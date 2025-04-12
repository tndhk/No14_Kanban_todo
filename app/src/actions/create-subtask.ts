"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const CreateSubtaskSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }),
  taskId: z.string().uuid({ message: "Invalid Task ID." }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }), // For auth/revalidation
});

// Return type
interface CreateSubtaskState {
  errors?: { title?: string[]; _general?: string[]; };
  message?: string | null;
}

export async function createSubtask(
  prevState: CreateSubtaskState,
  formData: FormData
): Promise<CreateSubtaskState> {
  const { userId } = await auth();

  // 1. Auth Check
  if (!userId) {
    return { errors: { _general: ["Unauthorized"] }, message: "Authentication failed." };
  }

  // 2. Validation
  const validatedFields = CreateSubtaskSchema.safeParse({
    title: formData.get("title"),
    taskId: formData.get("taskId"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not create subtask.",
    };
  }

  const { title, taskId, boardId } = validatedFields.data;

  // 3. Authorization & Creation
  try {
    // Verify user owns the board the parent task belongs to
    const task = await prismadb.task.findUnique({
      where: {
        id: taskId,
        column: { boardId: boardId },
      },
      select: {
        column: { select: { board: { select: { userId: true } } } },
      },
    });

    if (!task || task.column.board.userId !== userId) {
      return {
        errors: { _general: ["Authorization failed. Task not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Create the new subtask
    await prismadb.subtask.create({
      data: {
        title,
        taskId,
        // done defaults to false
      },
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to create subtask."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Subtask "${title}" created.`, 
  };
} 
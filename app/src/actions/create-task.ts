"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const CreateTaskSchema = z.object({
  title: z.string().min(1, {
    message: "Title cannot be empty.",
  }),
  columnId: z.string().uuid({ message: "Invalid Column ID." }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }), // For auth/revalidation
  // Add other fields later (description, dueDate?)
});

// Return type
interface CreateTaskState {
  errors?: {
    title?: string[];
    columnId?: string[];
    boardId?: string[];
    _general?: string[];
  };
  message?: string | null;
}

export async function createTask(
  prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  const { userId } = auth();

  // 1. Auth Check
  if (!userId) {
    return {
      errors: { _general: ["Unauthorized"] },
      message: "Authentication failed.",
    };
  }

  // 2. Validation
  const validatedFields = CreateTaskSchema.safeParse({
    title: formData.get("title"),
    columnId: formData.get("columnId"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not create task.",
    };
  }

  const { title, columnId, boardId } = validatedFields.data;

  // 3. Authorization & Creation
  try {
    // Verify user owns the board the column belongs to
    const column = await prismadb.column.findUnique({
      where: {
        id: columnId,
        boardId: boardId,
      },
      select: {
        board: { select: { userId: true } },
      },
    });

    if (!column || column.board.userId !== userId) {
      return {
        errors: { _general: ["Authorization failed. Column not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Determine the order for the new task (last in the column)
    const lastTask = await prismadb.task.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastTask ? lastTask.order + 1 : 0;

    // Create the new task
    await prismadb.task.create({
      data: {
        title,
        columnId,
        order: newOrder,
        // Add description, dueDate etc. here if included in form
      },
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to create task."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Task "${title}" created.`, // Success message
  };
} 
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const DeleteTaskSchema = z.object({
  taskId: z.string().uuid({ message: "Invalid Task ID." }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }), // For auth/revalidation
});

// Return type
interface DeleteTaskState {
  errors?: {
    taskId?: string[];
    boardId?: string[];
    _general?: string[];
  };
  message?: string | null;
}

export async function deleteTask(
  prevState: DeleteTaskState, // Keep pattern
  formData: FormData
): Promise<DeleteTaskState> {
  const { userId } = auth();

  // 1. Auth Check
  if (!userId) {
    return { errors: { _general: ["Unauthorized"] }, message: "Authentication failed." };
  }

  // 2. Validation
  const validatedFields = DeleteTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not delete task.",
    };
  }

  const { taskId, boardId } = validatedFields.data;

  // 3. Authorization & Deletion
  try {
    // Verify user owns the board the task belongs to
    const task = await prismadb.task.findUnique({
      where: {
        id: taskId,
        column: { boardId: boardId }, // Ensure task is on the correct board
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

    // Delete the task (Prisma should handle cascading delete for subtasks)
    await prismadb.task.delete({
      where: {
        id: taskId,
      },
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to delete task."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Task deleted successfully.`, 
  };
} 
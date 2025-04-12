"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const ToggleSubtaskSchema = z.object({
  subtaskId: z.string().uuid(),
  taskId: z.string().uuid(), // For auth check
  boardId: z.string().uuid(), // For auth/revalidation
  done: z.boolean(),
});

// Return type
interface ToggleSubtaskState {
  errors?: { _general?: string[]; };
  message?: string | null;
}

export async function toggleSubtask(
  input: z.infer<typeof ToggleSubtaskSchema>
): Promise<ToggleSubtaskState> {
  const { userId } = await auth();

  // 1. Auth Check
  if (!userId) {
    return { errors: { _general: ["Unauthorized"] }, message: "Authentication failed." };
  }

  const { subtaskId, taskId, boardId, done } = input;

  // 2. Authorization & Update
  try {
    // Verify user owns the board the subtask's parent task belongs to
    const subtask = await prismadb.subtask.findUnique({
      where: { 
          id: subtaskId,
          taskId: taskId, // Ensure subtask belongs to the specified task
          task: { // Ensure task belongs to a column on the specified board owned by user
              column: { 
                  boardId: boardId,
                  board: { userId: userId }
              }
          }
       },
       select: { id: true } // Only need to check existence and ownership chain
    });

    if (!subtask) {
       return {
        errors: { _general: ["Authorization failed. Subtask not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Update the subtask status
    await prismadb.subtask.update({
      where: { id: subtaskId },
      data: { done },
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to update subtask status."] },
      message: "Database operation failed.",
    };
  }

  // 3. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 4. Success
  return {
    message: `Subtask status updated.`, 
  };
} 
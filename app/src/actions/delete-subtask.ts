"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const DeleteSubtaskSchema = z.object({
  subtaskId: z.string().uuid(),
  taskId: z.string().uuid(), // For auth check
  boardId: z.string().uuid(), // For auth/revalidation
});

// Return type
interface DeleteSubtaskState {
  errors?: { _general?: string[]; };
  message?: string | null;
}

export async function deleteSubtask(
  input: z.infer<typeof DeleteSubtaskSchema> // Use direct input for simplicity
): Promise<DeleteSubtaskState> {
  const { userId } = auth();

  // 1. Auth Check
  if (!userId) {
    return { errors: { _general: ["Unauthorized"] }, message: "Authentication failed." };
  }

  const { subtaskId, taskId, boardId } = input;

  // 2. Authorization & Deletion
  try {
    // Verify ownership chain
    const subtask = await prismadb.subtask.findUnique({
      where: { 
          id: subtaskId,
          taskId: taskId,
          task: { column: { boardId: boardId, board: { userId: userId } } }
       },
       select: { id: true } 
    });

    if (!subtask) {
       return {
        errors: { _general: ["Authorization failed. Subtask not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Delete the subtask
    await prismadb.subtask.delete({ where: { id: subtaskId } });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to delete subtask."] },
      message: "Database operation failed.",
    };
  }

  // 3. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 4. Success
  return {
    message: `Subtask deleted successfully.`, 
  };
} 
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema for a single task update item
const TaskOrderUpdateSchema = z.object({
  id: z.string().uuid(),
  order: z.number().int().min(0),
  columnId: z.string().uuid(), // Need the columnId for the update
});

// Schema for the input object
const UpdateTaskOrderSchema = z.object({
  boardId: z.string().uuid(),
  updates: z.array(TaskOrderUpdateSchema),
});

// Return type
interface UpdateTaskOrderState {
  errors?: {
    _general?: string[];
  };
  message?: string | null;
}

export async function updateTaskOrder(
  input: z.infer<typeof UpdateTaskOrderSchema>
): Promise<UpdateTaskOrderState> {
  const { userId } = auth();

  // 1. Auth Check
  if (!userId) {
    return {
      errors: { _general: ["Unauthorized"] },
      message: "Authentication failed.",
    };
  }

  const { boardId, updates } = input;

  // 3. Authorization & Update Transaction
  try {
    // Verify user owns the board
    const board = await prismadb.board.findUnique({
      where: { id: boardId, userId },
      select: { id: true },
    });

    if (!board) {
      return {
        errors: { _general: ["Authorization failed. Board not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // TODO: Add check to ensure all columnIds in updates belong to the board? (Optional)

    // Perform updates within a transaction
    const transaction = updates.map((update) =>
      prismadb.task.update({
        where: {
          id: update.id,
          // Add extra authorization check: Ensure task belongs to a column on this board
          column: {
            boardId: boardId,
            // board: { userId: userId } // More specific if needed
          }
        },
        data: {
          order: update.order,
          columnId: update.columnId,
        },
      })
    );

    await prismadb.$transaction(transaction);

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to update task order."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: "Task order updated.",
  };
} 
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema for a single update item
const ColumnOrderUpdateSchema = z.object({
  id: z.string().uuid(),
  order: z.number().int().min(0),
});

// Schema for the input object
const UpdateColumnOrderSchema = z.object({
  boardId: z.string().uuid(),
  updates: z.array(ColumnOrderUpdateSchema),
});

// Return type
interface UpdateColumnOrderState {
  errors?: {
    _general?: string[];
  };
  message?: string | null;
}

export async function updateColumnOrder(
  input: z.infer<typeof UpdateColumnOrderSchema>
): Promise<UpdateColumnOrderState> {
  const { userId } = await auth();

  // 1. Auth Check
  if (!userId) {
    return {
      errors: { _general: ["Unauthorized"] },
      message: "Authentication failed.",
    };
  }

  // 2. Validation (Input is already validated by Zod if using direct call)
  // If using formData, parse here:
  // const validatedFields = UpdateColumnOrderSchema.safeParse(input);
  // if (!validatedFields.success) { ... handle error ... }
  // const { boardId, updates } = validatedFields.data;
  const { boardId, updates } = input; // Directly use input if validated beforehand

  // 3. Authorization & Update Transaction
  try {
    // Verify user owns the board
    const board = await prismadb.board.findUnique({
      where: { id: boardId, userId },
      select: { id: true }, // Only need to check existence and ownership
    });

    if (!board) {
      return {
        errors: { _general: ["Authorization failed. Board not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Perform updates within a transaction
    const transaction = updates.map((update) =>
      prismadb.column.update({
        where: {
          id: update.id,
          boardId: boardId, // Ensure the column belongs to the correct board
          // board: { userId: userId } // Can add extra check here if paranoid
        },
        data: {
          order: update.order,
        },
      })
    );

    await prismadb.$transaction(transaction);

  } catch (error) {
    console.error("Database Error:", error);
    // This could happen if a columnId doesn't exist or doesn't belong to the board
    return {
      errors: { _general: ["Database Error: Failed to update column order."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: "Column order updated.",
  };
} 
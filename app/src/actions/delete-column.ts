"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const DeleteColumnSchema = z.object({
  columnId: z.string().uuid({ message: "Invalid Column ID." }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }), // Needed for auth check & revalidation
});

// Return type
interface DeleteColumnState {
  errors?: {
    columnId?: string[];
    boardId?: string[];
    _general?: string[];
  };
  message?: string | null;
}

export async function deleteColumn(
  prevState: DeleteColumnState, // Not strictly needed for simple delete, but keeps pattern
  formData: FormData
): Promise<DeleteColumnState> {
  const { userId } = auth();

  // 1. Auth Check
  if (!userId) {
    return {
      errors: { _general: ["Unauthorized"] },
      message: "Authentication failed.",
    };
  }

  // 2. Validation
  const validatedFields = DeleteColumnSchema.safeParse({
    columnId: formData.get("columnId"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not delete column.",
    };
  }

  const { columnId, boardId } = validatedFields.data;

  // 3. Authorization & Deletion
  try {
    // Verify the user owns the board the column belongs to before deleting
    // Fetch the column and include its board to verify ownership
    const column = await prismadb.column.findUnique({
      where: {
        id: columnId,
        boardId: boardId,
      },
      select: {
        board: {
          select: { userId: true },
        },
      },
    });

    // Check if column exists and if the user owns the board
    if (!column || column.board.userId !== userId) {
      return {
        errors: { _general: ["Authorization failed. Column not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Delete the column
    await prismadb.column.delete({
      where: {
        id: columnId,
      },
    });

  } catch (error) {
    // Handle potential errors, e.g., foreign key constraints if tasks exist?
    // Prisma should cascade delete tasks/subtasks if schema is set up correctly.
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to delete column."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Column deleted successfully.`, // Might not see this if page reloads quickly
  };
} 
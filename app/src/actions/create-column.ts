"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema for input validation
const CreateColumnSchema = z.object({
  title: z.string().min(1, {
    message: "Title cannot be empty.",
  }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }),
});

// Return type
interface CreateColumnState {
  errors?: {
    title?: string[];
    boardId?: string[]; // Added for boardId validation
    _general?: string[]; // For general errors like auth or db failure
  };
  message?: string | null;
}

export async function createColumn(
  prevState: CreateColumnState,
  formData: FormData
): Promise<CreateColumnState> {
  const { userId } = auth();

  // 1. Check authentication
  if (!userId) {
    return {
      errors: { _general: ["Unauthorized"] },
      message: "Authentication failed.",
    };
  }

  // 2. Validate form data
  const validatedFields = CreateColumnSchema.safeParse({
    title: formData.get("title"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not create column.",
    };
  }

  const { title, boardId } = validatedFields.data;

  // 3. Attempt to create the column
  try {
    // Verify user owns the board before adding a column
    const board = await prismadb.board.findUnique({
      where: { id: boardId, userId },
    });

    if (!board) {
      return {
        errors: { boardId: ["Board not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Determine the order for the new column (last column)
    const lastColumn = await prismadb.column.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastColumn ? lastColumn.order + 1 : 0;

    // Create the new column
    await prismadb.column.create({
      data: {
        title,
        boardId,
        order: newOrder,
      },
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to create column."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate the board path
  revalidatePath(`/board/${boardId}`);

  // 5. Return success
  return {
    message: `Column "${title}" created.`, // Success message
  };
} 
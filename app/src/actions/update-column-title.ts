"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema
const UpdateColumnTitleSchema = z.object({
  title: z.string().min(1, {
    message: "Title cannot be empty.",
  }),
  columnId: z.string().uuid({ message: "Invalid Column ID." }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }), // Needed for auth check & revalidation
});

// Return type
interface UpdateColumnTitleState {
  errors?: {
    title?: string[];
    columnId?: string[];
    boardId?: string[];
    _general?: string[];
  };
  message?: string | null;
}

export async function updateColumnTitle(
  prevState: UpdateColumnTitleState,
  formData: FormData
): Promise<UpdateColumnTitleState> {
  const { userId } = await auth();

  // 1. Auth Check
  if (!userId) {
    return {
      errors: { _general: ["Unauthorized"] },
      message: "Authentication failed.",
    };
  }

  // 2. Validation
  const validatedFields = UpdateColumnTitleSchema.safeParse({
    title: formData.get("title"),
    columnId: formData.get("columnId"),
    boardId: formData.get("boardId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not update title.",
    };
  }

  const { title, columnId, boardId } = validatedFields.data;

  // 3. Authorization & Update
  try {
    // Fetch the column and include its board to verify ownership
    const column = await prismadb.column.findUnique({
      where: {
        id: columnId,
        boardId: boardId, // Ensure column belongs to the specified board
      },
      include: {
        board: {
          select: { userId: true }, // Select only userId for the check
        },
      },
    });

    // Check if column exists and if the user owns the board it belongs to
    if (!column || column.board.userId !== userId) {
      return {
        errors: { _general: ["Authorization failed. Column not found or access denied."] },
        message: "Authorization failed.",
      };
    }

    // Update the column title
    await prismadb.column.update({
      where: {
        id: columnId,
        // Add boardId and userId check again for extra safety? Not strictly necessary due to above check.
        // boardId: boardId,
        // board: {
        //   userId: userId,
        // }
      },
      data: {
        title: title,
      },
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to update column title."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Column title updated to "${title}".`,
  };
} 
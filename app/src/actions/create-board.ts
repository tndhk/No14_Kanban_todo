"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma"; // Import Prisma client

// Define the schema for input validation
const CreateBoardSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long.",
  }),
});

// Define the return type for the action
interface CreateBoardState {
  errors?: {
    title?: string[];
  };
  message?: string | null;
}

export async function createBoard(
  prevState: CreateBoardState, // For useActionState hook
  formData: FormData
): Promise<CreateBoardState> {
  const { userId } = auth();

  // 1. Check if user is authenticated
  if (!userId) {
    return {
      message: "Unauthorized",
    };
  }

  // 2. Validate form data
  const validatedFields = CreateBoardSchema.safeParse({
    title: formData.get("title"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not create board.",
    };
  }

  const { title } = validatedFields.data;

  // 3. Attempt to create the board in the database
  try {
    // Optional: Check if user exists in our DB (if syncing)
    // const userExists = await prismadb.user.findUnique({ where: { id: userId } });
    // if (!userExists) { /* Handle or create user */ }

    await prismadb.board.create({
      data: {
        title,
        userId,
        // Optionally add default columns here if desired
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Failed to create board.",
    };
  }

  // 4. Revalidate the path where boards are displayed (adjust path if needed)
  revalidatePath("/"); // Assuming boards are shown on the home page for now

  // 5. Return success state (or potentially redirect)
  return {
    message: `Board "${title}" created successfully.`, // Success message
  };
} 
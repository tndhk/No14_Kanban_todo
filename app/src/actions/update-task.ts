"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prismadb from "@/lib/prisma";

// Schema - Allow optional fields
const UpdateTaskSchema = z.object({
  taskId: z.string().uuid({ message: "Invalid Task ID." }),
  boardId: z.string().uuid({ message: "Invalid Board ID." }), // For auth/revalidation
  title: z.string().min(1, { message: "Title cannot be empty." }).optional(),
  description: z.string().nullable().optional(), // Allow null or string
  dueDate: z.date().nullable().optional(),        // Allow null or Date
});

// Return type
interface UpdateTaskState {
  errors?: {
    title?: string[];
    description?: string[];
    dueDate?: string[];
    taskId?: string[];
    boardId?: string[];
    _general?: string[];
  };
  message?: string | null;
}

// Helper to create update data object only with provided fields
function createUpdateData(validatedData: z.infer<typeof UpdateTaskSchema>) {
    const data: { title?: string; description?: string | null; dueDate?: Date | null } = {};
    if (validatedData.title !== undefined) data.title = validatedData.title;
    if (validatedData.description !== undefined) data.description = validatedData.description;
    if (validatedData.dueDate !== undefined) data.dueDate = validatedData.dueDate;
    return data;
}

export async function updateTask(
  prevState: UpdateTaskState,
  formData: FormData
): Promise<UpdateTaskState> {
  const { userId } = await auth();

  // 1. Auth Check
  if (!userId) {
    return { errors: { _general: ["Unauthorized"] }, message: "Authentication failed." };
  }

  // 2. Basic Validation (existence)
  const taskId = formData.get("taskId") as string;
  const boardId = formData.get("boardId") as string;
  const title = formData.get("title") as string | undefined;
  const description = formData.get("description") as string | null | undefined;
  const dueDateStr = formData.get("dueDate") as string | null | undefined;

  // Convert dueDate string to Date object or null
  let dueDate: Date | null | undefined = undefined;
  if (dueDateStr === "null" || dueDateStr === null || dueDateStr === "") {
      dueDate = null;
  } else if (dueDateStr) {
      try {
          dueDate = new Date(dueDateStr);
          if (isNaN(dueDate.getTime())) throw new Error('Invalid Date');
      } catch { 
          return { errors: { dueDate: ["Invalid date format."] }, message: "Validation failed." };
      } 
  }

  const validatedFields = UpdateTaskSchema.safeParse({
    taskId,
    boardId,
    // Only include fields if they were actually present in the form submission
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(dueDate !== undefined && { dueDate }),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Could not update task.",
    };
  }

  const updateData = createUpdateData(validatedFields.data);

  // Check if there's anything to update
  if (Object.keys(updateData).length === 0) {
    return { message: "No changes detected." }; // Or maybe an error?
  }

  // 3. Authorization & Update
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

    // Update the task
    await prismadb.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
    });

  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { _general: ["Database Error: Failed to update task."] },
      message: "Database operation failed.",
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Task updated successfully.`, 
  };
} 
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
  dueDate: z.preprocess(
    // Preprocess to handle string date or null properly
    (val) => {
      if (val === null || val === "null" || val === "") return null;
      if (typeof val === "string") return new Date(val);
      return val;
    },
    z.date().nullable().optional()
  ),  // Allow null or Date
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
    if (validatedData.dueDate !== undefined) {
      data.dueDate = validatedData.dueDate;  // Ensure it's Date or null
    }
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
  const title = formData.has("title") ? formData.get("title") as string : undefined;
  const description = formData.has("description") ? 
    (formData.get("description") as string || null) : undefined;
  const dueDateStr = formData.has("dueDate") ? 
    (formData.get("dueDate") as string || null) : undefined;

  try {
    // パース前にコンソールで値を確認（デバッグ用）
    console.log("Processing form data:", {
      taskId,
      boardId,
      title,
      description: description === "" ? "empty string" : description,
      dueDateStr: dueDateStr === "" ? "empty string" : dueDateStr
    });

    const validatedFields = UpdateTaskSchema.safeParse({
      taskId,
      boardId,
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDateStr !== undefined && { dueDate: dueDateStr }),
    });

    if (!validatedFields.success) {
      console.error("Validation error:", validatedFields.error.format());
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Validation failed. Could not update task.",
      };
    }

    const updateData = createUpdateData(validatedFields.data);

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return { message: "No changes detected." };
    }

    // コンソールで最終的な更新データを確認（デバッグ用）
    console.log("Final update data:", updateData);

    // 3. Authorization & Update
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
    if (error instanceof Error) {
      console.error('Update task error:', error.message);
      if (error.message.includes('Expected string')) {
        return { 
          errors: { 
            _general: ['Type conversion error. Please check the input format.'],
            description: ['Cannot process description value. Make sure it\'s a valid string or null.'],
            dueDate: ['Cannot process date value. Make sure it\'s a valid date format or null.']
          }, 
          message: 'Update failed due to data type mismatch.' 
        };
      }
    }
    console.error('Database Error:', error);
    return {
      errors: { _general: ['Database Error: Failed to update task.'] },
      message: 'Database operation failed.',
    };
  }

  // 4. Revalidate
  revalidatePath(`/board/${boardId}`);

  // 5. Success
  return {
    message: `Task updated successfully.`, 
  };
}
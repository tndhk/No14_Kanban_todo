// Board Detail Page

import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import prismadb from "@/lib/prisma";
import { ColumnList } from "@/components/column-list";
import { ModalManager } from "@/components/modal-manager";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { startTransition } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { CreateColumnForm } from "@/components/create-column-form";

interface BoardPageProps {
  params: {
    boardId: string;
  };
  searchParams?: {
    task?: string;
  };
}

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const { userId } = await auth();
  try {
    const { boardId } = params;

    if (!userId) {
      // Should be handled by middleware, but good practice to check
      return <p>Unauthorized</p>;
    }

    // Fetch the board data
    let board;
    try {
      board = await prismadb.board.findUnique({
        where: {
          id: boardId,
          userId: userId, // Ensure the user owns this board
        },
        // Include columns and tasks later
        include: {
          columns: {
            orderBy: { order: 'asc' },
            // Include tasks later
            include: { // Add include for tasks within columns
              tasks: {
                orderBy: { order: 'asc' },
                include: { subtasks: { orderBy: { createdAt: 'asc' } } } // Include subtasks
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to fetch board:", error);
      // Handle error appropriately, maybe show an error message
      return <p>Error loading board.</p>;
    }

    // If board not found or user doesn't own it
    if (!board) {
      notFound(); // Render the 404 page
    }

    return (
      <>
        <div className="p-2 sm:p-4 md:p-8 h-full overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Board: {board.title}</h1>
            <CreateColumnForm boardId={board.id} />
          </div>

          {/* Render ColumnList component */}
          <ColumnList initialColumns={board.columns} boardId={board.id} />
        </div>

        {/* Render Modal Manager */}
        <ModalManager boardId={board.id} columns={board.columns} />
        <Dialog>
          <DialogContent>
            <VisuallyHidden.Root>
              <DialogTitle>タイトルを追加（例: タスクの詳細）</DialogTitle>
            </VisuallyHidden.Root>
            {/* 既存のコンテンツ */}
          </DialogContent>
        </Dialog>
      </>
    );
  } catch (error) {
    console.error('Error accessing params:', error);
    throw error;  // Re-throw to maintain error handling
  }
} 
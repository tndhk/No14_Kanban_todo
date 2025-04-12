'use client';

import { useState, useRef, useActionState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { Column } from '@prisma/client';
import { X } from 'lucide-react'; // Import X icon

import { updateColumnTitle } from '@/actions/update-column-title';
import { deleteColumn } from '@/actions/delete-column'; // Import delete action
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Might need later for options
import { Label } from '@/components/ui/label';

interface ColumnHeaderProps {
  column: Column;
  boardId: string; // Need boardId for the action
}

export function ColumnHeader({ column, boardId }: ColumnHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(column.title);
  const titleFormRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isTitleUpdatePending, startTitleUpdateTransition] = useTransition();

  const titleInitialState = { message: null, errors: {} };
  const [titleState, titleFormAction] = useActionState(updateColumnTitle, titleInitialState);

  // State specifically for delete action feedback (optional)
  const deleteInitialState = { message: null, errors: {} };
  const [deleteState, deleteFormAction] = useActionState(deleteColumn, deleteInitialState);

  // Effect for title update feedback
  useEffect(() => {
    if (titleState?.message && !titleState.errors) {
      toast.success(titleState.message);
      setIsEditingTitle(false);
    } else if (titleState?.message && titleState.errors) {
      const errorMsg = titleState.errors.title?.[0] || titleState.errors.columnId?.[0] || titleState.errors.boardId?.[0] || titleState.errors._general?.[0] || titleState.message;
      toast.error(errorMsg || "Failed to update title.");
      setCurrentTitle(column.title);
      setIsEditingTitle(false);
    }
  }, [titleState, column.title]);

  // Effect for delete feedback (optional, as revalidation handles UI update)
  useEffect(() => {
    if (deleteState?.message && !deleteState.errors) {
      toast.success(deleteState.message);
      // Column removal is handled by revalidation
    } else if (deleteState?.message && deleteState.errors) {
      const errorMsg = deleteState.errors.columnId?.[0] || deleteState.errors.boardId?.[0] || deleteState.errors._general?.[0] || deleteState.message;
      toast.error(errorMsg || "Failed to delete column.");
    }
  }, [deleteState]);

  const enableTitleEditing = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleSubmit = () => {
    if (titleInputRef.current?.value && titleInputRef.current.value !== column.title) {
      titleFormRef.current?.requestSubmit();
    } else {
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTitleSubmit();
    } else if (event.key === 'Escape') {
      setCurrentTitle(column.title);
      setIsEditingTitle(false);
    }
  };

  // Render title editing form
  if (isEditingTitle) {
    return (
      <form action={titleFormAction} ref={titleFormRef} className="mb-2 flex items-center space-x-2">
        <input type="hidden" name="columnId" value={column.id} />
        <input type="hidden" name="boardId" value={boardId} />
        <Label htmlFor={`column-title-${column.id}`} className="sr-only">
          Column Title
        </Label>
        <Input
          ref={titleInputRef}
          id={`column-title-${column.id}`}
          name="title"
          defaultValue={currentTitle}
          onBlur={handleTitleSubmit}
          onKeyDown={handleTitleKeyDown}
          disabled={isTitleUpdatePending}
          className="h-8 px-2 text-sm font-semibold border-2 border-sky-500 focus-visible:ring-transparent flex-grow"
        />
      </form>
    );
  }

  // Render normal header with delete button
  return (
    <div className="flex items-center justify-between mb-2 px-1 py-1">
      <div
        onClick={enableTitleEditing}
        className="font-semibold text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-1 flex-grow mr-2"
        title="Click to edit title"
      >
        {column.title}
      </div>
      {/* Delete Button Form */}
      <form action={deleteFormAction}>
        <input type="hidden" name="columnId" value={column.id} />
        <input type="hidden" name="boardId" value={boardId} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
          aria-label="Delete column"
          title="Delete column"
          // Add confirmation later if desired
          // onClick={(e) => { if (!confirm('Are you sure?')) e.preventDefault(); }}
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
} 
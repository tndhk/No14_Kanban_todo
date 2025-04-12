'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { Plus } from 'lucide-react';

import { createTask } from '@/actions/create-task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateTaskFormProps {
  columnId: string;
  boardId: string;
}

export function CreateTaskForm({ columnId, boardId }: CreateTaskFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createTask, initialState);

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast.success(state.message);
      formRef.current?.reset();
      setIsEditing(false); // Close form on success
    } else if (state?.message && state.errors) {
      const errorMsg = state.errors.title?.[0] || state.errors.columnId?.[0] || state.errors.boardId?.[0] || state.errors._general?.[0] || state.message;
      toast.error(errorMsg || "Failed to create task.");
      // Keep form open for correction, focus input again?
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [state]);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const disableEditing = () => {
    setIsEditing(false);
    formRef.current?.reset();
  };

  // Submit handler specifically for this form to ensure disableEditing is called
  const handleFormSubmit = (formData: FormData) => {
    formAction(formData);
    // Optimistically try to close, but useEffect will handle errors/reopening
    // disableEditing(); // Let useEffect handle closing based on success/failure
  };

  if (isEditing) {
    return (
      <div className="p-1 pt-2">
        <form action={handleFormSubmit} ref={formRef} className="space-y-2">
          {/* Hidden inputs */}
          <input type="hidden" name="columnId" value={columnId} />
          <input type="hidden" name="boardId" value={boardId} />
          <div>
            <Label htmlFor={`task-title-${columnId}`} className="sr-only">Task Title</Label>
            <Input
              ref={inputRef}
              id={`task-title-${columnId}`}
              name="title"
              required
              placeholder="Enter a title for this card..."
              className="h-9 px-2 text-sm"
              aria-describedby={`task-title-error-${columnId}`}
              onKeyDown={(e) => { if (e.key === 'Escape') disableEditing(); }}
            />
            {state?.errors?.title && (
              <div id={`task-title-error-${columnId}`} aria-live="polite" className="mt-1 text-xs text-destructive">
                {state.errors.title.join(", ")}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button type="submit" size="sm">Add card</Button>
            <Button type="button" variant="ghost" size="sm" onClick={disableEditing}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  // Button to open the form
  return (
    <div className="p-2 border-t border-gray-200 dark:border-gray-700/50">
      <Button
        onClick={enableEditing}
        variant="ghost"
        size="sm"
        className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a card
      </Button>
      {/* Add other options like template button here later? */}
    </div>
  );
} 
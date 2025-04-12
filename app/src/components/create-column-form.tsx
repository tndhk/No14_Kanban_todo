'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { toast } from "sonner";

import { createColumn } from '@/actions/create-column';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateColumnFormProps {
  boardId: string;
}

export function CreateColumnForm({ boardId }: CreateColumnFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createColumn, initialState);

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast.success(state.message);
      formRef.current?.reset();
      setIsEditing(false);
    } else if (state?.message && state.errors) {
      const errorMsg = state.errors.title?.[0] || state.errors.boardId?.[0] || state.errors._general?.[0] || state.message;
      toast.error(errorMsg);
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

  if (isEditing) {
    return (
      <div className="min-w-[280px] p-3 rounded-lg bg-white dark:bg-gray-900 shadow-md">
        <form action={formAction} ref={formRef} className="space-y-2">
          <input type="hidden" name="boardId" value={boardId} />
          <div>
            <Label htmlFor="column-title" className="sr-only">Column Title</Label>
            <Input
              ref={inputRef}
              id="column-title"
              name="title"
              required
              placeholder="Enter column title..."
              className="h-9 px-2 text-sm"
              aria-describedby="column-title-error"
            />
            {state?.errors?.title && (
              <div id="column-title-error" aria-live="polite" className="mt-1 text-xs text-destructive">
                {state.errors.title.join(", ")}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button type="submit" size="sm">Add Column</Button>
            <Button type="button" variant="ghost" size="sm" onClick={disableEditing}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-w-[280px] p-2">
      <Button onClick={enableEditing} variant="outline" className="w-full justify-start">
        + Add another column
      </Button>
    </div>
  );
} 
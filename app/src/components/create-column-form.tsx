'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { Plus } from 'lucide-react';

import { createColumn } from '@/actions/create-column';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CreateColumnFormProps {
  boardId: string;
}

export function CreateColumnForm({ boardId }: CreateColumnFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const initialState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createColumn, initialState);

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast.success(state.message);
      formRef.current?.reset();
      setIsPopoverOpen(false);
    } else if (state?.message && state.errors) {
      const errorMsg = state.errors.title?.[0] || state.errors.boardId?.[0] || state.errors._general?.[0] || state.message;
      toast.error(errorMsg);
    }
  }, [state]);

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleCancel = () => {
    setIsPopoverOpen(false);
    formRef.current?.reset();
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none text-center">Create Column</h4>
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" size="sm">Add Column</Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
} 
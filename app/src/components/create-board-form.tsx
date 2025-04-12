'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from "sonner"; // Assuming sonner for toast notifications

import { createBoard } from '@/actions/create-board';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CreateBoardForm() {
  const initialState = { message: null, errors: {} };
  // NOTE: useFormState might be needed for stable Next.js versions
  const [state, formAction] = useActionState(createBoard, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.message && !state.errors) {
      // Optionally show a success toast
      toast.success(state.message);
      formRef.current?.reset(); // Reset form on success
      dialogCloseRef.current?.click(); // Close dialog on success
    } else if (state?.message && state.errors) {
      // Optionally show an error toast
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Board</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Board Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter board title (min. 3 chars)"
              aria-describedby="title-error"
            />
            {state?.errors?.title && (
              <div id="title-error" aria-live="polite" className="text-sm font-medium text-destructive">
                {state.errors.title.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            {/* Hidden close button for programmatic closing */}
            <DialogClose ref={dialogCloseRef} className="hidden" />
            <Button type="submit">Create Board</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
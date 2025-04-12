'use client';

import { useState, useRef, useEffect, useActionState, useTransition } from 'react';
import { Task, Subtask } from '@prisma/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, AlignLeft, Trash2, Check } from 'lucide-react'; // Add Trash2 and Check icons
import TextareaAutosize from 'react-textarea-autosize';
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

import { updateTask } from '@/actions/update-task';
import { deleteTask } from '@/actions/delete-task'; // Import delete action
import { toggleSubtask } from '@/actions/toggle-subtask'; // Import toggle action
import { createSubtask } from '@/actions/create-subtask'; // Import create action
import { deleteSubtask } from '@/actions/delete-subtask'; // Import delete action
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Import Alert Dialog for confirmation

// Define Task with Subtasks type
interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}

interface TaskModalProps {
  task: TaskWithSubtasks; // Use updated type
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Basic Date Picker Component (can be moved to its own file later)
function DatePicker({ date, setDate }: { date: Date | null | undefined, setDate: (date: Date | null) => void }) {
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate || null);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined} // Pass undefined if null
          onSelect={handleSelect}
          initialFocus
        />
         <Button 
           variant="ghost" 
           size="sm" 
           className="w-full justify-center text-xs" 
           onClick={() => setDate(null)} // Button to clear date
         >
            Clear Date
         </Button>
      </PopoverContent>
    </Popover>
  );
}

export function TaskModal({ task, boardId, isOpen, onClose }: TaskModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentTitle, setCurrentTitle] = useState(task.title);
  const [currentDescription, setCurrentDescription] = useState(task.description);
  const [currentDueDate, setCurrentDueDate] = useState<Date | null | undefined>(task.dueDate);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isPending, startTransition] = useTransition(); // Add transition state

  // Action state for update
  const updateInitialState = { message: null, errors: {} };
  const [updateState, updateFormAction] = useActionState(updateTask, updateInitialState);

  // Action state for delete
  const deleteInitialState = { message: null, errors: {} };
  const [deleteState, deleteFormAction] = useActionState(deleteTask, deleteInitialState);

  // Action state for create subtask
  const createSubtaskInitialState = { message: null, errors: {} };
  const [createSubtaskState, createSubtaskFormAction] = useActionState(createSubtask, createSubtaskInitialState);

  const subtaskFormRef = useRef<HTMLFormElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  // Reset local state if task prop changes (e.g., navigating between tasks)
  useEffect(() => {
    setCurrentTitle(task.title);
    setCurrentDescription(task.description);
    setCurrentDueDate(task.dueDate);
    setIsEditingDescription(false); // Reset description editing state too
  }, [task]);

  // Handle update action feedback
  useEffect(() => {
    if (updateState?.message && !updateState.errors) {
      toast.success(updateState.message);
      // Keep modal open after update? Or close? Current: Close on successful update submit.
      // onClose(); 
    } else if (updateState?.message && updateState.errors) {
      const errorMsg = updateState.errors.title?.[0] || updateState.errors.description?.[0] || updateState.errors.dueDate?.[0] || updateState.errors._general?.[0] || updateState.message;
      toast.error(errorMsg || "Failed to update task.");
    }
  }, [updateState]);

  // Handle delete action feedback
   useEffect(() => {
    if (deleteState?.message && !deleteState.errors) {
      toast.success(deleteState.message);
      onClose(); // Close modal on successful delete
    } else if (deleteState?.message && deleteState.errors) {
      const errorMsg = deleteState.errors.taskId?.[0] || deleteState.errors.boardId?.[0] || deleteState.errors._general?.[0] || deleteState.message;
      toast.error(errorMsg || "Failed to delete task.");
    }
  }, [deleteState, onClose]);

  // Effect for create subtask feedback
  useEffect(() => {
      if (createSubtaskState?.message && !createSubtaskState.errors) {
          // toast.success(createSubtaskState.message); // Optional toast
          subtaskFormRef.current?.reset(); // Clear form on success
          subtaskInputRef.current?.focus(); // Keep focus for adding more
      } else if (createSubtaskState?.message && createSubtaskState.errors) {
          toast.error(createSubtaskState.errors.title?.[0] || createSubtaskState.errors._general?.[0] || "Failed to add subtask.");
      }
  }, [createSubtaskState]);

  // Handle update form submission
  const handleUpdateSubmit = (formData: FormData) => {
    // Append current date state to form data if it has changed
    // Need to handle date carefully (pass as ISO string or similar)
    if (currentDueDate !== task.dueDate) {
        formData.set("dueDate", currentDueDate ? currentDueDate.toISOString() : "null");
    } else {
        // Ensure unchanged date field isn't submitted if we don't want it to be
        formData.delete("dueDate"); 
    }
    
    // Only include title/description if they changed?
    // Or let the server action handle unchanged data
    if (currentTitle === task.title) formData.delete('title');
    if (currentDescription === task.description) formData.delete('description');

    // Only submit if there are actual changes
    let hasChanges = false;
    formData.forEach((value, key) => {
        if (key !== 'taskId' && key !== 'boardId') {
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        updateFormAction(formData);
    } else {
        toast.info("No changes detected."); // Inform user if no changes
    }
  };
  
  // Handle delete form submission (triggered by AlertDialog confirmation)
  const handleDeleteSubmit = () => {
      const formData = new FormData();
      formData.set("taskId", task.id);
      formData.set("boardId", boardId);
      deleteFormAction(formData);
  };

  // Trigger description edit state
  const enableDescEditing = () => setIsEditingDescription(true);
  const disableDescEditing = () => setIsEditingDescription(false);

  // Calculate subtask progress
  const completedSubtasks = task.subtasks.filter(st => st.done).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Handler for subtask toggle
  const handleSubtaskToggle = (subtaskId: string, done: boolean) => {
    startTransition(async () => {
      const result = await toggleSubtask({
        subtaskId,
        taskId: task.id, // Pass parent task ID
        boardId,
        done,
      });
      if (result.errors) {
        toast.error(result.errors._general?.[0] || "Failed to update subtask.");
      } else {
        // toast.success(result.message); // Optional success toast (might be noisy)
      }
    });
  };

  // Handler for subtask delete
  const handleSubtaskDelete = (subtaskId: string) => {
    startTransition(async () => {
      const result = await deleteSubtask({
        subtaskId,
        taskId: task.id,
        boardId,
      });
      if (result.errors) {
        toast.error(result.errors._general?.[0] || "Failed to delete subtask.");
      } else {
        // toast.success(result.message); // Optional
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <form action={handleUpdateSubmit} ref={formRef}>
          {/* Hidden fields */}
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="boardId" value={boardId} />

          <DialogHeader className="mb-4">
            {/* Editable Title */}
            <Label htmlFor="task-title" className="sr-only">Task Title</Label>
            <Input
              id="task-title"
              name="title"
              defaultValue={currentTitle} // Or use controlled with onChange={e => setCurrentTitle(e.target.value)}
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 p-0"
            />
            <p className="text-sm text-muted-foreground ml-1">
              in column <span className="font-medium">{/* TODO: Get column name? */}</span>
            </p>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4">
            {/* Main Content Area (Description, Subtasks etc.) */}
            <div className="col-span-3 md:col-span-2 space-y-6">
              {/* Description Section */}
              <div className="flex items-start gap-x-3 w-full">
                 <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700 dark:text-neutral-300" />
                 <div className="w-full">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Description</p>
                    {isEditingDescription ? (
                        <div className="space-y-2">
                            <TextareaAutosize
                                name="description"
                                className={cn(
                                    "w-full mt-2 p-2 rounded-md border bg-transparent",
                                    "focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                )}
                                placeholder="Add a more detailed description..."
                                defaultValue={currentDescription ?? ""}
                                onKeyDown={(e) => { if (e.key === 'Escape') disableDescEditing(); }}
                                // onBlur={disableDescEditing} // Maybe too aggressive
                            />
                            <div className="flex items-center gap-x-2">
                                <Button type="submit" size="sm">Save</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={disableDescEditing}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={enableDescEditing} 
                            role="button"
                            className="min-h-[78px] bg-neutral-100 dark:bg-neutral-800/50 text-sm font-medium py-3 px-3.5 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700/80"
                        >
                             {currentDescription || "Add a more detailed description..."}
                        </div>
                    )}
                </div>
              </div>
              
              {/* Subtask Section */}  
              {task.subtasks && task.subtasks.length > 0 && (
                 <div className="flex items-start gap-x-3 w-full">
                    <Check className="h-5 w-5 mt-0.5 text-neutral-700 dark:text-neutral-300" />
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-neutral-700 dark:text-neutral-300">Subtasks</p>
                            <span className="text-xs text-muted-foreground">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        </div>
                        {/* Progress Bar (Optional - simple div for now) */}
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-4">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        {/* Subtask List */}
                        <div className="space-y-2">
                            {task.subtasks.map(subtask => (
                                <div key={subtask.id} className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded group">
                                    <Checkbox 
                                        id={`subtask-${subtask.id}`}
                                        checked={subtask.done}
                                        disabled={isPending} // Disable checkbox during transition
                                        onCheckedChange={(checked) => handleSubtaskToggle(subtask.id, !!checked)}
                                    />
                                    <label 
                                        htmlFor={`subtask-${subtask.id}`} 
                                        className={`flex-grow text-sm cursor-pointer ${subtask.done ? 'line-through text-muted-foreground' : ''}`}
                                    >
                                        {subtask.title}
                                    </label>
                                    {/* Delete button for subtask */}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-700"
                                        onClick={() => handleSubtaskDelete(subtask.id)}
                                        disabled={isPending}
                                        aria-label="Delete subtask"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {/* Form to create new subtasks */}
                        <form action={createSubtaskFormAction} ref={subtaskFormRef} className="mt-3 flex items-center space-x-2">
                            <input type="hidden" name="taskId" value={task.id} />
                            <input type="hidden" name="boardId" value={boardId} />
                            <Input 
                                ref={subtaskInputRef}
                                name="title" 
                                placeholder="Add a subtask..." 
                                className="h-8 flex-grow text-sm px-2"
                                aria-describedby={`create-subtask-error-${task.id}`}
                            />
                            <Button type="submit" size="sm">Add</Button>
                        </form>
                        {createSubtaskState?.errors?.title && (
                            <div id={`create-subtask-error-${task.id}`} aria-live="polite" className="mt-1 text-xs text-destructive">
                                {createSubtaskState.errors.title.join(", ")}
                            </div>
                        )}
                    </div>
                 </div>
              )}
            </div>

            {/* Sidebar Area (Due Date, Actions) */}
            <div className="col-span-3 md:col-span-1 space-y-4">
              <Label>Due Date</Label>
              <DatePicker date={currentDueDate} setDate={setCurrentDueDate} />
              
              <Label>Actions</Label>
              {/* Delete Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task
                      and any associated subtasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {/* Use a regular button to trigger the delete action form submission */}
                    <AlertDialogAction onClick={handleDeleteSubmit} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <DialogFooter className="mt-6">
            {/* Optionally hide submit button if fields auto-save? 
                Or have explicit save? Current setup saves on button click/blur? 
                Needs refinement. Let's use an explicit Save button for now. 
            */}
             <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
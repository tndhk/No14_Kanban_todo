'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Task, Subtask, Column } from '@prisma/client';

import { TaskModal } from './task-modal'; // Assuming TaskModal is in the same directory or adjust path

interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
}
interface ColumnWithTasks extends Column {
  tasks: TaskWithSubtasks[];
}

interface ModalManagerProps {
  boardId: string;
  columns: ColumnWithTasks[]; // Use updated type
}

// Helper function (can be shared)
function findTaskById(columns: ColumnWithTasks[], taskId: string): TaskWithSubtasks | undefined {
  for (const column of columns) {
    const task = column.tasks.find(t => t.id === taskId);
    if (task) return task;
  }
  return undefined;
}

export function ModalManager({ boardId, columns }: ModalManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task');

  const selectedTask = taskId ? findTaskById(columns, taskId) : undefined;

  const handleClose = () => {
    router.push(pathname); // Navigate back to the board URL without query params
  };

  if (!selectedTask) {
    return null; // Don't render anything if no task is selected
  }

  return (
    <TaskModal
      isOpen={!!selectedTask}
      task={selectedTask}
      boardId={boardId}
      onClose={handleClose}
    />
  );
} 
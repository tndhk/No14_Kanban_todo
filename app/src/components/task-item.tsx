'use client';

import { Task } from '@prisma/client';
import { Draggable } from '@hello-pangea/dnd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TaskItemProps {
  task: Task;
  index: number;
}

export function TaskItem({ task, index }: TaskItemProps) {
  const pathname = usePathname();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Link
          href={`${pathname}?task=${task.id}`}
          scroll={false}
          className="block mb-2"
        >
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            role="button"
            className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
          >
            <p className="text-sm font-medium">{task.title}</p>
          </div>
        </Link>
      )}
    </Draggable>
  );
} 
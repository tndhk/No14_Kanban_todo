'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Column, Task } from '@prisma/client'; // Assuming tasks are not included yet
import { toast } from 'sonner';

import { updateColumnOrder } from '@/actions/update-column-order'; // Action to update order
import { updateTaskOrder } from '@/actions/update-task-order'; // Import new action
import { ColumnHeader } from '@/components/column-header';
import { CreateColumnForm } from '@/components/create-column-form';
import { TaskItem } from '@/components/task-item'; // Import TaskItem
import { CreateTaskForm } from '@/components/create-task-form'; // Import task form

// Define the type for a column that might include tasks later
interface ColumnWithTasks extends Column {
  tasks: Task[]; // Uncomment and use Task type
}

interface ColumnListProps {
  initialColumns: ColumnWithTasks[];
  boardId: string;
}

// Function to reorder items in a list
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function ColumnList({ initialColumns, boardId }: ColumnListProps) {
  const [orderedColumns, setOrderedColumns] = useState<ColumnWithTasks[]>(initialColumns);

  // Update local state if initialColumns change (e.g., after adding/deleting)
  useEffect(() => {
    setOrderedColumns(initialColumns);
  }, [initialColumns]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Column Reordering (Existing Logic - keep as is)
    if (type === 'COLUMN') {
      const items = reorder(orderedColumns, source.index, destination.index);
      setOrderedColumns(items);
      const columnOrderUpdates = items.map((col, index) => ({ id: col.id, order: index }));
      try {
        const { errors } = await updateColumnOrder({ boardId, updates: columnOrderUpdates });
        if (errors) {
          toast.error(errors._general?.[0] || "Failed to reorder columns.");
          setOrderedColumns(initialColumns);
        }
      } catch (error) {
        toast.error("Failed to update column order.");
        setOrderedColumns(initialColumns);
      }
      return; // Exit after handling column reorder
    }

    // Task Reordering Logic
    if (type === 'TASK') {
      let newOrderedColumns = [...orderedColumns];

      // Find source and destination columns
      const sourceColumn = newOrderedColumns.find(col => col.id === source.droppableId);
      const destColumn = newOrderedColumns.find(col => col.id === destination.droppableId);

      if (!sourceColumn || !destColumn) {
        console.error("Source or destination column not found!");
        return;
      }

      // Find the dragged task
      const taskToMove = sourceColumn.tasks.find(task => task.id === draggableId);
      if (!taskToMove) {
        console.error("Dragged task not found!");
        return;
      }

      // --- Optimistic Update --- 
      
      // 1. Remove task from source column's tasks
      sourceColumn.tasks.splice(source.index, 1);

      // 2. Add task to destination column's tasks at the correct index
      destColumn.tasks.splice(destination.index, 0, taskToMove);

      // 3. Update the order property for tasks in affected columns
      // Source column task order update
      sourceColumn.tasks.forEach((task, idx) => { task.order = idx; });
      // Destination column task order update (only if different from source)
      if (source.droppableId !== destination.droppableId) {
          destColumn.tasks.forEach((task, idx) => { task.order = idx; });
      }

      // 4. Update the state
      setOrderedColumns(newOrderedColumns);

      // --- Prepare Data for Server Action --- 
      const taskOrderUpdates = [
          // Tasks in source column (if different from destination)
          ...(source.droppableId !== destination.droppableId 
              ? sourceColumn.tasks.map(task => ({ 
                  id: task.id, 
                  order: task.order, 
                  columnId: sourceColumn.id 
                })) 
              : []),
          // Tasks in destination column
          ...destColumn.tasks.map(task => ({ 
              id: task.id, 
              order: task.order, 
              columnId: destColumn.id 
          }))
      ];

      // --- Call Server Action --- 
      try {
          // Note: updateTaskOrder action needs to be created
          const { message, errors } = await updateTaskOrder({ 
              boardId, 
              updates: taskOrderUpdates 
          });
          if (errors) {
              toast.error(errors._general?.[0] || "Failed to reorder tasks.");
              // Revert optimistic update on error
              setOrderedColumns(initialColumns); 
          } else {
              // toast.success(message || "Tasks reordered."); // Optional success toast
          }
      } catch (error) {
          toast.error("Failed to update task order.");
          setOrderedColumns(initialColumns); // Revert on unexpected error
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="columns" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-4 items-start" // Adjusted spacing
          >
            {/* Column List */}
            {orderedColumns.map((column, index) => (
              <Draggable key={column.id} draggableId={column.id} index={index}>
                {(provided) => (
                  <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="w-full sm:min-w-[280px] max-w-[280px] bg-gray-100 dark:bg-gray-800 rounded-lg shadow flex flex-col" // Adjusted width
                  >
                    <div {...provided.dragHandleProps} className="p-3 pb-1"> {/* Padding for header */}
                      <ColumnHeader column={column} boardId={boardId} />
                    </div>

                    {/* Task List within Droppable Area */}
                    <Droppable droppableId={column.id} type="TASK">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 pt-0 flex-grow ${snapshot.isDraggingOver ? 'bg-sky-100 dark:bg-sky-900/50' : ''}`}
                        >
                          {column.tasks.length > 0 ? (
                            column.tasks.map((task, taskIndex) => (
                              <TaskItem key={task.id} task={task} index={taskIndex} />
                            ))
                          ) : (
                            !snapshot.isDraggingOver && (
                              <p className="text-xs text-center text-gray-500 p-2">
                                No tasks yet
                              </p>
                            )
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    {/* Add Create Task Button/Form here */}
                    <CreateTaskForm columnId={column.id} boardId={boardId} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder} {/* Placeholder for dragging items */}

            {/* REMOVE Add Column Form from here */}
            {/* 
            <div className="w-full sm:min-w-[280px] max-w-[280px] flex-shrink-0">
              <CreateColumnForm boardId={boardId} />
            </div>
            */}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 
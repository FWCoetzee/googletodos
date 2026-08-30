import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Edit2, X, GripVertical, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { todoSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { isOverdue, formatDueDate } from '@/lib/utils/dateUtils';

export const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.task);
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? new Date(todo.due_date) : null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(todo.due_date, todo.completed);

  const handleEdit = () => {
    const result = todoSchema.safeParse({ task: editText.trim() });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      toast.error(errorMessage);
      return;
    }
    
    const hasChanges = result.data.task !== todo.task || 
      (editDueDate?.toISOString() || null) !== todo.due_date;
    
    if (hasChanges) {
      onEdit(todo.id, result.data.task, editDueDate);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.task);
    setEditDueDate(todo.due_date ? new Date(todo.due_date) : null);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group bg-card rounded-xl p-4 shadow-sm border transition-all",
        overdue 
          ? "border-destructive/50 bg-destructive/5" 
          : "border-border hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder task"
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? "Mark task as not done" : "Mark task as done"}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-success border-success shadow-sm'
              : 'border-border hover:border-primary'
          }`}
        >
          {todo.completed && <Check className="h-4 w-4 text-success-foreground" />}
        </button>

        {isEditing ? (
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="h-9 text-sm flex-1"
                autoFocus
              />
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Pick a due date"
                    className={cn(
                      "h-9 px-3",
                      editDueDate && "text-primary border-primary"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={editDueDate}
                    onSelect={(date) => {
                      setEditDueDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                  {editDueDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => {
                          setEditDueDate(null);
                          setCalendarOpen(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                onClick={handleEdit}
                aria-label="Save task changes"
                className="h-9 px-3"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                aria-label="Cancel editing"
                className="h-9 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "block text-base transition-all",
                  todo.completed
                    ? 'line-through text-muted-foreground'
                    : overdue
                    ? 'text-destructive'
                    : 'text-foreground'
                )}
              >
                {todo.task}
              </span>
              {todo.due_date && (
                <span
                  className={cn(
                    "text-xs mt-1 flex items-center gap-1",
                    overdue
                      ? "text-destructive font-medium"
                      : todo.completed
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3 w-3" />
                  {formatDueDate(todo.due_date)}
                  {overdue && " • Overdue"}
                </span>
              )}
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                aria-label="Edit task"
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(todo.id)}
                aria-label="Delete task"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

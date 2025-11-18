import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Edit2, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { todoSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.task);

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

  const handleEdit = () => {
    const result = todoSchema.safeParse({ task: editText.trim() });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      toast.error(errorMessage);
      return;
    }
    
    if (result.data.task !== todo.task) {
      onEdit(todo.id, result.data.task);
    }
    setIsEditing(false);
    setEditText(todo.task);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.task);
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
      className="group bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-success border-success shadow-sm'
              : 'border-border hover:border-primary'
          }`}
        >
          {todo.completed && <Check className="h-4 w-4 text-success-foreground" />}
        </button>

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') handleCancel();
              }}
              className="h-9 text-sm"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleEdit}
              className="h-9 px-3"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="h-9 px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <span
              className={`flex-1 text-base transition-all ${
                todo.completed
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {todo.task}
            </span>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(todo.id)}
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.task);

  const handleEdit = () => {
    if (editText.trim() && editText !== todo.task) {
      onEdit(todo.id, editText.trim());
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
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
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

import { motion, AnimatePresence } from 'framer-motion';
import { TodoItem } from './TodoItem';
import { CheckCircle2 } from 'lucide-react';

export const TodoList = ({ todos, onToggle, onDelete, onEdit }) => {
  if (todos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-lg text-muted-foreground">No tasks yet. Add one to get started!</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

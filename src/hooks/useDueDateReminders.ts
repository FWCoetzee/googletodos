import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { isToday, isTomorrow } from 'date-fns';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  due_date: string | null;
}

export const useDueDateReminders = (todos: Todo[], loading: boolean) => {
  const hasShownReminders = useRef(false);

  useEffect(() => {
    // Only show reminders once when todos are first loaded
    if (loading || hasShownReminders.current || todos.length === 0) return;

    const incompleteTodos = todos.filter(todo => !todo.completed && todo.due_date);
    
    const dueToday = incompleteTodos.filter(todo => 
      todo.due_date && isToday(new Date(todo.due_date))
    );
    
    const dueTomorrow = incompleteTodos.filter(todo => 
      todo.due_date && isTomorrow(new Date(todo.due_date))
    );

    // Show reminders with a slight delay for better UX
    setTimeout(() => {
      if (dueToday.length > 0) {
        toast.warning(
          `${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today!`,
          {
            description: dueToday.map(t => t.task).slice(0, 3).join(', ') + 
              (dueToday.length > 3 ? ` and ${dueToday.length - 3} more...` : ''),
            duration: 6000,
          }
        );
      }

      if (dueTomorrow.length > 0) {
        setTimeout(() => {
          toast.info(
            `${dueTomorrow.length} task${dueTomorrow.length > 1 ? 's' : ''} due tomorrow`,
            {
              description: dueTomorrow.map(t => t.task).slice(0, 3).join(', ') + 
                (dueTomorrow.length > 3 ? ` and ${dueTomorrow.length - 3} more...` : ''),
              duration: 5000,
            }
          );
        }, 1000); // Stagger the second toast
      }
    }, 500);

    hasShownReminders.current = true;
  }, [todos, loading]);
};

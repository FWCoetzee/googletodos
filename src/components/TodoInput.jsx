import { useState } from 'react';
import { Plus, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { todoSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const TodoInput = ({ onAdd }) => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const result = todoSchema.safeParse({ task: task.trim() });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      toast.error(errorMessage);
      return;
    }
    
    onAdd(result.data.task, dueDate);
    setTask('');
    setDueDate(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="flex-1 h-12 text-base shadow-sm border-border focus-visible:ring-primary"
      />
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-12 px-3 gap-2",
              dueDate && "text-primary border-primary"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {dueDate ? format(dueDate, 'MMM d') : <span className="hidden sm:inline">Due</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={(date) => {
              setDueDate(date);
              setCalendarOpen(false);
            }}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          {dueDate && (
            <div className="p-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setDueDate(null);
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
        type="submit" 
        size="lg"
        className="h-12 px-6 bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-lg transition-all"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add
      </Button>
    </form>
  );
};

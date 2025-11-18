import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { todoSchema } from '@/lib/validations';
import { toast } from 'sonner';

export const TodoInput = ({ onAdd }) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const result = todoSchema.safeParse({ task: task.trim() });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid input';
      toast.error(errorMessage);
      return;
    }
    
    onAdd(result.data.task);
    setTask('');
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

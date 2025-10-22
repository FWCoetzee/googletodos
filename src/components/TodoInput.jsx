import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TodoInput = ({ onAdd }) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      onAdd(task.trim());
      setTask('');
    }
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

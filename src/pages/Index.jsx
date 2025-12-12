import { useState, useEffect } from 'react';
import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { FilterBar } from '@/components/FilterBar';
import { Profile } from '@/components/Profile';
import { CheckSquare, LogOut, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { todoSchema } from '@/lib/validations';
import { useDueDateReminders } from '@/hooks/useDueDateReminders';

const Index = () => {
  const [filter, setFilter] = useState('all');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const { user, signOut } = useAuth();

  // Show toast reminders for tasks due today/tomorrow
  useDueDateReminders(todos, loading);

  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) return;
      
      setAvatarLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error.message);
      } finally {
        setAvatarLoading(false);
      }
    };

    loadAvatar();

    // Real-time subscription for avatar updates
    if (!user) return;
    
    const channel = supabase
      .channel('avatar-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new?.avatar_url !== undefined) {
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch todos from database
  const fetchTodos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      toast.error('Failed to load todos');
      if (import.meta.env.DEV) {
        console.error('Error fetching todos:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const addTodo = async (task, dueDate = null) => {
    if (!user) return;

    // Server-side validation
    const result = todoSchema.safeParse({ task });
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid task';
      toast.error(errorMessage);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ 
          task: result.data.task, 
          user_id: user.id, 
          completed: false,
          due_date: dueDate ? dueDate.toISOString() : null
        }])
        .select()
        .single();

      if (error) throw error;
      setTodos([data, ...todos]);
      toast.success('Task added!');
    } catch (error) {
      toast.error('Failed to add task');
      if (import.meta.env.DEV) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find((t) => t.id === id);
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    } catch (error) {
      toast.error('Failed to update task');
      if (import.meta.env.DEV) {
        console.error('Error toggling todo:', error);
      }
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter((t) => t.id !== id));
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task');
      if (import.meta.env.DEV) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const editTodo = async (id, newTask, newDueDate = undefined) => {
    // Server-side validation
    const result = todoSchema.safeParse({ task: newTask });
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || 'Invalid task';
      toast.error(errorMessage);
      return;
    }

    try {
      const updateData = { task: result.data.task };
      if (newDueDate !== undefined) {
        updateData.due_date = newDueDate ? newDueDate.toISOString() : null;
      }

      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map((t) => (t.id === id ? { ...t, ...updateData } : t)));
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
      if (import.meta.env.DEV) {
        console.error('Error editing todo:', error);
      }
    }
  };

  const reorderTodos = async (oldIndex, newIndex) => {
    const reorderedTodos = Array.from(todos);
    const [movedTodo] = reorderedTodos.splice(oldIndex, 1);
    reorderedTodos.splice(newIndex, 0, movedTodo);

    // Optimistically update the UI
    setTodos(reorderedTodos);

    try {
      // Update positions in database
      const updates = reorderedTodos.map((todo, index) => ({
        id: todo.id,
        position: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('todos')
          .update({ position: update.position })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      toast.error('Failed to reorder tasks');
      if (import.meta.env.DEV) {
        console.error('Error reordering todos:', error);
      }
      // Revert on error
      fetchTodos();
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  };

  const stats = {
    total: todos.length,
    active: todos.filter((todo) => !todo.completed).length,
    completed: todos.filter((todo) => todo.completed).length,
  };

  const filteredTodos = getFilteredTodos();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Logout button */}
            <div className="flex justify-end mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Prominent Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              {avatarLoading ? (
                <Skeleton className="h-24 w-24 rounded-full mb-3" />
              ) : (
                <Avatar 
                  className="h-24 w-24 ring-4 ring-primary/20 shadow-lg mb-3 cursor-pointer hover:ring-primary/40 transition-all"
                  onClick={() => setActiveTab('profile')}
                >
                  <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
              )}
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
              <CheckSquare className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Todo List
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay organized and get things done
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 md:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex mx-auto mb-6">
                <TabsTrigger value="todos" className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todos" className="space-y-6">
                <TodoInput onAdd={addTodo} />
                
                {todos.length > 0 && (
                  <FilterBar
                    currentFilter={filter}
                    onFilterChange={setFilter}
                    stats={stats}
                  />
                )}

                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                <TodoList
                  todos={filteredTodos}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                  onReorder={reorderTodos}
                />
                )}
              </TabsContent>

              <TabsContent value="profile">
                <Profile />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Built with React, Tailwind CSS, and Framer Motion</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;

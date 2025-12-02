import { useState, useEffect } from 'react';
import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { FilterBar } from '@/components/FilterBar';
import { Profile } from '@/components/Profile';
import { CheckSquare, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTodos } from '@/hooks/useTodos';
import { PageTransition } from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [filter, setFilter] = useState('all');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { user, signOut } = useAuth();
  const { todos, loading, addTodo, toggleTodo, deleteTodo, editTodo, reorderTodos } = useTodos();

  useEffect(() => {
    if (user) {
      loadAvatar();
    }
  }, [user]);

  const loadAvatar = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading avatar:', error.message);
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
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
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
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
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

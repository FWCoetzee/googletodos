import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const addTodo = async (task) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task, user_id: user.id, completed: false }])
        .select()
        .single();

      if (error) throw error;
      setTodos([data, ...todos]);
      toast.success('Task added!');
    } catch (error) {
      toast.error('Failed to add task');
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = async (id, newTask) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ task: newTask })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, task: newTask } : t));
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error editing todo:', error);
    }
  };

  return {
    todos,
    loading,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
};

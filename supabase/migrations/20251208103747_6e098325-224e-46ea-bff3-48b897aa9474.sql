-- Add due_date column to todos table
ALTER TABLE public.todos 
ADD COLUMN due_date timestamp with time zone DEFAULT NULL;
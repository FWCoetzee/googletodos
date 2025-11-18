import { z } from 'zod';

export const todoSchema = z.object({
  task: z.string()
    .trim()
    .min(1, { message: 'Task cannot be empty' })
    .max(500, { message: 'Task must be less than 500 characters' })
});

export type TodoInput = z.infer<typeof todoSchema>;

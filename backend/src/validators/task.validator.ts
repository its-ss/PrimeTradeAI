import { z } from 'zod';

const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must be at most 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .trim()
      .optional(),
    status: taskStatusEnum.optional().default('TODO'),
    priority: taskPriorityEnum.optional().default('MEDIUM'),
    dueDate: z.string().datetime({ message: 'Invalid date format (use ISO 8601)' }).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must be at most 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .trim()
      .nullable()
      .optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Invalid date format (use ISO 8601)' })
      .nullable()
      .optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Task ID is required' }),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    search: z.string().trim().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];

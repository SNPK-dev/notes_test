import { z } from 'zod'

export const persistedTodoSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  completed: z.boolean(),
})

export const persistedNoteSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  todos: z.array(persistedTodoSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const persistedNotesCollectionSchema = z.array(persistedNoteSchema)

export type PersistedTodoDto = z.infer<typeof persistedTodoSchema>
export type PersistedNoteDto = z.infer<typeof persistedNoteSchema>

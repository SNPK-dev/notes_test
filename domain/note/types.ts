export type Todo = {
  id: string
  text: string
  completed: boolean
}

export type Note = {
  id: string
  title: string
  todos: Todo[]
  createdAt: string
  updatedAt: string
}

export type PersistedTodo = Todo

export type PersistedNote = Note

export type TodoDraft = {
  id: string
  text: string
  completed: boolean
}

export type NoteDraft = {
  id: string | null
  title: string
  todos: TodoDraft[]
  createdAt: string | null
  updatedAt: string | null
  isNew: boolean
}

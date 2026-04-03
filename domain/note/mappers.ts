import type {
  Note,
  NoteDraft,
  PersistedNote,
  PersistedTodo,
  Todo,
  TodoDraft,
} from './types'
import type { PersistedNoteDto, PersistedTodoDto } from './schemas'

export function mapPersistedTodoDtoToTodo(dto: PersistedTodoDto): Todo {
  return {
    id: dto.id,
    text: dto.text,
    completed: dto.completed,
  }
}

export function mapPersistedNoteDtoToNote(dto: PersistedNoteDto): Note {
  return {
    id: dto.id,
    title: dto.title,
    todos: dto.todos.map(mapPersistedTodoDtoToTodo),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function mapTodoToPersistedTodo(todo: Todo): PersistedTodo {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
  }
}

export function mapNoteToPersistedNote(note: Note): PersistedNote {
  return {
    id: note.id,
    title: note.title,
    todos: note.todos.map(mapTodoToPersistedTodo),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

export function createDraftFromPersistedNote(note: PersistedNote): NoteDraft {
  return {
    id: note.id,
    title: note.title,
    todos: note.todos.map(mapPersistedTodoToDraftTodo),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    isNew: false,
  }
}

export function createEmptyNoteDraft(nowIso: string): NoteDraft {
  return {
    id: null,
    title: '',
    todos: [],
    createdAt: null,
    updatedAt: nowIso,
    isNew: true,
  }
}

export function mapDraftTodoToPersistedTodo(todo: TodoDraft): PersistedTodo {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
  }
}

export function mapDraftToPersistedNote(
  draft: NoteDraft,
  identity: { id: string; createdAt: string; updatedAt: string },
): PersistedNote {
  return {
    id: identity.id,
    title: draft.title,
    todos: draft.todos.map(mapDraftTodoToPersistedTodo),
    createdAt: identity.createdAt,
    updatedAt: identity.updatedAt,
  }
}

function mapPersistedTodoToDraftTodo(todo: PersistedTodo): TodoDraft {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
  }
}

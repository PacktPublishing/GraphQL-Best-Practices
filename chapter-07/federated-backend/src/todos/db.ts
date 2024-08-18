import { Todo } from '@/src/todos/models.js';
export type TodoModel = Todo & { owner: string };
export const db = {
  todos: [] as TodoModel[],
};

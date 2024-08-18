import { createResolvers } from '@/src/todos/axolotl.js';
import { TodoModel, db } from '@/src/todos/db.js';
import { User } from '@/src/todos/models.js';

export default createResolvers({
  AuthorizedUserQuery: {
    todos: async ([source]) => {
      const src = source as User;
      return db.todos.filter((todo) => todo.owner === src._id);
    },
    todo: async ([source], { _id }) => {
      const src = source as User;
      return db.todos.find((todo) => todo._id === _id && todo.owner === src._id);
    },
  },
  AuthorizedUserMutation: {
    createTodo: async ([source], { content }) => {
      const src = source as User;
      const _id = Math.random().toString(8);
      db.todos.push({ owner: src._id, content, _id });
      return _id;
    },
    todoOps: async ([source], { _id }) => {
      const src = source as User;
      return db.todos.find((todo) => todo._id === _id && todo.owner === src._id);
    },
  },
  TodoOps: {
    markDone: async ([source]) => {
      const src = source as TodoModel;
      const index = db.todos.findIndex((todo) => todo._id === src._id);
      db.todos.splice(index, 1, {
        ...src,
        done: true,
      });
    },
  },
});

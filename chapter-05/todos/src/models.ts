export interface TodoInput {
  title: string;
  userId: number;
}
export interface EditTodo {
  completed?: boolean | undefined;
  title?: string | undefined;
}

export type Models = {
  ['Todo']: {
    completed: {
      args: never;
    };
    title: {
      args: never;
    };
    userId: {
      args: never;
    };
    id: {
      args: never;
    };
  };
  ['Query']: {
    todos: {
      args: never;
    };
    getTodoById: {
      args: {
        id: number;
      };
    };
  };
  ['Mutation']: {
    createTodo: {
      args: {
        todo: TodoInput;
      };
    };
    updateTodo: {
      args: {
        id: unknown;
        todo: EditTodo;
      };
    };
    deleteTodo: {
      args: {
        id: unknown;
      };
    };
  };
};

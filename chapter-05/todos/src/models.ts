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
    addTodo: {
      args: {
        title: string;
      };
    };
  };
};

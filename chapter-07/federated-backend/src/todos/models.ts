export type Models = {
  ['Todo']: {
    _id: {
      args: Record<string, never>;
    };
    content: {
      args: Record<string, never>;
    };
    done: {
      args: Record<string, never>;
    };
  };
  ['User']: {
    _id: {
      args: Record<string, never>;
    };
  };
  ['TodoOps']: {
    markDone: {
      args: Record<string, never>;
    };
  };
  ['AuthorizedUserMutation']: {
    createTodo: {
      args: {
        content: string;
      };
    };
    todoOps: {
      args: {
        _id: string;
      };
    };
  };
  ['AuthorizedUserQuery']: {
    todos: {
      args: Record<string, never>;
    };
    todo: {
      args: {
        _id: string;
      };
    };
  };
};

export type Directives = unknown

export type Scalars = unknown;

export interface Todo {
  _id: string;
  content: string;
  done?: boolean | undefined;
}
export interface User {
  _id: string;
}
export interface TodoOps {
  markDone?: boolean | undefined;
}
export interface AuthorizedUserMutation {
  createTodo: string;
  todoOps: TodoOps;
}
export interface AuthorizedUserQuery {
  todos?: Array<Todo> | undefined;
  todo: Todo;
}

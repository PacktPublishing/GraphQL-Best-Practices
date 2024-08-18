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
  ['TodoOps']: {
    markDone: {
      args: Record<string, never>;
    };
  };
  ['User']: {
    _id: {
      args: Record<string, never>;
    };
    username: {
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
    changePassword: {
      args: {
        newPassword: string;
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
    me: {
      args: Record<string, never>;
    };
  };
  ['Mutation']: {
    user: {
      args: Record<string, never>;
    };
    login: {
      args: {
        username: string;
        password: string;
      };
    };
    register: {
      args: {
        username: string;
        password: string;
      };
    };
  };
  ['Query']: {
    user: {
      args: Record<string, never>;
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
export interface TodoOps {
  markDone?: boolean | undefined;
}
export interface User {
  _id: string;
  username: string;
}
export interface AuthorizedUserMutation {
  createTodo: string;
  todoOps: TodoOps;
  changePassword?: boolean | undefined;
}
export interface AuthorizedUserQuery {
  todos?: Array<Todo> | undefined;
  todo: Todo;
  me: User;
}
export interface Mutation {
  user: AuthorizedUserMutation;
  login: string;
  register: string;
}
export interface Query {
  user: AuthorizedUserQuery;
}

export type Models = {
  ['User']: {
    _id: {
      args: Record<string, never>;
    };
    username: {
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
  ['AuthorizedUserMutation']: {
    changePassword: {
      args: {
        newPassword: string;
      };
    };
  };
  ['AuthorizedUserQuery']: {
    me: {
      args: Record<string, never>;
    };
  };
};

export type Directives = unknown

export type Scalars = unknown;

export interface User {
  _id: string;
  username: string;
}
export interface Mutation {
  user: AuthorizedUserMutation;
  login: string;
  register: string;
}
export interface Query {
  user: AuthorizedUserQuery;
}
export interface AuthorizedUserMutation {
  changePassword?: boolean | undefined;
}
export interface AuthorizedUserQuery {
  me: User;
}

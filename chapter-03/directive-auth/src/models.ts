export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

export type Models = {
  ['User']: {
    id: {
      args: Record<string, never>;
    };
    name: {
      args: Record<string, never>;
    };
    email: {
      args: Record<string, never>;
    };
    role: {
      args: Record<string, never>;
    };
  };
  ['Query']: {
    users: {
      args: Record<string, never>;
    };
  };
};

export type Directives = {
    auth: {
      args: Record<string, never>;
    };
};

export interface User {
  id: unknown;
  name: string;
  email: string;
  role: Role;
}
export interface Query {
  users: Array<User>;
}

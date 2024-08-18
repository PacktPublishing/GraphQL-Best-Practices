import { UserModel, db } from '@/src/users/db.js';
import { createResolvers } from '@/src/users/axolotl.js';

export default createResolvers({
  AuthorizedUserQuery: {
    me: ([source]) => {
      const src = source as UserModel;
      return src;
    },
  },
  Mutation: {
    login: async (_, { password, username }) => {
      return db.users.find((u) => u.username === username && u.password === password)?.token;
    },
    register: async (_, { password, username }) => {
      const userExists = db.users.find((u) => u.username === username);
      if (userExists) throw new Error('User with that username already exists');
      const token = Math.random().toString(16);
      const _id = Math.random().toString(8);
      db.users.push({
        _id,
        token,
        password,
        username,
      });
      return token;
    },
    user: async (input) => {
      const token = input[2].request.headers.get('token');
      if (!token) throw new Error('Not authorized');
      const user = db.users.find((u) => u.token === token);
      if (!user) throw new Error('Not authorized');
      return user;
    },
  },
  Query: {
    user: async (input) => {
      const token = input[2].request.headers.get('token');
      if (!token) throw new Error('Not authorized');
      const user = db.users.find((u) => u.token === token);
      if (!user) throw new Error('Not authorized');
      return user;
    },
  },
  AuthorizedUserMutation: {
    changePassword: ([source], { newPassword }) => {
      const src = source as UserModel;
      const index = db.users.findIndex((u) => u._id === src._id);
      const token = Math.random().toString(16);
      db.users.splice(index, 1, {
        ...src,
        password: newPassword,
        token,
      });
      return src;
    },
  },
});

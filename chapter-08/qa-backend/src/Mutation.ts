import { getUserOrThrow } from '@/src/auth.js';
import { createResolvers } from '@/src/axolotl.js';
import { GraphQLError } from 'graphql';

export const Mutation = createResolvers({
  Mutation: {
    public: () => {
      return {};
    },
    user: async ([, , context]) => {
      const authHeader = context.request.headers.get('Authorization');
      if (!authHeader) throw new GraphQLError('You must be logged in to use this resolver');
      return getUserOrThrow(authHeader);
    },
  },
});

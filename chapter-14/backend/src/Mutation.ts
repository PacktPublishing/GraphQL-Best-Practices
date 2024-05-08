import { getUserOrThrow } from '@/src/auth.js';
import { createResolvers } from '@/src/axolotl.js';
import { MongOrb } from '@/src/orm.js';
import { GraphQLError } from 'graphql';

export default createResolvers({
  Mutation: {
    user: async (yoga) => {
      const authHeader = yoga[2].request.headers.get('Authorization');
      if (!authHeader) throw new GraphQLError('You must be logged in to use this resolver');
      return getUserOrThrow(authHeader);
    },
    public: async () => {},
    client: async (yoga) => {
      const authHeader = yoga[2].request.headers.get('Authorization');
      if (!authHeader) throw new GraphQLError('You must be logged in to use this resolver');
      const user = await getUserOrThrow(authHeader);
      const client = await MongOrb('Client').collection.findOne({
        user: user._id,
      });
      if (!client) throw new GraphQLError('Forbidden!. Register as a Client');
      return client;
    },
    salon: async (yoga) => {
      const authHeader = yoga[2].request.headers.get('Authorization');
      if (!authHeader) throw new GraphQLError('You must be logged in to use this resolver');
      const user = await getUserOrThrow(authHeader);
      const salon = await MongOrb('Salon').collection.findOne({
        user: user._id,
      });
      if (!salon) throw new GraphQLError('Forbidden!. Register as a Client');
      return salon;
    },
  },
});

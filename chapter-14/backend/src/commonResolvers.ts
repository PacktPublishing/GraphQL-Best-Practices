import { getUserOrThrow } from '@/src/auth.js';
import { MongOrb } from '@/src/orm.js';
import { GraphQLError } from 'graphql';
import { YogaInitialContext } from 'graphql-yoga';

export const commonUserResolver = async (yoga: [unknown, unknown, YogaInitialContext]) => {
  const src = yoga[0] as { user: string };
  return MongOrb('User').collection.findOne({
    _id: src.user,
  });
};

export const commonAuthUserResolver = async (yoga: [unknown, unknown, YogaInitialContext]) => {
  const authHeader = yoga[2].request.headers.get('Authorization');
  if (!authHeader) throw new GraphQLError('You must be logged in to use this resolver');
  return getUserOrThrow(authHeader);
};

export const commonAuthClientResolver = async (yoga: [unknown, unknown, YogaInitialContext]) => {
  const user = await commonAuthUserResolver(yoga);
  const client = await MongOrb('Client').collection.findOne({
    user: user._id,
  });
  if (!client) throw new GraphQLError('Forbidden!. Register as a Client');
  return client;
};

export const commonAuthSalonResolver = async (yoga: [unknown, unknown, YogaInitialContext]) => {
  const user = await commonAuthUserResolver(yoga);
  const salon = await MongOrb('Salon').collection.findOne({
    user: user._id,
  });
  if (!salon) throw new GraphQLError('Forbidden!. Register as a Client');
  return salon;
};

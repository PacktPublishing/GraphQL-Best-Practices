import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { MongOrb } from '@/src/orm.js';
import { GraphQLError } from 'graphql';

export const secretKey = 'your-secret-key';

export const passwordSha512 = (password: string, salt: string) => {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const passwordHash = hash.digest('hex');
  return {
    salt,
    passwordHash,
  };
};

export const comparePasswords = ({ password, hash, salt }: { password: string; hash: string; salt: string }) => {
  return hash === passwordSha512(password, salt).passwordHash;
};

export const decodeToken = (token: string) => {
  const verifiedToken = jwt.verify(token, secretKey);
  if (typeof verifiedToken !== 'object') {
    throw new GraphQLError('Token is not an object');
  }
  if (!verifiedToken.userId) {
    throw new GraphQLError('Invalid token');
  }
  return verifiedToken as { userId: string };
};

export const getUser = async (authorizationHeader: string) => {
  const { userId } = decodeToken(authorizationHeader);
  const user = await MongOrb('User').collection.findOne({
    _id: userId,
  });
  if (!user) {
    return;
  }
  return user;
};

export const getUserOrThrow = async (authorizationHeader: string) => {
  const user = await getUser(authorizationHeader);
  if (!user) {
    throw new GraphQLError('You are not logged in');
  }
  return user;
};

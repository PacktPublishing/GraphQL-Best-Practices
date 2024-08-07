import { createResolvers } from '@/src/axolotl.js';
import { MongOrb } from '@/src/orm.js';
import { GraphQLError } from 'graphql';
import crypto from 'crypto';
import { comparePasswords, passwordSha512, secretKey } from '@/src/auth.js';
import jwt from 'jsonwebtoken';

export const PublicMutation = createResolvers({
  PublicMutation: {
    register: async (_, { username, password }) => {
      const userExists = await MongOrb('User').collection.findOne({ username });
      if (userExists) throw new GraphQLError('User already exist with this username');
      const s = crypto.randomBytes(8).toString('hex');
      const { passwordHash, salt } = passwordSha512(password, s);
      const user = await MongOrb('User').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        username,
        passwordHash,
        salt,
      });
      const token = jwt.sign({ userId: user.insertedId }, secretKey);
      return {
        token,
        user,
      };
    },
    login: async (_, { username, password }) => {
      const user = await MongOrb('User').collection.findOne({
        username,
      });
      if (!user) {
        throw new GraphQLError('User not found');
      }
      const validPass = comparePasswords({ password, hash: user.passwordHash, salt: user.salt });
      if (!validPass) {
        throw new GraphQLError('Invalid password');
      }
      const token = jwt.sign({ userId: user._id }, secretKey);
      return {
        token,
        user,
      };
    },
  },
});

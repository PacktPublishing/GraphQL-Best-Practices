import { MongOrb, UserModel } from '@/src/orm.js';
import { createResolvers } from '@/src/axolotl.js';
import { GraphQLError } from 'graphql';

export const UserMutation = createResolvers({
  UserMutation: {
    postQuestion: async ([source], args) => {
      const userSource = source as UserModel;
      const result = await MongOrb('Question').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        ...args.createQuestion,
        score: 0,
        user: userSource.username,
        answers: [],
      });
      return result.insertedId;
    },
    vote: async ([source], args) => {
      const q = await MongOrb('Question').collection.findOne({
        _id: args._id,
      });
      if (!q) {
        const a = await MongOrb('Answer').collection.findOne({
          _id: args._id,
        });
        if (!a) throw new GraphQLError(`Question or Answer with id "${args._id}" does not exist anymore.`);
        await MongOrb('Answer').collection.updateOne(
          { _id: args._id },
          {
            $inc: {
              score: 1,
            },
          },
        );
        return a?.score + 1;
      } else {
        await MongOrb('Question').collection.updateOne(
          { _id: args._id },
          {
            $inc: {
              score: 1,
            },
          },
        );
        return q?.score + 1;
      }
    },
    postAnswer: async ([source], args) => {
      const userSource = source as UserModel;
      const [q, a] = await Promise.all([
        MongOrb('Question').collection.findOne({
          _id: args.createAnswer.to,
        }),
        MongOrb('Answer').collection.findOne({
          _id: args.createAnswer.to,
        }),
      ]);
      const object = q || a;
      if (!object) {
        throw new GraphQLError(`Question or Answer with id "${args.createAnswer.to}" does not exist anymore.`);
      }
      const result = await MongOrb('Answer').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        answers: [],
        content: args.createAnswer.content,
        score: 0,
        user: userSource.username,
        to: object._id,
      });
      return result.insertedId;
    },
  },
});

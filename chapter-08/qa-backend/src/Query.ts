import { MongOrb } from '@/src/orm.js';
import { createResolvers } from '@/src/axolotl.js';
import { getUserOrThrow } from '@/src/auth.js';
import { GraphQLError } from 'graphql';

export const Query = createResolvers({
  Query: {
    question: (_, args) => {
      return MongOrb('Question').collection.findOne({
        _id: args._id,
      });
    },
    search: async (_, args) => {
      const questions = await MongOrb('Question')
        .collection.find(
          {
            $text: {
              $caseSensitive: false,
              $search: args.query,
            },
          },
          {
            sort: {
              score: 1,
            },
          },
        )
        .toArray();
      const answers = await MongOrb('Answer')
        .collection.find({
          to: {
            $in: questions.map((tq) => tq._id),
          },
        })
        .sort('score', 'desc')
        .toArray();
      return questions.map((question) => ({
        question,
        bestAnswer: answers.filter((a) => a.to === question._id)?.[0],
      }));
    },
    me: ([_, __, context]) => {
      const authHeader = context.request.headers.get('Authorization');
      if (!authHeader) throw new GraphQLError('You must be logged in to use this resolver');
      return getUserOrThrow(authHeader);
    },
    top: async () => {
      const topQuestions = await MongOrb('Question')
        .collection.find(
          {},
          {
            sort: {
              score: 1,
            },
            limit: 10,
          },
        )
        .toArray();
      const answers = await MongOrb('Answer')
        .collection.find({
          to: {
            $in: topQuestions.map((tq) => tq._id),
          },
        })
        .sort('score', 'desc')
        .toArray();
      return topQuestions.map((tq) => ({
        question: tq,
        bestAnswer: answers.filter((a) => a.to === tq._id)?.[0],
      }));
    },
  },
});

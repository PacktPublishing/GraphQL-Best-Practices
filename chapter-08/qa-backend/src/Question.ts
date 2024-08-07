import { MongOrb, QuestionModel } from '@/src/orm.js';
import { createResolvers } from '@/src/axolotl.js';

export const Question = createResolvers({
  Question: {
    user: async ([source]) => {
      const questionSource = source as QuestionModel;
      return MongOrb('User').collection.findOne({
        username: questionSource.user,
      });
    },
    answers: async ([source]) => {
      const questionSource = source as QuestionModel;
      return MongOrb('Answer')
        .collection.find({
          to: questionSource._id,
        })
        .toArray();
    },
  },
});

import { AnswerModel, MongOrb } from '@/src/orm.js';
import { createResolvers } from '@/src/axolotl.js';

export const Answer = createResolvers({
  Answer:{
    user: async ([source]) => {
      const answerSource = source as AnswerModel
      return MongOrb("User").collection.findOne({
        username: answerSource.user
      })
    },
    answers: async ([source]) => {
      const answerSource = source as AnswerModel
      return MongOrb("Answer").collection.find({
        to:answerSource._id
      }).toArray()
    },
    to: async ([source]) => {
      const answerSource = source as {to:string}
      const [q,a] = await Promise.all([MongOrb("Question").collection.findOne({
        _id: answerSource.to
      }),MongOrb("Answer").collection.findOne({
        _id:answerSource.to
      })])
      return q || a
    }
  },
});


import { Answer, Question, User } from '@/src/models.js';
import { iGraphQL, MongoModel } from 'i-graphql';
import { ObjectId } from 'mongodb';

export type UserModel = MongoModel<User> & {
  passwordHash: string;
  salt: string;
};
export type QuestionModel = MongoModel<Question>;
export type AnswerModel = MongoModel<Answer>;

export const orm = async () => {
  return iGraphQL<
    {
      Question: QuestionModel;
      Answer: AnswerModel;
      User: UserModel;
    },
    {
      _id: () => string;
      createdAt: () => string;
      updatedAt: () => string;
    }
  >({
    autoFields: {
      _id: () => new ObjectId().toHexString(),
      createdAt: () => new Date().toISOString(),
      updatedAt: () => new Date().toISOString(),
    },
  });
};

export const MongOrb = await orm();

MongOrb('Question').collection.createIndex({
  content: 'text',
  title: 'text',
});

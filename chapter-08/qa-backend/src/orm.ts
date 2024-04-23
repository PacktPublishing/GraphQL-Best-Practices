import { ModelTypes } from "@/src/zeus/index.js";
import { iGraphQL,MongoModel } from "i-graphql";
import { ObjectId } from "mongodb";

export type UserModel =  MongoModel<ModelTypes['User']> & {
  passwordHash:string;
  salt:string;
}
export type QuestionModel = MongoModel<ModelTypes['Question']>
export type AnswerModel = MongoModel<ModelTypes['Answer']>

export const orm = async () => {
    return iGraphQL<
      {
        Question: QuestionModel,
        Answer: AnswerModel,
        User: UserModel
      },
      {
        _id: () => string;
        createdAt: () => string;
        updatedAt: () => string;
      }
    >({
      _id: () => new ObjectId().toHexString(),
      createdAt: () => new Date().toISOString(),
      updatedAt: () => new Date().toISOString(),
    });
  };
  
  export const MongOrb = await orm();

  MongOrb("Question").collection.createIndex({
        "content":"text",
        "title":"text"
  })
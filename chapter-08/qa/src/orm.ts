import { ModelTypes } from "@/src/zeus/index.js";
import { iGraphQL,MongoModel } from "i-graphql";
import { ObjectId } from "mongodb";

export const orm = async () => {
    return iGraphQL<
      {
        Question: MongoModel<ModelTypes['Question']>,
        Answer: MongoModel<ModelTypes['Answer']>,
        User: MongoModel<ModelTypes['User']> & {
            passwordHash:string;
            salt:string;
        }
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
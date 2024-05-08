import { ModelTypes } from '@/src/zeus/index.js';
import { iGraphQL, MongoModel } from 'i-graphql';
import { ObjectId } from 'mongodb';

export type UserModel = MongoModel<ModelTypes['User']> & {
  passwordHash: string;
  salt: string;
};

export type SalonModel = MongoModel<ModelTypes['SalonProfile']>;
export type SalonClientModel = MongoModel<ModelTypes['SalonClient']>;
export type ClientModel = MongoModel<ModelTypes['Client']>;
export type VisitModel = MongoModel<ModelTypes['Visit']>;
export type ServiceModel = MongoModel<ModelTypes['Service']>;

export const orm = async () => {
  return iGraphQL<
    {
      User: UserModel;
      Salon: SalonModel;
      SalonClient: SalonClientModel;
      Client: ClientModel;
      Visit: VisitModel;
      Service: ServiceModel;
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

MongOrb('User').collection.createIndex(
  {
    username: 1,
  },
  { unique: true },
);

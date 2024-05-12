import { ModelTypes } from '@/src/zeus/index.js';
import { iGraphQL, MongoModel } from 'i-graphql';
import { ObjectId } from 'mongodb';

export type UserModel = MongoModel<ModelTypes['User']> & {
  passwordHash: string;
  salt: string;
};

export type SalonModel = Omit<MongoModel<ModelTypes['SalonProfile']>, 'services'>;
export type SalonClientModel = Omit<MongoModel<ModelTypes['SalonClient']>, 'messageThread'>;
export type ClientModel = MongoModel<ModelTypes['Client']>;
export type VisitModel = MongoModel<ModelTypes['Visit']>;
export type ServiceModel = MongoModel<ModelTypes['Service']>;
export type MessageThreadModel = MongoModel<ModelTypes['MessageThread']>;
export type MessageModel = MongoModel<ModelTypes['Message']>;

export const orm = async () => {
  return iGraphQL<
    {
      User: UserModel;
      Salon: SalonModel;
      SalonClient: SalonClientModel;
      Client: ClientModel;
      Visit: VisitModel;
      Service: ServiceModel;
      Message: MessageModel;
      MessageThread: MessageThreadModel;
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

MongOrb('Client').collection.createIndex(
  {
    user: 1,
  },
  { unique: true },
);

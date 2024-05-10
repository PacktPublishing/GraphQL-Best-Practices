import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, SalonModel } from '@/src/orm.js';
import { VisitStatus } from '@/src/zeus/index.js';
import { GraphQLError } from 'graphql';

export default createResolvers({
  SalonOps: {
    createVisit: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      const Service = await MongOrb('Service').collection.findOne({
        salon: src._id,
        _id: args.visit.serviceId,
      });
      if (!Service) throw new GraphQLError('Forbidden! Cannot create visit for other salon');
      const result = await MongOrb('Visit').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        service: args.visit.serviceId,
        client: args.visit.userId,
        whenDateTime: args.visit.whenDateTime,
        status: VisitStatus.CREATED,
      });
      return result.insertedId;
    },
    delete: async (yoga) => {
      const src = yoga[0] as SalonModel;
      const result = await MongOrb('Salon').collection.deleteOne({
        _id: src._id,
      });
      return !!result.acknowledged;
    },
    update: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      const result = await MongOrb('Salon').collection.updateOne(
        {
          _id: src._id,
        },
        {
          $set: {
            ...args.salon,
          },
        },
      );
      return !!result.acknowledged;
    },
    createService: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      const result = await MongOrb('Service').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        ...args.service,
        salon: src._id,
      });
      return result.insertedId;
    },
    serviceOps: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      return MongOrb('Service').collection.findOne({
        _id: args._id,
        salon: src._id,
      });
    },
    visitOps: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      return MongOrb('Visit').collection.findOne({
        _id: args._id,
        salon: src._id,
      });
    },
    sendMessage: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      const thread = await MongOrb('MessageThread').collection.findOneAndUpdate(
        {
          salon: src._id,
          client: args.salonClientId,
        },
        {
          $setOnInsert: {
            salon: src._id,
            client: args.salonClientId,
          },
        },
        {
          upsert: true,
        },
      );
      if (!thread) throw new GraphQLError('Corrupted message thread. Please try again');
      const result = await MongOrb('Message').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        messageThread: thread._id,
        sender: src._id,
        message: args.message.message,
      });
      return !!result.insertedId;
    },
  },
});

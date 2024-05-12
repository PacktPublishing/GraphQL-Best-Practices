import { createResolvers } from '@/src/axolotl.js';
import { ClientModel, MongOrb } from '@/src/orm.js';
import { VisitError, VisitStatus, RegistrationError } from '@/src/zeus/index.js';
import { GraphQLError } from 'graphql';

export default createResolvers({
  ClientOps: {
    createVisit: async (yoga, args) => {
      const src = yoga[0] as ClientModel;
      const result = await MongOrb('Visit').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        client: src._id,
        service: args.visit.serviceId,
        whenDateTime: args.visit.whenDateTime,
        status: VisitStatus.CREATED,
      });
      if (!result.insertedId) {
        return {
          errors: [VisitError.INVALID_DATE],
        };
      }
      return;
    },
    update: async (yoga, args) => {
      const src = yoga[0] as ClientModel;
      const result = await MongOrb('Client').collection.updateOne(
        { _id: src._id },
        {
          $set: {
            ...args.client,
          },
        },
      );
      if (!result.acknowledged) {
        return [RegistrationError.EXISTS_WITH_SAME_NAME];
      }
      return {};
    },
    sendMessage: async (yoga, args) => {
      const src = yoga[0] as ClientModel;
      const thread = await MongOrb('MessageThread').collection.findOneAndUpdate(
        {
          client: src._id,
          salon: args.salonId,
        },
        {
          $setOnInsert: {
            client: src._id,
            salon: args.salonId,
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
    registerToSalon: async (yoga, args) => {
      const src = yoga[0] as ClientModel;
      const Salon = await MongOrb('Salon').collection.findOne({
        slug: args.salonSlug,
      });
      if (!Salon) throw new GraphQLError('Salon with the following slug does not exist');

      const exists = await MongOrb('SalonClient').collection.findOne({
        salon: Salon._id,
        client: src._id,
      });
      if (exists) {
        throw new GraphQLError('This client already exist in this salon');
      }
      const result = await MongOrb('SalonClient').createWithAutoFields(
        '_id',
        'updatedAt',
        'createdAt',
      )({
        client: src._id,
        salon: Salon._id,
        visits: [],
      });
      return !!result.insertedId;
    },
  },
});

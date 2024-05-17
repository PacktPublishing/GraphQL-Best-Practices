import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, SalonClientModel } from '@/src/orm.js';
import { VisitError, VisitStatus } from '@/src/zeus/index.js';
import { GraphQLError } from 'graphql';

export default createResolvers({
  SalonClientOps: {
    createVisit: async (yoga, args) => {
      const src = yoga[0] as SalonClientModel;
      try {
        new Date(args.visit.whenDateTime);
      } catch (error) {
        return [VisitError.INVALID_DATE];
      }
      await MongOrb('Visit').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        client: src.client,
        service: args.visit.serviceId,
        whenDateTime: args.visit.whenDateTime,
        status: VisitStatus.CREATED,
      });
      return;
    },
    sendMessage: async (yoga, args) => {
      const src = yoga[0] as SalonClientModel;
      const thread = await MongOrb('MessageThread').collection.findOneAndUpdate(
        {
          salonClient: src._id,
        },
        {
          $setOnInsert: {
            salonClient: src._id,
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

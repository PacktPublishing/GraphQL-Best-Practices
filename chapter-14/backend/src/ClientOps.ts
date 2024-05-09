import { createResolvers } from '@/src/axolotl.js';
import { ClientModel, MongOrb } from '@/src/orm.js';
import { VisitError, VisitStatus, RegistrationError } from '@/src/zeus/index.js';

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
      return {};
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
  },
});

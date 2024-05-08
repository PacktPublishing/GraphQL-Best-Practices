import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, SalonModel } from '@/src/orm.js';
import { VisitStatus } from '@/src/zeus/index.js';

export default createResolvers({
  SalonOps: {
    createVisit: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      const result = await MongOrb('Visit').createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        salon: src._id,
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
  },
});

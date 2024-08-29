import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, SalonModel } from '@/src/orm.js';

export default createResolvers({
  SalonQuery: {
    analytics: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      return {
        model: src,
        args,
      };
    },
    clients: async (yoga) => {
      const src = yoga[0] as SalonModel;
      return MongOrb('SalonClient')
        .collection.find({
          salon: src._id,
        })
        .toArray();
    },
    client: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      return MongOrb('SalonClient').collection.findOne({
        _id: args._id,
        salon: src._id,
      });
    },
    visits: async (yoga, args) => {
      const src = yoga[0] as SalonModel;
      const services = await MongOrb('Service')
        .collection.find({
          salon: src._id,
        })
        .toArray();
      return MongOrb('Visit')
        .collection.find({
          service: {
            $in: services.map((s) => s._id),
          },
          whenDateTime: {
            $gte: args.filterDates.from,
            ...(args.filterDates.to
              ? {
                  $lte: args.filterDates.to,
                }
              : {}),
          },
        })
        .toArray();
    },
    me: async (yoga) => {
      const src = yoga[0] as SalonModel;
      return src;
    },
  },
});

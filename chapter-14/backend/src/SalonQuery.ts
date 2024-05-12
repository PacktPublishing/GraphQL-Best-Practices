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
    services: async (yoga) => {
      const src = yoga[0] as SalonModel;
      return MongOrb('Service')
        .collection.find({
          salon: src._id,
        })
        .toArray();
    },
    visits: async (yoga) => {
      const src = yoga[0] as SalonModel;
      src;
      return MongOrb('Visit').collection.find({}).toArray();
    },
    me: async (yoga) => {
      const src = yoga[0] as SalonModel;
      return src;
    },
  },
});

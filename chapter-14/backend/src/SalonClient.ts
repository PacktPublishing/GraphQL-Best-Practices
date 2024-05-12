import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, SalonClientModel } from '@/src/orm.js';

export default createResolvers({
  SalonClient: {
    client: async (yoga) => {
      const src = yoga[0] as SalonClientModel;
      return MongOrb('Client').collection.findOne({
        _id: src.client,
      });
    },
    salon: async (yoga) => {
      const src = yoga[0] as SalonClientModel;
      return MongOrb('Salon').collection.findOne({
        _id: src.salon,
      });
    },
    visits: async (yoga) => {
      const src = yoga[0] as SalonClientModel;
      return MongOrb('Visit')
        .collection.find({
          client: src.client,
        })
        .toArray();
    },
    messageThread: async (yoga) => {
      const src = yoga[0] as SalonClientModel;
      return MongOrb('MessageThread').collection.findOne({
        client: src._id,
        salon: src.salon,
      });
    },
  },
});

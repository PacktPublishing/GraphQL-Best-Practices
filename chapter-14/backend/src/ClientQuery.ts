import { createResolvers } from '@/src/axolotl.js';
import { ClientModel, MongOrb } from '@/src/orm.js';

export default createResolvers({
  ClientQuery: {
    me: async (yoga) => {
      const src = yoga[0] as ClientModel;
      return src;
    },
    clients: async (yoga) => {
      const src = yoga[0] as ClientModel;
      return MongOrb('SalonClient')
        .collection.find({
          client: src._id,
        })
        .toArray();
    },
  },
});

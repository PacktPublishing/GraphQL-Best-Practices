import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, VisitModel } from '@/src/orm.js';

export default createResolvers({
  Visit: {
    client: async (yoga) => {
      const src = yoga[0] as VisitModel;
      return MongOrb('SalonClient').collection.findOne({
        _id: src.client,
      });
    },
    service: async (yoga) => {
      const src = yoga[0] as VisitModel;
      if (!src.service) return null;
      return MongOrb('Service').collection.findOne({
        _id: src.service,
      });
    },
  },
});

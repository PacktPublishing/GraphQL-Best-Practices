import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, ServiceModel } from '@/src/orm.js';

export default createResolvers({
  Service: {
    salon: async (yoga) => {
      const src = yoga[0] as ServiceModel;
      return MongOrb('Salon').collection.findOne({
        _id: src.salon,
      });
    },
  },
});

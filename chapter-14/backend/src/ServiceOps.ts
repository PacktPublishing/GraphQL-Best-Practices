import { createResolvers } from '@/src/axolotl.js';
import { MongOrb, ServiceModel } from '@/src/orm.js';

export default createResolvers({
  ServiceOps: {
    delete: async (yoga) => {
      const src = yoga[0] as ServiceModel;
      const result = await MongOrb('Service').collection.deleteOne({
        _id: src._id,
      });
      return !!result.acknowledged;
    },
    update: async (yoga, args) => {
      const src = yoga[0] as ServiceModel;
      const result = await MongOrb('Service').collection.updateOne(
        {
          _id: src._id,
        },
        {
          $set: {
            ...args.service,
          },
        },
      );
      return !!result.acknowledged;
    },
  },
});

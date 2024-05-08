import { createResolvers } from '@/src/axolotl.js';
import { MongOrb } from '@/src/orm.js';

export default createResolvers({
  AuthPayload: {
    user: async (yoga) => {
      const src = yoga[0] as { user: string };
      return MongOrb('User').collection.findOne({
        _id: src.user,
      });
    },
  },
});

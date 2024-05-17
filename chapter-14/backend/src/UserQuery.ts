import { createResolvers } from '@/src/axolotl.js';
import { commonClientResolver, commonSalonResolver } from '@/src/commonResolvers.js';
import { UserModel } from '@/src/orm';

export default createResolvers({
  UserQuery: {
    client: commonClientResolver,
    salon: commonSalonResolver,
    me: async (yoga) => {
      const src = yoga[0] as UserModel;
      return src;
    },
  },
});

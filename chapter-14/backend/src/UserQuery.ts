import { createResolvers } from '@/src/axolotl.js';
import { commonAuthClientResolver, commonAuthSalonResolver } from '@/src/commonResolvers.js';
import { UserModel } from '@/src/orm';

export default createResolvers({
  UserQuery: {
    client: commonAuthClientResolver,
    salon: commonAuthSalonResolver,
    me: async (yoga) => {
      const src = yoga[0] as UserModel;
      return src;
    },
  },
});

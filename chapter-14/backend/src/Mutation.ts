import { createResolvers } from '@/src/axolotl.js';
import { commonAuthClientResolver, commonAuthSalonResolver, commonAuthUserResolver } from '@/src/commonResolvers.js';

export default createResolvers({
  Mutation: {
    user: commonAuthUserResolver,
    public: async () => ({}),
    client: commonAuthClientResolver,
    salon: commonAuthSalonResolver,
  },
});

import { createResolvers } from '@/src/axolotl.js';
import { commonAuthUserResolver } from '@/src/commonResolvers.js';

export default createResolvers({
  Mutation: {
    user: commonAuthUserResolver,
    public: async () => ({}),
  },
});

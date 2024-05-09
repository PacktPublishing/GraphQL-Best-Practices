import { createResolvers } from '@/src/axolotl.js';
import { commonAuthClientResolver, commonAuthSalonResolver } from '@/src/commonResolvers.js';

export default createResolvers({
  Query: {
    client: commonAuthClientResolver,
    salon: commonAuthSalonResolver,
  },
});

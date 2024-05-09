import { createResolvers } from '@/src/axolotl.js';
import { commonUserResolver } from '@/src/commonResolvers.js';

export default createResolvers({
  AuthPayload: {
    user: commonUserResolver,
  },
});

import AuthPayload from '@/src/AuthPayload.js';
import Mutation from '@/src/Mutation.js';
import PublicMutation from '@/src/PublicMutation.js';
import SalonProfile from '@/src/SalonProfile.js';
import UserOps from '@/src/UserOps.js';
import { createResolvers } from '@/src/axolotl.js';

const resolvers = createResolvers({
  ...Mutation,
  ...PublicMutation,
  ...UserOps,
  ...SalonProfile,
  ...AuthPayload,
});

export default resolvers;

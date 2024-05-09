import AuthPayload from '@/src/AuthPayload.js';
import ClientOps from '@/src/ClientOps.js';
import ClientQuery from '@/src/ClientQuery.js';
import Mutation from '@/src/Mutation.js';
import PublicMutation from '@/src/PublicMutation.js';
import Query from '@/src/Query.js';
import SalonAnalytics from '@/src/SalonAnalytics.js';
import SalonClient from '@/src/SalonClient.js';
import SalonOps from '@/src/SalonOps.js';
import SalonProfile from '@/src/SalonProfile.js';
import SalonQuery from '@/src/SalonQuery.js';
import Service from '@/src/Service.js';
import UserOps from '@/src/UserOps.js';
import Visit from '@/src/Visit.js';
import VisitOps from '@/src/VisitOps.js';
import { createResolvers } from '@/src/axolotl.js';

const resolvers = createResolvers({
  ...Query,
  ...Mutation,
  ...PublicMutation,
  ...UserOps,
  ...ClientQuery,
  ...ClientOps,
  ...SalonProfile,
  ...AuthPayload,
  ...SalonAnalytics,
  ...SalonOps,
  ...SalonClient,
  ...SalonQuery,
  ...Service,
  ...Visit,
  ...VisitOps,
});

export default resolvers;

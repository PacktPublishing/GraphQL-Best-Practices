import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';
import { createResolvers } from '@/src/axolotl.js';
import { UserMutation } from '@/src/UserMutation.js';
import { Query } from '@/src/Query.js';
import { Mutation } from '@/src/Mutation.js';
import { PublicMutation } from '@/src/PublicMutation.js';
import { Question } from '@/src/Question.js';
import { Answer } from '@/src/Answer.js';

const resolvers = createResolvers({
  ...Query,
  ...Mutation,
  ...PublicMutation,
  ...UserMutation,
  ...Question,
  ...Answer,
});

graphqlYogaAdapter(resolvers).listen(parseInt(process.env.PORT || '4000'), () => {
  console.log('LISTENING to ' + (process.env.PORT || '4000'));
});

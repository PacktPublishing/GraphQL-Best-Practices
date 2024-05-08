import resolvers from '@/src/resolvers.js';
import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';

// This is yoga specific

graphqlYogaAdapter(resolvers).listen(parseInt(process.env.PORT || '4000'), () => {
  console.log('LISTENING to ' + process.env.PORT || '4000');
});

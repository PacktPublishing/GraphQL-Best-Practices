import resolvers from '@/src/resolvers.js';
import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';

// This is yoga specific
const p = process.env.PORT || '4000';
graphqlYogaAdapter(resolvers).listen(parseInt(p), () => {
  console.log('LISTENING to ' + p);
});

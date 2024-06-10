import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';
import resolvers from '@/src/resolvers.js';

graphqlYogaAdapter(resolvers, {
  yoga: {
    maskedErrors: false,
  },
}).listen(parseInt(process.env.PORT || '4000'), () => {
  console.log('LISTENING to ' + process.env.PORT || '4000');
});

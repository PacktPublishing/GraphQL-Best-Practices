import { Axolotl } from '@aexol/axolotl-core';
import { Models } from '@/src/models.js';
import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';
import fetch from 'node-fetch';

const { createResolvers } = Axolotl(graphqlYogaAdapter)<Models>({
  modelsPath: './src/models.ts',
  schemaPath: './schema.graphql',
});


const resolvers = createResolvers({
  Query: {
    todos:async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos')
      const json = await response.json()
      return json
    },
    getTodoById: async (p,args) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${args.id}/`)
      const json = await response.json()
      return json
    }
  },
  Mutation:{
    addTodo:async (p,args) => {
      return {}
    }
  }
});


graphqlYogaAdapter(resolvers).listen(parseInt(process.env.PORT || '4000'), () => {
  console.log('LISTENING to ' + process.env.PORT || '4000');
});

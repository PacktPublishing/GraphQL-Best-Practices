import { Axolotl } from '@aexol/axolotl-core';
import { Models } from '@/src/models.js';
import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';
import fetch from 'node-fetch';

const { createResolvers } = Axolotl(graphqlYogaAdapter)<Models>({
  modelsPath: './src/models.ts',
  schemaPath: './schema.graphql',
});
interface CacheObject{
  object?: unknown
}
let cachedTodosList:CacheObject

const resolvers = createResolvers({
  Query: {
    todos:async () => {
      if(cachedTodosList){
        return cachedTodosList.object
      }
      const response = await fetch('https://jsonplaceholder.typicode.com/todos')
      const json = await response.json()
      cachedTodosList = {
        object:json
      }
      return json
    },
    getTodoById: async (p,args) => {
      p[2].request.headers
      if(cachedTodosList.object){
        return (cachedTodosList.object as {id:number}[]).find(o => o.id === args.id)
      }
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${args.id}/`,{
        headers:{...p[2].request.headers}
      })
      const json = await response.json()
      return json
    }
  },
  Mutation:{
    createTodo: async (p, args) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/`,{
        method:"POST",
        body:JSON.stringify(args.todo),
        headers:{
          "Content-Type":"application/json"
        }
      })
      delete cachedTodosList.object
      const json = await response.json()
      return json
    },
    updateTodo: async (p, args) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${args.id}/`,{
        method:"PUT",
        body:JSON.stringify(args.todo),
        headers:{
          "Content-Type":"application/json"
        }
      })
      delete cachedTodosList.object
      const json = await response.json()
      return json
    },
    deleteTodo: async (p, args) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${args.id}/`,{
        method:"DELETE",
      })
      delete cachedTodosList.object
      const json = await response.json()
      return !!json
    }
  }
});


graphqlYogaAdapter(resolvers).listen(parseInt(process.env.PORT || '4000'), () => {
  console.log('LISTENING to ' + process.env.PORT || '4000');
});

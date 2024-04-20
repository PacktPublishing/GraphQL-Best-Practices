import { MongOrb } from '@/src/orm.js';
import { createResolvers } from '@/src/axolotl.js';
import { getUserOrThrow } from '@/src/auth.js';
import { GraphQLError } from 'graphql';

export const Query = createResolvers({
  Query: {
    question:(_,args) => {
      return MongOrb('Question').collection.findOne({
        _id:args._id
      })
    },
    search: async (_,args) => {
      const questions = await MongOrb("Question").collection.find({
        $text:{
          $caseSensitive:false,
          $search:args.query
        }
      },{
        sort:{
            score:1
        }
      }).toArray()
      return questions.map(question => ({
        question
      }))
    },
    me:([_,__,context]) => {
        const authHeader = context.request.headers.get("Authorization")
        if(!authHeader) throw new GraphQLError("You must be logged in to use this resolver")
        return getUserOrThrow(authHeader)
    },
    top:() => {
        return MongOrb('Question').collection.find({},{
            sort:{
                score: 1
            },
            limit: 10
        }).toArray()
    }
  },
});

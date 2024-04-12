import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';
import { MongOrb } from '@/src/orm.js';
import { createResolvers } from '@/src/axolotl.js';
import { authResolvers, getUserFromHeaderOrThrow } from "@/src/auth.js";
import { GraphQLError } from 'graphql';

const resolvers = createResolvers({
  ...authResolvers,
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
      }).toArray()
      return questions.map(question => ({
        question
      }))
    }
  },
  Question:{
    user: async ([source]) => {
      const questionSource = source as {user:string}
      return MongOrb("User").collection.findOne({
        username: questionSource.user
      })
    },
    answers: async ([source]) => {
      const questionSource = source as {_id:string}
      return MongOrb("Answer").collection.find({
        to: questionSource._id
      }).toArray()
    }
  },
  Answer:{
    user: async ([source]) => {
      const answerSource = source as {user:string}
      return MongOrb("User").collection.findOne({
        username: answerSource.user
      })
    },
    answers: async ([source]) => {
      const answerSource = source as {_id:string}
      return MongOrb("Answer").collection.find({
        to:answerSource._id
      }).toArray()
    },
    to: async ([source]) => {
      const answerSource = source as {to:string}
      const [q,a] = await Promise.all([MongOrb("Question").collection.findOne({
        _id: answerSource.to
      }),MongOrb("Answer").collection.findOne({
        _id:answerSource.to
      })])
      const object = q || a
      return object
    }
  },
  Mutation: {
    public:() => {
      return {}
    },
    user:async ([_,__,context]) => {
      const authHeader = context.request.headers.get("Authorization")
      if(!authHeader) throw new GraphQLError("You must be logged in to use this resolver")
      return getUserFromHeaderOrThrow(authHeader)
    }
  },
  UserMutation:{
    postQuestion: async ([source],args) => {
      const userSource = source as { username:string }
      const result = await MongOrb("Question").createWithAutoFields('_id','createdAt','updatedAt')({
        ...args.createQuestion,
        score: 0,
        user:userSource.username,
        answers:[],
      })
      return result.insertedId
    },
    vote: async ([source], args) => {
      const q = await MongOrb("Question").collection.findOne({
        _id: args._id
      })
      if(!q){
        const a = await MongOrb("Answer").collection.findOne({
          _id: args._id
        })
        if(!a) throw new GraphQLError(`Question or Answer with id "${args._id}" does not exist anymore.`)
        await MongOrb("Answer").collection.updateOne({_id:args._id},{
          $inc:{
            score:1
          }
        })
      }else{
        await MongOrb("Question").collection.updateOne({_id:args._id},{
          $inc:{
            score:1
          }
        })
        return q?.score+1
      }
    },
    postAnswer: async ([source],args) => {
      const userSource = source as { username:string }
      const [q,a] = await Promise.all([MongOrb("Question").collection.findOne({
        _id: args.createAnswer.to
      }),MongOrb("Answer").collection.findOne({
        _id:args.createAnswer.to
      })])
      const object = q || a
      if(!object){
        throw new GraphQLError(`Question or Answer with id "${args.createAnswer.to}" does not exist anymore.`)
      }
      const result = await MongOrb("Answer").createWithAutoFields("_id",'createdAt','updatedAt')({
        answers:[],
        content:args.createAnswer.content,
        score:0,
        user: userSource.username,
        to: object._id
      })
      return result.insertedId
    }
  }
});

graphqlYogaAdapter(resolvers).listen(parseInt(process.env.PORT || '4000'), () => {
  console.log('LISTENING to ' + (process.env.PORT || '4000'));
});

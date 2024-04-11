
import { createSchema,createYoga } from "graphql-yoga";
import fs from 'node:fs'
import path from 'node:path'
import { Parser, compileType, getTypeName, FieldType, Options, ParserField } from 'graphql-js-tree';
import { createServer } from 'http'

const temporaryMemory:Record<string,any[]> = {}

const transformSchema = (schema:string) => {
  const tree = Parser.parse(schema)
  const modelTypes = tree.nodes.filter(n => n.directives.find(d => d.name === 'model'))
  const inputs = createModelInputs(modelTypes)
  return `
${schema}
${inputs}
type Query{
  ${modelTypes.map(mt => `list${mt.name}s: [${mt.name}!]`).join('\n\t')}
}  
type Mutation{
  ${modelTypes.map(mt => `create${mt.name}(${mt.name}: ${mt.name}Input!): ${mt.name}`).join('\n\t')}
  ${modelTypes.map(mt => `update${mt.name}(id: String!,${mt.name}: ${mt.name}Input!): Boolean`).join('\n\t')}
  ${modelTypes.map(mt => `delete${mt.name}(id: String!): Boolean`).join('\n\t')}
}
${modelTypes.map(mt => `extend type ${mt.name} { id: String! }`).join('\n')}
`
}

const createModelInputs = (nodes:ParserField[]) => {
  const scalars = ["String","Int","Float","Boolean","ID"]
  const inputs = nodes.map(mt => {
    const args = mt.args.map(
      a => {
        const isScalar = !!scalars.includes(getTypeName(a.type.fieldType))
        if(!isScalar) replaceTypeWithString(a.type.fieldType)
        const compiledType = compileType(a.type.fieldType)
        return `${a.name}: ${compiledType}`
      }
    ).join('\n\t')
    return `
input ${mt.name}Input{ 
\t${args}
}`})
}



const replaceTypeWithString = (f:FieldType) => {
  if(f.type === Options.name){
    f.name = "String"
    return
  }
  replaceTypeWithString(f.nest)
}

const run = async () => {
  const schemaFile = fs.readFileSync(path.join(process.cwd(),"./schema.graphql"),{
    encoding:'utf-8'
  })
  const newSchema = transformSchema(schemaFile)
  const tree = Parser.parse(schemaFile)
  const modelTypes = tree.nodes.filter(n => n.directives.find(d => d.name === 'model'))
  const schema = createSchema({
    typeDefs: newSchema,
    resolvers:{
      Query: Object.fromEntries(modelTypes.map(mt => [`list${mt.name}s`, () => {
        return temporaryMemory[mt.name]
      }])),
      Mutation:{
        ...Object.fromEntries(modelTypes.map(mt => [`create${mt.name}`, (_:any, args:any) => {
          temporaryMemory[mt.name] ||= []
          temporaryMemory[mt.name].push({
            ...args[mt.name],
            id: Math.random().toString(8)
          })
          return args[mt.name]
        }])),
        ...Object.fromEntries(modelTypes.map(mt => [`delete${mt.name}`, (_:any, args:any) => {
          temporaryMemory[mt.name] ||= []
          if(!temporaryMemory[mt.name].find(o => o.id === args.id)) return false
          temporaryMemory[mt.name] = temporaryMemory[mt.name].filter(o => o.id !== args.id)
          return true
        }])),
        ...Object.fromEntries(modelTypes.map(mt => [`update${mt.name}`, (_:any, args:any) => {
          temporaryMemory[mt.name] ||= []
          if(!temporaryMemory[mt.name].find(o => o.id === args.id)) return false
          temporaryMemory[mt.name] = temporaryMemory[mt.name].map(o => o.id !== args.id ? o : args[mt.name])
          return true
        }])),
      }
    }
  })
  const yoga = createYoga({schema})
  const server = createServer(yoga)
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}
run()
import { createSchema, createYoga } from 'graphql-yoga';
import fs from 'node:fs';
import path from 'node:path';
import { Parser, compileType, getTypeName, FieldType, Options, ParserField } from 'graphql-js-tree';
import { createServer } from 'http';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const temporaryMemory: Record<string, any[]> = {};

const transformSchema = (schema: string) => {
  const tree = Parser.parse(schema);
  const modelTypes = tree.nodes.filter((n) => n.directives.find((d) => d.name === 'model'));
  const inputs = createModelInputs(modelTypes);
  return `
${schema}
${inputs}
type Query{
  ${modelTypes.map((mt) => `list${mt.name}s: [${mt.name}!]`).join('\n\t')}
}  
type Mutation{
  ${modelTypes.map((mt) => `create${mt.name}(${mt.name}: ${mt.name}Input!): ${mt.name}`).join('\n\t')}
  ${modelTypes.map((mt) => `update${mt.name}(id: String!,${mt.name}: ${mt.name}UpdateInput!): Boolean`).join('\n\t')}
  ${modelTypes.map((mt) => `delete${mt.name}(id: String!): Boolean`).join('\n\t')}
}
${modelTypes.map((mt) => `extend type ${mt.name} { id: String! }`).join('\n')}
`;
};

const createModelInputs = (nodes: ParserField[]) => {
  const scalars = ['String', 'Int', 'Float', 'Boolean', 'ID'];
  return nodes
    .map((mt) => {
      const args = mt.args
        .map((a) => {
          const isScalar = !!scalars.includes(getTypeName(a.type.fieldType));
          if (!isScalar) replaceTypeWithString(a.type.fieldType);
          const compiledType = compileType(a.type.fieldType);
          return `${a.name}: ${compiledType}`;
        })
        .join('\n\t');
      const updateArgs = mt.args
        .map((a) => {
          if (a.type.fieldType.type === Options.required) a.type.fieldType = a.type.fieldType.nest;
          const isScalar = !!scalars.includes(getTypeName(a.type.fieldType));
          if (!isScalar) replaceTypeWithString(a.type.fieldType);
          const compiledType = compileType(a.type.fieldType);
          return `${a.name}: ${compiledType}`;
        })
        .join('\n\t');
      return `
input ${mt.name}Input{ 
\t${args}
}
input ${mt.name}UpdateInput{ 
\t${updateArgs}
}
`;
    })
    .join('\n');
};

const replaceTypeWithString = (f: FieldType) => {
  if (f.type === Options.name) {
    f.name = 'String';
    return;
  }
  replaceTypeWithString(f.nest);
};

const connectionFunction = (a: ParserField) => {
  return [
    a.name,
    (source: any) => {
      const relatedObjectFieldName = a.directives
        .find((d) => d.name === 'connection')
        ?.args.find((a) => a.name === 'fromField')?.value?.value;

      const argTypeName = getTypeName(a.type.fieldType);
      const isArrayField =
        a.type.fieldType.type === Options.array ||
        (a.type.fieldType.type === Options.required && a.type.fieldType.nest.type === Options.array);
      if (relatedObjectFieldName) {
        if (isArrayField) {
          return temporaryMemory[argTypeName].filter((ta) => {
            const fieldInRelatedObject = ta[relatedObjectFieldName];
            if (Array.isArray(fieldInRelatedObject)) return fieldInRelatedObject.includes(source.id);
            return fieldInRelatedObject === source.id;
          });
        }
        return temporaryMemory[argTypeName].find((ta) => {
          const fieldInRelatedObject = ta[relatedObjectFieldName];
          if (Array.isArray(fieldInRelatedObject)) return fieldInRelatedObject.includes(source.id);
          return fieldInRelatedObject === source.id;
        });
      }
      if (isArrayField) {
        return temporaryMemory[argTypeName].filter((ta) => source[a.name].includes(ta.id));
      }
      return temporaryMemory[argTypeName][source[a.name]];
    },
  ] as const;
};

const generateListResolvers = (modelTypes: ParserField[]) => {
  return Object.fromEntries(
    modelTypes.map((mt) => [
      `list${mt.name}s`,
      () => {
        return temporaryMemory[mt.name];
      },
    ]),
  );
};

const generateMutationResolvers = (modelTypes: ParserField[]) => {
  return {
    ...Object.fromEntries(
      modelTypes.map((mt) => [
        `create${mt.name}`,
        (_: any, args: any) => {
          temporaryMemory[mt.name] ||= [];
          const creationPayload = {
            ...args[mt.name],
            id: '' + idCounter++,
          };
          temporaryMemory[mt.name].push(creationPayload);
          return creationPayload;
        },
      ]),
    ),
    ...Object.fromEntries(
      modelTypes.map((mt) => [
        `delete${mt.name}`,
        (_: any, args: any) => {
          temporaryMemory[mt.name] ||= [];
          if (!temporaryMemory[mt.name].find((o) => o.id === args.id)) return false;
          temporaryMemory[mt.name] = temporaryMemory[mt.name].filter((o) => o.id !== args.id);
          return true;
        },
      ]),
    ),
    ...Object.fromEntries(
      modelTypes.map((mt) => [
        `update${mt.name}`,
        (_: any, args: any) => {
          temporaryMemory[mt.name] ||= [];
          if (!temporaryMemory[mt.name].find((o) => o.id === args.id)) return false;
          temporaryMemory[mt.name] = temporaryMemory[mt.name].map((o) =>
            o.id !== args.id ? o : { ...o, ...args[mt.name] },
          );
          return true;
        },
      ]),
    ),
  };
};

let idCounter = 0;

const run = async () => {
  const schemaFile = fs.readFileSync(path.join(process.cwd(), './schema.graphql'), {
    encoding: 'utf-8',
  });
  const newSchema = transformSchema(schemaFile);
  const tree = Parser.parse(schemaFile);
  const modelTypes = tree.nodes.filter((n) => n.directives.find((d) => d.name === 'model'));
  const relations = Object.fromEntries(
    tree.nodes
      .filter((n) => n.args.some((a) => a.directives.find((d) => d.name === 'connection')))
      .map((n) => {
        return [
          n.name,
          Object.fromEntries(
            n.args.filter((a) => a.directives.find((d) => d.name === 'connection')).map(connectionFunction),
          ),
        ] as const;
      }),
  );
  const schema = createSchema({
    typeDefs: newSchema,
    resolvers: {
      ...relations,
      Query: generateListResolvers(modelTypes),
      Mutation: generateMutationResolvers(modelTypes),
    },
  });
  const yoga = createYoga({ schema });
  const server = createServer(yoga);
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
  });
};
run();

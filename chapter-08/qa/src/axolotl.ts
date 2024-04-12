import { Models } from "@/src/models";
import { Axolotl } from "@aexol/axolotl-core";
import { graphqlYogaAdapter } from "@aexol/axolotl-graphql-yoga";

const { createResolvers } = Axolotl(graphqlYogaAdapter)<Models>({
    modelsPath: './src/models.ts',
    schemaPath: './schema.graphql',
  });
  
export {
    createResolvers
}
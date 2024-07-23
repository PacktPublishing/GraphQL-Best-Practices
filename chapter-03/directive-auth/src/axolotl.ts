import { Directives, Models } from '@/src/models.js';
import { Axolotl } from '@aexol/axolotl-core';
import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';

export const { applyMiddleware, createResolvers, adapter, createDirectives } = Axolotl(graphqlYogaAdapter)<Models,Directives>();

import { Models } from '@/src/models.js';
import { Axolotl } from '@aexol/axolotl-core';
import { graphqlYogaAdapter } from '@aexol/axolotl-graphql-yoga';

export const { createResolvers } = Axolotl(graphqlYogaAdapter)<Models, unknown, unknown>();

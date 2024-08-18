import { mergeAxolotls } from '@aexol/axolotl-core';
import beerResolvers from '@/src/todos/resolvers.js';
import shopResolvers from '@/src/users/resolvers.js';

export default mergeAxolotls(beerResolvers, shopResolvers);

import { mergeAxolotls } from '@aexol/axolotl-core';
import todosResolvers from '@/src/todos/resolvers.js';
import usersResolvers from '@/src/users/resolvers.js';

export default mergeAxolotls(todosResolvers, usersResolvers);

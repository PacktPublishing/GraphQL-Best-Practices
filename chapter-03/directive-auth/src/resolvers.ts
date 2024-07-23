import { createResolvers } from '@/src/axolotl.js';
import { Role, User } from '@/src/models.js';

const UserTable = [
  {
    email:"artur@aexol.com",
    id:"213891389j",
    name:"Artur Czemiel",
    role:Role.ADMIN
  },
  {
    email:"book@reader.com",
    id:"31r3rrr3r",
    name:"This is You",
    role:Role.USER
  }] satisfies User[]

export default createResolvers({
  Query: {
    users: async () => {
      return UserTable
    },
  },
});

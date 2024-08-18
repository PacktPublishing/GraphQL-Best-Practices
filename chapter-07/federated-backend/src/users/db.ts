import { User } from '@/src/users/models.js';
export type UserModel = User & {
  password: string;
  token: string;
};
export const db = {
  users: [] as UserModel[],
};

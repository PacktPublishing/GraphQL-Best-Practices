import crypto from 'node:crypto';
import jwt from "jsonwebtoken";
import { createResolvers } from '@/src/axolotl.js';
import { MongOrb } from '@/src/orm.js';
import { GraphQLError } from 'graphql';

const secretKey = 'your-secret-key'; 

const passwordSha512 = (password: string, salt: string) => {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const passwordHash = hash.digest('hex');
  return {
    salt,
    passwordHash,
  };
};

const comparePasswords = ({ password, hash, salt }: { password: string; hash: string; salt: string }) => {
    return hash === passwordSha512(password, salt).passwordHash;
  };
  
export const authResolvers = createResolvers({ 
  PublicMutation: { 
    register: async (_, { username, password }) => { 
      const userExists = await MongOrb("User").collection.findOne({username})
      if(userExists) throw new GraphQLError("User already exist with this username")
      const s = crypto.randomBytes(8).toString('hex');
      const {passwordHash,salt} = passwordSha512(password,s) 
      const user = await MongOrb("User").createWithAutoFields("_id",'createdAt','updatedAt')({
        username,
        passwordHash,
        salt
      })
      const token = jwt.sign({ userId:user.insertedId }, secretKey); 
      return { 
        token, 
        user, 
      }; 
    }, 
    login: async (_, { username, password }) => { 
      const user = await MongOrb("User").collection.findOne({
        username
      })
      if (!user) { 
        throw new GraphQLError('User not found'); 
      } 
      const validPass = comparePasswords({password,hash:user.passwordHash,salt:user.salt})
      if(!validPass){
        throw new GraphQLError('Invalid password')
      }
      const token = jwt.sign({ userId: user._id }, secretKey); 
      return { 
        token, 
        user, 
      }; 
    }, 
  }, 
})

const decodeJWTToken = (token: string) => {
    const verifiedToken = jwt.verify(token, secretKey);
    if (typeof verifiedToken !== 'object') {
        throw new GraphQLError('Token is not an object');
    }
    return verifiedToken as Record<string, unknown>;
};

export const decodeToken = (token: string) => {
    const verifiedToken = decodeJWTToken(token);
    if (!verifiedToken.userId) {
        throw new GraphQLError('Invalid token');
    }
    return verifiedToken as { userId: string };
};
  
export const getUser = async (token: string) => {
    const { userId } = decodeToken(token);
    const user = await MongOrb("User").collection.findOne({
        _id: userId,
    });
    if (!user) {
        return;
    }
    return user;
};

export const getUserFromHeader = async (authorizationHeader:string) => {
    const findUser = await getUser(authorizationHeader);
    if (!findUser) {
        return;
    }
    return findUser;
};

export const getUserFromHeaderOrThrow = async (authorizationHeader:string) => {
    const user = await getUserFromHeader(authorizationHeader);
    if (!user) {
        throw new GraphQLError('You are not logged in');
    }
    return user;
};
  
import { createResolvers } from '@/src/axolotl.js';

class MaskedError extends Error {
  constructor(message: string, unmask?: boolean) {
    super(!unmask ? 'Unexpected error' : message);
  }
}

const resolvers = createResolvers({
  Query: {
    error: () => {
      throw new MaskedError('Invalid resolver coded', true);
    },
    errorMasked: () => {
      throw new MaskedError('Invalid resolver coded');
    },
  },
});

export default resolvers;

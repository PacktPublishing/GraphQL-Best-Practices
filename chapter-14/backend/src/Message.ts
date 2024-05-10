import { createResolvers } from '@/src/axolotl.js';
import { MessageModel, MongOrb } from '@/src/orm.js';

export default createResolvers({
  Message: {
    messageThread: (yoga) => {
      const src = yoga[0] as MessageModel;
      return MongOrb('MessageThread').collection.findOne({
        _id: src.messageThread,
      });
    },
    sender: async (yoga) => {
      const src = yoga[0] as MessageModel;
      const isClient = await MongOrb('SalonClient').collection.findOne({ _id: src.sender });
      if (isClient)
        return {
          ...isClient,
          __typename: 'SalonClient',
        };
      return MongOrb('Salon').collection.findOne({
        _id: src.sender,
      });
    },
  },
});

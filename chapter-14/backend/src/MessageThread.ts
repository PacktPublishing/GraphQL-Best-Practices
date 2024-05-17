import { createResolvers } from '@/src/axolotl.js';
import { MessageThreadModel, MongOrb } from '@/src/orm.js';

export default createResolvers({
  MessageThread: {
    salonClient: (yoga) => {
      const src = yoga[0] as MessageThreadModel;
      return MongOrb('SalonClient').collection.findOne({
        _id: src.salonClient,
      });
    },
    messages: (yoga) => {
      const src = yoga[0] as MessageThreadModel;
      return MongOrb('Message')
        .collection.find({
          messageThread: src._id,
        })
        .toArray();
    },
  },
});

import { createResolvers } from '@/src/axolotl.js';
import { MessageThreadModel, MongOrb } from '@/src/orm.js';

export default createResolvers({
  MessageThread: {
    salon: (yoga) => {
      const src = yoga[0] as MessageThreadModel;
      return MongOrb('Salon').collection.findOne({
        _id: src.salon,
      });
    },
    client: (yoga) => {
      const src = yoga[0] as MessageThreadModel;
      return MongOrb('SalonClient').collection.findOne({
        _id: src.client,
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

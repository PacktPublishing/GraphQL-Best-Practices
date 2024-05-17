import { createResolvers } from '@/src/axolotl.js';
import { commonClientResolver, commonSalonResolver } from '@/src/commonResolvers.js';
import { MongOrb, UserModel } from '@/src/orm.js';
import { RegistrationError } from '@/src/zeus/index.js';

export default createResolvers({
  UserOps: {
    client: commonClientResolver,
    salon: commonSalonResolver,
    registerAsSalon: async (yoga, args) => {
      const s = MongOrb('Salon');
      const src = yoga[0] as UserModel;
      const SalonExists = await s.collection.findOne({
        $or: [
          {
            name: args.salon.name,
          },
          {
            slug: args.salon.slug,
          },
        ],
      });
      if (SalonExists) {
        return {
          errors: [RegistrationError.EXISTS_WITH_SAME_NAME],
        };
      }
      await s.createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        ...args.salon,
        user: src._id,
      });
      return;
    },
    registerAsClient: async (yoga, args) => {
      const s = MongOrb('Client');
      const src = yoga[0] as UserModel;

      if (args.client.email || args.client.phone) {
        const EmailOrPhoneExists = await s.collection.findOne({
          $or: [
            {
              email: args.client.email,
            },
            {
              phone: args.client.phone,
            },
          ],
        });
        if (EmailOrPhoneExists) {
          return {
            errors: [RegistrationError.EXISTS_WITH_SAME_NAME],
          };
        }
      }
      await s.createWithAutoFields(
        '_id',
        'createdAt',
        'updatedAt',
      )({
        ...args.client,
        user: src._id,
      });
      return;
    },
  },
});

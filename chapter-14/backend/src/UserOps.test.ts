import { Chain } from '@/src/zeus/index.js';
import { expect, test, beforeAll } from 'vitest';
const HOST = 'http://localhost:4000/graphql';

const user = {
  client: Chain(HOST),
};
beforeAll(async () => {
  const registerResult = await user.client('mutation')({
    public: {
      register: [
        {
          username: Math.random().toString(8),
          password: Math.random().toString(8),
        },
        {
          token: true,
        },
      ],
    },
  });
  user.client = Chain(HOST, {
    headers: { Authorization: `${registerResult.public?.register.token}`, 'Content-Type': 'application/json' },
  });
});
test('Should register a salon', async () => {
  const random = Math.random().toString(8);
  const [name, slug] = ['Dev hairdresser ' + random, 'dev-hairdresser-' + random];
  const salonRegistration = await user.client('mutation')({
    user: {
      registerAsSalon: [
        {
          salon: {
            name,
            slug,
          },
        },
        {
          errors: true,
        },
      ],
    },
  });
  expect(salonRegistration.user?.registerAsSalon?.errors).toBeFalsy();
  const salonService = await user.client('query')({
    user: {
      salon: {
        me: {
          name: true,
        },
      },
    },
  });
  expect(salonService.user?.salon?.me.name).toEqual(name);
});
test('Should register a client', async () => {
  const random = Math.random().toString(8);
  const phone = (100000000 + Math.floor(Math.random() * 899999999)).toString();
  const [firstName, lastName, email] = ['John', 'Hubble', `${random}@example.com`];
  const clientRegistration = await user.client('mutation')({
    user: {
      registerAsClient: [
        {
          client: {
            firstName,
            lastName,
            email,
            phone,
          },
        },
        {
          errors: true,
        },
      ],
    },
  });
  expect(clientRegistration.user?.registerAsClient?.errors).toBeFalsy();
  const clientService = await user.client('query')({
    user: {
      client: {
        me: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  expect(clientService.user?.client?.me.firstName).toEqual(firstName);
  expect(clientService.user?.client?.me.lastName).toEqual(lastName);
  expect(clientService.user?.client?.me.email).toEqual(email);
  expect(clientService.user?.client?.me.phone).toEqual(phone);
});

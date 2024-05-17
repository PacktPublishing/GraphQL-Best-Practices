import { Chain } from '@/src/zeus/index.js';
import { expect, test } from 'vitest';
const HOST = 'http://localhost:4000/graphql';

const client = Chain(HOST);
test('Should register a user and allow for the user to log in', async () => {
  const username = Math.random().toString(8);
  const password = Math.random().toString(8);
  const registerResult = await client('mutation')({
    public: {
      register: [
        {
          username,
          password,
        },
        {
          token: true,
        },
      ],
    },
  });
  expect(registerResult.public?.register.token).toBeTruthy();
  const loginResult = await client('mutation')({
    public: {
      login: [{ password, username }, { token: true }],
    },
  });
  expect(loginResult.public?.login?.token).toBeTruthy();
  const authorizedClient = Chain(HOST, {
    headers: { Authorization: `${loginResult.public?.login?.token}`, 'Content-Type': 'application/json' },
  });
  const meResult = await authorizedClient('query')({
    user: {
      me: {
        username: true,
      },
    },
  });
  expect(meResult.user?.me.username).toEqual(username);
});

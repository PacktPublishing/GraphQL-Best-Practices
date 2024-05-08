import { jwtToken } from '@/atoms';
import { Chain, HOST } from '@/zeus';
import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';

export const useClient = () => {
  const [token, setToken] = useAtom(jwtToken);
  const client = useMemo(() => {
    return Chain(HOST, {
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: token,
            }
          : {}),
      },
    });
  }, [token]);

  const login = useCallback(
    (username: string, password: string) => {
      client('mutation')({
        public: {
          login: [
            { username, password },
            {
              token: true,
            },
          ],
        },
      }).then((response) => {
        const token = response.public?.login.token;
        if (token) {
          setToken(token);
        }
      });
    },
    [client, setToken],
  );

  const register = useCallback(
    (username: string, password: string) => {
      client('mutation')({
        public: {
          register: [
            { username, password },
            {
              token: true,
            },
          ],
        },
      }).then((response) => {
        const token = response.public?.register.token;
        if (token) {
          setToken(token);
        }
      });
    },
    [client, setToken],
  );

  return {
    client,
    setToken,
    login,
    register,
    isLoggedIn: !!token,
  };
};

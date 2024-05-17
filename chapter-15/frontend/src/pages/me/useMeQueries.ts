import { useClient } from '@/graphql/client';
import { ResolverInputTypes } from '@/zeus';
import { useCallback } from 'react';

export const useMeQueries = () => {
  const { client } = useClient();

  const registerAsSalon = useCallback(
    (salon: ResolverInputTypes['CreateSalon']) => {
      return client('mutation')({
        user: {
          registerAsSalon: [
            {
              salon,
            },
            {
              errors: true,
            },
          ],
        },
      });
    },
    [client],
  );
  const registerAsClient = useCallback(
    (clientForm: ResolverInputTypes['CreateClient']) => {
      return client('mutation')({
        user: {
          registerAsClient: [
            {
              client: clientForm,
            },
            {
              errors: true,
            },
          ],
        },
      });
    },
    [client],
  );
  return { registerAsSalon, registerAsClient };
};

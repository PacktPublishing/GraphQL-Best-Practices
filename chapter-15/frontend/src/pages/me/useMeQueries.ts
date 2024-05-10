import { useClient } from '@/graphql/client';
import { ResolverInputTypes } from '@/zeus';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useMeQueries = () => {
  const { client } = useClient();
  const n = useNavigate();

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
      }).then((r) => {
        if (!r.user?.registerAsSalon?.errors) {
          n('/me/salon');
        }
      });
    },
    [client, n],
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
      }).then((r) => {
        if (!r.user?.registerAsClient?.errors) {
          n('/me/client');
        }
      });
    },
    [client, n],
  );
  return { registerAsSalon, registerAsClient };
};

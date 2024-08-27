import { useClient } from '@/graphql/client';
import { ResolverInputTypes } from '@/zeus';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useMeQueries = () => {
  const { client } = useClient();
  const nav = useNavigate();

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
        if (!r.user?.registerAsSalon?.errors.length) {
          nav('/me/salon');
        }
      });
    },
    [client, nav],
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
        if (!r.user?.registerAsClient?.errors.length) {
          nav('/me/client');
        }
      });
    },
    [client, nav],
  );
  return { registerAsSalon, registerAsClient };
};

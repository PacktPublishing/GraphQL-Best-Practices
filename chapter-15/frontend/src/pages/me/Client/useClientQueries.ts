import { useClient } from '@/graphql/client';
import {
  ClientSelector,
  SalonClientListForClientSelector,
  SalonClientListForClientType,
} from '@/graphql/selectors';
import { ResolverInputTypes } from '@/zeus';
import { useCallback, useEffect, useState } from 'react';

export const useClientQueries = () => {
  const { client } = useClient();
  const [salonClients, setSalonClients] = useState<
    SalonClientListForClientType[]
  >([]);

  const getSalonClients = useCallback(() => {
    return client('query')({
      user: {
        client: {
          clients: SalonClientListForClientSelector,
        },
      },
    }).then((r) => {
      setSalonClients(r.user?.client?.clients || []);
      return;
    });
  }, [client]);

  useEffect(() => {
    getSalonClients();
  }, [getSalonClients]);

  const update = useCallback(
    (clientUpdate: ResolverInputTypes['UpdateClient']) => {
      return client('mutation')({
        client: {
          update: [
            { client: clientUpdate },
            {
              errors: true,
            },
          ],
        },
      }).then((r) => r.client?.update?.errors);
    },
    [client],
  );

  const createVisit = useCallback(
    (visit: ResolverInputTypes['CreateVisitFromClient']) => {
      return client('mutation')({
        client: {
          createVisit: [{ visit }, { errors: true }],
        },
      }).then((r) => r.client?.createVisit?.errors);
    },
    [client],
  );

  const registerToSalon = useCallback(
    (slug: string) => {
      return client('mutation')({
        client: {
          registerToSalon: [{ salonSlug: slug }, true],
        },
      }).then((r) => r.client?.registerToSalon);
    },
    [client],
  );

  const sendMessage = useCallback(
    (salonId: string, message: ResolverInputTypes['MessageInput']) => {
      return client('mutation')({
        client: {
          sendMessage: [{ message, salonId }, true],
        },
      }).then((r) => r.client?.sendMessage);
    },
    [client],
  );

  const me = useCallback(() => {
    return client('query')({
      user: {
        client: {
          me: ClientSelector,
        },
      },
    }).then((r) => r.user?.client?.me);
  }, [client]);

  return {
    getSalonClients,
    salonClients,
    update,
    createVisit,
    registerToSalon,
    sendMessage,
    me,
  };
};

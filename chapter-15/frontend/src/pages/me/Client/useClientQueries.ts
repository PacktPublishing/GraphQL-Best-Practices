import { useClient } from '@/graphql/client';
import {
  ClientSelector,
  MessagesSelector,
  SalonClientDetailForClientSelector,
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

  const salonClientById = useCallback(
    (_id: string) => {
      return client('query')({
        user: {
          client: {
            client: [{ _id }, SalonClientDetailForClientSelector],
          },
        },
      }).then((r) => r.user?.client?.client);
    },
    [client],
  );

  const registerToSalon = useCallback(
    (slug: string) => {
      return client('mutation')({
        user: {
          client: {
            registerToSalon: [{ salonSlug: slug }, true],
          },
        },
      }).then((r) => r.user?.client?.registerToSalon);
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

  const update = useCallback(
    (clientUpdate: ResolverInputTypes['UpdateClient']) => {
      return client('mutation')({
        user: {
          client: {
            update: [
              { client: clientUpdate },
              {
                errors: true,
              },
            ],
          },
        },
      }).then((r) => r.user?.client?.update?.errors);
    },
    [client],
  );

  const createVisit = useCallback(
    (salonId: string, visit: ResolverInputTypes['CreateVisitFromClient']) => {
      return client('mutation')({
        user: {
          client: {
            salonClientOps: [
              { _id: salonId },
              {
                createVisit: [{ visit }, { errors: true }],
              },
            ],
          },
        },
      }).then((r) => r.user?.client?.salonClientOps?.createVisit?.errors);
    },
    [client],
  );

  const messages = useCallback(
    (salonClientId: string) => {
      return client('query')({
        user: {
          client: {
            client: [{ _id: salonClientId }, MessagesSelector],
          },
        },
      }).then((r) => r.user?.client?.client?.messageThread);
    },
    [client],
  );

  const sendMessage = useCallback(
    (salonClientId: string, message: ResolverInputTypes['MessageInput']) => {
      return client('mutation')({
        user: {
          client: {
            salonClientOps: [
              { _id: salonClientId },
              {
                sendMessage: [{ message }, true],
              },
            ],
          },
        },
      }).then((r) => r.user?.client?.salonClientOps?.sendMessage);
    },
    [client],
  );

  return {
    getSalonClients,
    salonClients,
    salonClientById,
    update,
    createVisit,
    registerToSalon,
    messages,
    sendMessage,
    me,
  };
};

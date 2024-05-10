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

  const me = useCallback(() => {
    return client('query')({
      user: {
        client: {
          me: ClientSelector,
        },
      },
    }).then((r) => r.user?.client?.me);
  }, [client]);

  return {};
};

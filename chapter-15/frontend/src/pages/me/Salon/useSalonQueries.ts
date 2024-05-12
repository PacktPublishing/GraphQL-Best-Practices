import { useClient } from '@/graphql/client';
import {
  SalonClientForSalonSelector,
  SalonProfileSelector,
  ServiceClientSelector,
  VisitServiceSelector,
} from '@/graphql/selectors';
import { useCallback, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ResolverInputTypes } from '@/zeus';

export const useSalonQueries = () => {
  const { client } = useClient();
  const [mySalon, setMySalon] =
    useState<ReturnType<typeof me> extends Promise<infer R> ? R : never>();

  const me = useCallback(() => {
    return client('query')({
      user: {
        salon: {
          me: SalonProfileSelector,
          services: ServiceClientSelector,
          visits: [
            { filterDates: { from: new Date().toISOString() } },
            VisitServiceSelector,
          ],
          clients: SalonClientForSalonSelector,
        },
      },
    }).then((r) => r.user?.salon);
  }, [client]);

  const analytics = useCallback(() => {
    return client('query')({
      user: {
        salon: {
          analytics: [
            {
              filterDates: {
                from: format(subDays(new Date(), 90), 'YYYY-MM-DD'),
              },
            },
            {
              cashPerDay: {
                amount: true,
                date: true,
              },
              visitsPerDay: {
                amount: true,
                date: true,
              },
            },
          ],
        },
      },
    }).then((r) => r.user?.salon);
  }, [client]);

  const createService = useCallback(
    (service: ResolverInputTypes['CreateService']) => {
      return client('mutation')({
        salon: {
          createService: [{ service }, true],
        },
      }).then((r) => r.salon?.createService);
    },
    [client],
  );

  const fetchMe = useCallback(() => {
    me().then((result) => {
      setMySalon(result);
    });
  }, [me]);

  return {
    fetchMe,
    mySalon,
    analytics,
    createService,
  };
};

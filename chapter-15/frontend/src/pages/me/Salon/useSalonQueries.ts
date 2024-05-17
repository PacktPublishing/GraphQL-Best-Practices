import { useClient } from '@/graphql/client';
import {
  FullSalonMeQuerySelector,
  FullSalonMeQueryType,
  MessagesSelector,
} from '@/graphql/selectors';
import { useCallback, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ResolverInputTypes } from '@/zeus';

export const useSalonQueries = () => {
  const { client } = useClient();
  const [mySalon, setMySalon] = useState<FullSalonMeQueryType>();

  const me = useCallback(() => {
    return client('query')({
      user: {
        salon: FullSalonMeQuerySelector,
      },
    }).then((r) => r.user?.salon);
  }, [client]);

  const fetchMe = useCallback(() => {
    me().then((result) => {
      setMySalon(result);
    });
  }, [me]);

  const createService = useCallback(
    (service: ResolverInputTypes['CreateService']) => {
      return client('mutation')({
        user: {
          salon: {
            createService: [{ service }, true],
          },
        },
      }).then((r) => {
        fetchMe();
        return r.user?.salon?.createService;
      });
    },
    [client, fetchMe],
  );

  const updateService = useCallback(
    (_id: string, service: ResolverInputTypes['UpdateService']) => {
      return client('mutation')({
        user: {
          salon: {
            serviceOps: [
              { _id },
              {
                update: [{ service }, true],
              },
            ],
          },
        },
      }).then((r) => {
        fetchMe();
        return r.user?.salon?.serviceOps?.update;
      });
    },
    [client, fetchMe],
  );

  const deleteService = useCallback(
    (_id: string) => {
      client('mutation')({
        user: {
          salon: {
            serviceOps: [
              { _id },
              {
                delete: true,
              },
            ],
          },
        },
      }).then(() => fetchMe());
    },
    [client, fetchMe],
  );

  const createVisit = useCallback(
    (visit: ResolverInputTypes['CreateVisitFromAdmin']) => {
      return client('mutation')({
        user: {
          salon: {
            createVisit: [{ visit }, true],
          },
        },
      }).then((r) => {
        fetchMe();
        return r.user?.salon?.createVisit;
      });
    },
    [client, fetchMe],
  );
  const updateVisit = useCallback(
    (_id: string, visit: ResolverInputTypes['UpdateVisitFromAdmin']) => {
      return client('mutation')({
        user: {
          salon: {
            visitOps: [
              { _id },
              {
                update: [{ visit }, { errors: true }],
              },
            ],
          },
        },
      }).then((r) => {
        const errors = r.user?.salon?.visitOps?.update?.errors;
        if (!errors) fetchMe();
        return errors;
      });
    },
    [client, fetchMe],
  );
  const deleteVisit = useCallback(
    (_id: string) => {
      return client('mutation')({
        user: {
          salon: {
            visitOps: [
              { _id },
              {
                delete: true,
              },
            ],
          },
        },
      }).then((r) => {
        fetchMe();
        return r.user?.salon?.visitOps?.delete;
      });
    },
    [client, fetchMe],
  );

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

  const messages = useCallback(
    (salonClientId: string) => {
      return client('query')({
        user: {
          salon: {
            client: [{ _id: salonClientId }, MessagesSelector],
          },
        },
      }).then((r) => r.user?.salon?.client?.messageThread);
    },
    [client],
  );

  const sendMessage = useCallback(
    (salonClientId: string, message: string) => {
      return client('mutation')({
        user: {
          salon: {
            sendMessage: [{ salonClientId, message: { message } }, true],
          },
        },
      });
    },
    [client],
  );

  return {
    fetchMe,
    mySalon,
    analytics,
    createService,
    updateService,
    deleteService,
    createVisit,
    updateVisit,
    deleteVisit,
    messages,
    sendMessage,
  };
};

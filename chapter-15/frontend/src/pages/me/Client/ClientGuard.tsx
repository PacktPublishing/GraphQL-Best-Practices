import { clientData } from '@/atoms';
import { useClient } from '@/graphql/client';
import { ClientSelector } from '@/graphql/selectors';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const ClientGuard = () => {
  const [, setClientData] = useAtom(clientData);
  const nav = useNavigate();
  const location = useLocation();
  const { client } = useClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client('query')({
      user: {
        client: {
          me: ClientSelector,
        },
      },
    })
      .then((r) => {
        if (r.user?.client?.me._id) {
          setLoading(false);
          setClientData(r.user.client.me);
          return;
        }
        nav('/me/registerClient?' + `next=${location.pathname}`);
      })
      .catch(() => {
        nav('/me/registerClient?' + `next=${location.pathname}`);
      });
  }, [nav, location.pathname, client, setClientData]);

  return (
    <div className="w-full justify-center items-center flex flex-col container space-y-8">
      {!loading && <Outlet />}
    </div>
  );
};
export default ClientGuard;

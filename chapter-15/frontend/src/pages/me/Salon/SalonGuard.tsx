import { useClient } from '@/graphql/client';
import { SalonProfileSelector } from '@/graphql/selectors';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const SalonGuard = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { client } = useClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client('query')({
      user: {
        salon: {
          me: SalonProfileSelector,
        },
      },
    })
      .then((r) => {
        if (r.user?.salon?.me._id) {
          setLoading(false);
          return;
        }
        nav('/me/registerSalon?' + `next=${location.pathname}`);
      })
      .catch(() => {
        nav('/me/registerSalon?' + `next=${location.pathname}`);
      });
  }, [nav, location.pathname, client]);

  return (
    <div className="w-full flex flex-col container space-y-8">
      {!loading && <Outlet />}
    </div>
  );
};
export default SalonGuard;

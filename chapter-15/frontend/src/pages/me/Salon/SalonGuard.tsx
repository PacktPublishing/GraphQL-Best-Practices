import { salonData } from '@/atoms';
import { useClient } from '@/graphql/client';
import { SalonProfileSelector } from '@/graphql/selectors';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const SalonGuard = () => {
  const [, setSalonData] = useAtom(salonData);
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
          setSalonData(r.user.salon.me);
          return;
        }
        nav('/me/registerSalon?' + `next=${location.pathname}`);
      })
      .catch(() => {
        nav('/me/registerSalon?' + `next=${location.pathname}`);
      });
  }, [nav, location.pathname, client, setSalonData]);

  return (
    <div className="w-full justify-center items-center flex flex-col container space-y-8">
      {!loading && <Outlet />}
    </div>
  );
};
export default SalonGuard;

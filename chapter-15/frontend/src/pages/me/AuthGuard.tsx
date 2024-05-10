import { jwtToken } from '@/atoms';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const AuthGuard = () => {
  const [token] = useAtom(jwtToken);
  const nav = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!token) {
      nav('/auth/login?' + `next=${location.pathname}`);
      return;
    }
  }, [token, nav, location.pathname]);
  return (
    <div className="w-full justify-center items-center flex flex-col container space-y-8">
      <Outlet />
    </div>
  );
};
export default AuthGuard;

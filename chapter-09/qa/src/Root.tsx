import { jwtToken } from '@/atoms';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { Link, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

const Root = () => {
  const [token, setToken] = useAtom(jwtToken);
  return (
    <>
      <nav className="w-full absolute hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <div className="container flex items-center w-full">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground px-8 py-4 block"
          >
            Home
          </Link>
          <div className="ml-auto space-x-2 flex items-center">
            {!!token && (
              <>
                <p>User logged in</p>
                <Link to="/me/post">
                  <Button>Post question</Button>
                </Link>
                <Button
                  variant={'outline'}
                  onClick={() => {
                    setToken(null);
                  }}
                >
                  Logout
                </Button>
              </>
            )}
            {!token && (
              <>
                <Link to="/auth/login">
                  <Button>Login</Button>
                </Link>
                <Link to="/auth/sign-up">
                  <Button variant={'outline'}>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="flex w-full gap-4 md:ml-auto md:gap-2 lg:gap-4 min-h-full pt-8 container">
        <Outlet />
      </div>
      <Toaster />
    </>
  );
};
export default Root;

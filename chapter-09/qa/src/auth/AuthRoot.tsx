import { jwtToken } from "@/atoms";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
const AuthRoot = () => {
  const [token] = useAtom(jwtToken);
  const [searchParams] = useSearchParams();
  const n = useNavigate();
  useEffect(() => {
    if (token) {
      const hasNext = searchParams.get("next");
      if (hasNext) {
        n(hasNext);
        return;
      }
      n("/");
      return;
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center w-full">
      <Outlet />
    </div>
  );
};
export default AuthRoot;

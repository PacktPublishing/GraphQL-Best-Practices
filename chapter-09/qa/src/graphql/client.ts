import { jwtToken } from "@/atoms";
import { Chain, HOST } from "@/zeus";
import { useAtom } from "jotai";
import { useMemo } from "react";

export const useClient = () => {
  const [token, setToken] = useAtom(jwtToken);
  const client = useMemo(() => {
    return Chain(HOST, {
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: token,
            }
          : {}),
      },
    });
  }, [token]);

  return {
    client,
    setToken,
  };
};

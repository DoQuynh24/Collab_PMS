
import { useQuery, type DefinedInitialDataOptions} from "@tanstack/react-query";
import { URL_API_AUTH_GOOGLE, URL_API_AUTH_ME } from "../../../constant/config";
import type { IUser } from "../types";
import { apiClient } from "../../../lib/api";
import { useEffect, useState } from "react";

export const startGoogleLogin = () => {
  window.location.href = `${URL_API_AUTH_GOOGLE}`;
};

export const getCurrentUser = async (): Promise<IUser> => {
  const res = await apiClient.get(URL_API_AUTH_ME);
  return res.data; 
};

export const useGetCurrentUser = (config?: DefinedInitialDataOptions<IUser, Error, IUser, ["current-user"]> | undefined) => {
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    setHasToken(!!localStorage.getItem('access_token'));
  }, []);

  return useQuery<IUser, Error, IUser, ["current-user"]>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await apiClient.get(URL_API_AUTH_ME);
      return res.data;
    },
    enabled: hasToken,
    retry: false,
    ...config,
  });
};
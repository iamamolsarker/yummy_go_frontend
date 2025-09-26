import axios from "axios";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const axiosSecure = axios.create({
  baseURL: `https://yummy-go-server.vercel.app/api`,
});

const useAxiosSecure = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      async (config) => {
        // Get token from Firebase user
        if (user) {
          try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error("Error getting token:", error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
    };
  }, [user]);
  useEffect(() => {
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (res) => {
        return res;
      },
      async (error) => {
        const status = error.response?.status;
        if (status === 403) {
          navigate("/forbidden");
        } else if (status === 401) {
          try {
            await logOut();
            navigate("/log-in");
          } catch (logoutError) {
            console.error("Logout error:", logoutError);
            navigate("/log-in");
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
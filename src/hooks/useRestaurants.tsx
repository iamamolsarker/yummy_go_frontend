import { useQuery } from '@tanstack/react-query';
import useAxios from './useAxios';
import type { Restaurant } from '../types/restaurant';

interface UseRestaurantsOptions {
  search?: string;
  status?: string;
}

const useRestaurants = (options?: UseRestaurantsOptions) => {
  const axios = useAxios();

  return useQuery({
    queryKey: ['restaurants', options],
    queryFn: async () => {
      try {
        let url = '/restaurants';
        const params = new URLSearchParams();

        if (options?.search) {
          params.append('search', options.search);
          url = '/restaurants/search';
        }

        if (options?.status) {
          url = `/restaurants/status/${options.status}`;
        }

        const queryString = params.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        const response = await axios.get(fullUrl);
        return response.data.data as Restaurant[];
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export default useRestaurants;

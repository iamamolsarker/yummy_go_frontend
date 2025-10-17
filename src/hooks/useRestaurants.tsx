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
        let url = 'api/restaurants';
        const params = new URLSearchParams();

        if (options?.search) {
          params.append('search', options.search);
          url = 'api/restaurants/search';
        }

        if (options?.status) {
          url = `api/restaurants/status/${options.status}`;
        }

        const queryString = params.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        console.log('Fetching restaurants from:', fullUrl);
        const response = await axios.get(fullUrl);
        console.log('Restaurant response:', response.data);
        
        // Backend response structure check kore data return korbo
        // Response structure: { success: true, data: [...] } or { data: [...] }
        const restaurants = response.data?.data || response.data || [];
        return restaurants as Restaurant[];
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

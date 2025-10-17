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
        console.log('Response.data type:', typeof response.data);
        console.log('Response.data.data:', response.data?.data);
        console.log('Is array?:', Array.isArray(response.data));
        console.log('Is data.data array?:', Array.isArray(response.data?.data));
        
        // Backend response structure check kore data return korbo
        // Response structure: { success: true, data: [...] } or { data: [...] } or [...]
        let restaurants = [];
        
        if (Array.isArray(response.data)) {
          // Direct array response
          restaurants = response.data;
          console.log('Using direct array, length:', restaurants.length);
        } else if (Array.isArray(response.data?.data)) {
          // Nested data structure
          restaurants = response.data.data;
          console.log('Using nested data, length:', restaurants.length);
        } else if (response.data) {
          // Fallback to response.data
          restaurants = Array.isArray(response.data) ? response.data : [];
          console.log('Fallback, length:', restaurants.length);
        }
        
        console.log('Final restaurants count:', restaurants.length);
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

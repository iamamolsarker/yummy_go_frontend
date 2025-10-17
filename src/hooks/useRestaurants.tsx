import { useQuery } from '@tanstack/react-query';
import useAxios from './useAxios';
import type { Restaurant } from '../types/restaurant';

interface UseRestaurantsOptions {
  search?: string;
  status?: string;
}

// Backend response type
interface BackendRestaurant {
  _id: string;
  name: string;
  email: string;
  owner_name?: string;
  phone: string;
  description?: string;
  cuisine?: string[];
  cuisine_types?: string[];
  location?: {
    address?: string;
    city?: string;
    area?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
  };
  address?: Record<string, unknown>;
  logo_url?: string;
  images?: string[];
  banner_url?: string;
  cover_image?: string;
  rating?: number;
  total_reviews?: number;
  total_ratings?: number;
  delivery_time?: { min: number; max: number };
  delivery_fee?: number;
  minimum_order?: number;
  is_open?: boolean;
  is_active?: boolean;
  opening_hours?: Record<string, unknown>;
  status?: string;
  featured?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
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
        
        // Transform backend data to match frontend types
        const transformedRestaurants = (restaurants as BackendRestaurant[]).map((restaurant) => {
          const location = restaurant.location || {};
          return {
            _id: restaurant._id,
            name: restaurant.name,
            email: restaurant.email,
            owner_name: restaurant.owner_name || 'N/A',
            phone: restaurant.phone,
            description: restaurant.description,
            cuisine_types: restaurant.cuisine || restaurant.cuisine_types || [],
            address: {
              street: location.address || '',
              city: location.city || '',
              area: location.area || '',
              postal_code: location.postal_code,
              latitude: location.latitude,
              longitude: location.longitude,
            },
            logo_url: restaurant.logo_url || restaurant.images?.[0],
            banner_url: restaurant.banner_url || restaurant.cover_image,
            rating: restaurant.rating || 0,
            total_ratings: restaurant.total_reviews || restaurant.total_ratings || 0,
            delivery_time: restaurant.delivery_time || { min: 20, max: 35 },
            delivery_fee: restaurant.delivery_fee || 50,
            minimum_order: restaurant.minimum_order || 0,
            is_open: restaurant.is_open ?? restaurant.is_active ?? true,
            opening_hours: restaurant.opening_hours,
            status: restaurant.status || 'active',
            featured: restaurant.featured || restaurant.is_verified || false,
            created_at: restaurant.created_at,
            updated_at: restaurant.updated_at,
          } as Restaurant;
        });
        
        console.log('Transformed restaurants:', transformedRestaurants);
        return transformedRestaurants as Restaurant[];
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

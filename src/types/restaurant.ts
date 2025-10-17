// Restaurant Types
export interface Restaurant {
  _id: string;
  name: string;
  email: string;
  owner_name: string;
  phone: string;
  description?: string;
  cuisine_types: string[];
  address: {
    street: string;
    city: string;
    area: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
  };
  logo_url?: string;
  banner_url?: string;
  rating: number;
  total_ratings: number;
  delivery_time: {
    min: number;
    max: number;
  };
  delivery_fee: number;
  minimum_order?: number;
  is_open: boolean;
  opening_hours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

// Menu Item Types
export interface MenuItem {
  _id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_featured?: boolean;
  dietary_info?: string[];
  ingredients?: string[];
  rating: number;
  total_ratings: number;
  preparation_time?: number;
  created_at: string;
  updated_at: string;
}

// Filter Types
export interface RestaurantFilters {
  sortBy: 'default' | 'distance' | 'top_reviewed' | 'top_selling';
  mealType: string[];
  priceRange: [number, number];
  deliveryTime: [number, number];
  cuisines: string[];
  searchQuery: string;
}

// Deal/Offer Types
export interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  image_url: string;
  restaurant_id?: string;
  valid_until?: string;
}

// Cuisine Category Types
export interface CuisineCategory {
  id: string;
  name: string;
  image_url: string;
  count?: number;
}

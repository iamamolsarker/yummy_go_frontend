import React from 'react';
import { Clock, Star, Heart } from 'lucide-react';
import type { Restaurant } from '../../types/restaurant';
import { Link } from 'react-router';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const isTemporarilyUnavailable = 
    (restaurant.is_open === false) || 
    (restaurant.is_active === false) || 
    (restaurant.status && restaurant.status !== 'active');
  
  // Format delivery time
  const deliveryTime = restaurant.delivery_time 
    ? `${restaurant.delivery_time.min} - ${restaurant.delivery_time.max} min`
    : '20 - 35 min';
  
  // Get cuisine types - handle both array and string
  const getCuisineDisplay = () => {
    const cuisine = restaurant.cuisine || restaurant.cuisine_types;
    if (!cuisine) return 'Restaurant';
    if (Array.isArray(cuisine)) return cuisine.join(', ');
    if (typeof cuisine === 'string') return cuisine;
    return 'Restaurant';
  };
  const cuisineDisplay = getCuisineDisplay();
  
  // Get opening time for closed restaurants
  const getOpeningTime = () => {
    if (!restaurant.opening_hours) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = restaurant.opening_hours[today];
    return todayHours?.open || null;
  };

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      {/* Favorite Button */}
      <button className="absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
        <Heart size={18} className="text-gray-600 group-hover:text-primary" />
      </button>

      {/* Restaurant Image */}
      <Link to={`/restaurants/${restaurant._id}`}>
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {(restaurant.banner_url || restaurant.logo_url) ? (
            <img
              src={restaurant.banner_url || restaurant.logo_url}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-orange-50 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-300">{restaurant.name}</span>
            </div>
          )}
          
          {/* Overlay for closed/unavailable restaurants */}
          {isTemporarilyUnavailable && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-lg mb-2">Temporarily unavailable</span>
              {getOpeningTime() && (
                <span className="text-white text-sm mb-3">
                  Open at {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}, {getOpeningTime()}
                </span>
              )}
              <button className="bg-white text-primary px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                Order for later
              </button>
            </div>
          )}

          {/* Badge for featured restaurants */}
          {restaurant.featured && (
            <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold">
              YUMMYGO
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-dark-title mb-1 truncate group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          
          <p className="text-sm text-gray-text mb-3 truncate">
            {cuisineDisplay}
          </p>

          {/* Rating and Delivery Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-dark-title">
                {restaurant.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-gray-text">
                ({restaurant.total_reviews || restaurant.total_ratings || 0})
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-text">
              <Clock size={16} />
              <span>{deliveryTime}</span>
            </div>
          </div>

          {/* Delivery Fee */}
          {restaurant.delivery_fee !== undefined && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-text">
              Delivery Fee: <span className="font-semibold text-dark-title">৳{restaurant.delivery_fee}</span>
              {restaurant.minimum_order && (
                <span className="ml-2">• Min order: ৳{restaurant.minimum_order}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default RestaurantCard;

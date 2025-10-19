import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Heart,
  Share2,
  ChevronLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X
} from 'lucide-react';
import useAxios from '../../hooks/useAxios';
import type { Restaurant, MenuItem } from '../../types/restaurant';

// Cart Item Type
interface CartItem extends MenuItem {
  quantity: number;
}

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axios = useAxios();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch Restaurant Details
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await axios.get(`/api/restaurants/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Fetch Menu Items
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu', id],
    queryFn: async () => {
      const response = await axios.get(`/api/restaurants/${id}/menu`);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(menuItems.map(item => item.category))];
    return cats;
  }, [menuItems]);

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart Functions
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem._id !== itemId);
    });
  };

  const getItemQuantity = (itemId: string) => {
    const item = cart.find(cartItem => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Loading State
  if (restaurantLoading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurant not found</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-primary hover:underline"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const isTemporarilyUnavailable = !restaurant.is_open || restaurant.status !== 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container w-[90%] mx-auto py-4">
          <button
            onClick={() => navigate('/restaurants')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back to Restaurants</span>
          </button>
        </div>
      </div>

      {/* Restaurant Banner */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={restaurant.banner_url || restaurant.logo_url || 'https://via.placeholder.com/1200x400?text=Restaurant'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Action Buttons on Banner */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              size={20}
              className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}
            />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Share2 size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container w-[90%] mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                <p className="text-lg text-gray-200 mb-3">
                  {restaurant.cuisine_types?.join(' • ') || 'Restaurant'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-300">({restaurant.total_ratings || 0})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={18} />
                    <span>{restaurant.delivery_time?.min || 0}-{restaurant.delivery_time?.max || 0} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{restaurant.address?.area || ''}, {restaurant.address?.city || ''}</span>
                  </div>
                </div>
              </div>
              {restaurant.logo_url && (
                <img
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                  className="w-20 h-20 rounded-lg border-4 border-white shadow-lg object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Unavailable Overlay */}
        {isTemporarilyUnavailable && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">Temporarily Unavailable</h2>
              <p className="text-lg">This restaurant is currently not accepting orders</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container w-[90%] mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Search and Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="space-y-4">
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">No items found</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const quantity = getItemQuantity(item._id);
                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 flex gap-4">
                        {/* Item Image */}
                        {item.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-dark-title mb-1">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              {item.dietary_info && item.dietary_info.length > 0 && (
                                <div className="flex gap-1 mb-2">
                                  {item.dietary_info.map((diet, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                                    >
                                      {diet}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-primary">
                                  ৳{item.price}
                                </span>
                                {item.rating > 0 && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold">{item.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Add to Cart Button */}
                          {!isTemporarilyUnavailable && (
                            <div className="flex items-center gap-2 mt-3">
                              {quantity === 0 ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={!item.is_available}
                                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    item.is_available
                                      ? 'bg-primary text-white hover:bg-primary/90'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {item.is_available ? 'Add to Cart' : 'Unavailable'}
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 bg-primary rounded-lg px-4 py-2">
                                  <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-white hover:scale-110 transition-transform"
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="text-white font-bold min-w-[20px] text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="text-white hover:scale-110 transition-transform"
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Restaurant Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Restaurant Details Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-dark-title mb-4">Restaurant Info</h3>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Address</p>
                      <p className="text-sm text-gray-600">
                        {restaurant.address?.street || ''}, {restaurant.address?.area || ''}<br />
                        {restaurant.address?.city || ''}
                        {restaurant.address?.postal_code && ` - ${restaurant.address.postal_code}`}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Phone</p>
                      <a
                        href={`tel:${restaurant.phone || ''}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {restaurant.phone || 'N/A'}
                      </a>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Delivery Fee</span>
                      <span className="font-semibold text-gray-800">৳{restaurant.delivery_fee || 0}</span>
                    </div>
                    {restaurant.minimum_order && (
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Minimum Order</span>
                        <span className="font-semibold text-gray-800">৳{restaurant.minimum_order}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Time</span>
                      <span className="font-semibold text-gray-800">
                        {restaurant.delivery_time?.min || 0}-{restaurant.delivery_time?.max || 0} min
                      </span>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  {restaurant.opening_hours && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800 mb-2">Opening Hours</p>
                      <div className="space-y-1 text-sm">
                        {Object.entries(restaurant.opening_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{day}</span>
                            <span className="text-gray-800">
                              {hours.open} - {hours.close}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {restaurant.description && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-dark-title mb-3">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartItemsCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 z-50"
        >
          <ShoppingCart size={24} />
          <span className="font-bold text-lg">{cartItemsCount} items</span>
          <span className="font-bold text-lg">৳{cartTotal}</span>
        </button>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-title">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                      <p className="text-primary font-semibold">৳{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-primary hover:scale-110 transition-transform"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-bold min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="text-primary hover:scale-110 transition-transform"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <p className="font-bold text-gray-800 w-20 text-right">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">৳{restaurant.delivery_fee}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-dark-title pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary">৳{cartTotal + restaurant.delivery_fee}</span>
                </div>
              </div>
              <button className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;

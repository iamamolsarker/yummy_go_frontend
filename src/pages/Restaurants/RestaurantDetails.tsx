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
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronRight
} from 'lucide-react';
import { FaLeaf, FaCarrot, FaCheckCircle, FaUtensils } from 'react-icons/fa';
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
      const response = await axios.get(`/restaurants/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Fetch Menu Items - Disabled for now as endpoint may not be ready
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/restaurants/${id}/menus`);
        return response.data.data || [];
      } catch {
        console.warn('Menu endpoint not available, using empty menu');
        return [];
      }
    },
    enabled: !!id,
    retry: false, // Don't retry on 404
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

  const isTemporarilyUnavailable = 
    (restaurant.is_open === false) || 
    (restaurant.is_active === false) || 
    (restaurant.status && restaurant.status !== 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-primary">
              Home
            </button>
            <ChevronRight size={16} />
            <button onClick={() => navigate('/restaurants')} className="hover:text-primary">
              Restaurant List
            </button>
            <ChevronRight size={16} />
            <span className="text-dark-title font-medium">{restaurant.name}</span>
          </div>
        </div>
      </div>

      {/* Restaurant Header - Compact Foodpanda Style */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Logo + Info */}
            <div className="flex items-start gap-4">
              {/* Restaurant Logo */}
              {(restaurant.logo_url || restaurant.banner_url) ? (
                <img
                  src={restaurant.logo_url || restaurant.banner_url}
                  alt={restaurant.name}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaUtensils className="text-3xl text-gray-400" />
                </div>
              )}

              {/* Restaurant Info */}
              <div>
                <h1 className="text-3xl font-bold text-dark-title mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 mb-2">
                  {(restaurant.cuisine || restaurant.cuisine_types)?.join(' · ') || 'Restaurant'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-primary text-primary" />
                    <span className="font-semibold text-dark-title">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                    <span>({(restaurant.total_reviews || restaurant.total_ratings || 0)}+)</span>
                  </div>
                  <span>·</span>
                  <span>Min. order Tk {restaurant.minimum_order || 0}</span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Heart
                  size={24}
                  className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                />
              </button>
              <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                <Share2 size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Delivery Info Banner */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            {restaurant.delivery_time && (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{restaurant.delivery_time.min}-{restaurant.delivery_time.max} min</span>
                </div>
                <span className="text-gray-400">·</span>
              </>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>
                {restaurant.location?.area || restaurant.address?.area || ''}, {restaurant.location?.city || restaurant.address?.city || ''}
              </span>
            </div>
          </div>

          {/* Unavailable Banner */}
          {isTemporarilyUnavailable && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">⚠️ Temporarily Unavailable - This restaurant is currently not accepting orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Search & Category Tabs - Sticky */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Search */}
          <div className="py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search in menu"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Tabs - Horizontal Scroll */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide border-t">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`py-3 px-1 whitespace-nowrap font-medium transition-colors relative ${
                  selectedCategory === category
                    ? 'text-dark-title'
                    : 'text-gray-600 hover:text-dark-title'
                }`}
              >
                {category}
                {selectedCategory === category && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Title */}
            {selectedCategory !== 'All' && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-dark-title flex items-center gap-2">
                  {selectedCategory}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Most ordered right now.</p>
              </div>
            )}

            {/* Menu Items - Image on RIGHT like Foodpanda */}
            <div className="space-y-4">
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <p className="text-gray-500 text-lg">No items found</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const quantity = getItemQuantity(item._id);
                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="p-4 flex gap-4 justify-between">
                        {/* Left: Item Info */}
                        <div className="flex-1">
                          {/* Title */}
                          <h3 className="text-lg font-bold text-dark-title mb-1">
                            {item.name}
                          </h3>

                          {/* Price */}
                          <p className="text-sm font-semibold text-gray-800 mb-2">
                            from Tk {item.price}
                          </p>

                          {/* Description */}
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.is_vegetarian && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium flex items-center gap-1">
                                <FaLeaf size={10} />
                                Vegetarian
                              </span>
                            )}
                            {item.is_vegan && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium flex items-center gap-1">
                                <FaCarrot size={10} />
                                Vegan
                              </span>
                            )}
                            {item.is_halal && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium flex items-center gap-1">
                                <FaCheckCircle size={10} />
                                Halal
                              </span>
                            )}
                          </div>

                          {/* Nutrition - Compact */}
                          {item.nutrition && (
                            <div className="flex gap-3 text-xs text-gray-600 mb-3">
                              {item.nutrition.calories != null && (
                                <span>{item.nutrition.calories} cal</span>
                              )}
                              {item.nutrition.protein != null && (
                                <span>·</span>
                              )}
                              {item.nutrition.protein != null && (
                                <span>{item.nutrition.protein}g protein</span>
                              )}
                            </div>
                          )}

                          {/* Rating & Prep Time */}
                          <div className="flex items-center gap-4 mb-3">
                            {item.rating > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{item.rating.toFixed(1)}</span>
                                <span className="text-gray-500">({item.total_reviews || 0})</span>
                              </div>
                            )}
                            {item.preparation_time && (
                              <>
                                <span className="text-gray-400">·</span>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock size={14} />
                                  <span>{item.preparation_time}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Add Button */}
                          {!isTemporarilyUnavailable && (
                            <div>
                              {quantity === 0 ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={!item.is_available}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    item.is_available
                                      ? 'bg-white border-2 border-gray-300 text-primary hover:bg-gray-50'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <Plus size={18} />
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 bg-primary text-white rounded-full px-3 py-1 w-fit">
                                  <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="hover:scale-110 transition-transform"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="font-bold min-w-[20px] text-center text-sm">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="hover:scale-110 transition-transform"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Image */}
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-28 h-28 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-28 h-28 bg-gradient-to-br from-primary/10 to-orange-50 rounded-lg flex items-center justify-center">
                              <FaUtensils className="text-3xl text-gray-400" />
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Restaurant Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-dark-title mb-4">Restaurant Info</h3>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800 mb-1 text-sm">Address</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {restaurant.location?.address || restaurant.address?.street || 'Address not available'}
                        {(restaurant.location?.area || restaurant.address?.area) && (
                          <><br />{restaurant.location?.area || restaurant.address?.area}</>
                        )}
                        {(restaurant.location?.city || restaurant.address?.city) && (
                          <>, {restaurant.location?.city || restaurant.address?.city}</>
                        )}
                        {restaurant.address?.postal_code && (
                          <> - {restaurant.address.postal_code}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800 mb-1 text-sm">Phone</p>
                      <a
                        href={`tel:${restaurant.phone || ''}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {restaurant.phone || 'N/A'}
                      </a>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {(restaurant.delivery_fee !== undefined || restaurant.minimum_order) && (
                    <div className="pt-4 border-t border-gray-200">
                      {restaurant.delivery_fee !== undefined && (
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span className="font-semibold text-gray-800">৳{restaurant.delivery_fee}</span>
                        </div>
                      )}
                      {restaurant.minimum_order && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Minimum Order</span>
                          <span className="font-semibold text-gray-800">৳{restaurant.minimum_order}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                    {item.image && (
                      <img
                        src={item.image}
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
                  <span className="font-semibold">৳{restaurant.delivery_fee || 0}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-dark-title pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary">৳{cartTotal + (restaurant.delivery_fee ?? 0)}</span>
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

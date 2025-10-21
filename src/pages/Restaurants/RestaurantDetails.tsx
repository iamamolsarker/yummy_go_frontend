import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  ChevronRight,
  AlertCircle,
  Check
} from 'lucide-react';
import { FaLeaf, FaCarrot, FaCheckCircle, FaUtensils } from 'react-icons/fa';
import useAxios from '../../hooks/useAxios';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import PageContainer from '../../components/shared/PageContainer';
import type { Restaurant, MenuItem } from '../../types/restaurant';

// Cart Item Type
interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

// Backend Cart Response Types
interface BackendCart {
  _id: string;
  user_email: string;
  restaurant_id: string;
  items: {
    menu_id: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  total_amount: number;
  status: 'active' | 'checkout' | 'ordered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axios = useAxios();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemNotes, setItemNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch Restaurant Details
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await axios.get(`/api/restaurants/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Fetch Menu Items - Disabled for now as endpoint may not be ready
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/restaurants/${id}/menus`);
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

  // Fetch Backend Cart
  const { data: backendCart, refetch: refetchCart } = useQuery<BackendCart | null>({
    queryKey: ['cart', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const response = await axiosSecure.get(`/carts/user/${user.email}`);
        return response.data.data;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          return null; // No cart exists yet
        }
        throw error;
      }
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60, // 1 minute
  });

  // Sync local cart with backend cart on load
  useEffect(() => {
    if (backendCart && backendCart.items.length > 0 && backendCart.restaurant_id === id) {
      // Map backend cart items to local cart
      const mappedCart: CartItem[] = backendCart.items.map(item => {
        const menuItem = menuItems.find(m => m._id === item.menu_id);
        if (menuItem) {
          return {
            ...menuItem,
            quantity: item.quantity,
            notes: item.notes,
          };
        }
        return null;
      }).filter(Boolean) as CartItem[];
      
      setLocalCart(mappedCart);
    }
  }, [backendCart, id, menuItems]);

  // Create Cart Mutation
  const createCartMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosSecure.post('/carts', {
        user_email: user?.email,
        restaurant_id: id,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.email] });
    },
  });

  // Add Item to Cart Mutation
  const addItemMutation = useMutation({
    mutationFn: async ({ cartId, item, notes }: { cartId: string; item: MenuItem; notes?: string }) => {
      const response = await axiosSecure.post(`/carts/${cartId}/items`, {
        menu_id: item._id,
        quantity: 1,
        price: item.price,
        notes: notes || undefined,
      });
      return response.data.data;
    },
    onSuccess: () => {
      refetchCart();
      showToast('Item added to cart!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to add item');
    },
  });

  // Update Item Quantity Mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartId, menuId, quantity }: { cartId: string; menuId: string; quantity: number }) => {
      const response = await axiosSecure.patch(`/carts/${cartId}/items/${menuId}/quantity`, {
        quantity,
      });
      return response.data.data;
    },
    onSuccess: () => {
      refetchCart();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to update quantity');
    },
  });

  // Remove Item Mutation
  const removeItemMutation = useMutation({
    mutationFn: async ({ cartId, menuId }: { cartId: string; menuId: string }) => {
      const response = await axiosSecure.delete(`/carts/${cartId}/items/${menuId}`);
      return response.data.data;
    },
    onSuccess: () => {
      refetchCart();
      showToast('Item removed from cart');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to remove item');
    },
  });

  // Clear Cart Mutation
  const clearCartMutation = useMutation({
    mutationFn: async (cartId: string) => {
      const response = await axiosSecure.delete(`/carts/${cartId}/clear`);
      return response.data.data;
    },
    onSuccess: () => {
      setLocalCart([]);
      refetchCart();
      showToast('Cart cleared');
    },
  });

  // Toast Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Cart Functions with Backend Integration
  const addToCart = async (item: MenuItem, notes?: string) => {
    if (!user) {
      showToast('Please login to add items to cart');
      navigate('/auth/login');
      return;
    }

    // Check if trying to add from different restaurant
    if (backendCart && backendCart.restaurant_id !== id) {
      const confirmSwitch = window.confirm(
        'Your cart contains items from another restaurant. Do you want to clear it and start a new cart?'
      );
      if (!confirmSwitch) return;
      await clearCartMutation.mutateAsync(backendCart._id);
    }

    try {
      let cartId = backendCart?._id;

      // Create cart if doesn't exist
      if (!cartId) {
        const newCart = await createCartMutation.mutateAsync();
        cartId = newCart._id;
      }

      // Check if item already exists
      const existingItem = localCart.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        // Update quantity
        await updateQuantityMutation.mutateAsync({
          cartId: cartId!,
          menuId: item._id,
          quantity: existingItem.quantity + 1,
        });
        
        // Update local state
        setLocalCart(prevCart =>
          prevCart.map(cartItem =>
            cartItem._id === item._id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      } else {
        // Add new item
        await addItemMutation.mutateAsync({ cartId: cartId!, item, notes });
        
        // Update local state
        setLocalCart(prevCart => [...prevCart, { ...item, quantity: 1, notes }]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!backendCart) return;

    const existingItem = localCart.find(cartItem => cartItem._id === itemId);
    if (!existingItem) return;

    try {
      if (existingItem.quantity > 1) {
        // Decrease quantity
        await updateQuantityMutation.mutateAsync({
          cartId: backendCart._id,
          menuId: itemId,
          quantity: existingItem.quantity - 1,
        });
        
        setLocalCart(prevCart =>
          prevCart.map(cartItem =>
            cartItem._id === itemId
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
        );
      } else {
        // Remove item completely
        await removeItemMutation.mutateAsync({
          cartId: backendCart._id,
          menuId: itemId,
        });
        
        setLocalCart(prevCart => prevCart.filter(cartItem => cartItem._id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getItemQuantity = (itemId: string) => {
    const item = localCart.find(cartItem => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  const cartTotal = useMemo(() => {
    return localCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [localCart]);

  const cartItemsCount = useMemo(() => {
    return localCart.reduce((total, item) => total + item.quantity, 0);
  }, [localCart]);

  const handleCheckout = () => {
    if (!user) {
      showToast('Please login to proceed');
      navigate('/auth/login');
      return;
    }

    if (cartItemsCount === 0) {
      showToast('Your cart is empty');
      return;
    }

    // Update cart status to checkout
    if (backendCart) {
      axiosSecure.patch(`/carts/${backendCart._id}/status`, { status: 'checkout' })
        .then(() => {
          navigate('/checkout', { state: { cartId: backendCart._id, restaurantId: id } });
        })
        .catch((error) => {
          console.error('Checkout error:', error);
          showToast('Failed to proceed to checkout');
        });
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: restaurant?.name || 'Restaurant',
      text: `Check out ${restaurant?.name} on YummyGo!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

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
        <PageContainer className="py-3">
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
        </PageContainer>
      </div>

      {/* Restaurant Header - Compact Foodpanda Style */}
      <div className="bg-white border-b">
          <PageContainer>
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
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  size={24}
                  className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                />
              </button>
              <button 
                onClick={handleShare}
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Share restaurant"
              >
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
        </PageContainer>
      </div>

      {/* Search & Category Tabs - Sticky */}
      <div className="bg-white border-b sticky top-0 z-30">
        <PageContainer className="py-0">
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
        </PageContainer>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
      <PageContainer>
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
                                  onClick={() => {
                                    if (item.ingredients || item.allergens || item.nutrition) {
                                      // Open modal for items with details
                                      setSelectedItem(item);
                                    } else {
                                      // Quick add for simple items
                                      addToCart(item);
                                    }
                                  }}
                                  disabled={!item.is_available}
                                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                                    item.is_available
                                      ? 'bg-primary text-white hover:bg-primary/90'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  {item.is_available ? 'Add' : 'Unavailable'}
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
        </PageContainer>
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
              {localCart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add items from the menu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {localCart.map((item) => (
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
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                        )}
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
              )}
            </div>

            {/* Cart Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">৳{(restaurant?.delivery_fee || 0).toFixed(2)}</span>
                </div>
                {restaurant?.minimum_order && cartTotal < restaurant.minimum_order && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <AlertCircle size={14} className="inline mr-1" />
                      Minimum order: ৳{restaurant.minimum_order} (Add ৳{(restaurant.minimum_order - cartTotal).toFixed(2)} more)
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-dark-title pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary">৳{(cartTotal + (restaurant?.delivery_fee ?? 0)).toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cartItemsCount === 0 || (restaurant?.minimum_order ? cartTotal < restaurant.minimum_order : false)}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {cartItemsCount === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <Check size={24} />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="relative">
              {selectedItem.image && (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setItemNotes('');
                }}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-2xl font-bold text-dark-title mb-2">{selectedItem.name}</h3>
              <p className="text-xl text-primary font-bold mb-4">৳{selectedItem.price}</p>
              
              {selectedItem.description && (
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              )}

              {/* Dietary Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItem.is_vegetarian && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg font-medium flex items-center gap-1">
                    <FaLeaf size={12} />
                    Vegetarian
                  </span>
                )}
                {selectedItem.is_vegan && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg font-medium flex items-center gap-1">
                    <FaCarrot size={12} />
                    Vegan
                  </span>
                )}
                {selectedItem.is_halal && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium flex items-center gap-1">
                    <FaCheckCircle size={12} />
                    Halal
                  </span>
                )}
              </div>

              {/* Nutrition Info */}
              {selectedItem.nutrition && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Nutrition Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedItem.nutrition.calories != null && (
                      <div>
                        <span className="text-gray-600">Calories:</span>
                        <span className="ml-2 font-semibold">{selectedItem.nutrition.calories}</span>
                      </div>
                    )}
                    {selectedItem.nutrition.protein != null && (
                      <div>
                        <span className="text-gray-600">Protein:</span>
                        <span className="ml-2 font-semibold">{selectedItem.nutrition.protein}g</span>
                      </div>
                    )}
                    {selectedItem.nutrition.carbs != null && (
                      <div>
                        <span className="text-gray-600">Carbs:</span>
                        <span className="ml-2 font-semibold">{selectedItem.nutrition.carbs}g</span>
                      </div>
                    )}
                    {selectedItem.nutrition.fat != null && (
                      <div>
                        <span className="text-gray-600">Fat:</span>
                        <span className="ml-2 font-semibold">{selectedItem.nutrition.fat}g</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Allergens</h4>
                  <p className="text-sm text-red-600">{selectedItem.allergens.join(', ')}</p>
                </div>
              )}

              {/* Special Instructions */}
              <div className="mb-4">
                <label className="block font-semibold text-gray-800 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="E.g., No onions, extra spicy..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  addToCart(selectedItem, itemNotes);
                  setSelectedItem(null);
                  setItemNotes('');
                }}
                disabled={!selectedItem.is_available}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {selectedItem.is_available ? `Add to Cart - ৳${selectedItem.price}` : 'Not Available'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;

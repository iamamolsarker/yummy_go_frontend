import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useAuth from '../hooks/useAuth';
import type { MenuItem } from '../types/restaurant';

// Cart Item Type
export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

// Backend Cart Response Type
export interface BackendCart {
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

interface CartContextType {
  localCart: CartItem[];
  setLocalCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  backendCart: BackendCart | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  cartItemsCount: number;
  addToCart: (item: MenuItem, notes?: string, restaurantId?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (itemId: string) => number;
  refetchCart: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export { CartContext };

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
          return null;
        }
        throw error;
      }
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60,
  });

  // Create Cart Mutation
  const createCartMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      const response = await axiosSecure.post('/carts', {
        user_email: user?.email,
        restaurant_id: restaurantId,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.email] });
    },
  });

  // Add Item Mutation
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

  // Update Quantity Mutation
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

  // Add to Cart Function
  const addToCart = async (item: MenuItem, notes?: string, restaurantId?: string) => {
    if (!user) {
      showToast('Please login to add items to cart');
      return;
    }

    // Check if trying to add from different restaurant
    if (backendCart && restaurantId && backendCart.restaurant_id !== restaurantId) {
      const confirmSwitch = window.confirm(
        'Your cart contains items from another restaurant. Do you want to clear it and start a new cart?'
      );
      if (!confirmSwitch) return;
      await clearCartMutation.mutateAsync(backendCart._id);
    }

    try {
      let cartId = backendCart?._id;

      // Create cart if doesn't exist
      if (!cartId && restaurantId) {
        const newCart = await createCartMutation.mutateAsync(restaurantId);
        cartId = newCart._id;
      }

      if (!cartId) {
        showToast('Unable to create cart');
        return;
      }

      // Check if item already exists
      const existingItem = localCart.find(cartItem => cartItem._id === item._id);

      if (existingItem) {
        // Update quantity
        await updateQuantityMutation.mutateAsync({
          cartId: cartId,
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
        await addItemMutation.mutateAsync({ cartId: cartId, item, notes });

        // Update local state
        setLocalCart(prevCart => [...prevCart, { ...item, quantity: 1, notes }]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Remove from Cart Function
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

  // Clear Cart Function
  const clearCart = async () => {
    if (!backendCart) return;
    try {
      await clearCartMutation.mutateAsync(backendCart._id);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Get Item Quantity
  const getItemQuantity = (itemId: string) => {
    const item = localCart.find(cartItem => cartItem._id === itemId);
    return item ? item.quantity : 0;
  };

  // Calculate Cart Total
  const cartTotal = localCart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Calculate Cart Items Count
  const cartItemsCount = localCart.reduce((total, item) => total + item.quantity, 0);

  // Sync local cart with backend when backendCart changes
  useEffect(() => {
    if (backendCart && backendCart.items.length > 0) {
      // This will be synced by individual pages when they have menu data
      // For now, just keep the structure
    } else if (backendCart?.items.length === 0) {
      setLocalCart([]);
    }
  }, [backendCart]);

  return (
    <CartContext.Provider
      value={{
        localCart,
        setLocalCart,
        backendCart: backendCart ?? null,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartItemsCount,
        addToCart,
        removeFromCart,
        clearCart,
        getItemQuantity,
        refetchCart,
        showToast,
      }}
    >
      {children}
      
      {/* Global Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

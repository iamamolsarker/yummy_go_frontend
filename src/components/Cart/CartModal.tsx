import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router';
import { ShoppingCart, Plus, Minus, X, AlertCircle } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const CartModal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const {
    localCart,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    cartItemsCount,
    addToCart,
    removeFromCart,
    backendCart,
    showToast,
  } = useCart();

  // Get restaurant details for delivery fee and minimum order
  const restaurant = backendCart
    ? {
        delivery_fee: 0, // Default, will be fetched if needed
        minimum_order: 0,
      }
    : null;

  const handleCheckout = () => {
    if (!user) {
      showToast('Please login to proceed');
      navigate('/auth/login');
      setIsCartOpen(false);
      return;
    }

    if (cartItemsCount === 0) {
      showToast('Your cart is empty');
      return;
    }

    // Update cart status to checkout
    if (backendCart) {
      axiosSecure
        .patch(`/carts/${backendCart._id}/status`, { status: 'checkout' })
        .then(() => {
          setIsCartOpen(false);
          navigate('/checkout', {
            state: { cartId: backendCart._id, restaurantId: backendCart.restaurant_id },
          });
        })
        .catch((error) => {
          console.error('Checkout error:', error);
          showToast('Failed to proceed to checkout');
        });
    }
  };

  if (!isCartOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
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
              <p className="text-gray-400 text-sm mt-2">Add items from restaurants</p>
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
                    <p className="font-semibold" style={{ color: '#EF451C' }}>৳{item.price}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="hover:scale-110 transition-transform"
                      style={{ color: '#EF451C' }}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="hover:scale-110 transition-transform"
                      style={{ color: '#EF451C' }}
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
              <span className="font-semibold">
                ৳{(restaurant?.delivery_fee || 0).toFixed(2)}
              </span>
            </div>
            {restaurant?.minimum_order && cartTotal < restaurant.minimum_order && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <AlertCircle size={14} className="inline mr-1" />
                  Minimum order: ৳{restaurant.minimum_order} (Add ৳
                  {(restaurant.minimum_order - cartTotal).toFixed(2)} more)
                </p>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-dark-title pt-3 border-t border-gray-300">
              <span>Total</span>
              <span style={{ color: '#EF451C' }}>
                ৳{(cartTotal + (restaurant?.delivery_fee ?? 0)).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={
              cartItemsCount === 0 ||
              (restaurant?.minimum_order ? cartTotal < restaurant.minimum_order : false)
            }
            style={{ backgroundColor: '#EF451C' }}
            className="cursor-pointer w-full text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {cartItemsCount === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CartModal;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MapPin, Phone, CreditCard, Wallet, Building2, Clock, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import PageContainer from '../../components/shared/PageContainer';
import { toast } from 'react-toastify';

interface DeliveryAddress {
  street: string;
  area: string;
  city: string;
  postal_code: string;
  phone: string;
  instructions?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { localCart, cartTotal, clearCart } = useCart();

  // Get cart and restaurant info from navigation state
  const { cartId, restaurantId } = location.state || {};

  // State Management
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    area: '',
    city: 'Dhaka',
    postal_code: '',
    phone: user?.phoneNumber || '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [restaurant, setRestaurant] = useState<{
    name?: string;
    delivery_fee?: number;
    delivery_time?: { min: number; max: number };
    minimum_order?: number;
  } | null>(null);

  // Fetch restaurant details
  useEffect(() => {
    if (!cartId || !restaurantId) {
      toast.error('Invalid checkout session');
      navigate('/restaurants');
      return;
    }

    const fetchRestaurant = async () => {
      try {
        const response = await axiosSecure.get(`/restaurants/${restaurantId}`);
        setRestaurant(response.data.data);
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
      }
    };

    fetchRestaurant();
  }, [cartId, restaurantId, navigate, axiosSecure]);

  // Calculate totals
  const deliveryFee = restaurant?.delivery_fee || 0;
  const vat = cartTotal * 0.05; // 5% VAT
  const totalAmount = cartTotal + deliveryFee + vat;

  // Handle form input changes
  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!deliveryAddress.street.trim()) {
      toast.error('Please enter street address');
      return false;
    }
    if (!deliveryAddress.area.trim()) {
      toast.error('Please enter area');
      return false;
    }
    if (!deliveryAddress.phone.trim()) {
      toast.error('Please enter phone number');
      return false;
    }
    if (deliveryAddress.phone.length < 11) {
      toast.error('Please enter valid phone number');
      return false;
    }
    return true;
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // Create order
      const orderData = {
        cart_id: cartId,
        restaurant_id: restaurantId,
        user_email: user?.email,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        items: localCart.map(item => ({
          menu_id: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        subtotal: cartTotal,
        delivery_fee: deliveryFee,
        vat: vat,
        total_amount: totalAmount,
        status: 'pending',
      };

      const response = await axiosSecure.post('/orders', orderData);
      
      if (response.data.success) {
        // Clear cart after successful order
        await clearCart();
        
        toast.success('Order placed successfully!');
        
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${response.data.data._id}`, {
          state: { orderId: response.data.data._id }
        });
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect if no cart
  if (!cartId || !restaurantId || !localCart || localCart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No items in cart</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
            style={{ backgroundColor: '#EF451C' }}
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-dark-title mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your order from {restaurant?.name || 'Restaurant'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={24} style={{ color: '#EF451C' }} />
                  <h2 className="text-xl font-bold text-dark-title">Delivery Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="e.g., House 123, Road 45"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Area *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.area}
                        onChange={(e) => handleAddressChange('area', e.target.value)}
                        placeholder="e.g., Gulshan, Banani"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={deliveryAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryAddress.instructions}
                      onChange={(e) => handleAddressChange('instructions', e.target.value)}
                      placeholder="e.g., Ring the bell, Leave at door"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={24} style={{ color: '#EF451C' }} />
                  <h2 className="text-xl font-bold text-dark-title">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-opacity-100 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={paymentMethod === 'cash' ? { borderColor: '#EF451C' } : {}}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-5 h-5"
                      style={{ accentColor: '#EF451C' }}
                    />
                    <Wallet size={24} className="text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </label>

                  {/* Card Payment */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-opacity-100 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={paymentMethod === 'card' ? { borderColor: '#EF451C' } : {}}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-5 h-5"
                      style={{ accentColor: '#EF451C' }}
                    />
                    <CreditCard size={24} className="text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay securely online</p>
                    </div>
                  </label>

                  {/* Mobile Banking */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'mobile'
                        ? 'border-opacity-100 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={paymentMethod === 'mobile' ? { borderColor: '#EF451C' } : {}}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={() => setPaymentMethod('mobile')}
                      className="w-5 h-5"
                      style={{ accentColor: '#EF451C' }}
                    />
                    <Building2 size={24} className="text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Mobile Banking</p>
                      <p className="text-sm text-gray-500">bKash, Nagad, Rocket</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-dark-title mb-4">Order Summary</h2>

                {/* Restaurant Info */}
                {restaurant && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">{restaurant.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      {restaurant.delivery_time?.min}-{restaurant.delivery_time?.max} min
                    </p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 max-h-64 overflow-y-auto">
                  {localCart.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.quantity}x {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">৳{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (5%)</span>
                    <span className="font-semibold">৳{vat.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-xl font-bold text-dark-title mb-6">
                  <span>Total</span>
                  <span style={{ color: '#EF451C' }}>৳{totalAmount.toFixed(2)}</span>
                </div>

                {/* Minimum Order Warning */}
                {restaurant?.minimum_order && cartTotal < restaurant.minimum_order && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Minimum order: ৳{restaurant.minimum_order}
                    </p>
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || (restaurant?.minimum_order ? cartTotal < restaurant.minimum_order : false)}
                  className="w-full text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: isProcessing ? '#9CA3AF' : '#EF451C' }}
                >
                  {isProcessing ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Processing...
                    </>
                  ) : (
                    `Place Order - ৳${totalAmount.toFixed(2)}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default Checkout;

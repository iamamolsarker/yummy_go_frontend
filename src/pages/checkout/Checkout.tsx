import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MapPin, Phone, CreditCard, Wallet, Building2, Clock, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import PageContainer from '../../components/shared/PageContainer';
import { toast } from 'react-toastify';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type PaymentMethodType = 'cash' | 'card' | 'mobile' | 'bkash' | 'nagad';

interface DeliveryAddress {
  street: string;
  area: string;
  city: string;
  postal_code: string;
  phone: string;
  instructions?: string;
}

interface OrderData {
  cart_id: string;
  restaurant_id: string;
  user_email?: string;
  delivery_address: DeliveryAddress;
  payment_method: PaymentMethodType;
  payment_intent_id?: string;
  payment_status: 'pending' | 'paid' | 'processing';
  items: Array<{
    menu_id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  delivery_fee: number;
  vat: number;
  total_amount: number;
  status: string;
}

// Payment Form Component
interface PaymentIntent {
  id: string;
  status: string;
  client_secret: string;
}

const PaymentForm = ({ totalAmount, onPaymentSuccess, disabled = false }: { 
  totalAmount: number; 
  onPaymentSuccess: (paymentIntent: PaymentIntent) => void;
  disabled?: boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const axiosSecure = useAxiosSecure();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      // Call your backend to create/initialize a payment intent
      const response = await axiosSecure.post('/create-payment-intent', {
        amount: Math.round(totalAmount * 100), // Convert to cents
        payment_method_id: paymentMethod.id,
      });

      const respData = response?.data;
      const payload = respData?.data || respData;

      // server payload commonly includes clientSecret and paymentIntentId
      const clientSecret = payload?.clientSecret || payload?.client_secret;
      const serverPaymentIntentId = payload?.paymentIntentId || payload?.payment_intent_id || payload?.paymentIntent?.id;

      if (clientSecret) {
        // Confirm the payment on client using the client secret
        const confirm = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

        if (confirm.error) {
          setError(confirm.error.message || 'Payment confirmation failed');
          return;
        }

        const pi = confirm.paymentIntent;
        const finalId = serverPaymentIntentId || pi?.id;

        if (pi && (pi.status === 'succeeded' || pi.status === 'requires_capture' || pi.status === 'requires_action')) {
          onPaymentSuccess({ id: finalId || pi.id, status: pi.status, client_secret: clientSecret });
        } else {
          setError('Payment was not completed.');
        }
      } else if (respData?.success && (serverPaymentIntentId || payload?.paymentIntent)) {
        // Some backends may create and confirm the payment intent server-side and return it
        const returnedPI = (payload.paymentIntent) ? payload.paymentIntent : { id: serverPaymentIntentId, status: payload?.status, client_secret: payload?.client_secret };
        onPaymentSuccess({ id: returnedPI.id, status: returnedPI.status || 'unknown', client_secret: returnedPI.client_secret });
      } else {
        setError('Payment initialization failed: invalid server response.');
      }
    } catch (e) {
  console.error('Payment error', e);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {disabled ? (
        <div className="p-4 border rounded-lg bg-green-50 text-green-800 font-semibold">Payment completed ✓</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={!stripe || loading || disabled}
            className="w-full bg-[#EF451C] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      )}
    </div>
  );
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { localCart, cartTotal, clearCart } = useCart();

  // Get cart and restaurant info from navigation state
  const { cartId, restaurantId } = location.state || {};

  // State Management
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    area: '',
    city: 'Dhaka',
    postal_code: '',
    phone: user?.phoneNumber || '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [mobilePayment, setMobilePayment] = useState<'bkash' | 'nagad' | null>(null);
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

    // Check if payment is required but not completed
    if ((paymentMethod === 'card' || paymentMethod === 'mobile') && !paymentCompleted) {
      toast.error('Please complete the payment before placing your order');
      return;
    }

    setIsProcessing(true);
    try {
      // Create order
      const orderData: OrderData = {
        cart_id: cartId,
        restaurant_id: restaurantId,
        user_email: user?.email || undefined,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        payment_intent_id: paymentIntent || undefined, // Add payment intent if paid with card
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
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

      // For mobile banking, set specific provider (bKash/Nagad) — payment_status remains 'paid' because payment must be completed before placing order
      if (paymentMethod === 'mobile' && mobilePayment) {
        orderData.payment_method = mobilePayment; // 'bkash' or 'nagad'
      }

      const response = await axiosSecure.post('/orders', orderData);
      
      if (response.data.success) {
        // Clear cart after successful order
        await clearCart();
        
        toast.success('Order placed successfully!');
        
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${response.data.data.orderId}`, {
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
                      onChange={() => {
                        setPaymentMethod('cash');
                        setPaymentCompleted(false);
                        setPaymentIntent(null);
                      }}
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
                      onChange={() => {
                        setPaymentMethod('card');
                        setPaymentCompleted(false);
                        setPaymentIntent(null);
                      }}
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
                      onChange={() => {
                        setPaymentMethod('mobile');
                        setPaymentCompleted(false);
                        setPaymentIntent(null);
                        setMobilePayment(null);
                      }}
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

                {/* Payment Forms */}
                <div className="mt-4">
                  {paymentMethod === 'card' && (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        totalAmount={totalAmount}
                        disabled={paymentCompleted}
                        onPaymentSuccess={(paymentIntent) => {
                          setPaymentIntent(paymentIntent.id);
                          setPaymentCompleted(true);
                          toast.success('Payment successful! You can now place your order.');
                        }}
                      />
                    </Elements>
                  )}

                  {paymentMethod === 'mobile' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setMobilePayment('bkash')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            mobilePayment === 'bkash'
                              ? 'border-[#EF451C] bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src="/bkash-logo.png" alt="bKash" className="h-8" />
                          <span className="font-semibold">bKash</span>
                        </button>
                        <button
                          onClick={() => setMobilePayment('nagad')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            mobilePayment === 'nagad'
                              ? 'border-[#EF451C] bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src="/nagad-logo.png" alt="Nagad" className="h-8" />
                          <span className="font-semibold">Nagad</span>
                        </button>
                      </div>
                      
                      {mobilePayment && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {mobilePayment.toUpperCase()} Number
                            </label>
                            <input
                              type="tel"
                              placeholder="01XXXXXXXXX"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                            />
                          </div>
                          <button
                            className={`w-full py-3 rounded-lg font-semibold ${paymentCompleted ? 'bg-green-500 text-white' : 'bg-[#EF451C] text-white hover:opacity-90'}`}
                            disabled={paymentCompleted}
                            onClick={async () => {
                              try {
                                // Simulating mobile payment verification
                                const response = await axiosSecure.post('/verify-mobile-payment', {
                                  provider: mobilePayment,
                                  amount: totalAmount,
                                });

                                if (response.data.success) {
                                  setPaymentIntent(response.data.transactionId);
                                  setPaymentCompleted(true);
                                  toast.success('Payment successful! You can now place your order.');
                                } else {
                                  toast.error(response.data.message || 'Payment verification failed.');
                                }
                              } catch {
                                toast.error('Payment verification failed. Please try again.');
                              }
                            }}
                          >
                            {paymentCompleted ? `${mobilePayment?.toUpperCase()} Paid ✓` : `Pay with ${mobilePayment?.toUpperCase()}`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p className="text-gray-600 flex items-center gap-2">
                        <Wallet className="text-[#EF451C]" size={20} />
                        Pay with cash upon delivery. Our delivery rider will collect the payment.
                      </p>
                    </div>
                  )}
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

                {/* Payment Status Badge */}
                <div className="mb-4">
                  {paymentMethod === 'cash' ? (
                    <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700">Payment method: Cash on delivery</div>
                  ) : paymentCompleted ? (
                    <div className="px-3 py-2 rounded-lg bg-green-50 text-green-800 font-semibold">Payment: Paid</div>
                  ) : (
                    <div className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-800">Payment: Pending</div>
                  )}
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
                  onClick={() => handlePlaceOrder()}
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

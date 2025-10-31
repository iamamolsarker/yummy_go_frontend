import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle, MapPin, Phone, Clock, Package, CreditCard, AlertTriangle } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import PageContainer from '../../components/shared/PageContainer';

interface Order {
  _id: string;
  order_number: string;
  restaurant_id: string;
  restaurant_name?: string;
  user_email: string;
  delivery_address: {
    street: string;
    area: string;
    city: string;
    phone: string;
    instructions?: string;
  };
  payment_method: 'cash' | 'card' | 'mobile';
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
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  estimated_delivery_time?: number;
  created_at: string;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await axiosSecure.get(`/orders/${orderId}`);
        setOrder(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, axiosSecure]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg" style={{ color: '#EF451C' }}></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Order not found'}</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
            style={{ backgroundColor: '#EF451C' }}
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const paymentMethodLabels = {
    cash: 'Cash on Delivery',
    card: 'Credit/Debit Card',
    mobile: 'Mobile Banking',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-6 border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#FEF3EF' }}>
              <CheckCircle size={48} style={{ color: '#EF451C' }} />
            </div>
            <h1 className="text-3xl font-bold text-dark-title mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. We've received it and will start preparing soon.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Order Number:</span>
              <span className="text-lg font-bold" style={{ color: '#EF451C' }}>
                #{order.order_number || order._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Estimated Delivery Time */}
          {order.estimated_delivery_time && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3EF' }}>
                  <Clock size={24} style={{ color: '#EF451C' }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="text-xl font-bold text-dark-title">
                    {order.estimated_delivery_time} minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Package size={24} style={{ color: '#EF451C' }} />
              <h2 className="text-xl font-bold text-dark-title">Order Items</h2>
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {item.quantity}x {item.name}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-1">Note: {item.notes}</p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800">৳{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">৳{(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold">৳{(order.delivery_fee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (5%)</span>
                <span className="font-semibold">৳{(order.vat || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-dark-title pt-2 border-t border-gray-200">
                <span>Total</span>
                <span style={{ color: '#EF451C' }}>৳{(order.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={24} style={{ color: '#EF451C' }} />
              <h2 className="text-xl font-bold text-dark-title">Delivery Address</h2>
            </div>
            <div className="space-y-2">
              <p className="text-gray-800">{order.delivery_address.street}</p>
              <p className="text-gray-800">
                {order.delivery_address.area}, {order.delivery_address.city}
              </p>
              {order.delivery_address.instructions && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Instructions:</span> {order.delivery_address.instructions}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-gray-800">
                <Phone size={16} />
                <span>{order.delivery_address.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={24} style={{ color: '#EF451C' }} />
              <h2 className="text-xl font-bold text-dark-title">Payment Method</h2>
            </div>
            <p className="text-gray-800 font-semibold">{paymentMethodLabels[order.payment_method]}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="flex-1 border-2 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#EF451C' }}
            >
              Track Order
            </button>
            <button
              onClick={() => navigate('/restaurants')}
              className="flex-1 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#EF451C' }}
            >
              Order Again
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help with your order?{' '}
              <button 
                className="font-semibold hover:underline" 
                style={{ color: '#EF451C' }}
                onClick={() => navigate('/support')}
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default OrderConfirmation;

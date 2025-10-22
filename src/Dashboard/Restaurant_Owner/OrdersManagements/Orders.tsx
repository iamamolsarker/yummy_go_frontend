/* Delivery Actions Integrated into Orders Page */
import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useAuth } from "../../../hooks/useAuth";

type DeliveryType = {
  _id: string;
  order_id: string;
  rider_id: string;
  status: string;
  location?: { latitude: number; longitude: number };
  proof?: { photo_url?: string; signature?: string; notes?: string };
};

type OrderType = {
  _id: string;
  orderNumber: string;
  userEmail: string;
  status: string;
  payment_status: string;
  totalAmount: number;
  delivery?: DeliveryType;
  isDeliveryOpen?: boolean;
};

export default function OrdersPageWithDelivery() {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [restaurantId, setRestaurantId] = useState<string>("");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch restaurant ID
  useEffect(() => {
    if (!user?.email) return;
    axiosSecure.get(`/restaurants/email/${user.email}`)
      .then(res => setRestaurantId(res.data._id))
      .catch(() => toast.error("Failed to fetch restaurant info"));
  }, [user?.email]);

  // Fetch orders
  useEffect(() => {
    if (!restaurantId) return;
    setIsLoading(true);
    axiosSecure.get(`/orders/restaurant/${restaurantId}`)
      .then(res => {
        const data = res.data.map((o: any) => ({ ...o, isDeliveryOpen: false }));
        setOrders(data);
      })
      .catch(() => toast.error("Failed to fetch orders"))
      .finally(() => setIsLoading(false));
  }, [restaurantId]);

  const handleDeliveryStatusUpdate = async (deliveryId: string, status: string) => {
    try {
      await axiosSecure.patch(`/deliveries/${deliveryId}/status`, { status });
      setOrders(prev => prev.map(order => {
        if (order.delivery?._id === deliveryId) order.delivery.status = status;
        return order;
      }));
      toast.success(`Delivery status updated to "${status}"`);
    } catch {
      toast.error("Failed to update delivery status");
    }
  };

  const handleDeliveryProofUpload = async (deliveryId: string, proofData: any) => {
    try {
      await axiosSecure.patch(`/deliveries/${deliveryId}/proof`, proofData);
      setOrders(prev => prev.map(order => {
        if (order.delivery?._id === deliveryId) order.delivery.proof = proofData;
        return order;
      }));
      toast.success("Delivery proof uploaded successfully");
    } catch {
      toast.error("Failed to upload delivery proof");
    }
  };

  const handleRiderLocationUpdate = async (deliveryId: string, location: { latitude: number; longitude: number }) => {
    try {
      await axiosSecure.patch(`/deliveries/${deliveryId}/location`, location);
      setOrders(prev => prev.map(order => {
        if (order.delivery?._id === deliveryId) order.delivery.location = location;
        return order;
      }));
    } catch {
      toast.error("Failed to update rider location");
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order._id} className="border rounded p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{order.orderNumber}</strong> - {order.status} - ${order.totalAmount.toFixed(2)}
                </div>
                <button onClick={() => setOrders(prev => prev.map(o => o._id === order._id ? { ...o, isDeliveryOpen: !o.isDeliveryOpen } : o))}>
                  {order.isDeliveryOpen ? "Hide Delivery" : "Show Delivery"}
                </button>
              </div>

              {order.isDeliveryOpen && order.delivery && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div>Delivery Status: {order.delivery.status}</div>
                  <div>
                    <button onClick={() => handleDeliveryStatusUpdate(order.delivery!._id, "picked_up")} className="mr-2">
                      Picked Up
                    </button>
                    <button onClick={() => handleDeliveryStatusUpdate(order.delivery!._id, "on_the_way")} className="mr-2">
                      On the Way
                    </button>
                    <button onClick={() => handleDeliveryStatusUpdate(order.delivery!._id, "delivered")}>
                      Delivered
                    </button>
                  </div>
                  <div className="mt-2">
                    <button onClick={() => handleRiderLocationUpdate(order.delivery!._id, { latitude: 23.8103, longitude: 90.4125 })}>
                      Update Rider Location
                    </button>
                  </div>
                  <div className="mt-2">
                    <button onClick={() => handleDeliveryProofUpload(order.delivery!._id, { photo_url: "https://example.com/photo.jpg", notes: "Delivered successfully" })}>
                      Upload Proof
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

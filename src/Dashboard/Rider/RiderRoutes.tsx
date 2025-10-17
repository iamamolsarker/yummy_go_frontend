/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import {
  ServerCrash,
  Navigation,
  Loader2,
  UtensilsCrossed,
  Flag,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Fix for default Leaflet icons ---
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// --- Type Definitions ---
type Delivery = {
  _id: string;
  order_number: string;
  status: string;
  pickup_address: { lat: number; lng: number; address: string };
  delivery_address: { lat: number; lng: number; address: string };
};

type RiderLocation = {
  lat: number;
  lng: number;
};

// --- Routing Machine Component ---
// This component bridges the gap between Leaflet's routing plugin and React
const RoutingMachine: React.FC<{ waypoints: L.LatLng[] }> = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // FIX: Cast 'L' to 'any' to resolve the TypeScript error for the routing plugin
    const routingControl = (L as any).Routing.control({
      waypoints,
      routeWhileDragging: true,
      show: false, // Hides the instruction panel
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#EF451C', opacity: 0.8, weight: 6 }],
      },
      createMarker: () => null, // Prevents default markers from the plugin
    }).addTo(map);

    // Cleanup function to remove the control when component unmounts
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, waypoints]);

  return null;
};

// --- Main Component ---
const RiderRoutes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }

    const fetchActiveDelivery = async () => {
      try {
        const userRes = await axiosSecure.get(`/users/${user.email}`);
        const riderId = userRes.data?.data?._id;
        if (riderId) {
          const deliveriesRes = await axiosSecure.get(`/deliveries/rider/${riderId}`);
          const deliveries = deliveriesRes.data?.data || [];
          const active = deliveries.find((d: any) => !['delivered', 'cancelled'].includes(d.status));
          setActiveDelivery(active || null);
        }
      } catch (err) {
        setError("Could not fetch active delivery details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveDelivery();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setRiderLocation(newLoc);
        setIsLoading(false);
      },
      () => {
        setError("Location access denied. Please enable it in your browser settings.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, authLoading, axiosSecure]);

  const mapCenter: L.LatLngExpression = riderLocation ? [riderLocation.lat, riderLocation.lng] : [23.8103, 90.4125];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-slate-500">
        <Loader2 className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Fetching Location & Route...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '1rem' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rider's Current Location Marker */}
        {riderLocation && (
          <CircleMarker
            center={[riderLocation.lat, riderLocation.lng]}
            radius={8}
            pathOptions={{ color: 'white', fillColor: '#4285F4', fillOpacity: 1, weight: 2 }}
          >
            <Popup>Your Current Location</Popup>
          </CircleMarker>
        )}

        {/* If there is an active delivery, render markers and route */}
        {activeDelivery && (
          <>
            <Marker position={[activeDelivery.pickup_address.lat, activeDelivery.pickup_address.lng]}>
              <Popup><b>Pickup:</b> {activeDelivery.pickup_address.address}</Popup>
            </Marker>
            <Marker position={[activeDelivery.delivery_address.lat, activeDelivery.delivery_address.lng]}>
              <Popup><b>Drop-off:</b> {activeDelivery.delivery_address.address}</Popup>
            </Marker>
            <RoutingMachine
              waypoints={[
                L.latLng(activeDelivery.pickup_address.lat, activeDelivery.pickup_address.lng),
                L.latLng(activeDelivery.delivery_address.lat, activeDelivery.delivery_address.lng),
              ]}
            />
          </>
        )}
      </MapContainer>

      <div className="absolute top-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        {activeDelivery ? (
          <div>
            <p className="font-bold text-slate-800">Active Delivery: #{activeDelivery.order_number}</p>
            <p className="text-sm text-slate-500 mb-2">Status: <span className="font-semibold text-green-600 capitalize">{activeDelivery.status}</span></p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2"><UtensilsCrossed size={16} className="text-slate-500 mt-0.5"/> <div><span className="font-semibold">Pickup:</span> {activeDelivery.pickup_address.address}</div></div>
              <div className="flex items-start gap-2"><Flag size={16} className="text-slate-500 mt-0.5"/> <div><span className="font-semibold">Drop-off:</span> {activeDelivery.delivery_address.address}</div></div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Navigation size={24} className="mx-auto text-slate-500 mb-2" />
            <p className="font-semibold text-slate-800">No Active Deliveries</p>
            <p className="text-sm text-slate-500">You are currently free. Ready for the next order!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderRoutes;
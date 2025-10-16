/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import {
  Map,
  ServerCrash,
  Navigation,
  Loader2,
  UtensilsCrossed,
  Flag,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

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

// --- Map Styling & Configuration ---
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
};

// --- Main Component ---
const RiderRoutes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // ✅ FIX: Use import.meta.env for Vite projects instead of process.env
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // --- Data Fetching and Geolocation ---
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
          const active = deliveries.find(
            (d: any) => !['delivered', 'cancelled'].includes(d.status)
          );
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
        setRiderLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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

  const mapCenter = useMemo(() => riderLocation || { lat: 23.8103, lng: 90.4125 }, [riderLocation]);

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
  
  if (!googleMapsApiKey) {
     return (
       <div className="flex flex-col justify-center items-center h-full text-center p-4">
          <Map className="text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Google Maps API Key Missing</h2>
          <p className="text-slate-500 max-w-md">Please add your Google Maps API Key to your environment variables (`.env.local`) as `VITE_GOOGLE_MAPS_API_KEY` to display the map.</p>
       </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={14} options={mapOptions}>
          {riderLocation && (
            <Marker
              position={riderLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8, fillColor: "#4285F4", fillOpacity: 1,
                strokeColor: "white", strokeWeight: 2,
              }}
            />
          )}

          {activeDelivery && (
            <>
              <Marker position={activeDelivery.pickup_address} label={{ text: "P", color: "white" }} />
              <Marker position={activeDelivery.delivery_address} label={{ text: "D", color: "white" }} />
              <DirectionsService
                options={{
                  destination: activeDelivery.delivery_address,
                  origin: activeDelivery.pickup_address,
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={(res) => {
                  if (res !== null && directionsResponse === null) {
                    setDirectionsResponse(res);
                  }
                }}
              />
              {directionsResponse && (
                <DirectionsRenderer options={{ directions: directionsResponse, suppressMarkers: true }} />
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>

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
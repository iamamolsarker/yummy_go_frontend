import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Bangladesh default center
const defaultCenter: LatLngExpression = [23.685, 90.3563];

// Custom red icon for user location
const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [36, 36], // slightly bigger for focus
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Recenter map when user location changes
interface RecenterProps {
  position: LatLngExpression | null;
}
function RecenterMap({ position }: RecenterProps) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 12); // zoom closer to user
    }
  }, [position, map]);
  return null;
}


interface District {
  name: string;
  lat: number;
  lng: number;
}
const districts: District[] = [
  { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Chittagong", lat: 22.3569, lng: 91.7832 },
  { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { name: "Rajshahi", lat: 24.3745, lng: 88.6042 },
  { name: "Khulna", lat: 22.8456, lng: 89.5403 },
  { name: "Barishal", lat: 22.7010, lng: 90.3535 },
  { name: "Rangpur", lat: 25.7439, lng: 89.2752 },
  { name: "Mymensingh", lat: 24.7471, lng: 90.4203 },
  // Remaining districts...
  { name: "Bagerhat", lat: 22.6600, lng: 89.7833 },
  { name: "Bogra", lat: 24.8491, lng: 89.3710 },
  { name: "Brahmanbaria", lat: 23.9575, lng: 91.0820 },
  { name: "Comilla", lat: 23.4600, lng: 91.1800 },
  { name: "Cox's Bazar", lat: 21.4272, lng: 92.0058 },
  { name: "Chuadanga", lat: 23.6333, lng: 88.8530 },
  { name: "Dinajpur", lat: 25.6250, lng: 88.6363 },
  { name: "Faridpur", lat: 23.6079, lng: 89.8456 },
  { name: "Feni", lat: 23.0158, lng: 91.3831 },
  { name: "Gaibandha", lat: 25.3333, lng: 89.5667 },
  { name: "Gazipur", lat: 23.9990, lng: 90.4200 },
  { name: "Gopalganj", lat: 23.0000, lng: 90.2414 },
  { name: "Habiganj", lat: 24.3758, lng: 91.4169 },
  { name: "Jamalpur", lat: 25.1043, lng: 89.9365 },
  { name: "Jashore", lat: 23.1695, lng: 89.2192 },
  { name: "Jhalokathi", lat: 22.5379, lng: 90.2937 },
  { name: "Jhenaidah", lat: 23.5455, lng: 89.1329 },
  { name: "Joypurhat", lat: 25.0925, lng: 89.0341 },
  { name: "Kishoreganj", lat: 24.4262, lng: 90.7793 },
  { name: "Kurigram", lat: 25.8000, lng: 89.6167 },
  { name: "Kushtia", lat: 23.9012, lng: 89.1202 },
  { name: "Lakshmipur", lat: 23.1860, lng: 90.7822 },
  { name: "Lalmonirhat", lat: 25.8833, lng: 89.3667 },
  { name: "Madaripur", lat: 23.1770, lng: 90.2065 },
  { name: "Magura", lat: 23.4855, lng: 89.4193 },
  { name: "Manikganj", lat: 23.8642, lng: 90.0082 },
  { name: "Meherpur", lat: 23.7457, lng: 88.6336 },
  { name: "Munshiganj", lat: 23.5500, lng: 90.5091 },
  { name: "Moulvibazar", lat: 24.4876, lng: 91.7777 },
  { name: "Narsingdi", lat: 23.9190, lng: 90.7151 },
  { name: "Natore", lat: 24.4100, lng: 89.0272 },
  { name: "Nawabganj", lat: 24.6021, lng: 88.3472 },
  { name: "Netrakona", lat: 24.8790, lng: 90.7294 },
  { name: "Nilphamari", lat: 25.9340, lng: 88.8346 },
  { name: "Noakhali", lat: 22.8167, lng: 91.1063 },
  { name: "Pabna", lat: 24.0060, lng: 89.2340 },
  { name: "Panchagarh", lat: 26.3344, lng: 88.5586 },
  { name: "Patuakhali", lat: 22.3597, lng: 90.3270 },
  { name: "Pirojpur", lat: 22.5787, lng: 90.3336 },
  { name: "Rajbari", lat: 23.7420, lng: 89.4446 },
  { name: "Rangamati", lat: 22.6075, lng: 92.2180 },
  { name: "Rangpur", lat: 25.7439, lng: 89.2752 },
  { name: "Satkhira", lat: 22.7167, lng: 89.0667 },
  { name: "Shariatpur", lat: 23.2500, lng: 90.4167 },
  { name: "Sherpur", lat: 25.0255, lng: 90.0150 },
  { name: "Sirajganj", lat: 24.4500, lng: 89.7000 },
  { name: "Sunamganj", lat: 24.9167, lng: 91.2500 },
  { name: "Tangail", lat: 24.2500, lng: 89.9167 },
  { name: "Thakurgaon", lat: 26.0333, lng: 88.4667 },
];

export default function DeliveryMapSection() {
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation([pos.coords.latitude, pos.coords.longitude] as LatLngExpression),
        () => console.warn("Geolocation denied, using default center")
      );
    }
  }, []);

  return (
    <section className="pt-[80px] bg-[#fffaf5] pb-16">
      <div className="text-center mb-12">
        <h2  className="text-4xl font-bold text-gray-800 mb-4">We Deliver To</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Yummy Go delivers across all <span className="font-bold">64 districts</span> of Bangladesh 🇧🇩
        </p>
      </div>

      <div className="w-11/12 mx-auto h-[500px] rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={userLocation || defaultCenter}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap position={userLocation} />

          {/* User marker with red icon and a focus circle */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={userIcon}>
                <Popup>Your Location 📍</Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={800} // 800 meters radius
                pathOptions={{ color: "red", fillOpacity: 0.2 }}
              />
            </>
          )}

          {/* District markers */}
          {districts.map((d, i) => (
            <Marker key={i} position={[d.lat, d.lng]}>
              <Popup>{d.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

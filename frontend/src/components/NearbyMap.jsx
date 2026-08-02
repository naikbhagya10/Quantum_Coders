import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Phone, Star, Clock } from 'lucide-react';

// Fix Leaflet marker icons in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function NearbyMap({ facilities = [], currentLocation = null }) {
  const centerLat = currentLocation?.lat ?? (facilities.length > 0 ? facilities[0].lat : 0);
  const centerLng = currentLocation?.lng ?? (facilities.length > 0 ? facilities[0].lng : 0);

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-base shadow-soft relative bg-white">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={currentLocation ? 13 : facilities.length > 0 ? 13 : 2}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {facilities.map((fac) => (
          <Marker key={fac.id} position={[fac.lat, fac.lng]}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{fac.address}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-emerald-600" /> {fac.rating} ({fac.reviews})
                  </span>
                  <span className="text-cyan-700 font-medium">{fac.distance} away</span>
                </div>
                <a
                  href={
                    currentLocation
                      ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${fac.lat},${fac.lng}`
                      : `https://maps.google.com/?q=${fac.lat},${fac.lng}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block w-full text-center py-1 bg-cyan-600 text-white rounded text-xs font-semibold hover:bg-cyan-700 transition"
                >
                  Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

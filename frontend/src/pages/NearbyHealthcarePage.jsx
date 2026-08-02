import React, { useState, useEffect } from 'react';
import { getNearbyHospitals } from '../services/api';
import { MapPin, Phone, Star, Clock, Search, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NearbyHealthcarePage() {
  const [facilities, setFacilities] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Detecting your current location...');
  const [locationResolved, setLocationResolved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser. Please enable location to see nearby care.');
      setLocationResolved(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationStatus(`Using your current location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setLocationResolved(true);
      },
      (error) => {
        setLocationStatus('Unable to detect location. Please enable location access to view nearby care.');
        console.warn('Geolocation error:', error);
        setLocationResolved(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (locationResolved && currentLocation) {
      fetchNearby();
    }
  }, [specialty, currentLocation, locationResolved]);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const params = { specialty };
      if (currentLocation) {
        params.lat = currentLocation.lat;
        params.lng = currentLocation.lng;
      }
      const res = await getNearbyHospitals(params);
      setFacilities(res.data.facilities || []);
    } catch (err) {
      console.error("Error fetching nearby healthcare:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
          <MapPin className="w-7 h-7 text-cyan-500" />
          <span>Nearby Hospitals & Specialist Finder</span>
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Locate nearby emergency rooms, diagnostic labs, specialty clinics, and top doctor specialists.
        </p>
        <p className="text-xs text-secondary mt-2">
          {locationStatus}
        </p>
      </div>

      {/* Search & Specialty Filters */}
      <div className="surface-card p-6 rounded-3xl border border-base flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Search specialty (e.g. Cardiology, Pathology)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field text-primary placeholder-secondary text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSpecialty('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              !specialty ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white border border-base text-secondary'
            }`}
          >
            All Facilities
          </button>
          <button
            onClick={() => setSpecialty('Cardiology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              specialty === 'Cardiology' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white border border-base text-secondary'
            }`}
          >
            🫀 Cardiology
          </button>
          <button
            onClick={() => setSpecialty('Pathology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              specialty === 'Pathology' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white border border-base text-secondary'
            }`}
          >
            🧪 Diagnostic Labs
          </button>
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilities.map((fac) => (
          <div key={fac.id} className="surface-card p-6 rounded-3xl border border-base space-y-4 hover:shadow-soft transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 font-semibold">{fac.category}</span>
                <h3 className="font-bold text-base text-primary mt-0.5">{fac.name}</h3>
                <p className="text-xs text-secondary mt-1">{fac.address}</p>
              </div>
              {fac.emergency_24x7 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-extrabold shrink-0">
                  24/7 ER
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {fac.rating} ({fac.reviews} reviews)
              </span>
              <span className="text-emerald-600 font-semibold">{fac.distance} away</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {fac.specialties?.map((spec, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-[#F7FAFD] text-secondary text-[10px] border border-base">
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-base text-xs">
              <span className="text-secondary font-mono flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-500" /> {fac.phone}
              </span>
              <a
                href={
                  currentLocation
                    ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${fac.lat},${fac.lng}`
                    : `https://maps.google.com/?q=${fac.lat},${fac.lng}`
                }
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition"
              >
                <span>Navigate</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

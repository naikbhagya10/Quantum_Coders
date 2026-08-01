import React, { useState, useEffect } from 'react';
import { getNearbyHospitals } from '../services/api';
import NearbyMap from '../components/NearbyMap';
import { MapPin, Phone, Star, Clock, Search, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NearbyHealthcarePage() {
  const [facilities, setFacilities] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearby();
  }, [specialty]);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const res = await getNearbyHospitals({ specialty });
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <MapPin className="w-7 h-7 text-cyan-400" />
          <span>Nearby Hospitals & Specialist Finder</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Locate nearby emergency rooms, diagnostic labs, specialty clinics, and top doctor specialists.
        </p>
      </div>

      {/* Search & Specialty Filters */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Search specialty (e.g. Cardiology, Pathology)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSpecialty('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              !specialty ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'glass-panel text-slate-400'
            }`}
          >
            All Facilities
          </button>
          <button
            onClick={() => setSpecialty('Cardiology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              specialty === 'Cardiology' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'glass-panel text-slate-400'
            }`}
          >
            🫀 Cardiology
          </button>
          <button
            onClick={() => setSpecialty('Pathology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              specialty === 'Pathology' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'glass-panel text-slate-400'
            }`}
          >
            🧪 Diagnostic Labs
          </button>
        </div>
      </div>

      {/* Interactive Map View */}
      <NearbyMap facilities={facilities} />

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilities.map((fac) => (
          <div key={fac.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">{fac.category}</span>
                <h3 className="font-bold text-base text-white mt-0.5">{fac.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{fac.address}</p>
              </div>
              {fac.emergency_24x7 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold shrink-0">
                  24/7 ER
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {fac.rating} ({fac.reviews} reviews)
              </span>
              <span className="text-emerald-400 font-semibold">{fac.distance} away</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {fac.specialties?.map((spec, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800">
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" /> {fac.phone}
              </span>
              <a
                href={`https://maps.google.com/?q=${fac.lat},${fac.lng}`}
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

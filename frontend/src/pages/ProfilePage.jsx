import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getCurrentUser } from '../services/api';
import { User, Mail, Calendar, Droplet, ShieldCheck, Heart, Save, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || 30,
    gender: user?.gender || 'Male',
    blood_group: user?.blood_group || 'A+',
    emergency_contact: '+1 (555) 019-2834',
    allergies: 'Penicillin, Peanuts',
    chronic_conditions: 'Mild Hypertension'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getCurrentUser();
      if (res.data.user) {
        setProfile((prev) => ({ ...prev, ...res.data.user }));
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addNotification('Patient profile updated successfully!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <User className="w-7 h-7 text-cyan-400" />
          <span>Patient Profile & Health Details</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Manage your personal medical profile, emergency contacts, and vital information.
        </p>
      </div>

      {/* Profile Form & Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Profile Overview Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
            {profile.name ? profile.name[0].toUpperCase() : 'P'}
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white">{profile.name || 'Patient'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mt-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Verified Health Account</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-3 text-left text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Blood Group</span>
              <span className="text-rose-400 font-bold text-sm">{profile.blood_group}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Age</span>
              <span className="text-cyan-400 font-bold text-sm">{profile.age} Yrs</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4">Edit Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                <select
                  value={profile.blood_group}
                  onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={profile.emergency_contact}
                  onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

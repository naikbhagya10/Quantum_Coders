import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { registerUser } from '../services/api';
import { Activity, Mail, Lock, User, Calendar, Droplet, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: 35,
    gender: 'Male',
    blood_group: 'A+'
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addNotification('Please fill in all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(formData);
      login(res.data.user, res.data.token);
      addNotification('Account created successfully! Welcome to MediClear AI.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      addNotification(msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-6 bg-base">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md surface-card p-6 rounded-3xl border border-base shadow-soft relative overflow-hidden"
      >
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F1F8] border border-[#D1E4EE] flex items-center justify-center mx-auto mb-3">
            <Activity className="w-7 h-7 text-[#2E6F95] stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">{t('registerAccount')}</h2>
          <p className="text-xs text-secondary mt-1">{t('startTranslating')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 rounded-xl input-field placeholder-secondary text-primary text-sm focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">{t('emailAddress')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl input-field placeholder-secondary text-primary text-sm focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">{t('password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-xl input-field placeholder-secondary text-primary text-sm focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl input-field text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-2 py-2 rounded-xl input-field text-primary text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Blood Group</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full px-2 py-2 rounded-xl input-field text-primary text-sm focus:outline-none focus:border-cyan-400"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl btn-primary font-bold text-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-secondary/20 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{t('createPatientProfile')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-secondary">
          {t('noAccount')}{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-secondary hover:underline">
            {t('login')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

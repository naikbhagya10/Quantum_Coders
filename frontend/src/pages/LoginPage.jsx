import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { loginUser } from '../services/api';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification('Please enter your email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      addNotification(`Welcome back, ${res.data.user.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
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
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F1F8] border border-[#D1E4EE] flex items-center justify-center mx-auto mb-3">
            <Activity className="w-7 h-7 text-[#2E6F95] stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">{t('patientPortalLogin')}</h2>
          <p className="text-xs text-secondary mt-1">{t('loginDescription')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">{t('emailAddress')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field placeholder-secondary text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">{t('password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field placeholder-secondary text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl btn-primary flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-secondary/20 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{t('signInDashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-secondary">
          {t('noAccount')}{' '}
          <Link to="/register" className="text-primary font-semibold hover:text-secondary hover:underline">
            {t('registerFree')}
          </Link>
        </div>

        <div className="mt-5 pt-3 border-t border-base flex items-center justify-center space-x-2 text-[11px] text-secondary">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit Encrypted Secure Health Session</span>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 w-full surface-card border-b border-base bg-white/95 backdrop-blur-sm shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F1F8] border border-[#D1E4EE] flex items-center justify-center text-[#2E6F95]">
            <Activity className="w-6 h-6" />
          </div>

          <div>
            <span className="text-lg font-semibold text-primary">MediGuide</span>
            <p className="text-[11px] text-secondary mt-0.5">Medical portal for reports and symptoms</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-4">

          <select
            value={language}
            onChange={handleLanguageChange}
            className="input-field rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-label={t('selectedLanguage')}
          >
            <option value="English">🇺🇸 English</option>
            <option value="Kannada">🇮🇳 ಕನ್ನಡ</option>
            <option value="Hindi">🇮🇳 हिन्दी</option>
          </select>

          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center space-x-3 bg-[#F0F5F8] border border-[#D1E4EE] px-3 py-1.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-[#C7E3F5] text-[#2E6F95] flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>

                <div className="text-xs text-left">
                  <p className="font-semibold text-primary">{user?.name || t('patientPortal')}</p>
                  <p className="text-[10px] text-accent font-mono">
                    Blood: {user?.blood_group || 'A+'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg btn-secondary"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs font-medium text-secondary hover:text-primary px-3 py-2 transition-colors"
              >
                {t('login')}
              </Link>

              <Link
                to="/register"
                className="text-xs font-semibold px-4 py-2 rounded-lg btn-primary"
              >
                {t('getStarted')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
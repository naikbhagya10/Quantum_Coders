import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Language State
  const [language, setLanguage] = useState("English");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);

    // Save language for future use
    localStorage.setItem("language", selectedLanguage);

    console.log("Selected Language:", selectedLanguage);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              Healthcare <span className="text-cyan-400 font-extrabold">AI</span>
            </span>

            <span className="hidden sm:block text-[10px] tracking-wider font-semibold uppercase text-emerald-400">
              Smart Medical Translator
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-4">

          {isAuthenticated ? (
            <>

              {/* User Card */}
              <div className="hidden md:flex items-center space-x-3 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full">

                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>

                <div className="text-xs text-left">
                  <p className="font-semibold text-slate-200">
                    {user?.name || 'Patient'}
                  </p>

                  <p className="text-[10px] text-emerald-400 font-mono">
                    Blood: {user?.blood_group || 'A+'}
                  </p>
                </div>

              </div>

              {/* Language Dropdown */}
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="English">🇺🇸 English</option>
                <option value="Kannada">🇮🇳 ಕನ್ನಡ</option>
                <option value="Hindi">🇮🇳 हिन्दी</option>
              </select>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

            </>
          ) : (

            <div className="flex items-center space-x-3">

              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-cyan-400 px-3 py-2 transition-colors"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
              >
                Get Started Free
              </Link>

            </div>

          )}

        </div>
      </div>
    </header>
  );
}
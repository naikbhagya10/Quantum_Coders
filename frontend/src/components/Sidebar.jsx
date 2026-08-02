import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  FileText,
  Stethoscope,
  Pill,
  Calendar,
  MapPin,
  History,
  User,
  Bell,
  Bot
} from 'lucide-react';

export default function Sidebar() {
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t('dashboardOverview'), icon: LayoutDashboard },
    { path: '/analyze-report', label: t('reportAnalyzer'), icon: FileText },
    { path: '/history', label: t('medicalHistory'), icon: History },
    { path: '/symptom-checker', label: t('symptomChecker'), icon: Stethoscope },
    { path: '/prescriptions', label: t('medicineBreakdown'), icon: Pill },
    { path: '/appointments', label: t('doctorAppointments'), icon: Calendar },
    { path: '/nearby', label: t('nearbyCare'), icon: MapPin },
    { path: '/notifications', label: t('notifications'), icon: Bell },
    { path: '/profile', label: t('patientProfile'), icon: User },
  ];

  const openHealthcareAssistant = () => {
    window.dispatchEvent(new CustomEvent('open-healthbot-panel'));
  };

  return (
    <aside className="w-64 surface-card border border-base hidden md:flex flex-col justify-between py-6 px-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 space-y-3">
          <p className="text-[11px] font-bold tracking-wider uppercase text-secondary">PATIENT PORTAL</p>
          <button
            type="button"
            onClick={openHealthcareAssistant}
            className="w-full p-3 rounded-xl bg-[#F4FAFF] border border-[#D1E4EE] flex items-center justify-center gap-2 text-primary hover:bg-[#EDF8FD] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#D8EEF7] text-[#2E6F95] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Healthcare Chatbot</span>
          </button>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#E6F1F8] text-primary border border-[#D1E4EE] shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-[#F4F8FB]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}

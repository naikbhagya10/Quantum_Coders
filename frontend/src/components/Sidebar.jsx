import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/analyze-report', label: 'Report AI Analyzer', icon: FileText },
    { path: '/symptom-checker', label: 'AI Symptom Checker', icon: Stethoscope },
    { path: '/prescriptions', label: 'Medicine Breakdown', icon: Pill },
    { path: '/appointments', label: 'Doctor Appointments', icon: Calendar },
    { path: '/nearby', label: 'Nearby Care Finder', icon: MapPin },
    { path: '/history', label: 'Medical History', icon: History },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/profile', label: 'Patient Profile', icon: User },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 bg-slate-950/60 hidden md:flex flex-col justify-between py-6 px-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">PATIENT PORTAL</p>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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

      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900/80 border border-cyan-500/20 text-center">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-200">HIPAA Compliant AI</h4>
        <p className="text-[10px] text-slate-400 mt-1">Encrypted report analysis & private medical history storage.</p>
      </div>
    </aside>
  );
}

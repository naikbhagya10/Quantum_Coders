import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Calendar, Pill, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Doctor Appointment Reminder',
      message: 'Consultation with Dr. Sarah Jenkins at City Care Hospital in 1 hour (10:30 AM).',
      time: '15 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'report',
      title: 'Medical Report AI Analysis Ready',
      message: 'Complete Blood Count (CBC) analysis completed. 2 abnormal values flagged for physician review.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'symptom',
      title: 'Symptom Triage Assessment Logged',
      message: 'Tension headache assessment classified as Moderate Risk. First-aid steps recommended.',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'prescription',
      title: 'Prescription Dosage Alert',
      message: 'Remember to take Telmisartan 40mg with breakfast in the morning.',
      time: '2 days ago',
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'report': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'symptom': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'prescription': return <Pill className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-cyan-400" />
            <span>Health Alerts & Reminder Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time notifications for upcoming doctor visits, abnormal lab report flags, and dosage reminders.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`glass-panel p-5 rounded-2xl border transition flex items-start space-x-4 ${
              !notif.read ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-500/5' : 'border-slate-800/80 opacity-80'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

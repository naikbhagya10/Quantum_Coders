import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMedicalHistory } from '../services/api';
import { 
  FileText, 
  Stethoscope, 
  Pill, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Activity,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await getMedicalHistory();
        setHistory(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const reports = history?.reports || [];
  const appointments = history?.appointments || [];
  const symptoms = history?.symptoms || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 border border-slate-800"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>MediClear AI Health Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, <span className="bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">{user?.name || 'Patient'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Your AI medical portal is monitoring lab reports, symptom checks, and prescriptions. All medical terms are simplified for your peace of mind.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/analyze-report"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span>Upload New Report</span>
            </Link>
            <Link
              to="/symptom-checker"
              className="px-5 py-3 rounded-xl glass-panel text-slate-200 hover:text-white font-semibold text-xs border border-slate-700/80 flex items-center space-x-2 transition hover:bg-slate-800/60"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>AI Symptom Checker</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reports Analyzed</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{reports.length}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> OCR Processed
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Abnormal Flags</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">
              {reports.reduce((acc, r) => acc + (r.analysis?.abnormal_values?.length || 0), 0) || 2}
            </h3>
            <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
              Attention Recommended
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Symptom Checks</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{symptoms.length}</h3>
            <span className="text-[10px] text-slate-400">Triage Evaluated</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Doctor Visits</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{appointments.length}</h3>
            <span className="text-[10px] text-cyan-400">Reminders Enabled</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Abnormal Alerts & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Recent Medical Reports</span>
            </h3>
            <Link to="/analyze-report" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
              <span>Upload New</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No medical reports uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Upload a blood test, urine panel, or radiology report to simplify medical terms and flag abnormal ranges.</p>
              <Link
                to="/analyze-report"
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold transition"
              >
                <span>Upload First Report or Try Sample</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => {
                const abnormals = rep.analysis?.abnormal_values || [];
                return (
                  <div key={rep.id} className="glass-panel p-4 rounded-2xl glass-panel-hover border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{rep.analysis?.report_title || rep.original_filename}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Uploaded on {new Date(rep.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {abnormals.length > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">
                          {abnormals.length} Abnormal Values
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                          Normal Ranges
                        </span>
                      )}
                      <Link
                        to="/analyze-report"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-medium transition"
                      >
                        View AI Insights
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Widgets: Upcoming Appointments & Quick Links */}
        <div className="space-y-6">
          {/* Upcoming Appointments Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Upcoming Appointments</span>
              </h3>
              <Link to="/appointments" className="text-xs text-cyan-400 hover:underline">
                Manage
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-6 border border-slate-800/80 rounded-xl bg-slate-900/40">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No scheduled appointments</p>
                <Link to="/appointments" className="text-xs text-cyan-400 font-semibold hover:underline mt-1 inline-block">
                  + Book Doctor Visit
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 2).map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{app.doctor_name}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-slate-400">{app.specialty} • {app.facility_name}</p>
                    <p className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {app.appointment_date} at {app.appointment_time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
            
            <Link
              to="/prescriptions"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 transition group"
            >
              <div className="flex items-center space-x-3">
                <Pill className="w-4 h-4 text-cyan-400" />
                <span>Analyze Prescription Dosages</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
            </Link>

            <Link
              to="/nearby"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 transition group"
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Find Nearby Hospitals & ER</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

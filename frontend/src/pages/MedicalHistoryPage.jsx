import React, { useState, useEffect } from 'react';
import { getMedicalHistory } from '../services/api';
import { History, FileText, Stethoscope, Pill, Calendar, TrendingUp, Printer } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function MedicalHistoryPage() {
  const [historyData, setHistoryData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await getMedicalHistory();
      setHistoryData(res.data);
    } catch (err) {
      console.error("Error fetching medical history:", err);
    } finally {
      setLoading(false);
    }
  };

  const biomarkerTrends = historyData?.biomarker_trends || [];

  return (
    <div className="space-y-8 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Complete Medical History & Biomarker Trends</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Centralized timeline of all past reports, AI symptom evaluations, prescriptions, and health parameter graphs.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Export History Summary</span>
        </button>
      </div>

      {/* Recharts Biomarker Trends */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Health Biomarkers Over Time</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Blood Glucose & Hemoglobin Tracking</span>
        </div>

        <div className="w-full h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={biomarkerTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="blood_sugar" name="Blood Glucose (mg/dL)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="hemoglobin" name="Hemoglobin (g/dL)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="systolic_bp" name="Systolic BP (mmHg)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 print:hidden">
        {['all', 'reports', 'symptoms', 'prescriptions', 'appointments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History Stream */}
      <div className="space-y-4">
        {historyData?.reports?.map((rep) => (
          (activeTab === 'all' || activeTab === 'reports') && (
            <div key={rep.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{rep.analysis?.report_title || rep.original_filename}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Uploaded {new Date(rep.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
                Medical Report
              </span>
            </div>
          )
        ))}

        {historyData?.symptoms?.map((sym) => (
          (activeTab === 'all' || activeTab === 'symptoms') && (
            <div key={sym.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Symptom Check: {sym.symptoms}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Triage Severity: {sym.analysis?.severity_level} Risk</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
                Symptom Check
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

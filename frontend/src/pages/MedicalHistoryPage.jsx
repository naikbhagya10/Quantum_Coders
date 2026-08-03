import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMedicalHistory, getUserReports } from '../services/api';
import { History, FileText, Stethoscope, Pill, Calendar, TrendingUp, Printer } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

const BASE_REPORT_STORAGE_KEY = 'mediclear_report_history';

const getScopedStorageKey = (baseKey) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('mediclear_session_user') || '{}');
    const userIdentifier = currentUser.email || currentUser.id || 'guest';
    return `${baseKey}_${userIdentifier}`;
  } catch (error) {
    return `${baseKey}_guest`;
  }
};

const readStoredReports = () => {
  try {
    const raw = localStorage.getItem(getScopedStorageKey(BASE_REPORT_STORAGE_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading stored reports:', error);
    return [];
  }
};

const mergeReports = (serverReports = [], localReports = []) => {
  const byId = new Map();

  [...localReports, ...serverReports].forEach((report) => {
    const key = report?.id || report?._id || report?.report_id;
    if (!key) return;
    byId.set(key, { ...(byId.get(key) || {}), ...report });
  });

  return [...byId.values()].sort((a, b) => {
    const aTime = new Date(a.uploaded_at || a.created_at || 0).getTime();
    const bTime = new Date(b.uploaded_at || b.created_at || 0).getTime();
    return bTime - aTime;
  });
};

const itemTimestamp = (item) => {
  const value = item?.uploaded_at || item?.created_at || item?.appointment_date || item?.date || '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export default function MedicalHistoryPage() {
  const [historyData, setHistoryData] = useState({
    reports: [],
    symptoms: [],
    prescriptions: [],
    appointments: [],
    biomarker_trends: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const storedReports = readStoredReports();

    try {
      const res = await getMedicalHistory();
      if (res.data && (res.data.reports || res.data.symptoms || res.data.prescriptions || res.data.appointments)) {
        const mergedReports = mergeReports(res.data.reports || [], storedReports);
        setHistoryData({
          reports: mergedReports,
          symptoms: res.data.symptoms || [],
          prescriptions: res.data.prescriptions || [],
          appointments: res.data.appointments || [],
          biomarker_trends: res.data.biomarker_trends || []
        });
        localStorage.setItem(getScopedStorageKey(BASE_REPORT_STORAGE_KEY), JSON.stringify(mergedReports));
      } else {
        const reportsRes = await getUserReports();
        const mergedReports = mergeReports(reportsRes.data.reports || [], storedReports);
        setHistoryData((prevData) => ({
          ...prevData,
          reports: mergedReports,
          symptoms: prevData.symptoms || [],
          prescriptions: prevData.prescriptions || [],
          appointments: prevData.appointments || []
        }));
        localStorage.setItem(getScopedStorageKey(BASE_REPORT_STORAGE_KEY), JSON.stringify(mergedReports));
      }
    } catch (err) {
      console.error("Error fetching medical history:", err);
      try {
        const reportsRes = await getUserReports();
        const mergedReports = mergeReports(reportsRes.data.reports || [], storedReports);
        setHistoryData((prevData) => ({
          ...prevData,
          reports: mergedReports,
          symptoms: prevData.symptoms || [],
          prescriptions: prevData.prescriptions || [],
          appointments: prevData.appointments || []
        }));
        localStorage.setItem(getScopedStorageKey(BASE_REPORT_STORAGE_KEY), JSON.stringify(mergedReports));
      } catch (reportsErr) {
        console.error("Error fetching reports fallback:", reportsErr);
        setHistoryData((prevData) => ({
          ...prevData,
          reports: storedReports,
          symptoms: prevData.symptoms || [],
          prescriptions: prevData.prescriptions || [],
          appointments: prevData.appointments || []
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const reportRiskCounts = historyData.reports?.reduce((counts, report) => {
    const level = report.analysis?.overall_risk_level || 'Moderate';
    counts[level] = (counts[level] || 0) + 1;
    return counts;
  }, {});

  const reportCategoryItems = Object.entries(reportRiskCounts);
  const biomarkerTrends = historyData?.biomarker_trends || [];
  const hasAnyHistory =
    (historyData?.reports?.length || 0) +
    (historyData?.symptoms?.length || 0) +
    (historyData?.prescriptions?.length || 0) +
    (historyData?.appointments?.length || 0) > 0;

  return (
    <div className="space-y-8 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
            <History className="w-7 h-7 text-cyan-500" />
            <span>Complete Medical History & Biomarker Trends</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Centralized timeline of all past reports, AI symptom evaluations, prescriptions, and health parameter graphs.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl btn-secondary text-secondary hover:text-primary border border-base text-xs font-semibold flex items-center space-x-2 transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Export History Summary</span>
        </button>
      </div>

      {/* Recharts Biomarker Trends */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface-card p-6 rounded-3xl border border-base bg-white">
          <h3 className="text-sm font-bold text-primary mb-2">Saved Medical Reports</h3>
          <p className="text-3xl font-bold text-primary">{historyData.reports?.length || 0}</p>
          <p className="text-xs text-secondary mt-2">Total reports saved from the Analyzer.</p>
        </div>
        {reportCategoryItems.length > 0 ? reportCategoryItems.map(([category, count]) => (
          <div key={category} className="surface-card p-6 rounded-3xl border border-base bg-white">
            <h3 className="text-sm font-bold text-primary mb-2">{category} Risk</h3>
            <p className="text-3xl font-bold text-primary">{count}</p>
            <p className="text-xs text-secondary mt-2">Reports in this risk group.</p>
          </div>
        )) : (
          <div className="surface-card p-6 rounded-3xl border border-base bg-white col-span-3 text-center text-sm text-secondary">
            No report categories available yet.
          </div>
        )}
      </div>

      {/* History Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="surface-card p-8 rounded-3xl border border-base text-center text-secondary bg-white">
            Loading history records...
          </div>
        ) : (
          <>
            {!hasAnyHistory && (
              <div className="surface-card p-8 rounded-3xl border border-base text-center bg-white">
                <p className="text-base font-semibold text-primary">No history entries found yet.</p>
                <p className="text-sm text-secondary mt-2">
                  Upload a medical report, symptom check, prescription, or appointment to populate your medical history.
                </p>
              </div>
            )}

            {historyData?.reports?.map((rep) => (
              (activeTab === 'all' || activeTab === 'reports') && (
                <div key={rep.id || rep._id} className="surface-card p-5 rounded-2xl border border-base flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">{rep.analysis?.report_title || rep.original_filename}</h4>
                      <p className="text-xs text-secondary mt-0.5">Uploaded {new Date(rep.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#F7FAFD] border border-base text-xs font-mono text-secondary">
                      Medical Report
                    </span>
                    <Link
                      to={`/analyze-report?reportId=${rep.id || rep._id}`}
                      className="px-3 py-2 rounded-xl btn-secondary text-xs font-semibold transition"
                    >
                      Open in Analyzer
                    </Link>
                  </div>
                </div>
              )
            ))}

            {historyData?.symptoms?.map((sym) => (
              (activeTab === 'all' || activeTab === 'symptoms') && (
                <div key={sym.id || sym._id} className="surface-card p-5 rounded-2xl border border-base flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">Symptom Check: {sym.symptoms}</h4>
                      <p className="text-xs text-secondary mt-0.5">
                        {sym.analysis?.severity_level || sym.user_severity || 'Moderate'} risk • {sym.duration || 'Recent'} duration
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F7FAFD] border border-base text-xs font-mono text-emerald-700">
                    Symptom Check
                  </span>
                </div>
              )
            ))}

            {historyData?.prescriptions?.map((prescription) => (
              (activeTab === 'all' || activeTab === 'prescriptions') && (
                <div key={prescription.id || prescription._id} className="surface-card p-5 rounded-2xl border border-base flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">{prescription.filename || 'Prescription Review'}</h4>
                      <p className="text-xs text-secondary mt-0.5">
                        {prescription.prescription_text ? `${prescription.prescription_text.slice(0, 90)}${prescription.prescription_text.length > 90 ? '...' : ''}` : 'Medication analysis recorded'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F7FAFD] border border-base text-xs font-mono text-violet-700">
                    Prescription
                  </span>
                </div>
              )
            ))}

            {historyData?.appointments?.map((appointment) => (
              (activeTab === 'all' || activeTab === 'appointments') && (
                <div key={appointment.id || appointment._id} className="surface-card p-5 rounded-2xl border border-base flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">{appointment.doctor_name}</h4>
                      <p className="text-xs text-secondary mt-0.5">
                        {appointment.appointment_date} at {appointment.appointment_time} • {appointment.facility_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#F7FAFD] border border-base text-xs font-mono text-amber-700">
                      {appointment.status || 'Upcoming'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#F7FAFD] border border-base text-xs font-mono text-secondary">
                      Appointment
                    </span>
                  </div>
                </div>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
}

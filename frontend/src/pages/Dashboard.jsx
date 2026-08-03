import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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

const BASE_DASHBOARD_HISTORY_KEY = 'mediclear_dashboard_history';
const BASE_REPORT_HISTORY_KEY = 'mediclear_report_history';

const getScopedStorageKey = (baseKey) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('mediclear_session_user') || '{}');
    const userIdentifier = currentUser.email || currentUser.id || 'guest';
    return `${baseKey}_${userIdentifier}`;
  } catch (error) {
    return `${baseKey}_guest`;
  }
};

const readStoredDashboardHistory = () => {
  try {
    const dashboardKey = getScopedStorageKey(BASE_DASHBOARD_HISTORY_KEY);
    const raw = localStorage.getItem(dashboardKey);
    const stored = raw ? JSON.parse(raw) : null;

    if (stored) {
      return stored;
    }

    const reportKey = getScopedStorageKey(BASE_REPORT_HISTORY_KEY);
    const reportRaw = localStorage.getItem(reportKey);
    const storedReports = reportRaw ? JSON.parse(reportRaw) : [];

    return {
      reports: storedReports,
      symptoms: [],
      prescriptions: [],
      appointments: [],
      biomarker_trends: []
    };
  } catch (error) {
    console.error('Error reading stored dashboard history:', error);
    return {
      reports: [],
      symptoms: [],
      prescriptions: [],
      appointments: [],
      biomarker_trends: []
    };
  }
};

const mergeDashboardHistory = (serverHistory = {}, storedHistory = {}) => {
  const safeServerReports = Array.isArray(serverHistory.reports) && serverHistory.reports.length > 0
    ? serverHistory.reports
    : (storedHistory.reports || []);

  const safeServerSymptoms = Array.isArray(serverHistory.symptoms) && serverHistory.symptoms.length > 0
    ? serverHistory.symptoms
    : (storedHistory.symptoms || []);

  const safeServerPrescriptions = Array.isArray(serverHistory.prescriptions) && serverHistory.prescriptions.length > 0
    ? serverHistory.prescriptions
    : (storedHistory.prescriptions || []);

  const safeServerAppointments = Array.isArray(serverHistory.appointments) && serverHistory.appointments.length > 0
    ? serverHistory.appointments
    : (storedHistory.appointments || []);

  const safeServerBiomarkerTrends = Array.isArray(serverHistory.biomarker_trends) && serverHistory.biomarker_trends.length > 0
    ? serverHistory.biomarker_trends
    : (storedHistory.biomarker_trends || []);

  return {
    reports: safeServerReports,
    symptoms: safeServerSymptoms,
    prescriptions: safeServerPrescriptions,
    appointments: safeServerAppointments,
    biomarker_trends: safeServerBiomarkerTrends
  };
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const storedHistory = readStoredDashboardHistory();

      try {
        const res = await getMedicalHistory();
        const mergedHistory = mergeDashboardHistory(res.data || {}, storedHistory);
        localStorage.setItem(getScopedStorageKey(BASE_DASHBOARD_HISTORY_KEY), JSON.stringify(mergedHistory));
        setHistory(mergedHistory);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setHistory(storedHistory);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    const handleHistoryUpdated = () => {
      loadDashboardData();
    };

    window.addEventListener('mediclear_history_updated', handleHistoryUpdated);
    window.addEventListener('storage', handleHistoryUpdated);

    return () => {
      window.removeEventListener('mediclear_history_updated', handleHistoryUpdated);
      window.removeEventListener('storage', handleHistoryUpdated);
    };
  }, []);

  const reports = history?.reports || [];
  const appointments = history?.appointments || [];
  const symptoms = history?.symptoms || [];
  const latestReport = reports[0] || null;

  const reportRiskCounts = reports.reduce((counts, report) => {
    const level = report.analysis?.overall_risk_level || 'Moderate';
    counts[level] = (counts[level] || 0) + 1;
    return counts;
  }, {});

  const reportCategoryItems = Object.entries(reportRiskCounts);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-6 sm:p-8 rounded-3xl border border-base"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary leading-tight">
              Hello, <span className="text-primary">{user?.name || 'patient'}</span> 👋
            </h1>
            <p className="text-sm sm:text-base text-secondary mt-3 max-w-2xl">
              Your AI medical portal is monitoring lab reports, symptom checks, and prescriptions. All medical terms are simplified for your peace of mind.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/analyze-report"
              className="px-5 py-3 rounded-xl btn-primary font-bold text-xs flex items-center space-x-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Upload New Report</span>
            </Link>
            <Link
              to="/symptom-checker"
              className="px-5 py-3 rounded-xl btn-secondary font-semibold text-xs flex items-center space-x-2 transition"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>AI Symptom Checker</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="surface-card p-5 rounded-2xl border border-base flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6F1F8] border border-[#D1E4EE] text-[#2E6F95] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('reportsAnalyzed')}</p>
            <h3 className="text-2xl font-bold text-primary mt-0.5">{reports.length}</h3>
            <span className="text-[10px] text-accent flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> {t('ocrProcessed')}
            </span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-base flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEEAEA] border border-[#F5C2C2] text-[#B63A3A] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('abnormalFlags')}</p>
            <h3 className="text-2xl font-bold text-primary mt-0.5">
              {reports.reduce((acc, r) => acc + (r.analysis?.abnormal_values?.length || 0), 0) || 2}
            </h3>
            <span className="text-[10px] text-[#B63A3A] flex items-center gap-1 mt-0.5">
              {t('attentionRecommended')}
            </span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-base flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#E7F6EE] border border-[#D8E9DD] text-[#237A4D] flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('symptomChecks')}</p>
            <h3 className="text-2xl font-bold text-primary mt-0.5">{symptoms.length}</h3>
            <span className="text-[10px] text-secondary">{t('triageEvaluated')}</span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-base flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] border border-[#D7E6F4] text-[#2E6F95] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('doctorVisits')}</p>
            <h3 className="text-2xl font-bold text-primary mt-0.5">{appointments.length}</h3>
            <span className="text-[10px] text-accent">{t('remindersEnabled')}</span>
          </div>
        </div>
      </div>

      {/* Report Category Breakdown */}
      <div className="surface-card p-6 rounded-3xl border border-base bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-primary">Report Category Breakdown</h3>
            <p className="text-xs text-secondary mt-1">See how many saved reports fall into each AI risk category.</p>
          </div>
          <span className="text-xs text-secondary">{reports.length} total reports</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reportCategoryItems.length > 0 ? (
            reportCategoryItems.map(([category, count]) => (
              <div key={category} className="rounded-3xl border border-base p-4 bg-[#F7FAFD]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-secondary">{category}</p>
                <h4 className="text-3xl font-bold text-primary mt-2">{count}</h4>
                <p className="text-xs text-secondary mt-1">reports</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-base p-6 text-center text-sm text-secondary">
              No report categories available yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Abnormal Alerts & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports List */}
        <div className="lg:col-span-2 surface-card p-6 rounded-3xl border border-base space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              <span>{t('recentMedicalReports')}</span>
            </h3>
            <Link to="/analyze-report" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
              <span>{t('uploadNew')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="surface-card p-10 rounded-2xl border border-dashed border-base bg-white/90">
              <FileText className="w-10 h-10 text-secondary mx-auto mb-3" />
              <p className="text-sm font-semibold text-primary">{t('noReports')}</p>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">{t('uploadReportDescription')}</p>
              <Link
                to="/analyze-report"
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold transition"
              >
                <span>{t('uploadFirstReport')}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => {
                const abnormals = rep.analysis?.abnormal_values || [];
                return (
                  <div key={rep.id} className="surface-card p-4 rounded-2xl border border-base flex items-center justify-between gap-4 hover:shadow-soft transition">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F1F8] text-[#2E6F95] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary">{rep.analysis?.report_title || rep.original_filename}</h4>
                        <p className="text-xs text-secondary mt-0.5">
                          Uploaded on {new Date(rep.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {abnormals.length > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#FEEAEA] text-[#B63A3A] border border-[#F5C2C2] text-[11px] font-semibold">
                          {abnormals.length} {t('abnormalFlags')}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#E7F6EE] text-[#237A4D] border border-[#D8E9DD] text-[11px] font-semibold">
                          {t('normalRanges')}
                        </span>
                      )}
                      <Link
                        to="/analyze-report"
                        className="px-3 py-1.5 rounded-lg btn-secondary text-xs font-medium transition"
                      >
                        {t('viewAIInsights')}
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
          <div className="surface-card p-6 rounded-3xl border border-base space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>{t('upcomingAppointments')}</span>
              </h3>
              <Link to="/appointments" className="text-xs text-secondary hover:text-primary transition">
                {t('manage')}
              </Link>
            </div>
            {appointments.length === 0 ? (
              <div className="surface-card p-6 text-center rounded-2xl border border-base bg-white/90">
                <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-xs text-secondary">{t('noAppointments')}</p>
                <Link to="/appointments" className="text-xs text-primary font-semibold hover:underline mt-1 inline-block">
                  {t('scheduleFirstAppointment')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 2).map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-[#F7FAFD] border border-base text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{app.doctor_name}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 font-mono text-[10px]">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-secondary">{app.specialty} • {app.facility_name}</p>
                    <p className="text-primary font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" /> {app.appointment_date} at {app.appointment_time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Uploaded Report */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">Latest Uploaded Report</h3>
              <span className="text-[11px] text-secondary uppercase tracking-wider">{reports.length} total</span>
            </div>
            {latestReport ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F7FAFD] border border-base">
                  <h4 className="text-sm font-semibold text-primary">{latestReport.analysis?.report_title || latestReport.original_filename}</h4>
                  <p className="text-[11px] text-secondary mt-1">Uploaded {new Date(latestReport.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-secondary">
                  <div className="rounded-xl bg-white border border-base p-3">
                    <p className="font-semibold text-primary">Abnormal</p>
                    <p>{latestReport.analysis?.abnormal_values?.length || 0}</p>
                  </div>
                  <div className="rounded-xl bg-white border border-base p-3">
                    <p className="font-semibold text-primary">View</p>
                    <p>{latestReport.analysis ? 'AI Insight' : 'Pending'}</p>
                  </div>
                </div>
                <Link
                  to="/analyze-report"
                  className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl btn-secondary text-xs font-semibold transition"
                >
                  View Report Details
                </Link>
              </div>
            ) : (
              <div className="text-xs text-secondary">
                No uploaded reports yet. Use the report analyzer to store your first medical report.
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">{t('quickActions')}</h3>
            
            <Link
              to="/prescriptions"
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-base text-xs text-secondary hover:text-primary transition group"
            >
              <div className="flex items-center space-x-3">
                <Pill className="w-4 h-4 text-cyan-400" />
                <span>{t('analyzePrescription')}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-secondary group-hover:text-cyan-400 transition" />
            </Link>

            <Link
              to="/nearby"
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-base text-xs text-secondary hover:text-primary transition group"
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>{t('findNearbyHospitals')}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-secondary group-hover:text-emerald-400 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

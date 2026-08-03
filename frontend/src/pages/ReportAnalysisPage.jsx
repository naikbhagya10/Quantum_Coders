import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { uploadReport, analyzeSampleReport, getUserReports, getReportById } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Printer, 
  ShieldAlert, 
  ArrowRight,
  Info,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_REPORT_STORAGE_KEY = 'mediclear_report_history';
const BASE_DASHBOARD_HISTORY_KEY = 'mediclear_dashboard_history';

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

const writeStoredReports = (reports) => {
  const reportKey = getScopedStorageKey(BASE_REPORT_STORAGE_KEY);
  const dashboardKey = getScopedStorageKey(BASE_DASHBOARD_HISTORY_KEY);

  localStorage.setItem(reportKey, JSON.stringify(reports));

  try {
    const rawDashboardHistory = localStorage.getItem(dashboardKey);
    const storedDashboardHistory = rawDashboardHistory ? JSON.parse(rawDashboardHistory) : {
      reports: [],
      symptoms: [],
      prescriptions: [],
      appointments: [],
      biomarker_trends: []
    };

    const dashboardHistory = {
      ...storedDashboardHistory,
      reports
    };

    localStorage.setItem(dashboardKey, JSON.stringify(dashboardHistory));
  } catch (error) {
    console.error('Error syncing dashboard report storage:', error);
  }

  window.dispatchEvent(new CustomEvent('mediclear_history_updated'));
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

const looksLikeNonMedicalFilename = (fileName = '') => {
  const loweredName = fileName.toLowerCase();
  return /(resume|cv|curriculum|cover letter|portfolio|candidate|job application)/i.test(loweredName);
};

export default function ReportAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotification();
  const { t } = useLanguage();

  const selectedReportParam = searchParams.get('reportId');

  useEffect(() => {
    loadPastReports();
  }, []);

  useEffect(() => {
    if (selectedReportParam) {
      loadReportById(selectedReportParam);
    }
  }, [selectedReportParam]);

  const loadReportById = async (reportId) => {
    try {
      const res = await getReportById(reportId);
      const report = res.data.report;
      setSelectedReportId(reportId);
      setAnalysisResult(report.analysis);
    } catch (err) {
      console.error('Error loading report details:', err);
    }
  };

  const loadPastReports = async () => {
    try {
      const res = await getUserReports();
      const serverReports = res.data.reports || [];
      const reports = mergeReports(serverReports, readStoredReports());
      setPastReports(reports);
      writeStoredReports(reports);

      if (selectedReportParam) {
        loadReportById(selectedReportParam);
      } else if (reports.length > 0 && !analysisResult) {
        setSelectedReportId(reports[0].id || reports[0]._id);
        setAnalysisResult(reports[0].analysis);
      }
    } catch (err) {
      console.error("Error loading past reports:", err);
      const localReports = readStoredReports();
      setPastReports(localReports);
      if (selectedReportParam) {
        loadReportById(selectedReportParam);
      } else if (localReports.length > 0 && !analysisResult) {
        setSelectedReportId(localReports[0].id || localReports[0]._id);
        setAnalysisResult(localReports[0].analysis);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const nextFile = e.target.files[0];
      if (looksLikeNonMedicalFilename(nextFile.name)) {
        addNotification('Please upload a medical report, lab report, or clinical document instead of a resume/CV.', 'warning');
      }
      setSelectedFile(nextFile);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addNotification('Please select a PDF or image file first.', 'warning');
      return;
    }

    if (looksLikeNonMedicalFilename(selectedFile.name)) {
      addNotification('Only medical report files can be analyzed here. Please upload a clinical report instead of a resume.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const res = await uploadReport(formData);
      const reportId = res.data.report_id || res.data.id;
      const reportItem = {
        id: reportId,
        _id: reportId,
        report_id: reportId,
        original_filename: selectedFile?.name || 'Medical_Report.pdf',
        uploaded_at: new Date().toISOString(),
        analysis: res.data.analysis,
      };
      const storedReports = mergeReports([reportItem], readStoredReports());
      writeStoredReports(storedReports);
      setPastReports(storedReports);
      setSelectedReportId(reportId);
      setAnalysisResult(res.data.analysis);
      addNotification('Medical report processed & simplified successfully!', 'success');
      await loadPastReports();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error analyzing report. Please try again.';
      addNotification(msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSample = async () => {
    setLoading(true);
    try {
      const res = await analyzeSampleReport();
      const reportId = res.data.report_id || res.data.id;
      const reportItem = {
        id: reportId,
        _id: reportId,
        report_id: reportId,
        original_filename: 'Sample_Blood_Panel_Report.pdf',
        uploaded_at: new Date().toISOString(),
        analysis: res.data.analysis,
      };
      const storedReports = mergeReports([reportItem], readStoredReports());
      writeStoredReports(storedReports);
      setPastReports(storedReports);
      setSelectedReportId(reportId);
      setAnalysisResult(res.data.analysis);
      addNotification('Sample blood test report loaded & simplified!', 'success');
      await loadPastReports();
    } catch (err) {
      addNotification('Error loading sample report.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-secondary" />
            <span>{t('aiMedicalReportAnalyzer')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            {t('reportAnalyzerDescription')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunSample}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl btn-secondary text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>{t('trySampleReport')}</span>
          </button>
          {analysisResult && (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl btn-secondary text-xs font-semibold flex items-center space-x-2 transition print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Print Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="surface-card p-6 rounded-3xl border border-base print:hidden bg-white">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-base hover:border-secondary rounded-2xl p-6 sm:p-8 text-center transition bg-[#F7FAFD] relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#E6F1F8] border border-[#D1E4EE] text-secondary flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">{selectedFile.name}</p>
                <p className="text-xs text-secondary font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {t('selectFileWarning')}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">
                  {t('uploadReportPrompt')}
                </p>
                <p className="text-xs text-secondary">{t('uploadReportSupport')}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-6 py-3 rounded-xl btn-primary text-xs font-bold flex items-center space-x-2 transition disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-secondary/20 border-t-transparent rounded-full animate-spin"></div>
                  <span>Extracting OCR & Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <span>{t('analyzeReport')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Analysis Display */}
      {loading ? (
        <div className="surface-card p-12 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#B8DAED] border-t-secondary rounded-full animate-spin mx-auto"></div>
          <h3 className="text-lg font-bold text-primary">Running Tesseract OCR & Medical Analysis</h3>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            Extracting lab parameters, checking reference ranges, and generating clear recommendations...
          </p>
        </div>
      ) : analysisResult ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overview & Risk Status Banner */}
          <div className="surface-card p-6 sm:p-8 rounded-3xl border border-base space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base pb-4">
              <div>
                <span className="text-[11px] font-mono text-secondary uppercase tracking-wider">AI SUMMARY OVERVIEW</span>
                <h2 className="text-xl font-bold text-primary mt-1">{analysisResult.report_title}</h2>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-secondary">{t('riskAssessment')}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  analysisResult.overall_risk_level === 'High'
                    ? 'bg-[#FEEAEA] text-[#B63A3A] border border-[#F5C2C2]'
                    : analysisResult.overall_risk_level === 'Moderate'
                    ? 'bg-[#FEF3C7] text-[#B07B00] border border-[#FDE68A]'
                    : 'bg-[#E7F6EE] text-[#237A4D] border border-[#D8E9DD]'
                }`}>
                  {analysisResult.overall_risk_level || 'Moderate'} Risk
                </span>
              </div>
            </div>

            <p className="text-sm text-secondary leading-relaxed font-normal">
              {analysisResult.patient_summary}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-[#F7FAFD] border border-base text-secondary">
                <span className="text-secondary">{t('recommendedSpecialist')}</span>{' '}
                <span className="font-semibold text-primary">{analysisResult.specialist_to_consult || 'General Physician'}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#F7FAFD] border border-base text-secondary">
                <span className="text-secondary">{t('abnormalMarkers')}</span>{' '}
                <span className="font-semibold text-[#B63A3A]">{analysisResult.abnormal_values?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Highlighted Abnormal Values */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#B63A3A]" />
              <span>{t('outOfRangeValues')}</span>
            </h3>

            {analysisResult.abnormal_values?.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>All parameters in this report fall within normal standard reference ranges!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {analysisResult.abnormal_values.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7FAFD] border border-base space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-sm text-primary">{item.parameter}</span>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="font-mono text-secondary">
                          Result: <strong className="text-primary">{item.value}</strong> (Ref: {item.reference_range})
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'High' ? 'bg-rose-500/20 text-rose-600 border border-rose-200' : 'bg-amber-500/20 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed bg-white/80 p-3 rounded-xl border border-base">
                      <strong className="text-cyan-500">What this means:</strong> {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medical Terms Explained in Simple Language */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-4 bg-white">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-500" />
              <span>Medical Terms Simplified</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.medical_terms_explained?.map((term, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F7FAFD] border border-base space-y-1">
                  <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-wider">{term.term}</h4>
                  <p className="text-xs text-secondary leading-relaxed">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Advice & Action Steps */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-3 bg-white">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Actionable Health Recommendations</span>
            </h3>
            <ul className="space-y-2">
              {analysisResult.actionable_recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-secondary">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>{analysisResult.disclaimer}</p>
          </div>
        </motion.div>
      ) : (
        <div className="surface-card p-10 rounded-3xl text-center text-secondary text-xs bg-white border border-base">
          Select a medical report PDF/Image above or click "Try Sample Report" to view simplified insights.
        </div>
      )}
    </div>
  );
}

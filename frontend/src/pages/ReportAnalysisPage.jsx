import React, { useState, useEffect } from 'react';
import { uploadReport, analyzeSampleReport, getUserReports } from '../services/api';
import { useNotification } from '../context/NotificationContext';
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

export default function ReportAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadPastReports();
  }, []);

  const loadPastReports = async () => {
    try {
      const res = await getUserReports();
      setPastReports(res.data.reports || []);
      if (res.data.reports?.length > 0 && !analysisResult) {
        setAnalysisResult(res.data.reports[0].analysis);
      }
    } catch (err) {
      console.error("Error loading past reports:", err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addNotification('Please select a PDF or image file first.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const res = await uploadReport(formData);
      setAnalysisResult(res.data.analysis);
      addNotification('Medical report processed & simplified successfully!', 'success');
      loadPastReports();
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
      setAnalysisResult(res.data.analysis);
      addNotification('Sample blood test report loaded & simplified!', 'success');
      loadPastReports();
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-cyan-400" />
            <span>AI Medical Report Analyzer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Translates complex lab terms, highlights abnormal values, and explains health insights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunSample}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center space-x-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try Sample Report</span>
          </button>
          {analysisResult && (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Print Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 print:hidden">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-2xl p-6 sm:p-8 text-center transition bg-slate-900/40 relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-400">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drag and drop your Medical Report (PDF, PNG, JPG) or click to browse
                </p>
                <p className="text-xs text-slate-500">Supports Complete Blood Count (CBC), Metabolic Panel, Lipid Panel, Thyroid reports</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Extracting OCR & Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <span>Analyze Uploaded Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Analysis Display */}
      {loading ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <h3 className="text-lg font-bold text-white">Running Tesseract OCR & Gemini AI</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extracting lab parameters, checking reference ranges, and generating layman explanations...
          </p>
        </div>
      ) : analysisResult ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overview & Risk Status Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">AI SUMMARY OVERVIEW</span>
                <h2 className="text-xl font-bold text-white mt-1">{analysisResult.report_title}</h2>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">Risk Assessment:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  analysisResult.overall_risk_level === 'High'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 glow-rose'
                    : analysisResult.overall_risk_level === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald'
                }`}>
                  {analysisResult.overall_risk_level || 'Moderate'} Risk
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {analysisResult.patient_summary}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Recommended Specialist:</span>{' '}
                <span className="font-semibold text-cyan-400">{analysisResult.specialist_to_consult || 'General Physician'}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-slate-500">Abnormal Markers Flagged:</span>{' '}
                <span className="font-semibold text-rose-400">{analysisResult.abnormal_values?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Highlighted Abnormal Values */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Out-of-Range & Abnormal Values</span>
            </h3>

            {analysisResult.abnormal_values?.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All parameters in this report fall within normal standard reference ranges!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {analysisResult.abnormal_values.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-sm text-white">{item.parameter}</span>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="font-mono text-slate-300">
                          Result: <strong className="text-white">{item.value}</strong> (Ref: {item.reference_range})
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                      <strong className="text-cyan-400">What this means:</strong> {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medical Terms Explained in Simple Language */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Medical Terms Simplified</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.medical_terms_explained?.map((term, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{term.term}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Advice & Action Steps */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Actionable Health Recommendations</span>
            </h3>
            <ul className="space-y-2">
              {analysisResult.actionable_recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
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
        <div className="glass-panel p-10 rounded-3xl text-center text-slate-400 text-xs">
          Select a medical report PDF/Image above or click "Try Sample Report" to view simplified insights.
        </div>
      )}
    </div>
  );
}

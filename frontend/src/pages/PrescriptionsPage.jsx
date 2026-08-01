import React, { useState, useEffect } from 'react';
import { analyzePrescription, getPrescriptions } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Pill, UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, Clock, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrescriptionsPage() {
  const [prescriptionText, setPrescriptionText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [pastRx, setPastRx] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const res = await getPrescriptions();
      setPastRx(res.data.prescriptions || []);
      if (res.data.prescriptions?.length > 0 && !analysisResult) {
        setAnalysisResult(res.data.prescriptions[0].analysis);
      }
    } catch (err) {
      console.error("Error loading prescriptions:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await analyzePrescription(formData);
      } else {
        res = await analyzePrescription({ prescription_text: prescriptionText });
      }

      setAnalysisResult(res.data.analysis);
      addNotification('Prescription analyzed & breakdown generated!', 'success');
      loadPrescriptions();
    } catch (err) {
      addNotification('Error analyzing prescription.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const setSampleRx = () => {
    setPrescriptionText("Metformin 500mg twice daily after meals, Telmisartan 40mg once daily in morning, Vitamin D3 60,000 IU weekly after breakfast.");
    setFile(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Pill className="w-7 h-7 text-cyan-400" />
          <span>Prescription & Medicine Analyzer</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Deconstructs prescriptions into dosage instructions, timing (before/after food), uses, side effects, and drug precautions.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Enter Prescription Text or Doctor's Dosage Notes
            </label>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="e.g. Metformin 500mg twice daily after meals, Telmisartan 40mg once daily..."
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={setSampleRx}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              + Use Sample Prescription Note
            </button>

            <button
              type="submit"
              disabled={loading || (!prescriptionText && !file)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Parsing Pharmacology...</span>
                </>
              ) : (
                <>
                  <span>Analyze Medicine Details</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-400" />
              <span>Prescribed Medications Breakdown</span>
            </h3>

            <div className="space-y-4">
              {analysisResult.medicines?.map((med, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{med.name}</h4>
                      <p className="text-xs text-cyan-400 mt-0.5 font-medium">{med.purpose}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-mono">
                        Dosage: {med.dosage}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {med.timing}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Frequency & Schedule:</span>
                      <span className="text-slate-200">{med.frequency}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Safety Precautions:</span>
                      <span className="text-amber-300">{med.precautions}</span>
                    </div>
                  </div>

                  {med.common_side_effects?.length > 0 && (
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500 font-semibold">Possible Side Effects:</span>{' '}
                      {med.common_side_effects.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

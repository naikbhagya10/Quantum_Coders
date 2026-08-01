import React, { useState } from 'react';
import { checkSymptoms } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { 
  Stethoscope, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles, 
  ArrowRight,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SymptomCheckerPage() {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [duration, setDuration] = useState('2-3 days');
  const [severity, setSeverity] = useState('Moderate');
  const [age, setAge] = useState(32);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addNotification } = useNotification();

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsInput.trim()) {
      addNotification('Please enter your symptoms to run analysis.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await checkSymptoms({
        symptoms: symptomsInput,
        duration,
        severity,
        age
      });
      setResult(res.data.result);
      addNotification('Symptom triage & assessment completed.', 'success');
    } catch (err) {
      addNotification('Error processing symptom assessment.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (symptomStr, sev) => {
    setSymptomsInput(symptomStr);
    setSeverity(sev);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Stethoscope className="w-7 h-7 text-emerald-400" />
          <span>AI Symptom Checker & Emergency Triage</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Evaluates symptoms, determines severity level, recommends specialists, and provides immediate first-aid steps.
        </p>
      </div>

      {/* Input Form & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <form onSubmit={handleSymptomSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Describe Your Symptoms (e.g. Chest pain, mild fever, headache, nausea)
              </label>
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Type your symptoms here in detail..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 transition resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="Less than 24 hours">Less than 24 hours</option>
                  <option value="2-3 days">2-3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="More than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perceived Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="Low">Low (Mild discomfort)</option>
                  <option value="Moderate">Moderate (Distracting)</option>
                  <option value="High">High (Severe / Intolerable)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Patient Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !symptomsInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Evaluating Symptoms...</span>
                  </>
                ) : (
                  <>
                    <span>Run AI Symptom Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Preset Buttons */}
          <div className="border-t border-slate-800/80 pt-4">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Quick Sample Scenarios:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setPreset('Chest tightness, shortness of breath, left arm discomfort', 'High')}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition"
              >
                🚨 Chest Pain & Breathlessness (High)
              </button>
              <button
                onClick={() => setPreset('Throbbing migraine headache with light sensitivity', 'Moderate')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition"
              >
                💆 Severe Migraine (Moderate)
              </button>
              <button
                onClick={() => setPreset('Sore throat, low grade fever, runny nose', 'Low')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition"
              >
                🤧 Cold & Fever (Low)
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Emergency Red Flags</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you or someone around you experiences severe chest pain, sudden paralysis or numbness, severe difficulty breathing, or loss of consciousness, skip online checkers and call emergency services (911 / 108 / 112) immediately.
          </p>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs font-semibold">
            <PhoneCall className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Emergency Services: Dial 911 / 108 / 112</span>
          </div>
        </div>
      </div>

      {/* AI Symptom Assessment Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Emergency Alert Banner if Serious */}
          {result.emergency_alert && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500 shadow-2xl shadow-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">HIGH SEVERITY ALERT - EMERGENCY CARE ADVISED</h3>
                  <p className="text-xs text-rose-200 mt-0.5">Symptoms indicate potential acute cardio-respiratory strain. Seek urgent medical care.</p>
                </div>
              </div>
              <a
                href="tel:911"
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-lg uppercase tracking-wider shrink-0"
              >
                Call Emergency Now
              </a>
            </div>
          )}

          {/* Severity & Recommended Specialist Header */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">TRIAGE SEVERITY</span>
              <h4 className={`text-xl font-bold mt-1 ${
                result.severity_level === 'High' ? 'text-rose-400' : result.severity_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {result.severity_level} Risk
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">RECOMMENDED SPECIALIST</span>
              <h4 className="text-base font-bold text-cyan-400 mt-1">{result.recommended_specialist}</h4>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">PRIMARY SYMPTOMS EVALUATED</span>
              <h4 className="text-xs font-semibold text-slate-200 mt-1">{result.primary_symptoms?.join(', ')}</h4>
            </div>
          </div>

          {/* Possible Conditions Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Possible Health Conditions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.possible_conditions?.map((cond, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{cond.condition}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {cond.match_probability} Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cond.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate First-Aid Guidance */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Step-by-Step First-Aid Guidance</span>
            </h3>
            <div className="space-y-2">
              {result.first_aid_guidance?.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

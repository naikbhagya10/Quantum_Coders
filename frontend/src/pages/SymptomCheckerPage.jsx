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

const syncDashboardSymptomHistory = (symptomPayload) => {
  try {
    const key = getScopedStorageKey(BASE_DASHBOARD_HISTORY_KEY);
    const raw = localStorage.getItem(key);
    const storedHistory = raw ? JSON.parse(raw) : {
      reports: [],
      symptoms: [],
      prescriptions: [],
      appointments: [],
      biomarker_trends: []
    };

    const dashboardHistory = {
      ...storedHistory,
      symptoms: [
        {
          id: `symptom-${Date.now()}`,
          symptoms: symptomPayload.symptoms,
          severity_level: symptomPayload.severity,
          duration: symptomPayload.duration,
          created_at: new Date().toISOString(),
          user_age: symptomPayload.age,
          ...symptomPayload.result
        },
        ...(storedHistory.symptoms || [])
      ]
    };

    localStorage.setItem(key, JSON.stringify(dashboardHistory));
  } catch (error) {
    console.error('Error syncing symptom dashboard history:', error);
  }
};

export default function SymptomCheckerPage() {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [duration, setDuration] = useState('2-3 days');
  const [severity, setSeverity] = useState('Moderate');
  const [age, setAge] = useState(32);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addNotification } = useNotification();
  const isUnclearSymptomDescription = result?.unclear_input === true;

  const medicalKeywordPattern = /\b(pain|fever|cough|dizzy|dizziness|nausea|headache|ache|burning|weakness|fatigue|vomit|vomiting|shortness|breath|chest|stomach|throat|cold|flu|rash|swelling|sore|cramp|pressure|tingling|numbness|migraine|infection)\b/i;
  const looksLikeMedicalInput = (text) => medicalKeywordPattern.test(text);

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsInput.trim()) {
      addNotification('Please enter your symptoms to run analysis.', 'warning');
      return;
    }

    if (!looksLikeMedicalInput(symptomsInput)) {
      addNotification('Please enter a valid medical symptom description.', 'warning');
      setResult({ unclear_input: true });
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
      syncDashboardSymptomHistory({
        symptoms: symptomsInput,
        duration,
        severity,
        age,
        result: res.data.result
      });
      window.dispatchEvent(new CustomEvent('mediclear_history_updated'));
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
          <Stethoscope className="w-7 h-7 text-emerald-500" />
          <span>AI Symptom Checker & Emergency Triage</span>
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Evaluates symptoms, determines severity level, recommends specialists, and provides immediate first-aid steps.
        </p>
      </div>

      {/* Input Form & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 surface-card p-6 sm:p-8 rounded-3xl border border-base space-y-6">
          <form onSubmit={handleSymptomSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-2">
                Describe Your Symptoms (e.g. Chest pain, mild fever, headache, nausea)
              </label>
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Type your symptoms here in detail..."
                rows={4}
                className="w-full p-4 rounded-2xl input-field text-primary placeholder-secondary text-sm focus:outline-none focus:border-emerald-400 transition resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                >
                  <option value="Less than 24 hours">Less than 24 hours</option>
                  <option value="2-3 days">2-3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="More than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Perceived Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                >
                  <option value="Low">Low (Mild discomfort)</option>
                  <option value="Moderate">Moderate (Distracting)</option>
                  <option value="High">High (Severe / Intolerable)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Patient Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !symptomsInput.trim()}
                className="px-6 py-3 rounded-xl btn-primary text-xs font-bold flex items-center space-x-2 transition disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-secondary/20 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="border-t border-base pt-4">
            <span className="text-[11px] font-semibold uppercase text-secondary tracking-wider">Quick Sample Scenarios:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setPreset('Chest tightness, shortness of breath, left arm discomfort', 'High')}
                className="px-3 py-1.5 rounded-lg bg-base hover:bg-slate-100 border border-base text-secondary text-xs font-medium transition"
              >
                🚨 Chest Pain & Breathlessness (High)
              </button>
                  <button
                    onClick={() => setPreset('Throbbing migraine headache with light sensitivity', 'Moderate')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-base text-secondary text-xs font-medium hover:text-primary transition"
                  >
                💆 Severe Migraine (Moderate)
              </button>
                  <button
                    onClick={() => setPreset('Sore throat, low grade fever, runny nose', 'Low')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-base text-secondary text-xs font-medium hover:text-primary transition"
                  >
                🤧 Cold & Fever (Low)
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="surface-card p-6 rounded-3xl border border-base space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-primary">Emergency Red Flags</h3>
          <p className="text-xs text-secondary leading-relaxed">
            If you or someone around you experiences severe chest pain, sudden paralysis or numbness, severe difficulty breathing, or loss of consciousness, skip online checkers and call emergency services (911 / 108 / 112) immediately.
          </p>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-semibold">
            <PhoneCall className="w-4 h-4 text-rose-500 animate-bounce" />
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
          {isUnclearSymptomDescription ? (
            <div className="p-6 rounded-3xl surface-card border border-base bg-white shadow-soft">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-700">Input not recognized as medical symptoms</h3>
                  <p className="text-sm text-secondary mt-2">
                    The entered text did not describe a valid medical symptom. Please enter symptom details such as pain, fever, cough, dizziness, nausea, or headache.
                  </p>
                  <p className="text-xs text-secondary mt-3">
                    No diagnosis or triage advice is provided for unrelated or nonsensical text.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Emergency Alert Banner if Serious */}
              {result.emergency_alert && (
                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-rose-700">HIGH SEVERITY ALERT - EMERGENCY CARE ADVISED</h3>
                      <p className="text-xs text-rose-600 mt-0.5">Symptoms indicate potential acute cardio-respiratory strain. Seek urgent medical care.</p>
                    </div>
                  </div>
                  <a
                    href="tel:911"
                    className="btn-secondary px-6 py-3 rounded-xl text-sm shadow-lg uppercase tracking-wider shrink-0"
                  >
                    Call Emergency Now
                  </a>
                </div>
              )}

              {/* Severity & Recommended Specialist Header */}
              <div className="surface-card p-6 rounded-3xl border border-base grid grid-cols-1 sm:grid-cols-3 gap-4 text-center bg-white">
                <div className="p-4 rounded-2xl bg-[#F7FAFD] border border-base">
                  <span className="text-[11px] font-mono text-secondary uppercase">TRIAGE SEVERITY</span>
                  <h4 className={`text-xl font-bold mt-1 ${
                    result.severity_level === 'High' ? 'text-rose-500' : result.severity_level === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {result.severity_level} Risk
                  </h4>
                </div>

            <div className="p-4 rounded-2xl bg-[#F7FAFD] border border-base">
              <span className="text-[11px] font-mono text-secondary uppercase">RECOMMENDED SPECIALIST</span>
              <h4 className="text-base font-bold text-cyan-600 mt-1">{result.recommended_specialist}</h4>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7FAFD] border border-base">
              <span className="text-[11px] font-mono text-secondary uppercase">PRIMARY SYMPTOMS EVALUATED</span>
              <h4 className="text-xs font-semibold text-secondary mt-1">{result.primary_symptoms?.join(', ')}</h4>
            </div>
          </div>

          {/* Possible Conditions Breakdown */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-4 bg-white">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-500" />
              <span>Possible Health Conditions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.possible_conditions?.map((cond, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#F7FAFD] border border-base space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-primary">{cond.condition}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                      {cond.match_probability} Match
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">{cond.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate First-Aid Guidance */}
          <div className="surface-card p-6 rounded-3xl border border-base space-y-3 bg-white">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Step-by-Step First-Aid Guidance</span>
            </h3>
            <div className="space-y-2">
              {result.first_aid_guidance?.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-[#F7FAFD] border border-base text-xs text-secondary">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

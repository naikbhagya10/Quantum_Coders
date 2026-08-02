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

  const hasMedicineKeywords = (text) => {
    const medicineNamePattern = /\b(?:dolo|paracetamol|acetaminophen|aspirin|ibuprofen|naproxen|amoxicillin|metformin|telmisartan|omeprazole|pantoprazole|diclofenac|azithromycin|atorvastatin|amlodipine|metoprolol|losartan|simvastatin|clarithromycin|clindamycin|montelukast|fluconazole|prednisone|hydroxychloroquine|levothyroxine|loratadine|cetirizine|levocetirizine|rabeprazole|vitamin\s*[a-z0-9]*|calcium|zinc|iron|magnesium|selenium|folic|acetazolamide|allopurinol|alprazolam|bupropion|carbamazepine|chloroquine|colchicine|dexamethasone|domperidone|escitalopram|fenofibrate|gabapentin|haloperidol|insulin|loperamide|lorazepam|miconazole|nitrofurantoin|olmesartan|oseltamivir|oxcarbazepine|paroxetine|pioglitazone|sertraline|tamoxifen|terfenadine|thiamine|valproate|valsartan|verapamil|warfarin|clopidogrel|bisoprolol|digoxin|donepezil|finasteride|tadalafil|tamsulosin|cetaphil|salbutamol|spironolactone|furosemide|metronidazole|amitriptyline|ciprofloxacin|doxycycline|enalapril|ramipril|sildenafil|tramadol)\b/i;
    const medicineSuffixPattern = /\b[a-z][a-z0-9\-]{2,}(?:cillin|mycin|floxacin|cycline|penem|azole|vir|pril|sartan|olol|dipine|statin|prazole|tidine|sone|mab|nib|tide|fenac|caine|done)\b/i;
    const dosagePattern = /\b\d+(?:\.\d+)?\s*(mg|mcg|g|iu|ml|units|tablet|tab|capsule|capsules|syrup|drop|drops|ointment|cream|patch|puff)\b/i;
    const medicineUsagePattern = /\b(take|tablet|capsule|syrup|drop|drops|ointment|cream|patch|puff|daily|once daily|twice daily|three times daily|before meals|after meals|morning|evening|bedtime|before bed|after food|before food|with food|as needed)\b/i;
    const genericMedPattern = /\b[a-z][a-z0-9\-]{2,}(?:\s+[a-z][a-z0-9\-]{2,}){0,2}\s*(?:\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|units|tablet|tab|capsule|capsules|syrup|drop|drops|ointment|cream|patch|puff))\b/i;
    const takeDrugPattern = /\btake\s+[a-z][a-z0-9\-]{2,}(?:\s+[a-z][a-z0-9\-]{2,}){0,2}\b/i;

    return (
      medicineNamePattern.test(text) ||
      medicineSuffixPattern.test(text) ||
      genericMedPattern.test(text) ||
      takeDrugPattern.test(text) ||
      (dosagePattern.test(text) && medicineUsagePattern.test(text))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!file && !prescriptionText.trim()) {
        addNotification('Please enter prescription text or upload a prescription file.', 'warning');
        return;
      }

      if (!file && !hasMedicineKeywords(prescriptionText)) {
        addNotification('Please enter a valid medicine prescription with drug names, dosages, or dosing instructions.', 'warning');
        return;
      }

      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await analyzePrescription(formData);
      } else {
        res = await analyzePrescription({ prescription_text: prescriptionText });
      }

      setAnalysisResult(res.data.analysis);
      window.dispatchEvent(new CustomEvent('mediclear_history_updated'));
      addNotification('Prescription analyzed & breakdown generated!', 'success');
      loadPrescriptions();
    } catch (err) {
      if (err.response?.data?.invalid_input) {
        addNotification(err.response.data.message || 'Please enter valid prescription text.', 'warning');
      } else {
        addNotification('Error analyzing prescription.', 'danger');
      }
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
          <Pill className="w-7 h-7 text-cyan-500" />
          <span>Prescription & Medicine Analyzer</span>
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Deconstructs prescriptions into dosage instructions, timing (before/after food), uses, side effects, and drug precautions.
        </p>
      </div>

      {/* Input Section */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-base space-y-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Enter Prescription Text or Doctor's Dosage Notes
            </label>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="e.g. Metformin 500mg twice daily after meals, Telmisartan 40mg once daily..."
              rows={3}
              className="w-full p-4 rounded-2xl input-field text-primary placeholder-secondary text-sm focus:outline-none focus:border-cyan-400 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={setSampleRx}
              className="text-xs text-secondary hover:text-primary font-semibold transition"
            >
              + Use Sample Prescription Note
            </button>

            <button
              type="submit"
              disabled={loading || (!prescriptionText && !file)}
              className="px-6 py-3 rounded-xl btn-primary text-xs font-bold flex items-center space-x-2 transition disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-secondary/20 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="surface-card p-6 rounded-3xl border border-base space-y-4 bg-white">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-500" />
              <span>Prescribed Medications Breakdown</span>
            </h3>

            <div className="space-y-4">
              {analysisResult.medicines?.map((med, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#F7FAFD] border border-base space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base pb-3">
                    <div>
                      <h4 className="text-base font-bold text-primary">{med.name}</h4>
                      <p className="text-xs text-cyan-700 mt-0.5 font-medium">{med.purpose}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-white text-secondary font-mono border border-base">
                        Dosage: {med.dosage}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
                        {med.timing}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-base">
                      <span className="text-secondary font-semibold block mb-1">Frequency & Schedule:</span>
                      <span className="text-primary">{med.frequency}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-base">
                      <span className="text-secondary font-semibold block mb-1">Safety Precautions:</span>
                      <span className="text-emerald-700">{med.precautions}</span>
                    </div>
                  </div>

                  {med.common_side_effects?.length > 0 && (
                    <div className="text-xs text-secondary">
                      <span className="text-primary font-semibold">Possible Side Effects:</span>{' '}
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

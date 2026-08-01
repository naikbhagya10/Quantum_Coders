import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  FileText, 
  Stethoscope, 
  Pill, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  HeartPulse
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: "AI Medical Report Translator",
      desc: "Upload lab reports in PDF or image format. Tesseract OCR & Gemini AI translate complex jargon into plain, understandable English."
    },
    {
      icon: HeartPulse,
      title: "Abnormal Value Highlighting",
      desc: "Instantly flags out-of-range blood parameters (Glucose, Hemoglobin, Cholesterol) with clear explanations of what they mean for your health."
    },
    {
      icon: Stethoscope,
      title: "AI Symptom Checker & Triage",
      desc: "Enter symptoms to receive severity risk ratings (Low/Moderate/High), recommended specialist doctors, and step-by-step first-aid guidance."
    },
    {
      icon: Pill,
      title: "Prescription & Medicine Breakdown",
      desc: "Deconstructs doctor prescriptions to explain dosage, exact timing (before/after food), side effects, and drug precautions."
    },
    {
      icon: Calendar,
      title: "Appointment Management",
      desc: "Schedule specialist visits with ease and receive timely browser and notification reminders before your scheduled appointment time."
    },
    {
      icon: MapPin,
      title: "Nearby Healthcare Finder",
      desc: "Locate nearby hospitals, trauma centers, diagnostic centers, and specialists with Google Maps integration and direct directions."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card-accent border border-cyan-500/30 mb-8"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-300">Powered by Google Gemini AI & Tesseract OCR</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Understand Your Medical Reports & Prescriptions <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Instantly</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          No more waiting in anxiety until your next doctor's visit. MediClear AI simplifies medical terms, highlights abnormal lab values, guides symptoms, and organizes your medical journey.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
          >
            <span>Analyze Your Report Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl glass-panel text-slate-200 hover:text-white font-semibold text-base border border-slate-700/80 flex items-center justify-center transition-all hover:bg-slate-800/60"
          >
            Patient Login
          </Link>
        </motion.div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Instant OCR Extraction</span></div>
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Layman English Summaries</span></div>
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>24/7 AI Symptom Triage</span></div>
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Nearby Hospital Maps</span></div>
        </div>
      </section>

      {/* Interactive Feature Cards */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">Comprehensive Health Intelligence Suite</h2>
            <p className="text-slate-400 text-sm mt-3">Everything you need to understand, track, and take control of your health data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl glass-panel-hover flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100">{feat.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <footer className="py-8 px-4 text-center border-t border-slate-800 text-xs text-slate-500 glass-panel">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Medical Disclaimer</span>
          </div>
          <p>
            MediClear AI provides automated explanations of medical terms, lab reports, and symptoms for informational and educational purposes only. It is not a substitute for professional medical diagnosis, advice, or treatment. Always consult a qualified physician for any medical concerns or before starting treatment.
          </p>
          <p className="pt-2 text-[11px] text-slate-600">© 2026 MediClear AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

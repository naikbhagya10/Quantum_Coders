import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  const features = [
    {
      icon: FileText,
      title: t('landingFeatureReportTranslatorTitle'),
      desc: t('landingFeatureReportTranslatorDesc')
    },
    {
      icon: HeartPulse,
      title: t('landingFeatureAbnormalHighlightTitle'),
      desc: t('landingFeatureAbnormalHighlightDesc')
    },
    {
      icon: Stethoscope,
      title: t('landingFeatureSymptomCheckerTitle'),
      desc: t('landingFeatureSymptomCheckerDesc')
    },
    {
      icon: Pill,
      title: t('landingFeaturePrescriptionAnalyzerTitle'),
      desc: t('landingFeaturePrescriptionAnalyzerDesc')
    },
    {
      icon: Calendar,
      title: t('landingFeatureAppointmentTitle'),
      desc: t('landingFeatureAppointmentDesc')
    },
    {
      icon: MapPin,
      title: t('landingFeatureNearbyFinderTitle'),
      desc: t('landingFeatureNearbyFinderDesc')
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
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#E6F1F8] border border-[#D1E4EE] mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#2E6F95]" />
          <span className="text-xs font-semibold text-secondary">{t('landingPoweredBy')}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-primary tracking-tight leading-tight max-w-4xl mx-auto"
        >
          {t('landingHeroTitle')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-secondary max-w-2xl mx-auto font-normal leading-relaxed"
        >
          {t('landingHeroSubtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl btn-primary font-bold text-base flex items-center justify-center space-x-2 transition-all"
          >
            <span>{t('landingPrimaryCallToAction')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl btn-secondary font-semibold text-base flex items-center justify-center transition-all"
          >
            {t('landingLoginCta')}
          </Link>
        </motion.div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-secondary">
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-secondary" /><span>{t('landingBadgeOcrExtraction')}</span></div>
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-secondary" /><span>{t('landingBadgeLaymanSummaries')}</span></div>
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-secondary" /><span>{t('landingBadgeSymptomTriage')}</span></div>
          <div className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-secondary" /><span>{t('landingBadgeNearbyMaps')}</span></div>
        </div>
      </section>

      {/* Interactive Feature Cards */}
      <section className="py-16 bg-white/80 border-y border-base backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-primary">{t('landingSuiteTitle')}</h2>
            <p className="text-secondary text-sm mt-3">{t('landingSuiteDescription')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="surface-card p-6 rounded-2xl flex flex-col justify-between bg-white border border-base">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#E6F1F8] border border-[#D1E4EE] text-[#2E6F95] flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{feat.title}</h3>
                    <p className="text-xs text-secondary mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <footer className="py-8 px-4 text-center border-t border-base text-xs text-secondary surface-card">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center space-x-2 text-secondary">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span className="font-semibold text-primary">{t('landingDisclaimerTitle')}</span>
          </div>
          <p>{t('landingDisclaimerText')}</p>
          <p className="pt-2 text-[11px] text-secondary">{t('copyrightNotice')}</p>
        </div>
      </footer>
    </div>
  );
}

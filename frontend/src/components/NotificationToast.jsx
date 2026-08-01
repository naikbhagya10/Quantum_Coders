import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationToast() {
  const { toasts, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-500/40 bg-emerald-950/80';
      case 'warning': return 'border-amber-500/40 bg-amber-950/80';
      case 'danger': return 'border-rose-500/40 bg-rose-950/80';
      default: return 'border-cyan-500/40 bg-slate-900/90';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start p-4 rounded-xl border backdrop-blur-md shadow-2xl ${getBorderColor(toast.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5 mr-3">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeNotification(toast.id)}
              className="ml-3 flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

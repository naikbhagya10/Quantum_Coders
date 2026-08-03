import React, { useState, useEffect } from 'react';
import { scheduleAppointment, getAppointments, cancelAppointment } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, User, Plus, CheckCircle2, XCircle, Bell, MapPin } from 'lucide-react';
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

const syncDashboardAppointmentHistory = (appointmentPayload, mode = 'add') => {
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

    const existingAppointments = Array.isArray(storedHistory.appointments) ? storedHistory.appointments : [];

    if (mode === 'add') {
      const appointmentRecord = {
        id: appointmentPayload.id || `appointment-${Date.now()}`,
        doctor_name: appointmentPayload.doctor_name,
        specialty: appointmentPayload.specialty,
        facility_name: appointmentPayload.facility_name,
        appointment_date: appointmentPayload.appointment_date,
        appointment_time: appointmentPayload.appointment_time,
        reason: appointmentPayload.reason,
        status: 'Upcoming',
        reminder_minutes_before: appointmentPayload.reminder_minutes_before,
        created_at: new Date().toISOString()
      };

      const dashboardHistory = {
        ...storedHistory,
        appointments: [appointmentRecord, ...existingAppointments]
      };

      localStorage.setItem(key, JSON.stringify(dashboardHistory));
      return;
    }

    const dashboardHistory = {
      ...storedHistory,
      appointments: existingAppointments.filter((appointment) => appointment.id !== appointmentPayload.id)
    };

    localStorage.setItem(key, JSON.stringify(dashboardHistory));
  } catch (error) {
    console.error('Error syncing appointment dashboard history:', error);
  }
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dayBeforeReminder, setDayBeforeReminder] = useState(null);
  const [tomorrowReminderNotified, setTomorrowReminderNotified] = useState(false);
  const { addNotification } = useNotification();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    doctor_name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiologist',
    facility_name: 'City Care Specialty Hospital',
    appointment_date: '2026-08-05',
    appointment_time: '10:30 AM',
    reason: 'Follow-up consultation for lipid and blood sugar results',
    reminder_minutes_before: 60
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      const appointmentsData = res.data.appointments || [];
      setAppointments(appointmentsData);
      scheduleTomorrowReminder(appointmentsData);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await scheduleAppointment(formData);
      const createdAppointment = res.data?.appointment || {
        id: `appointment-${Date.now()}`,
        ...formData,
        status: 'Upcoming'
      };

      syncDashboardAppointmentHistory(createdAppointment, 'add');
      window.dispatchEvent(new CustomEvent('mediclear_history_updated'));
      addNotification(`Appointment saved for ${formData.appointment_date} at ${formData.appointment_time}. You will get a reminder one day before.`, 'success');
      setShowModal(false);
      loadAppointments();
    } catch (err) {
      if (err.response?.status === 401) {
        addNotification('Session expired. Please log in again to save the appointment.', 'danger');
        logout();
        return;
      }
      const msg = err.response?.data?.message || 'Error scheduling appointment.';
      addNotification(msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const scheduleTomorrowReminder = (appointmentsList) => {
    if (!appointmentsList?.length) {
      setTomorrowReminderNotified(false);
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];

    const tomorrowAppointment = appointmentsList.find((app) => app.appointment_date === tomorrowDateString && app.status === 'Upcoming');

    if (tomorrowAppointment) {
      setDayBeforeReminder(tomorrowAppointment);
      if (!tomorrowReminderNotified) {
        addNotification(
          `Reminder: You have an appointment with ${tomorrowAppointment.doctor_name} tomorrow at ${tomorrowAppointment.appointment_time}.`,
          'info'
        );
        setTomorrowReminderNotified(true);
      }
    } else {
      setDayBeforeReminder(null);
      setTomorrowReminderNotified(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      syncDashboardAppointmentHistory({ id }, 'remove');
      window.dispatchEvent(new CustomEvent('mediclear_history_updated'));
      addNotification('Appointment cancelled.', 'info');
      loadAppointments();
    } catch (err) {
      addNotification('Error cancelling appointment.', 'danger');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-emerald-500" />
            <span>{t('appointmentHeader')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            {t('appointmentDescription')}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl btn-primary text-xs font-bold flex items-center space-x-2 transition hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Save Appointment</span>
        </button>
      </div>

      {/* Appointment Reminder */}
      {dayBeforeReminder && (
        <div className="surface-card p-5 rounded-3xl border border-emerald-200 bg-emerald-50 text-primary flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Appointment Reminder</p>
            <p className="text-sm font-semibold text-primary">
              You have an appointment tomorrow with {dayBeforeReminder.doctor_name} at {dayBeforeReminder.appointment_time}.
            </p>
            <p className="text-xs text-secondary mt-1">{dayBeforeReminder.facility_name} · {dayBeforeReminder.specialty}</p>
          </div>
        </div>
      )}

      {/* Appointment List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="surface-card p-12 rounded-3xl text-center border border-base bg-white/90 space-y-3">
            <Calendar className="w-12 h-12 text-secondary mx-auto mb-2" />
            <h3 className="text-base font-bold text-primary">{t('noAppointments')}</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              {t('scheduleVisit')}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 px-4 py-2 rounded-xl btn-secondary text-xs font-semibold transition"
            >
              {t('scheduleFirstAppointment')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {appointments.map((app) => (
              <div key={app.id} className="surface-card p-6 rounded-3xl border border-base space-y-4 hover:shadow-soft transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-primary">{app.doctor_name}</h4>
                      <p className="text-xs text-secondary font-medium">{app.specialty}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    app.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-secondary bg-[#F7FAFC] p-3.5 rounded-2xl border border-base">
                  <div className="flex items-center space-x-2 text-emerald-600 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>{app.appointment_date} at {app.appointment_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-secondary">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{app.facility_name}</span>
                  </div>
                  <p className="text-secondary pt-1 border-t border-base">
                    <strong className="text-primary">Reason:</strong> {app.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" /> {t('remindActiveMsg')}
                  </span>
                  {app.status === 'Upcoming' && (
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="text-xs text-rose-400 hover:underline font-semibold"
                    >
                      Cancel Visit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="surface-card p-6 sm:p-8 rounded-3xl border border-base max-w-md w-full space-y-4 shadow-soft relative"
          >
            <div className="flex items-center justify-between border-b border-base pb-3">
              <h3 className="text-lg font-bold text-primary">Save Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-primary">✕</button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-secondary font-semibold mb-1">{t('doctorName')}</label>
                <input
                  type="text"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-secondary font-semibold mb-1">{t('specialty')}</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-secondary font-semibold mb-1">{t('facilityName')}</label>
                  <input
                    type="text"
                    value={formData.facility_name}
                    onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-secondary font-semibold mb-1">{t('appointmentDate')}</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-secondary font-semibold mb-1">{t('appointmentTime')}</label>
                  <input
                    type="text"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary font-semibold mb-1">{t('reasonForVisit')}</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl input-field text-primary text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl btn-secondary text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-bold"
                >
                  {loading ? 'Saving...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

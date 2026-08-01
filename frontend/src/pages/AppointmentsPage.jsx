import React, { useState, useEffect } from 'react';
import { scheduleAppointment, getAppointments, cancelAppointment } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Calendar, Clock, User, Plus, CheckCircle2, XCircle, Bell, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { addNotification } = useNotification();

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
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await scheduleAppointment(formData);
      addNotification(`Appointment booked with ${formData.doctor_name}! Reminder notification active.`, 'success');
      setShowModal(false);
      loadAppointments();
    } catch (err) {
      addNotification('Error scheduling appointment.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-400" />
            <span>Doctor Appointments & Reminders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Schedule specialist consultations and receive reminder alerts before your appointment time.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Book Doctor Appointment</span>
        </button>
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Appointments Scheduled</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Schedule your doctor visits to receive automated reminder alerts before your consultation time.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition"
            >
              + Schedule First Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {appointments.map((app) => (
              <div key={app.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 glass-panel-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{app.doctor_name}</h4>
                      <p className="text-xs text-cyan-400 font-medium">{app.specialty}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    app.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>{app.appointment_date} at {app.appointment_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{app.facility_name}</span>
                  </div>
                  <p className="text-slate-400 pt-1 border-t border-slate-800">
                    <strong className="text-slate-300">Reason:</strong> {app.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" /> Reminder set 1 hour before
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Book Doctor Visit</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Specialty</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={formData.facility_name}
                    onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationToast from './components/NotificationToast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ReportAnalysisPage from './pages/ReportAnalysisPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import NearbyHealthcarePage from './pages/NearbyHealthcarePage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <NotificationToast />
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

            {/* Protected Portal Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/analyze-report" element={<ProtectedRoute><AppLayout><ReportAnalysisPage /></AppLayout></ProtectedRoute>} />
            <Route path="/symptom-checker" element={<ProtectedRoute><AppLayout><SymptomCheckerPage /></AppLayout></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><AppLayout><PrescriptionsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppLayout><AppointmentsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute><AppLayout><NearbyHealthcarePage /></AppLayout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><AppLayout><MedicalHistoryPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

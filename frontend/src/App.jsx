import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationToast from './components/NotificationToast';
import { Bot, SendHorizonal, X, RotateCcw } from 'lucide-react';

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

function getHealthAssistantReply(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('fever')) {
    return 'For fever, focus on fluids such as water, ORS, soups, and light foods like bananas, rice, toast, or plain porridge. Rest well and seek a clinician if the fever is high, persistent, or comes with breathing trouble or confusion.';
  }

  if (lowerMessage.includes('stomach') || lowerMessage.includes('gas') || lowerMessage.includes('nausea')) {
    return 'For stomach discomfort, try bland foods such as plain rice, toast, bananas, applesauce, and clear soups. Sip water slowly and avoid heavy, spicy, or greasy meals until symptoms improve.';
  }

  if (lowerMessage.includes('blood pressure') || lowerMessage.includes('bp')) {
    return 'Support blood pressure care with a low-salt diet, fruits, vegetables, and regular hydration. Pair this with medication adherence and follow-up advice from your healthcare provider.';
  }

  if (lowerMessage.includes('diabetes') || lowerMessage.includes('sugar')) {
    return 'For diabetes support, prioritize balanced meals with protein, vegetables, and controlled portions of carbohydrates. Avoid skipping meals and follow medical guidance for medication or glucose monitoring.';
  }

  if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
    return 'For cough or a common cold, stay hydrated, rest, and use warm fluids like soups or herbal tea if tolerated. Soft, easy-to-digest foods and proper rest can help the body recover.';
  }

  return 'This assistant is limited to illness support, food guidance, hydration, and general medical-condition advice. For urgent symptoms, severe pain, trouble breathing, fainting, or worsening conditions, contact a medical professional immediately.';
}

function AppLayout({ children }) {
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask about illness support, food suggestions, hydration, or general medical-condition guidance.',
    },
  ]);

  useEffect(() => {
    const openAssistant = () => setShowAssistant(true);
    window.addEventListener('open-healthbot-panel', openAssistant);

    return () => {
      window.removeEventListener('open-healthbot-panel', openAssistant);
    };
  }, []);

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Ask about illness support, food suggestions, hydration, or general medical-condition guidance.',
      },
    ]);
    setAssistantInput('');
  };

  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    const trimmedPrompt = assistantInput.trim();

    if (!trimmedPrompt) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          text: 'Please enter a health-related question such as fever, stomach pain, or diet guidance.',
        },
      ]);
      return;
    }

    const promptReply = getHealthAssistantReply(trimmedPrompt);
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedPrompt },
      { role: 'assistant', text: promptReply },
    ]);
    setAssistantInput('');
  };

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Sidebar />
        <main className="flex-1 p-0 sm:pl-8 overflow-x-hidden">
          {children}
          {showAssistant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
              <div className="w-full max-w-md rounded-2xl border border-[#D1E4EE] bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#D8EEF7] text-[#2E6F95] flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">Healthcare Chatbot</div>
                      <div className="text-[10px] text-secondary">Illness support • food advice • medical-condition guidance</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetChat}
                      className="inline-flex items-center gap-1 rounded-full border border-[#D1E4EE] px-2 py-1 text-[10px] font-semibold text-secondary hover:bg-[#F4F8FB]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAssistant(false)}
                      className="rounded-full p-1 hover:bg-[#F4F8FB]"
                    >
                      <X className="w-4 h-4 text-secondary" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F4FAFF] border border-[#D1E4EE] px-3 py-3 mb-3 max-h-[280px] overflow-y-auto space-y-2">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-5 ${
                          message.role === 'user'
                            ? 'bg-[#2E6F95] text-white'
                            : 'bg-white text-secondary border border-[#D1E4EE]'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAssistantSubmit} className="space-y-2">
                  <textarea
                    rows="3"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    className="w-full rounded-xl border border-[#D1E4EE] bg-white px-3 py-2 text-xs text-primary outline-none focus:border-[#68A9C9]"
                    placeholder="Ask about symptoms, food, or recovery care..."
                  />
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E6F95] px-3 py-2 text-xs font-semibold text-white hover:bg-[#245C79]"
                  >
                    <SendHorizonal className="w-3.5 h-3.5" />
                    Ask Assistant
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      <NotificationToast />
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-base text-primary flex flex-col">
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
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

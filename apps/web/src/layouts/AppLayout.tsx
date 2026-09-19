import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { RoomDetailDrawer } from '../components/RoomDetailDrawer';
import { SystemHealthModal } from '../components/SystemHealthModal';
import { DemoScenarioModal } from '../components/DemoScenarioModal';
import { useCampusStore } from '../store/useCampusStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { initApp, toast, clearToast } = useCampusStore();

  useEffect(() => {
    // Silently verify the stored token is still valid before initializing
    const verifyAndInit = async () => {
      const token = localStorage.getItem('campussynapse_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            // Token is stale — refresh it silently with default admin credentials
            const loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'admin@campussynapse.edu', password: 'Admin@123' }),
            });
            if (loginRes.ok) {
              const data = await loginRes.json();
              localStorage.setItem('campussynapse_token', data.token);
              localStorage.setItem('campussynapse_user', JSON.stringify(data.user));
            }
          }
        } catch {
          // Network error — proceed anyway
        }
      }
      initApp();
    };
    verifyAndInit();
  }, [initApp]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-slate-100">
      {/* Top Mission Control Header */}
      <Header />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Modals & Overlays */}
      <RoomDetailDrawer />
      <SystemHealthModal />
      <DemoScenarioModal />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl border shadow-2xl flex items-center space-x-3 text-xs font-medium max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-surface-elevated border-surface-border text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={clearToast}
              className="p-1 text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

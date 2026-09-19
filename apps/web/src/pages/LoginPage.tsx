import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusStore } from '../store/useCampusStore';
import { api } from '../services/api';
import { Cpu, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'SUPER_ADMIN', email: 'admin@campussynapse.edu', pass: 'Admin@123', label: 'Super Admin (Dr. Rajesh Sharma)' },
  { role: 'CAMPUS_ADMIN', email: 'campusadmin@campussynapse.edu', pass: 'Admin@123', label: 'Campus Admin (Prof. Ananya Sen)' },
  { role: 'FACULTY', email: 'faculty@campussynapse.edu', pass: 'Faculty@123', label: 'Faculty Coordinator (Dr. Vikram Patel)' },
  { role: 'FACILITY_STAFF', email: 'staff@campussynapse.edu', pass: 'Faculty@123', label: 'Facility Lead (Suresh Kumar)' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@campussynapse.edu');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, showToast } = useCampusStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      localStorage.setItem('campussynapse_token', res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center shadow-lg shadow-blue-500/25 mb-1">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">CAMPUSSYNAPSE</h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Campus Digital Twin & Resource Orchestration
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
          <div>
            <label className="text-slate-400 font-mono block mb-1">INSTITUTIONAL EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@campussynapse.edu"
                className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono block mb-1">OPERATOR PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95"
          >
            <span>{isLoading ? 'AUTHENTICATING...' : 'ACCESS MISSION CONTROL'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="pt-4 border-t border-surface-border space-y-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
            {DEMO_ACCOUNTS.map((acc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.pass);
                }}
                className="p-2 rounded bg-surface-elevated hover:bg-slate-800 border border-surface-border text-left text-slate-300 hover:text-white transition flex items-center justify-between text-[11px]"
              >
                <span>{acc.label}</span>
                <span className="text-blue-400 text-[10px]">SELECT</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

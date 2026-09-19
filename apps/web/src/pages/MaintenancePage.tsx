import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCampusStore } from '../store/useCampusStore';
import { MaintenanceTicket } from '@campussynapse/shared-types';
import { Wrench, AlertTriangle, ShieldAlert, CheckCircle2, Plus, Send, Clock } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceName, setResourceName] = useState('Classroom B204');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, fetchResources, fetchDashboard } = useCampusStore();

  const loadTickets = async () => {
    try {
      const data = await api.getMaintenanceTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.reportMaintenance({
        title: title || description.slice(0, 40),
        description,
        resourceName,
        buildingName: resourceName.includes('C1') ? 'Block C' : 'Block B',
      });

      showToast(`Ticket logged! AI Classified as ${res.ticket.priority} priority`, 'success');
      setTitle('');
      setDescription('');
      await loadTickets();
      await fetchResources();
      await fetchDashboard();
    } catch (err) {
      showToast('Reporting failed: ' + (err as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await api.updateTicketStatus(ticketId, 'RESOLVED');
      showToast('Ticket marked RESOLVED. Operational lock removed.', 'success');
      await loadTickets();
      await fetchResources();
      await fetchDashboard();
    } catch (err) {
      showToast('Update failed: ' + (err as Error).message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Automated Facility Intelligence
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>MAINTENANCE INTELLIGENCE & SAFETY HAZARDS</span>
          </h1>
        </div>
      </div>

      {/* Natural Language Incident Reporter */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center space-x-2">
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Report Facility Incident (AI Auto-Triage & Safety Escalation)</span>
        </h3>

        <form onSubmit={handleReport} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-slate-400 font-mono block mb-1">INCIDENT SUMMARY</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electrical panel sparking in Lab C1 or Projector color distortion"
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-mono block mb-1">TARGET ROOM / SPACE</label>
              <input
                type="text"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="e.g. Advanced Computing Lab C1"
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono text-xs block mb-1">DETAILED DESCRIPTION</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, safety hazards, equipment tags... (Critical electrical or flooding automatically triggers emergency lockout)"
              className="w-full bg-surface-elevated border border-surface-border rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-md shadow-amber-600/25 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'TRIAGING INCIDENT...' : 'SUBMIT FOR AI TRIAGE'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Incident Tickets List */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
          Active Maintenance & Safety Tickets ({tickets.length})
        </h3>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-lg border bg-surface-elevated transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                t.priority === 'CRITICAL' ? 'border-rose-500/50 bg-rose-950/10' : 'border-surface-border'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-slate-500 text-[10px]">{t.ticketNumber}</span>
                  <span className="font-bold text-sm text-white">{t.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      t.priority === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : t.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {t.priority}
                  </span>
                  {t.isEscalated && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>RESOURCE AUTO-BLOCKED</span>
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-xs mt-1.5">{t.description}</p>

                <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center space-x-3">
                  <span>Room: <strong className="text-slate-200">{t.resourceName}</strong></span>
                  <span>•</span>
                  <span>Team: <strong className="text-slate-200">{t.assignedTeam}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-blue-400">{t.status}</strong></span>
                </div>
              </div>

              {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                <button
                  onClick={() => handleResolve((t as any)._id || t.id || t.ticketNumber)}
                  className="px-3.5 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold shrink-0 transition"
                >
                  RESOLVE & UNBLOCK
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

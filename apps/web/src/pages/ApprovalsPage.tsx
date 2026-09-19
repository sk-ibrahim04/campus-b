import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCampusStore } from '../store/useCampusStore';
import { ApprovalRequest } from '@campussynapse/shared-types';
import { CheckSquare, ShieldCheck, Check, X, AlertTriangle, Clock, Layers } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { showToast, fetchDashboard, fetchResources } = useCampusStore();

  const loadApprovals = async () => {
    try {
      const data = await api.getApprovals(activeTab === 'ALL' ? undefined : activeTab);
      setApprovals(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    try {
      await api.approveProposal(id, 'Approved by campus administrator via mission control.');
      showToast('Proposal approved and executed into Digital Twin.', 'success');
      await loadApprovals();
      await fetchDashboard();
      await fetchResources();
    } catch (err) {
      showToast('Approval error: ' + (err as Error).message, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(id);
    try {
      await api.rejectProposal(id, 'Rejected due to alternative timetable prioritization.');
      showToast('Proposal rejected.', 'info');
      await loadApprovals();
      await fetchDashboard();
      await fetchResources();
    } catch (err) {
      showToast('Rejection error: ' + (err as Error).message, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Human-in-the-Loop Governance
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <span>AI PROPOSAL APPROVAL QUEUE</span>
          </h1>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'PENDING'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-surface-elevated text-slate-400 hover:text-white'
            }`}
          >
            PENDING REVIEW
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'APPROVED'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-surface-elevated text-slate-400 hover:text-white'
            }`}
          >
            APPROVED HISTORY
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-surface-elevated text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.length > 0 ? (
          approvals.map((appr) => (
            <div
              key={appr.id}
              className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">
                      AI PROPOSAL • {appr.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        appr.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : appr.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {appr.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1">{appr.title}</h3>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <div>Agent: <span className="text-slate-200">{appr.requestedByAgent}</span></div>
                  <div>Role required: <span className="text-blue-400">{appr.requiredRole}</span></div>
                </div>
              </div>

              {/* Description & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="md:col-span-2 text-slate-300 leading-relaxed">
                  <p>{appr.description}</p>
                  {appr.proposedPlan && (
                    <div className="mt-2.5 p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs font-mono">
                      <div className="text-blue-400 font-bold">{appr.proposedPlan.title}</div>
                      <div className="text-slate-400 mt-1">
                        Capacity: {appr.proposedPlan.capacity} seats • Feasibility: {appr.proposedPlan.feasibilityScore}% •
                        Disruption: {appr.proposedPlan.disruptionScore}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border flex flex-col justify-between font-mono text-[11px]">
                  <div className="space-y-1">
                    <div className="text-slate-500 uppercase text-[10px]">Operational Metrics</div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attendees:</span>
                      <span className="text-white font-bold">{appr.impactMetrics?.attendees || 180}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disruption Score:</span>
                      <span className="text-emerald-400 font-bold">{appr.impactMetrics?.disruptionScore || 95}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacity Fit:</span>
                      <span className="text-blue-400 font-bold">{appr.impactMetrics?.utilizationScore || 88}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {appr.status === 'PENDING' && (
                <div className="pt-3 border-t border-surface-border/80 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleReject(appr.id)}
                    disabled={isProcessing === appr.id}
                    className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-rose-950/40 border border-surface-border hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-mono font-semibold transition"
                  >
                    REJECT PROPOSAL
                  </button>
                  <button
                    onClick={() => handleApprove(appr.id)}
                    disabled={isProcessing === appr.id}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-mono font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-600/25 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isProcessing === appr.id ? 'EXECUTING...' : 'AUTHORIZE & EXECUTE'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 rounded-xl bg-surface border border-surface-border text-center text-slate-400 font-mono text-xs">
            No proposals currently in {activeTab} queue.
          </div>
        )}
      </div>
    </div>
  );
};

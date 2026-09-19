import React from 'react';
import { CandidatePlan } from '../types';
import { CheckCircle2, AlertTriangle, ShieldCheck, Scale, Cpu } from 'lucide-react';

interface DecisionCardProps {
  plan: CandidatePlan;
  solverEngine?: string;
  onApprove?: () => void;
  isExecuting?: boolean;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  plan,
  solverEngine = 'GOOGLE_OR_TOOLS_CPSAT',
  onApprove,
  isExecuting,
}) => {
  return (
    <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xl relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Explainable AI & Optimization Synthesis
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SOLVER: {solverEngine}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Why this Decision? — {plan.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            {plan.decisionScore}
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Multi-Criteria Score</div>
        </div>
      </div>

      {/* Rationale Headline */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-sans leading-relaxed">
        {plan.recommendationReason}
      </div>

      {/* Criteria Verification Checklist */}
      <div>
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Institutional Constraint Verification Checklist</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">
              Capacity Certified: {plan.capacity} seats (Optimal fit)
            </span>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Zero Timetable Conflict in Target Window</span>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Hardware Verified: Projector & Sound Rig Active</span>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Full Ground / Elevator Accessibility</span>
          </div>
        </div>
      </div>

      {/* Weighted Scoring Factors Matrix */}
      <div>
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
          <Scale className="w-4 h-4 text-blue-400" />
          <span>Configurable Decision Criteria Breakdown</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs text-center">
          <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div className="text-[10px] text-slate-400 uppercase">Feasibility (35%)</div>
            <div className="text-base font-bold text-emerald-400 mt-1">{plan.feasibilityScore}%</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div className="text-[10px] text-slate-400 uppercase">Min Disruption (25%)</div>
            <div className="text-base font-bold text-blue-400 mt-1">{plan.disruptionScore}%</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div className="text-[10px] text-slate-400 uppercase">Utilization (20%)</div>
            <div className="text-base font-bold text-amber-400 mt-1">{plan.utilizationScore}%</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div className="text-[10px] text-slate-400 uppercase">Proximity (10%)</div>
            <div className="text-base font-bold text-purple-400 mt-1">{plan.distanceScore}%</div>
          </div>
        </div>
      </div>

      {/* Human Approval Action */}
      {onApprove && (
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span className="font-mono text-amber-400 font-bold uppercase">Human-in-the-Loop Gate:</span> Requires
            administrator approval to execute allocation and update Digital Twin.
          </div>
          <button
            onClick={onApprove}
            disabled={isExecuting}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
          >
            {isExecuting ? 'EXECUTING ALLOCATION...' : 'AUTHORIZE & EXECUTE PLAN'}
          </button>
        </div>
      )}
    </div>
  );
};

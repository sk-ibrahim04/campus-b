import React from 'react';
import { CandidatePlan } from '../types';
import { Award, Check, AlertCircle } from 'lucide-react';

interface CandidatePlanCardProps {
  plan: CandidatePlan;
  isSelected: boolean;
  onSelect: () => void;
}

export const CandidatePlanCard: React.FC<CandidatePlanCardProps> = ({ plan, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-4 relative ${
        isSelected
          ? 'bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500'
          : 'bg-surface border-surface-border hover:border-slate-600'
      }`}
    >
      {plan.isRecommended && (
        <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
          <Award className="w-3 h-3" />
          <span>RECOMMENDED PLAN</span>
        </div>
      )}

      <div>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-sm text-white">{plan.title}</h4>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              {plan.buildingName} • Capacity: {plan.capacity} seats
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-blue-400">{plan.decisionScore}</span>
            <span className="text-[10px] text-slate-500 font-mono">/100</span>
          </div>
        </div>

        {/* Mini score badges */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 text-[10px] font-mono text-center">
          <div className="p-1.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-500">Feasibility</div>
            <div className="font-bold text-emerald-400">{plan.feasibilityScore}%</div>
          </div>
          <div className="p-1.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-500">Disruption</div>
            <div className="font-bold text-blue-400">{plan.disruptionScore}%</div>
          </div>
          <div className="p-1.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-500">Utilization</div>
            <div className="font-bold text-amber-400">{plan.utilizationScore}%</div>
          </div>
        </div>

        {/* Reasons & Trade-offs */}
        <div className="mt-3 space-y-1.5 text-xs">
          {plan.reasons.slice(0, 2).map((r, i) => (
            <div key={i} className="flex items-start space-x-1.5 text-slate-300 text-[11px]">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{r}</span>
            </div>
          ))}
          {plan.tradeOffs.slice(0, 1).map((t, i) => (
            <div key={i} className="flex items-start space-x-1.5 text-amber-300 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`w-full py-2 rounded-lg text-xs font-mono font-semibold transition ${
          isSelected
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'bg-surface-elevated text-slate-300 hover:text-white border border-surface-border'
        }`}
      >
        {isSelected ? 'SELECTED FOR REVIEW' : 'INSPECT PLAN'}
      </button>
    </div>
  );
};

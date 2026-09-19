import React, { useState } from 'react';
import { AICommandBar } from '../components/AICommandBar';
import { CandidatePlanCard } from '../components/CandidatePlanCard';
import { DecisionCard } from '../components/DecisionCard';
import { useCampusStore } from '../store/useCampusStore';
import { Sparkles, Sliders, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';
import { api } from '../services/api';

export const OrchestratorPage: React.FC = () => {
  const { showToast, fetchDashboard, fetchResources } = useCampusStore();
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Tunable scoring weights
  const [feasibilityWeight, setFeasibilityWeight] = useState(35);
  const [disruptionWeight, setDisruptionWeight] = useState(25);
  const [utilizationWeight, setUtilizationWeight] = useState(20);
  const [distanceWeight, setDistanceWeight] = useState(10);
  const [preferenceWeight, setPreferenceWeight] = useState(10);

  const handlePlanGenerated = (data: any) => {
    setOrchestratorResult(data);
    if (data.recommendedPlan) {
      setSelectedPlanId(data.recommendedPlan.planId);
    }
  };

  const handleApprove = async () => {
    if (!orchestratorResult || !selectedPlanId) return;
    const plan = orchestratorResult.candidatePlans?.find((p: any) => p.planId === selectedPlanId);
    if (!plan) return;

    try {
      setIsExecuting(true);
      await api.executePlan({
        planId: plan.planId,
        resourceId: plan.resourceId,
        title: plan.title,
        attendees: plan.capacity,
        startTime: '14:00',
        endTime: '17:00',
      });
      showToast(`Plan approved and executed: ${plan.resourceName} is now RESERVED!`, 'success');
      await fetchDashboard();
      await fetchResources();
      setOrchestratorResult(null);
    } catch (err) {
      showToast('Execution error: ' + (err as Error).message, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedPlan =
    orchestratorResult?.candidatePlans?.find((p: any) => p.planId === selectedPlanId) ||
    orchestratorResult?.recommendedPlan;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Autonomous Resource Orchestration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              OR-TOOLS CP-SAT + AI INTENT
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>AI COMMAND ORCHESTRATION PIPELINE</span>
          </h1>
        </div>
      </div>

      {/* AI Command Bar */}
      <AICommandBar onPlanGenerated={handlePlanGenerated} />

      {/* Weight Tuning Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center space-x-2 font-bold uppercase">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Configurable Decision Scoring Weights (Realtime Re-weighting)</span>
          </span>
          <span className="text-slate-500 text-[11px]">Total Sum: 100%</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-400 text-[10px]">FEASIBILITY</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">{feasibilityWeight}%</div>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-400 text-[10px]">MIN DISRUPTION</div>
            <div className="text-sm font-bold text-blue-400 mt-1">{disruptionWeight}%</div>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-400 text-[10px]">CAPACITY FIT</div>
            <div className="text-sm font-bold text-amber-400 mt-1">{utilizationWeight}%</div>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-400 text-[10px]">CAMPUS DISTANCE</div>
            <div className="text-sm font-bold text-purple-400 mt-1">{distanceWeight}%</div>
          </div>
          <div className="p-2.5 rounded bg-surface-elevated border border-surface-border">
            <div className="text-slate-400 text-[10px]">PREFERENCE</div>
            <div className="text-sm font-bold text-slate-200 mt-1">{preferenceWeight}%</div>
          </div>
        </div>
      </div>

      {/* Candidate Plans Display */}
      {orchestratorResult && selectedPlan && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase mb-3 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>OR-Tools Candidate Plans Generated ({orchestratorResult.candidatePlans?.length || 3})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orchestratorResult.candidatePlans?.map((plan: any) => (
                <CandidatePlanCard
                  key={plan.planId}
                  plan={plan}
                  isSelected={selectedPlanId === plan.planId}
                  onSelect={() => setSelectedPlanId(plan.planId)}
                />
              ))}
            </div>
          </div>

          <DecisionCard
            plan={selectedPlan}
            solverEngine={orchestratorResult.solverEngine}
            onApprove={handleApprove}
            isExecuting={isExecuting}
          />
        </div>
      )}
    </div>
  );
};

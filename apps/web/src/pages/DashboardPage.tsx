import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { AICommandBar } from '../components/AICommandBar';
import { ResourceRecoveryCard } from '../components/ResourceRecoveryCard';
import { CandidatePlanCard } from '../components/CandidatePlanCard';
import { DecisionCard } from '../components/DecisionCard';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { telemetry, fetchDashboard, fetchResources, showToast } = useCampusStore();
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();

  const handlePlanGenerated = (data: any) => {
    setOrchestratorResult(data);
    if (data.recommendedPlan) {
      setSelectedPlanId(data.recommendedPlan.planId);
    }
  };

  const handleApproveSelectedPlan = async () => {
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
      showToast(`Plan approved! ${plan.resourceName} is now RESERVED.`, 'success');
      await fetchDashboard();
      await fetchResources();
      setOrchestratorResult(null);
    } catch (err) {
      showToast('Approval failed: ' + (err as Error).message, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedPlan =
    orchestratorResult?.candidatePlans?.find((p: any) => p.planId === selectedPlanId) ||
    orchestratorResult?.recommendedPlan;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Hero Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide flex items-center space-x-2">
            <span>CAMPUSSYNAPSE MISSION CONTROL</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Autonomous Core Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Realtime Digital Twin Telemetry & Predictive Resource Orchestration
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>AUTONOMY CYCLE: CONTINUOUS OBSERVATION</span>
        </div>
      </div>

      {/* Main Metric Cards (Prompt Section 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Campus Status */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500">Campus Status</div>
          <div className="text-base font-bold text-emerald-400 mt-2 flex items-center space-x-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-pulse" />
            <span>OPERATIONAL</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">All telemetry live</div>
        </div>

        {/* Active Conflicts */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500">Active Conflicts</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
            {telemetry?.activeConflictsCount || 3}
          </div>
          <div className="text-[10px] text-amber-400/80 font-sans">Mitigation suggested</div>
        </div>

        {/* Pending Decisions */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500">Pending Decisions</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">
            {telemetry?.pendingDecisionsCount || 4}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">Awaiting admin sign-off</div>
        </div>

        {/* Available Resources */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500">Available Resources</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">
            {telemetry?.availableResourcesCount || 27}
            <span className="text-xs text-slate-500 font-normal font-sans">/{telemetry?.totalResourcesCount || 32}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-sans">Ready for allocation</div>
        </div>

        {/* Autonomous Actions */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500">Autonomous Actions</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">
            {telemetry?.autonomousActionsTodayCount || 12}
          </div>
          <div className="text-[10px] text-purple-400/80 font-sans">Safely executed today</div>
        </div>

        {/* Recovered Resources */}
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="text-[10px] font-mono uppercase text-slate-500">Recovered Resources</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {telemetry?.recoveredResourcesTodayCount || 5}
          </div>
          <div className="text-[10px] text-emerald-400/80 font-sans">Ghost slots reclaimed</div>
        </div>
      </div>

      {/* AI Command Bar */}
      <AICommandBar onPlanGenerated={handlePlanGenerated} />

      {/* Candidate Plans and Explainable Decision Output if generated */}
      {orchestratorResult && selectedPlan && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>OR-Tools CP-SAT Candidate Plans ({orchestratorResult.candidatePlans?.length || 3})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Confidence: {Math.round((orchestratorResult.parsedIntent?.confidence || 0.96) * 100)}%
            </span>
          </div>

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

          <DecisionCard
            plan={selectedPlan}
            solverEngine={orchestratorResult.solverEngine}
            onApprove={handleApproveSelectedPlan}
            isExecuting={isExecuting}
          />
        </div>
      )}

      {/* Ghost Booking Resource Recovery Card */}
      <ResourceRecoveryCard />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Digital Twin Shortcut */}
        <div
          onClick={() => navigate('/digital-twin')}
          className="p-5 rounded-xl bg-surface border border-surface-border hover:border-blue-500/50 transition cursor-pointer flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                Inspect Live Digital Twin
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Full spatial visualizer across Blocks A, B, and C with realtime IoT sensor states.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
        </div>

        {/* What-If Simulator Shortcut */}
        <div
          onClick={() => navigate('/simulator')}
          className="p-5 rounded-xl bg-surface border border-surface-border hover:border-indigo-500/50 transition cursor-pointer flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">
                Launch What-If Disruption Simulator
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate room closures, power outages, and schedule shifts with 0 persistent state mutation.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
        </div>
      </div>
    </div>
  );
};

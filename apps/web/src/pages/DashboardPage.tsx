import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { AICommandBar } from '../components/AICommandBar';
import { ResourceRecoveryCard } from '../components/ResourceRecoveryCard';
import { CandidatePlanCard } from '../components/CandidatePlanCard';
import { DecisionCard } from '../components/DecisionCard';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Layers,
  ShieldCheck, RotateCcw, Sparkles, ArrowRight, Cpu,
  TrendingUp, Zap, Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const METRICS = (telemetry: any) => [
  {
    label: 'Campus Status',
    value: 'OPERATIONAL',
    sub: 'All telemetry live',
    color: 'emerald',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    isPulse: true,
  },
  {
    label: 'Active Conflicts',
    value: telemetry?.activeConflictsCount ?? 3,
    sub: 'Mitigation suggested',
    color: 'amber',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  },
  {
    label: 'Pending Decisions',
    value: telemetry?.pendingDecisionsCount ?? 4,
    sub: 'Awaiting admin sign-off',
    color: 'blue',
    icon: <Clock className="w-4 h-4 text-blue-400" />,
  },
  {
    label: 'Available / Total',
    value: `${telemetry?.availableResourcesCount ?? 27}`,
    sub: `of ${telemetry?.totalResourcesCount ?? 32} resources`,
    color: 'slate',
    icon: <Layers className="w-4 h-4 text-slate-300" />,
  },
  {
    label: 'Autonomous Actions',
    value: telemetry?.autonomousActionsTodayCount ?? 12,
    sub: 'Safely executed today',
    color: 'purple',
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
  },
  {
    label: 'Recovered Resources',
    value: telemetry?.recoveredResourcesTodayCount ?? 5,
    sub: 'Ghost slots reclaimed',
    color: 'emerald',
    icon: <RotateCcw className="w-4 h-4 text-emerald-400" />,
  },
];

const COLOR_MAP: Record<string, { text: string; border: string; glow: string; bg: string }> = {
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.08)', bg: 'bg-emerald-500/8' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-500/20',   glow: 'rgba(245,158,11,0.08)', bg: 'bg-amber-500/8' },
  blue:    { text: 'text-blue-400',    border: 'border-blue-500/20',    glow: 'rgba(59,130,246,0.08)', bg: 'bg-blue-500/8' },
  slate:   { text: 'text-slate-100',   border: 'border-slate-600/30',   glow: 'rgba(100,116,139,0.06)', bg: 'bg-slate-500/8' },
  purple:  { text: 'text-purple-400',  border: 'border-purple-500/20',  glow: 'rgba(139,92,246,0.08)', bg: 'bg-purple-500/8' },
};

export const DashboardPage: React.FC = () => {
  const { telemetry, fetchDashboard, fetchResources, showToast } = useCampusStore();
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();

  const handlePlanGenerated = (data: any) => {
    setOrchestratorResult(data);
    if (data.recommendedPlan) setSelectedPlanId(data.recommendedPlan.planId);
  };

  const handleApproveSelectedPlan = async () => {
    if (!orchestratorResult || !selectedPlanId) return;
    const plan = orchestratorResult.candidatePlans?.find((p: any) => p.planId === selectedPlanId);
    if (!plan) return;
    try {
      setIsExecuting(true);
      await api.executePlan({ planId: plan.planId, resourceId: plan.resourceId, title: plan.title, attendees: plan.capacity, startTime: '14:00', endTime: '17:00' });
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

  const metrics = METRICS(telemetry);

  return (
    <div className="space-y-5 max-w-7xl mx-auto relative">
      {/* Ambient background glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[rgba(38,51,77,0.5)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h1 className="text-[15px] font-extrabold text-white tracking-widest uppercase">
              CampusSynapse Mission Control
            </h1>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Autonomous Core Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Realtime Digital Twin Telemetry · Predictive Resource Orchestration
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span>AUTONOMY CYCLE: CONTINUOUS OBSERVATION</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => {
          const c = COLOR_MAP[m.color];
          return (
            <div
              key={i}
              className="metric-card p-4 animate-in"
              style={{ animationDelay: `${i * 60}ms`, boxShadow: `0 4px 20px ${c.glow}` }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{m.label}</span>
                <span className={`p-1 rounded-lg ${c.bg}`}>{m.icon}</span>
              </div>

              {/* Value */}
              <div className={`text-lg font-extrabold font-mono leading-none ${c.text} flex items-center gap-1.5`}>
                {m.isPulse && <span className={`w-2 h-2 rounded-full bg-emerald-400 radar-pulse`} />}
                <span>{m.value}</span>
              </div>

              {/* Sub */}
              <div className="text-[9px] text-slate-500 mt-1.5">{m.sub}</div>

              {/* Bottom accent line */}
              <div className="progress-bar mt-2.5">
                <div
                  className="progress-fill"
                  style={{ width: typeof m.value === 'number' ? `${Math.min((m.value / 20) * 100, 100)}%` : '100%' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Command Bar */}
      <AICommandBar onPlanGenerated={handlePlanGenerated} />

      {/* Candidate Plans */}
      {orchestratorResult && selectedPlan && (
        <div className="space-y-4 animate-in">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-white font-mono uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              OR-Tools CP-SAT Candidate Plans ({orchestratorResult.candidatePlans?.length || 3})
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
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

      {/* Ghost Booking Recovery */}
      <ResourceRecoveryCard />

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            to: '/digital-twin',
            title: 'Inspect Live Digital Twin',
            desc: 'Full spatial visualizer across Blocks A, B, and C with realtime IoT sensor states.',
            icon: Layers,
            color: 'blue',
          },
          {
            to: '/simulator',
            title: 'Launch What-If Disruption Simulator',
            desc: 'Simulate room closures, power outages, and schedule shifts with 0 persistent state mutation.',
            icon: Activity,
            color: 'indigo',
          },
        ].map(({ to, title, desc, icon: Icon, color }) => (
          <div
            key={to}
            onClick={() => navigate(to)}
            className="glass-card glass-card-hover p-5 rounded-xl cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400 group-hover:scale-110 transition duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-sm text-white group-hover:text-${color}-400 transition`}>{title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{desc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition duration-200 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

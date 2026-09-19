import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { AICommandBar } from '../components/AICommandBar';
import { ResourceRecoveryCard } from '../components/ResourceRecoveryCard';
import { CandidatePlanCard } from '../components/CandidatePlanCard';
import { DecisionCard } from '../components/DecisionCard';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Layers,
  ShieldCheck, RotateCcw, Sparkles, ArrowRight, Cpu,
  TrendingUp, Zap, Users, Signal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const METRICS = (telemetry: any) => [
  {
    label: 'Campus Status',
    value: 'OPERATIONAL',
    sub: 'All telemetry live',
    color: 'emerald',
    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    badgeClass: 'badge-glow-emerald',
    isPulse: true,
  },
  {
    label: 'Active Conflicts',
    value: telemetry?.activeConflictsCount ?? 3,
    sub: 'Mitigation suggested',
    color: 'amber',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    badgeClass: 'badge-glow-amber',
  },
  {
    label: 'Pending Decisions',
    value: telemetry?.pendingDecisionsCount ?? 4,
    sub: 'Awaiting admin sign-off',
    color: 'cyan',
    icon: <Clock className="w-5 h-5 text-cyan-400" />,
    badgeClass: 'badge-glow-cyan',
  },
  {
    label: 'Available / Total',
    value: `${telemetry?.availableResourcesCount ?? 27}`,
    sub: `of ${telemetry?.totalResourcesCount ?? 32} resources`,
    color: 'slate',
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    badgeClass: 'badge-glow-violet',
  },
  {
    label: 'Autonomous Actions',
    value: telemetry?.autonomousActionsTodayCount ?? 12,
    sub: 'Safely executed today',
    color: 'purple',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    badgeClass: 'badge-glow-violet',
  },
  {
    label: 'Recovered Resources',
    value: telemetry?.recoveredResourcesTodayCount ?? 5,
    sub: 'Ghost slots reclaimed',
    color: 'emerald',
    icon: <RotateCcw className="w-5 h-5 text-emerald-400" />,
    badgeClass: 'badge-glow-emerald',
  },
];

const COLOR_MAP: Record<string, { text: string; border: string; glow: string; bg: string; fill: string }> = {
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'rgba(16,185,129,0.2)', bg: 'bg-emerald-500/10', fill: 'bg-emerald-400' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-500/30',   glow: 'rgba(245,158,11,0.2)', bg: 'bg-amber-500/10', fill: 'bg-amber-400' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-500/30',    glow: 'rgba(6,182,212,0.2)',  bg: 'bg-cyan-500/10', fill: 'bg-cyan-400' },
  slate:   { text: 'text-indigo-400',  border: 'border-indigo-500/30',  glow: 'rgba(99,102,241,0.2)', bg: 'bg-indigo-500/10', fill: 'bg-indigo-400' },
  purple:  { text: 'text-purple-400',  border: 'border-purple-500/30',  glow: 'rgba(139,92,246,0.2)', bg: 'bg-purple-500/10', fill: 'bg-purple-400' },
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
    <div className="space-y-6 max-w-7xl mx-auto relative animate-fadeInUp">
      {/* Ambient background lights */}
      <div className="absolute -top-10 left-1/3 w-[500px] h-[250px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Mission Control Banner Header */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight font-display">
                CampusSynapse <span className="gradient-text">Mission Control</span>
              </h1>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full badge-glow-emerald uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse-dot" />
                Autonomous Core Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Realtime Digital Twin Telemetry & Dynamic AI Resource Orchestration Platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10">
              <Signal className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">System Telemetry</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">100% HEALTHY</div>
              </div>
            </div>

            <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10">
              <Zap className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Solver Engine</div>
                <div className="text-xs font-bold text-purple-300 font-mono">OR-Tools CP-SAT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, i) => {
          const c = COLOR_MAP[m.color];
          return (
            <div
              key={i}
              className="glass-panel-interactive p-4 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 relative group overflow-hidden"
              style={{ boxShadow: `0 8px 30px -10px ${c.glow}` }}
            >
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${c.fill}`} />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">{m.label}</span>
                <span className={`p-2 rounded-xl ${c.bg} border ${c.border} group-hover:scale-110 transition duration-300`}>{m.icon}</span>
              </div>

              <div className={`text-2xl font-black font-display leading-none ${c.text} flex items-center gap-2 mb-1.5`}>
                {m.isPulse && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 status-pulse-dot" />}
                <span>{m.value}</span>
              </div>

              <div className="text-[10px] text-slate-400 font-medium">{m.sub}</div>

              {/* Glowing progress fill bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full ${c.fill} transition-all duration-500`}
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
        <div className="space-y-4 glass-panel p-6 rounded-3xl border border-purple-500/30 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              OR-Tools CP-SAT Candidate Plans ({orchestratorResult.candidatePlans?.length || 3})
            </h3>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full badge-glow-violet">
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

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            to: '/digital-twin',
            title: 'Inspect Live Digital Twin',
            desc: 'Interactive 3D spatial visualizer across Blocks A, B, and C with realtime IoT sensor states & heatmaps.',
            icon: Layers,
            badge: 'LIVE SPATIAL MAP',
            badgeClass: 'badge-glow-cyan',
            gradient: 'from-cyan-500/20 to-blue-500/5',
            borderColor: 'border-cyan-500/30',
            textColor: 'text-cyan-400',
          },
          {
            to: '/simulator',
            title: 'Launch What-If Disruption Simulator',
            desc: 'Simulate HVAC failures, room closures, power outages, and schedule shifts with 0 persistent state mutation.',
            icon: Activity,
            badge: 'STRESS TEST ENGINE',
            badgeClass: 'badge-glow-violet',
            gradient: 'from-purple-500/20 to-indigo-500/5',
            borderColor: 'border-purple-500/30',
            textColor: 'text-purple-400',
          },
        ].map(({ to, title, desc, icon: Icon, badge, badgeClass, gradient, borderColor, textColor }) => (
          <div
            key={to}
            onClick={() => navigate(to)}
            className={`glass-panel p-6 rounded-3xl border ${borderColor} cursor-pointer flex items-center justify-between group hover:border-cyan-400/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-2xl`}
          >
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition duration-500`} />

            <div className="flex items-center gap-5 relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-slate-900/80 border ${borderColor} flex items-center justify-center ${textColor} group-hover:scale-110 shadow-lg transition duration-300`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full ${badgeClass} uppercase tracking-wider mb-1.5 inline-block`}>
                  {badge}
                </span>
                <h4 className={`font-bold text-base text-white group-hover:${textColor} transition`}>{title}</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{desc}</p>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center ${textColor} group-hover:bg-white/10 group-hover:translate-x-1 transition duration-300 shrink-0 z-10`}>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

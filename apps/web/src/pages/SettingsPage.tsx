import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCampusStore } from '../store/useCampusStore';
import { Sliders, ShieldCheck, CheckCircle2, Lock, Zap } from 'lucide-react';

const AUTONOMY_LEVELS = [
  {
    level: 0,
    name: 'LEVEL 0: OBSERVE',
    description: 'Telemetry sensing and real-time monitoring only. No AI recommendations or execution.',
    badge: 'MONITOR ONLY',
  },
  {
    level: 1,
    name: 'LEVEL 1: RECOMMEND',
    description: 'AI generates candidate plans and suggestions; human operator must execute all actions.',
    badge: 'PROPOSAL ONLY',
  },
  {
    level: 2,
    name: 'LEVEL 2: APPROVE THEN EXECUTE',
    description: 'AI prepares complete atomic action; executes immediately upon 1-click human sign-off.',
    badge: 'HUMAN-IN-THE-LOOP (DEFAULT)',
  },
  {
    level: 3,
    name: 'LEVEL 3: SAFE ACTION AUTO-EXECUTION',
    description: 'Safely auto-executes routine low-risk actions (reclaiming ghost bookings, conflict warnings). High-impact changes still require approval.',
    badge: 'SAFE AUTONOMY',
  },
];

export const SettingsPage: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(2);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast, fetchDashboard } = useCampusStore();

  useEffect(() => {
    api.getAutonomySettings()
      .then((data) => {
        if (data.level !== undefined) setCurrentLevel(data.level);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLevelChange = async (lvl: number) => {
    setIsUpdating(true);
    try {
      await api.setAutonomyLevel(lvl);
      setCurrentLevel(lvl);
      showToast(`Autonomy Level updated to Level ${lvl}!`, 'success');
      await fetchDashboard();
    } catch (err) {
      showToast('Update failed: ' + (err as Error).message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Autonomy & Governance Configuration
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span>CAMPUS AUTONOMY LEVELS & SAFETY THRESHOLDS</span>
          </h1>
        </div>
      </div>

      {/* Autonomy Selector */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Operational Autonomy Level (Controlled Self-Driving Campus)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUTONOMY_LEVELS.map((al) => (
            <div
              key={al.level}
              onClick={() => handleLevelChange(al.level)}
              className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                currentLevel === al.level
                  ? 'bg-blue-600/10 border-blue-500 shadow-lg ring-1 ring-blue-500/50'
                  : 'bg-surface-elevated border-surface-border hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white font-mono">{al.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      currentLevel === al.level
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentLevel === al.level ? '✓ ACTIVE' : al.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed">{al.description}</p>
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                {al.level === 3 ? 'Safe auto-execution permitted for Level 3 tasks' : 'Strict human authorization enforced'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Actions vs Approval Required Policy Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Safe Auto Actions */}
        <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-lg space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Permitted Safe Auto-Actions (Low Risk)</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Release abandoned reservations after 15-minute 0-occupancy grace period</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Auto-triage routine AV/HVAC maintenance tickets to respective crews</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Send timetable conflict warning alerts to affected instructors</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Generate daily energy and spatial utilization analytics reports</span>
            </li>
          </ul>
        </div>

        {/* Mandatory Approvals */}
        <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-lg space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Strict Human Approval Required (High Impact)</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>High-capacity events (≥ 150 attendees) and plenary hall allocations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Final semester university examination relocations or shifts</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Faculty reassignment and lecture cancellations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Dismissal or downgrading of critical electrical / structural hazards</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

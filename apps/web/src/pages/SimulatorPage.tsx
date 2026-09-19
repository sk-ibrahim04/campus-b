import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { api } from '../services/api';
import { WhatIfSimulationResult } from '@campussynapse/shared-types';
import {
  Compass,
  Play,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Users,
  Building,
  ArrowRight,
} from 'lucide-react';

const SCENARIO_PRESETS = [
  {
    title: 'Auditorium 1 Sudden Closure',
    scenarioType: 'RESOURCE_UNAVAILABLE',
    resourceName: 'Auditorium 1 (Rabindranath Tagore Hall)',
    reason: 'Stage lighting electrical breaker trip and emergency inspection',
  },
  {
    title: 'Block C Power Grid Outage',
    scenarioType: 'POWER_OUTAGE',
    resourceName: 'Block C Computing Complex',
    reason: 'Main transformer substation routine preventive maintenance',
  },
  {
    title: 'Seminar Hall A Mechanical Air Conditioning Failure',
    scenarioType: 'RESOURCE_UNAVAILABLE',
    resourceName: 'Seminar Hall A (Sir CV Raman Hall)',
    reason: 'HVAC compressor malfunction during peak 34°C afternoon heat',
  },
  {
    title: 'Surge 300-Student State Hackathon Event Added',
    scenarioType: 'EVENT_SURGE',
    resourceName: 'Central Academic Spine',
    reason: 'Governor Innovation Challenge requiring multi-hall contiguous booking',
  },
];

export const SimulatorPage: React.FC = () => {
  const { resources, showToast } = useCampusStore();
  const [selectedPreset, setSelectedPreset] = useState(SCENARIO_PRESETS[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeWindow, setTimeWindow] = useState('14:00 - 17:00');
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      const [start, end] = timeWindow.split(' - ').map((s) => s.trim());
      const response = await api.runSimulation({
        scenarioType: selectedPreset.scenarioType,
        resourceId: selectedPreset.resourceName,
        date: targetDate,
        startTime: start,
        endTime: end,
        reason: selectedPreset.reason,
      });
      setSimulationResult(response);
      showToast('Simulation evaluated with 0 persistent state mutation.', 'success');
    } catch (err) {
      showToast('Simulation failed: ' + (err as Error).message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Predictive What-If Sandbox
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Zero State Mutation Guarantee
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <span>CAMPUS DISRUPTION & RESILIENCE SIMULATOR</span>
          </h1>
        </div>
      </div>

      {/* Scenario Builder Card */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xl space-y-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
          Step 1: Select Hypothetical Disruption Scenario
        </h3>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIO_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPreset(preset)}
              className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                selectedPreset.title === preset.title
                  ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-surface-elevated border-surface-border hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs text-white">{preset.title}</div>
              <div className="text-[11px] text-slate-400 font-mono line-clamp-2">{preset.reason}</div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                {selectedPreset.title === preset.title ? '✓ ACTIVE SELECTION' : 'SELECT'}
              </span>
            </div>
          ))}
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-surface-border/60 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">TARGET SIMULATION DATE</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">DISRUPTION TIME WINDOW</label>
            <input
              type="text"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              placeholder="14:00 - 17:00"
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRunSimulation}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-600/25 active:scale-95"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SIMULATING CONSEQUENCES...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>EXECUTE WHAT-IF SIMULATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Results (Baseline vs. Scenario vs. Impact vs. Alternatives) */}
      {simulationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Impacted Bookings</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
                {simulationResult.affectedBookings.length}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Requiring reallocation</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Affected Students</div>
              <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
                {simulationResult.affectedStudentsCount}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Across lecture cohorts</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Displaced Faculty</div>
              <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">
                {simulationResult.affectedFacultyCount}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Proactive alerts queued</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Automated Mitigations</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                {simulationResult.availableMitigationsCount}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Alternative slots verified</div>
            </div>
          </div>

          {/* Impact Matrix Table */}
          <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Direct Operational Impact Matrix</span>
            </h3>

            {simulationResult.affectedBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-surface-border text-slate-400 font-mono text-[11px]">
                      <th className="pb-3">SESSION TITLE</th>
                      <th className="pb-3">FACULTY IN CHARGE</th>
                      <th className="pb-3">ORIGINAL SPACE</th>
                      <th className="pb-3">ORIGINAL TIME</th>
                      <th className="pb-3">ATTENDEES</th>
                      <th className="pb-3 text-right">DISRUPTION LEVEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/60">
                    {simulationResult.affectedBookings.map((b, idx) => (
                      <tr key={idx} className="hover:bg-surface-elevated transition">
                        <td className="py-3 font-semibold text-slate-100">{b.title}</td>
                        <td className="py-3 text-slate-300">{b.facultyName}</td>
                        <td className="py-3 font-mono text-slate-400">{b.originalRoom}</td>
                        <td className="py-3 font-mono text-blue-400">{b.originalTime}</td>
                        <td className="py-3 font-mono text-slate-300">{b.attendeesCount}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              b.disruptionLevel === 'HIGH'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {b.disruptionLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                ✓ No active bookings in target window. Disruption is fully contained with zero displaced students.
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Simulated Mitigation Directives</span>
            </h3>
            <div className="space-y-2">
              {simulationResult.recommendedActions.map((act, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-200 flex items-start space-x-2.5"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

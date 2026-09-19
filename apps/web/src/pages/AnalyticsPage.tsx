import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, RotateCcw, ShieldCheck, Zap, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Operational Telemetry & Performance
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>CAMPUS OPERATIONAL ANALYTICS</span>
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Utilization Gain</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {data?.summary?.utilizationGainPercent || '+14.6%'}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">Over traditional ERP baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Avg Resolution Time</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">
            {data?.summary?.avgResolutionTimeMinutes || 4.2}m
          </div>
          <div className="text-[10px] text-slate-400 font-sans">From hours down to minutes</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Autonomous Interventions</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">
            {data?.summary?.autonomousActionsToday || 12}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">Level 3 auto executions</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Reclaimed Ghost Hours</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">68 hrs</div>
          <div className="text-[10px] text-slate-400 font-sans">Via 0-occupancy recovery</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Building Utilization Bar Chart */}
        <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Average Resource Utilization by Complex (%)
            </h3>
            <span className="text-[10px] font-mono text-blue-400">TELEMETRY AGGREGATED</span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.buildingUtilization || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#26334d', color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="utilization" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Conflict Trends */}
        <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
              Weekly Conflict Detection & Autonomous Resolution Rate
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">7-DAY CYCLE</span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.conflictTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#26334d', color: '#fff', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="detected" stroke="#f59e0b" name="Conflicts Detected" strokeWidth={2} />
                <Line type="monotone" dataKey="resolvedAuto" stroke="#10b981" name="Resolved Autonomously" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

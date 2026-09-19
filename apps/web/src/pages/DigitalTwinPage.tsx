import React from 'react';
import { DigitalTwinMap } from '../components/DigitalTwinMap';
import { Box, Layers, Radio, ShieldCheck, Thermometer, Zap } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';

export const DigitalTwinPage: React.FC = () => {
  const { resources } = useCampusStore();

  const totalCapacity = resources.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = resources.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
  const maintenanceCount = resources.filter((r) => r.status === 'MAINTENANCE' || r.status === 'BLOCKED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Telemetry summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Autonomous Spatial Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Websocket Telemetry Active
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Box className="w-5 h-5 text-blue-400" />
            <span>CAMPUS DIGITAL TWIN (LIVE MULTI-BLOCK SPATIAL MATRIX)</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-2 rounded bg-surface-elevated border border-surface-border flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Total Live Occupancy:</span>
            <span className="font-bold text-white">
              {totalOccupied} / {totalCapacity} seats
            </span>
          </div>
          {maintenanceCount > 0 && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center space-x-1.5">
              <span>{maintenanceCount} Hazard Lockouts</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Digital Twin Map */}
      <DigitalTwinMap />
    </div>
  );
};

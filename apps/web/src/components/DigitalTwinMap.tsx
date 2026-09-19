import React from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { Resource, ResourceStatus } from '../types';
import { Users, Thermometer, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const STATUS_STYLES: Record<
  ResourceStatus,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  AVAILABLE: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'AVAILABLE',
  },
  OCCUPIED: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
    label: 'OCCUPIED',
  },
  RESERVED: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'RESERVED',
  },
  MAINTENANCE: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'MAINTENANCE',
  },
  BLOCKED: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'BLOCKED',
  },
  UNDER_REVIEW: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
    label: 'UNDER REVIEW',
  },
};

export const DigitalTwinMap: React.FC = () => {
  const { resources, buildings, setSelectedResource, activeBuildingFilter, setActiveBuildingFilter } =
    useCampusStore();

  const filteredResources = activeBuildingFilter
    ? resources.filter((r) => r.buildingId === activeBuildingFilter)
    : resources;

  // Group by building
  const blocks = [
    {
      id: 'BLDG-A',
      title: 'BLOCK A — Engineering & Heavy Laboratories',
      rooms: filteredResources.filter((r) => r.buildingId === 'BLDG-A' || r.buildingName.includes('Block A')),
    },
    {
      id: 'BLDG-B',
      title: 'BLOCK B — Main Academic & Seminar Complex',
      rooms: filteredResources.filter((r) => r.buildingId === 'BLDG-B' || r.buildingName.includes('Block B')),
    },
    {
      id: 'BLDG-C',
      title: 'BLOCK C — Advanced Computing & Performing Arts',
      rooms: filteredResources.filter((r) => r.buildingId === 'BLDG-C' || r.buildingName.includes('Block C')),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Building Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-surface-border">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveBuildingFilter(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
              !activeBuildingFilter
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-surface-elevated text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL BLOCKS ({resources.length})
          </button>
          {buildings.map((b) => (
            <button
              key={b.id || b.code}
              onClick={() => setActiveBuildingFilter(b.id || b.code)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
                activeBuildingFilter === (b.id || b.code)
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-surface-elevated text-slate-400 hover:text-slate-200'
              }`}
            >
              {b.code}
            </button>
          ))}
        </div>

        {/* Status Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          {Object.entries(STATUS_STYLES).map(([key, style]) => (
            <div key={key} className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              <span className="text-slate-400">{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spatial Campus Grid */}
      <div className="space-y-8">
        {blocks
          .filter((b) => !activeBuildingFilter || b.id === activeBuildingFilter)
          .map((block) => (
            <div key={block.id} className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span>{block.title}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {block.rooms.length} Total Monitored Spaces
                </span>
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {block.rooms.map((room) => {
                  const style = STATUS_STYLES[room.status] || STATUS_STYLES.AVAILABLE;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedResource(room)}
                      className={`p-3.5 rounded-lg border bg-surface-elevated hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between space-y-3 group hover:border-blue-500/50 hover:shadow-lg ${style.border}`}
                    >
                      {/* Top row: Name & Status Badge */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-xs text-slate-100 group-hover:text-blue-400 transition truncate max-w-[150px]">
                            {room.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {room.code} • Floor {room.floor}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${style.bg} ${style.text} border ${style.border}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      {/* Middle: Capacity & Live Sensor Telemetry */}
                      <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded bg-slate-900/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center space-x-1" title="Capacity & Live Occupancy">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>
                            {room.currentOccupancy}/{room.capacity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1" title="Room Ambient Temperature">
                          <Thermometer className="w-3 h-3 text-slate-500" />
                          <span>{room.telemetry?.temperatureCelsius || 22}°C</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Power Draw">
                          <Zap className="w-3 h-3 text-slate-500" />
                          <span>{room.telemetry?.powerDrawWatts || 320}W</span>
                        </div>
                      </div>

                      {/* Bottom: Next availability / ongoing session */}
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60 font-sans">
                        <span className="truncate">
                          {room.maintenanceState?.isUnderMaintenance ? (
                            <span className="text-amber-400 font-mono">Hazard Lockout</span>
                          ) : (
                            <span>Next: {room.nextAvailable || 'Now'}</span>
                          )}
                        </span>
                        <span className="font-mono text-slate-500 text-[9px]">
                          Util: {room.utilizationRate || 75}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { Layers, Search, Filter, Users, Thermometer, Zap } from 'lucide-react';
import { STATUS_STYLES } from '../components/DigitalTwinMap';

export const ResourcesPage: React.FC = () => {
  const { resources, buildings, setSelectedResource } = useCampusStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.buildingName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchBuilding = selectedBuilding === 'ALL' || r.buildingId === selectedBuilding;
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchSearch && matchBuilding && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Campus Infrastructure Registry
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>CAMPUS RESOURCES & FACILITIES DIRECTORY</span>
          </h1>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Monitored Spaces: <span className="text-white font-bold">{resources.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by space name, code, or building..."
            className="w-full bg-surface border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Campus Buildings</option>
            {buildings.map((b) => (
              <option key={b.id || b.code} value={b.id || b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Operational Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="RESERVED">RESERVED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((r) => {
          const style = STATUS_STYLES[r.status] || STATUS_STYLES.AVAILABLE;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedResource(r)}
              className={`p-4 rounded-xl bg-surface border hover:border-blue-500/50 transition cursor-pointer flex flex-col justify-between space-y-3 shadow-lg group ${style.border}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] text-blue-400 font-bold">{r.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${style.bg} ${style.text} border ${style.border}`}
                  >
                    {style.label}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mt-1 group-hover:text-blue-400 transition truncate">
                  {r.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono truncate">{r.buildingName}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-surface-elevated border border-surface-border text-[10px] font-mono text-center text-slate-300">
                <div>
                  <div className="text-slate-500">Cap</div>
                  <div className="font-bold">{r.capacity}</div>
                </div>
                <div>
                  <div className="text-slate-500">Live Occ</div>
                  <div className="font-bold text-cyan-400">{r.currentOccupancy}</div>
                </div>
                <div>
                  <div className="text-slate-500">Floor</div>
                  <div className="font-bold">{r.floor}</div>
                </div>
              </div>

              {/* Equipment badges preview */}
              <div className="flex flex-wrap gap-1 text-[10px] text-slate-400 font-sans">
                {r.equipment.slice(0, 2).map((eq, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 truncate max-w-[120px]">
                    {eq}
                  </span>
                ))}
                {r.equipment.length > 2 && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                    +{r.equipment.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

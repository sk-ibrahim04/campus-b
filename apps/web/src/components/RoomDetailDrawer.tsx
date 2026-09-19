import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { STATUS_STYLES } from './DigitalTwinMap';
import {
  X,
  Users,
  Thermometer,
  Zap,
  Wind,
  CheckCircle,
  Clock,
  Calendar,
  Layers,
  Wrench,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';

export const RoomDetailDrawer: React.FC = () => {
  const { selectedResource, setSelectedResource, showToast, fetchResources, fetchDashboard } = useCampusStore();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedResource) return null;

  const style = STATUS_STYLES[selectedResource.status] || STATUS_STYLES.AVAILABLE;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await api.updateResourceStatus(selectedResource.id, newStatus, 'Manual mission control operator override');
      showToast(`Status updated to ${newStatus}`, 'success');
      await fetchResources();
      await fetchDashboard();
      setSelectedResource({ ...selectedResource, status: newStatus as any });
    } catch (err) {
      showToast('Update failed: ' + (err as Error).message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecover = async () => {
    try {
      setIsUpdating(true);
      await api.recoverResource(selectedResource.id);
      showToast(`Ghost reservation reclaimed for ${selectedResource.name}`, 'success');
      await fetchResources();
      await fetchDashboard();
      setSelectedResource({ ...selectedResource, status: 'AVAILABLE', currentOccupancy: 0 });
    } catch (err) {
      showToast('Reclaim failed: ' + (err as Error).message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition">
      <div className="w-full max-w-lg bg-surface border-l border-surface-border h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-surface-border sticky top-0 bg-surface/95 backdrop-blur z-10">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                Digital Twin Resource Telemetry
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{selectedResource.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedResource.buildingName} • Floor {selectedResource.floor}
              </p>
            </div>
            <button
              onClick={() => setSelectedResource(null)}
              className="p-1.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase border ${style.bg} ${style.text} ${style.border}`}
            >
              {style.label}
            </span>
            {selectedResource.accessibility && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ADA / Barrier-Free Accessible
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Realtime Telemetry Grid */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 radar-pulse" />
              <span>IoT Sensory Telemetry (Live Pulse)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <div className="flex items-center justify-center text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-slate-100 font-mono">
                  {selectedResource.currentOccupancy}
                  <span className="text-xs text-slate-500 font-normal">/{selectedResource.capacity}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Live Occupancy</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <div className="flex items-center justify-center text-slate-400 mb-1">
                  <Thermometer className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-slate-100 font-mono">
                  {selectedResource.telemetry?.temperatureCelsius || 22}°C
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Ambient Temp</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <div className="flex items-center justify-center text-slate-400 mb-1">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-slate-100 font-mono">
                  {selectedResource.telemetry?.powerDrawWatts || 320}W
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Power Draw</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <div className="flex items-center justify-center text-slate-400 mb-1">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-slate-100 font-mono">
                  {selectedResource.telemetry?.airQualityIndex || 42}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Air Quality AQI</div>
              </div>
            </div>
          </div>

          {/* Maintenance Notice if under repair */}
          {selectedResource.maintenanceState?.isUnderMaintenance && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <div className="font-bold font-mono uppercase">Hazard Lockout Active</div>
                <p className="text-[11px] text-amber-200/90 mt-0.5 font-sans">
                  {selectedResource.maintenanceState.issue} (Priority: {selectedResource.maintenanceState.priority})
                </p>
              </div>
            </div>
          )}

          {/* Equipment List */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Hardware & Facilities</h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedResource.equipment.map((eq, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-[11px] text-slate-300 font-sans"
                >
                  ✓ {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Schedule Timeline */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Operational Schedule Timeline</span>
              <span className="text-[10px] font-mono text-blue-400">TODAY / TOMORROW</span>
            </h3>

            {selectedResource.schedule && selectedResource.schedule.length > 0 ? (
              <div className="space-y-2">
                {selectedResource.schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.organizer} • {item.attendees} attendees
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="text-blue-400 font-bold">
                        {item.startTime} - {item.endTime}
                      </span>
                      <div className="text-[10px] text-slate-500">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border text-center text-xs text-slate-400 font-mono">
                No active bookings. Available for instant scheduling.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-surface-border bg-surface-elevated/50 space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Operator Manual State Control</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('AVAILABLE')}
              className="py-1.5 px-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold transition"
            >
              AVAILABLE
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('RESERVED')}
              className="py-1.5 px-2 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold transition"
            >
              RESERVED
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('MAINTENANCE')}
              className="py-1.5 px-2 rounded bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold transition"
            >
              MAINTENANCE
            </button>
          </div>

          {selectedResource.status === 'RESERVED' && selectedResource.currentOccupancy === 0 && (
            <button
              disabled={isUpdating}
              onClick={handleRecover}
              className="w-full py-2 px-3 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/25 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RECLAIM GHOST RESERVATION (AUTO-RECOVERY)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

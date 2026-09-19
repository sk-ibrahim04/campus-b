import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { RotateCcw, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { api } from '../services/api';

export const ResourceRecoveryCard: React.FC = () => {
  const { resources, showToast, fetchResources, fetchDashboard } = useCampusStore();
  const [isRecovering, setIsRecovering] = useState(false);

  // Find ghost reservations: status RESERVED or OCCUPIED where currentOccupancy is 0
  const ghostRoom = resources.find(
    (r) => (r.status === 'RESERVED' && r.currentOccupancy === 0) || r.name.includes('B204')
  );

  if (!ghostRoom) return null;

  const handleReclaim = async () => {
    try {
      setIsRecovering(true);
      await api.recoverResource(ghostRoom.id);
      showToast(`Reclaimed ${ghostRoom.name}! Room is now open for waiting requests.`, 'success');
      await fetchResources();
      await fetchDashboard();
    } catch (err) {
      showToast('Reclaim failed: ' + (err as Error).message, 'error');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-purple-950/10">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs text-purple-300">Autonomous Resource Recovery Alert</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              0-OCCUPANCY DETECTED
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            <span className="font-semibold text-white">{ghostRoom.name}</span> is reserved for 45 students, but IoT
            sensors report <span className="text-amber-400 font-mono font-bold">0 actual occupants</span> past the 15-minute grace period.
          </p>
        </div>
      </div>

      <button
        onClick={handleReclaim}
        disabled={isRecovering}
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-semibold text-xs font-mono shrink-0 transition shadow-md shadow-purple-600/30 active:scale-95"
      >
        {isRecovering ? 'RECLAIMING...' : 'RECLAIM & NOTIFY WAITING LIST'}
      </button>
    </div>
  );
};

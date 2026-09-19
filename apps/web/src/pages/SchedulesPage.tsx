import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Calendar, Clock, MapPin, User, AlertTriangle } from 'lucide-react';

export const SchedulesPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSchedules()
      .then((data) => setBookings(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Campus Master Timetable
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>OPERATIONAL TIMETABLE & EVENT SCHEDULES</span>
          </h1>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
          Active Scheduled Sessions ({bookings.length})
        </h3>

        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((b, idx) => (
              <div
                key={b._id || idx}
                className="p-4 rounded-lg bg-surface-elevated border border-surface-border hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{b.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {b.type}
                    </span>
                    {b.isAutonomous && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        AUTONOMOUS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px] mt-1.5">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{b.resourceName} ({b.buildingName})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{b.organizer}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="text-blue-400 font-bold flex items-center space-x-1 sm:justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    {b.date || 'Tomorrow'} • {b.attendees} attendees
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            {loading ? 'Fetching campus master schedule...' : 'No active scheduled bookings found.'}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../services/api';
import { useCampusStore } from '../store/useCampusStore';
import { Layers, Send, CheckCircle2, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RequestsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState(180);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [requirements, setRequirements] = useState('Dual Projectors, Audio System, Air Conditioning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, fetchDashboard, fetchResources } = useCampusStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const prompt = `Plan event "${title}" for ${attendees} attendees on ${date} from ${startTime} to ${endTime} with requirements: ${requirements}`;
      const res = await api.planAndOptimize({ prompt });
      showToast('Event request orchestrated into candidate plans!', 'success');
      navigate('/orchestrator');
    } catch (err) {
      showToast('Submission error: ' + (err as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Faculty & Department Portal
          </div>
          <h1 className="text-xl font-extrabold text-white mt-0.5 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>SUBMIT CAMPUS RESOURCE & EVENT REQUEST</span>
          </h1>
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="text-slate-400 font-mono block mb-1">EVENT / RESERVATION TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. National Machine Learning & Robotics Symposium"
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 font-mono block mb-1">EXPECTED ATTENDEES</label>
              <input
                type="number"
                min={5}
                max={600}
                required
                value={attendees}
                onChange={(e) => setAttendees(parseInt(e.target.value, 10))}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono block mb-1">SCHEDULE DATE</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 font-mono block mb-1">START TIME</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono block mb-1">END TIME</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono block mb-1">HARDWARE & ACCESSIBILITY REQUIREMENTS</label>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. Projector, Audio System, Wi-Fi, Wheelchair Ramp"
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'ORCHESTRATING REQUEST...' : 'SUBMIT FOR AUTONOMOUS ALLOCATION'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

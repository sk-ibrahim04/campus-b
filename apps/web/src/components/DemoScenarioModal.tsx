import React, { useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { api } from '../services/api';
import { X, Play, CheckCircle2, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEMO_STEPS = [
  { id: 1, title: 'Observe Baseline Digital Twin', desc: 'Sensing 3 campus blocks, 20+ spaces, and telemetry' },
  { id: 2, title: 'Natural Language Intent Parsing', desc: '"Plan a seminar for 180 students tomorrow from 2 PM to 5 PM"' },
  { id: 3, title: 'Multi-Agent Conflict Discovery', desc: 'ScheduleAgent flags 2:30 PM lecture clash in Seminar Hall A' },
  { id: 4, title: 'Institutional Policy Gate', desc: 'Verifies capacity ceiling, safety lockout, and admin sign-off' },
  { id: 5, title: 'OR-Tools CP-SAT Optimization', desc: 'Multi-criteria solver outputs Plan A, Plan B, and Plan C' },
  { id: 6, title: 'What-If Disruption Simulation', desc: 'Validates 0-mutation boundary and spillover risk' },
  { id: 7, title: 'Explainable AI Decision Synthesis', desc: 'Generates transparent factors checklist and composite score' },
  { id: 8, title: 'Human-in-the-Loop Approval', desc: 'Administrator signs off on Plan A recommendation' },
  { id: 9, title: 'Autonomous Execution & State Mutation', desc: 'Resource locked to RESERVED and timetable synced' },
  { id: 10, title: 'Realtime Socket.IO & Audit Log Entry', desc: 'Broadcasting updates live to mission control dashboard' },
];

export const DemoScenarioModal: React.FC = () => {
  const { isDemoModalOpen, setDemoModalOpen, showToast, fetchDashboard, fetchResources } = useCampusStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [orchestrationData, setOrchestrationData] = useState<any>(null);
  const navigate = useNavigate();

  if (!isDemoModalOpen) return null;

  const handleStartDemo = async () => {
    setIsRunning(true);
    setCurrentStep(1);

    try {
      // Step 1 & 2: Reset and Run Demo
      const response = await api.runDemo();
      setOrchestrationData(response.orchestration);

      // Animate steps for the judge
      for (let s = 2; s <= 7; s++) {
        await new Promise((r) => setTimeout(r, 600));
        setCurrentStep(s);
      }

      await fetchDashboard();
      await fetchResources();
      showToast('Candidate plans ready for Human Approval!', 'info');
    } catch (err) {
      showToast('Demo execution error: ' + (err as Error).message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveInDemo = async () => {
    if (!orchestrationData?.recommendedPlan) return;
    setIsRunning(true);

    try {
      setCurrentStep(8);
      await api.executePlan({
        planId: orchestrationData.recommendedPlan.planId,
        resourceId: orchestrationData.recommendedPlan.resourceId,
        title: 'Academic Seminar (180 Attendees)',
        attendees: 180,
        startTime: '14:00',
        endTime: '17:00',
      });

      setCurrentStep(9);
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(10);

      await fetchDashboard();
      await fetchResources();
      showToast('Seminar confirmed and Digital Twin updated live!', 'success');
    } catch (err) {
      showToast('Execution error: ' + (err as Error).message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-surface border border-surface-border rounded-xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                SIH26193 Live Judging Demonstration
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                HERO SCENARIO
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Autonomous Orchestration: "Plan a Seminar for 180 Students"
            </h3>
          </div>
          <button
            onClick={() => setDemoModalOpen(false)}
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="py-5 overflow-y-auto flex-1 space-y-3">
          {DEMO_STEPS.map((step) => {
            const isDone = currentStep >= step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-lg border transition flex items-start space-x-3 text-xs ${
                  isDone
                    ? 'bg-blue-600/10 border-blue-500/40 text-slate-200'
                    : 'bg-surface-elevated/40 border-surface-border text-slate-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent && isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-400">
                      {step.id}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-200">{step.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            {currentStep === 0 && 'Ready to initialize 13-step hackathon hero flow.'}
            {currentStep > 0 && currentStep < 8 && 'Executing AI intent understanding & constraint optimization...'}
            {currentStep === 7 && 'Candidate plans generated. Human approval required.'}
            {currentStep === 10 && 'Demonstration completed. Live twin updated.'}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep === 0 && (
              <button
                onClick={handleStartDemo}
                disabled={isRunning}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START HERO DEMO</span>
              </button>
            )}

            {currentStep >= 7 && currentStep < 10 && (
              <button
                onClick={handleApproveInDemo}
                disabled={isRunning}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-600/25 active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>APPROVE RECOMMENDATION (HUMAN SIGN-OFF)</span>
              </button>
            )}

            {currentStep === 10 && (
              <button
                onClick={() => {
                  setDemoModalOpen(false);
                  navigate('/digital-twin');
                }}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 transition"
              >
                <span>VIEW LIVE DIGITAL TWIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

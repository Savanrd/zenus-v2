import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Clock, ShieldAlert, Cpu, Radio, Sparkles, ChevronRight
} from 'lucide-react';
import { NetworkEvent } from '../types';

interface ReplayTimelineProps {
  events: NetworkEvent[];
  onCurrentStepChange?: (stepIndex: number, currentEvent: NetworkEvent) => void;
}

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  events,
  onCurrentStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const timerRef = useRef<number | null>(null);

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Auto-advance step during playback
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 2000 / speedMultiplier;
      timerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= sortedEvents.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, sortedEvents.length]);

  // Trigger callback when current step changes
  useEffect(() => {
    if (sortedEvents[currentStep] && onCurrentStepChange) {
      onCurrentStepChange(currentStep, sortedEvents[currentStep]);
    }
  }, [currentStep, sortedEvents, onCurrentStepChange]);

  const togglePlay = () => {
    if (currentStep >= sortedEvents.length - 1 && !isPlaying) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(sortedEvents.length - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const activeEvent = sortedEvents[currentStep];

  if (!sortedEvents || sortedEvents.length === 0) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 font-mono text-sm">
        No events available in incident timeline reconstruction.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl glass-panel border border-cyan-500/20 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset to Step 1"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all border border-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            title="Previous Step"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-all border border-slate-800"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>REPLAY INCIDENT</span>
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === sortedEvents.length - 1}
            title="Next Step"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-all border border-slate-800"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress & Timestamp */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono">
            <span className="text-slate-400">Step: </span>
            <span className="text-cyan-400 font-bold">{currentStep + 1}</span>
            <span className="text-slate-500"> / {sortedEvents.length}</span>
          </div>

          {activeEvent && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeEvent.timestamp}</span>
            </div>
          )}

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {[0.5, 1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  speedMultiplier === speed
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="relative px-2">
        <input
          type="range"
          min={0}
          max={sortedEvents.length - 1}
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>Start: {sortedEvents[0]?.timestamp.split(' ')[1] || ''}</span>
          <span>End: {sortedEvents[sortedEvents.length - 1]?.timestamp.split(' ')[1] || ''}</span>
        </div>
      </div>

      {/* Sequential Timeline Event Stream */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {sortedEvents.map((event, idx) => {
          const isActive = idx === currentStep;
          const isPassed = idx < currentStep;
          const isRoot = idx === 0;

          return (
            <div
              key={event.id}
              onClick={() => setCurrentStep(idx)}
              className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-start gap-3.5 ${
                isActive
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : isPassed
                  ? 'border-slate-800 bg-slate-900/60 opacity-90'
                  : 'border-slate-800/40 bg-slate-950/40 opacity-40 hover:opacity-75'
              }`}
            >
              {/* Sequence Badge / Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                isRoot
                  ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-md shadow-purple-500/30'
                  : isActive
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {isRoot ? <Sparkles className="w-4 h-4" /> : `#${idx + 1}`}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200 text-xs tracking-wide">
                      {event.network_component}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {event.event_type}
                    </span>
                    {isRoot && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300">
                        ROOT TRIGGER
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      event.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : event.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {event.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {event.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-1.5">
                  {event.description}
                </p>

                {/* Telemetry pill */}
                {event.metric_name && (
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-slate-400">{event.metric_name}:</span>
                    <span className="text-cyan-300 font-bold">
                      {event.metric_value} {event.metric_unit || ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

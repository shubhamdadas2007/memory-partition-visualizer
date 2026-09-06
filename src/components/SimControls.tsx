import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge } from 'lucide-react';

interface SimControlsProps {
  isPlaying: boolean;
  speedMs: number;
  onPlayPause: () => void;
  onStepNext: () => void;
  onStepPrev: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const SimControls: React.FC<SimControlsProps> = ({
  isPlaying,
  speedMs,
  onPlayPause,
  onStepNext,
  onStepPrev,
  onReset,
  onSpeedChange
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onStepPrev}
          disabled={isPlaying}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Previous Step (Undo)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayPause}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" /> Pause Simulation
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Auto Play Steps
            </>
          )}
        </button>

        <button
          onClick={onStepNext}
          disabled={isPlaying}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Next Step"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          title="Reset Simulation State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <!-- Speed Control Slider -->
      <div className="flex items-center gap-3">
        <Gauge className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400">Step Delay:</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speedMs}
            onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
            className="w-28 accent-cyan-400 bg-slate-950 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-cyan-400 w-12 text-right">
            {speedMs}ms
          </span>
        </div>
      </div>
    </div>
  );
};

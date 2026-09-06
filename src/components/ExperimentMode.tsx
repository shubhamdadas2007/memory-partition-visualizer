import React, { useState } from 'react';
import { LAB_EXPERIMENTS } from '../data/experimentsData';
import { LabExperiment, PartitionScheme, FitAlgorithm } from '../types';
import { PlayCircle, CheckCircle, BookOpen, ChevronRight, RotateCcw } from 'lucide-react';

interface ExperimentModeProps {
  onLoadExperiment: (exp: LabExperiment) => void;
}

export const ExperimentMode: React.FC<ExperimentModeProps> = ({ onLoadExperiment }) => {
  const [selectedExp, setSelectedExp] = useState<LabExperiment>(LAB_EXPERIMENTS[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Sidebar: Experiment List -->
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            OS Laboratory Curriculum (7 Experiments)
          </h3>
          <p className="text-xs text-slate-400">Select an experiment to run its interactive OS lab workflow.</p>
        </div>

        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
          {LAB_EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp)}
              className={`p-3 text-left rounded-xl border transition-all flex items-center justify-between gap-2 ${
                selectedExp.id === exp.id
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-md'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-emerald-400">{exp.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{exp.objective}</div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${selectedExp.id === exp.id ? 'text-emerald-400' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>
      </div>

      <!-- Main Detail Panel -->
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
              OFFICIAL OS LAB EXPERIMENT
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1.5">{selectedExp.title}</h2>
          </div>

          <button
            onClick={() => onLoadExperiment(selectedExp)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <PlayCircle className="w-4 h-4 fill-current" />
            Load & Run Experiment in Simulator
          </button>
        </div>

        <!-- Objective & Given Configuration -->
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">Objective</span>
            <p className="text-slate-200 font-sans text-xs leading-relaxed">{selectedExp.objective}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">Given Memory Setup</span>
            <div>RAM Capacity: <strong className="text-cyan-400">{selectedExp.memorySize} KB</strong></div>
            <div>OS Reserved: <strong className="text-cyan-400">{selectedExp.osSize} KB</strong></div>
            <div>Scheme: <strong className="text-white uppercase">{selectedExp.scheme}</strong></div>
            <div>Algorithm: <strong className="text-amber-400 uppercase">{selectedExp.algorithm} FIT</strong></div>
          </div>
        </div>

        <!-- Workload Action Sequence -->
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Process Workload Action Sequence ({selectedExp.actions.length} Steps)
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedExp.actions.map((act, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                  act.type === 'allocate'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : act.type === 'deallocate'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <span className="font-bold">{idx + 1}.</span>
                <span>{act.type.toUpperCase()}</span>
                <strong className="text-white">{act.id}</strong>
                {act.size && <span>({act.size} KB)</span>}
              </div>
            ))}
          </div>
        </div>

        <!-- Academic Expected Concept & Conclusion -->
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-indigo-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Expected OS Concept
            </span>
            <p className="text-slate-300 leading-relaxed">{selectedExp.expectedConcept}</p>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Academic Conclusion
            </span>
            <p className="text-slate-300 leading-relaxed">{selectedExp.conclusion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

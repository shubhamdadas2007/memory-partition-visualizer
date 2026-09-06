import React from 'react';
import { Cpu, PlayCircle, BookOpen, HelpCircle, FileText, BarChart2, Layers, Award, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemo: () => void;
  onOpenExport: () => void;
  onRandomScenario: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunDemo,
  onOpenExport,
  onRandomScenario
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-xl">
      <!-- Top OS System Status Line -->
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-1.5 text-xs font-mono text-cyan-400 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            OS KERNEL ACTIVE
          </span>
          <span className="text-slate-600">|</span>
          <span>PHYSICAL MEMORY CONTIGUOUS ALLOCATION SIMULATOR</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <span>ADDRESS SPACE: 0 KB — 1024 KB</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-semibold">ACADEMIC 10/10 CONSOLE</span>
        </div>
      </div>

      <!-- Main Header Banner -->
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <!-- Logo -->
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('simulator')}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              MEMORYMAP PRO
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold">
                OS LAB
              </span>
            </h1>
            <p className="text-xs text-slate-400">Main Memory Allocation & Fragmentation Laboratory</p>
          </div>
        </div>

        <!-- Right Quick Action Controls -->
        <div className="flex items-center gap-2">
          <button
            onClick={onRandomScenario}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Generate Random Scenario with Reproducible Seed"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Random Scenario
          </button>

          <button
            onClick={onRunDemo}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            title="Run Automated Guided Presentation Demo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Demo Mode
          </button>

          <button
            onClick={onOpenExport}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Generate & Print Academic Laboratory Report"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Print Lab Report
          </button>
        </div>
      </div>

      <!-- Navigation Tabs Bar -->
      <div className="px-6 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'simulator'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Simulator Arena
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'benchmark'
              ? 'border-indigo-400 text-indigo-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          4-Algorithm Benchmark
        </button>

        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'experiments'
              ? 'border-emerald-400 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          Experiment Mode (7 Labs)
        </button>
      </div>
    </header>
  );
};

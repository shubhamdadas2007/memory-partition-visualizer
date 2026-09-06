import React from 'react';
import { PartitionScheme, FitAlgorithm } from '../types';
import { Sliders, Zap, RotateCcw } from 'lucide-react';

interface MemoryConfigProps {
  memorySize: number;
  osSize: number;
  scheme: PartitionScheme;
  algorithm: FitAlgorithm;
  onConfigChange: (scheme: PartitionScheme, algorithm: FitAlgorithm, memorySize?: number, osSize?: number) => void;
  onCompact: () => void;
  onReset: () => void;
  onLoadPreset: (presetId: string) => void;
}

export const MemoryConfig: React.FC<MemoryConfigProps> = ({
  memorySize,
  osSize,
  scheme,
  algorithm,
  onConfigChange,
  onCompact,
  onReset,
  onLoadPreset
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
            1
          </span>
          Memory Configuration
        </h3>
        <Sliders className="w-4 h-4 text-slate-400" />
      </div>

      <!-- Memory Size Presets -->
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Total Memory Capacity (KB):
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[512, 1024, 2048, 4096].map((size) => (
            <button
              key={size}
              onClick={() => onConfigChange(scheme, algorithm, size, osSize)}
              className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                memorySize === size
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {size} KB
            </button>
          ))}
        </div>
      </div>

      <!-- Partition Scheme Selection -->
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Partitioning Scheme:
        </label>
        <select
          value={scheme}
          onChange={(e) => onConfigChange(e.target.value as PartitionScheme, algorithm)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400"
        >
          <option value="dynamic">Dynamic Partitioning (Variable Holes)</option>
          <option value="fixed-equal">Fixed Equal Partitions (8x128 KB)</option>
          <option value="fixed-unequal">Fixed Unequal Partitions (64, 128, 256, 448 KB)</option>
        </select>
        <p className="text-[11px] text-slate-500 mt-1">
          {scheme === 'dynamic'
            ? '✓ Zero internal frag. Leftovers become free holes. External frag develops over time.'
            : '✓ Partition boundaries set at boot. Generates internal frag when process < partition.'}
        </p>
      </div>

      <!-- Placement Algorithm Selection -->
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Placement Fit Algorithm:
        </label>
        <select
          value={algorithm}
          onChange={(e) => onConfigChange(scheme, e.target.value as FitAlgorithm)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400"
        >
          <option value="first">First Fit (Scans from 0 KB)</option>
          <option value="best">Best Fit (Minimizes residual waste)</option>
          <option value="worst">Worst Fit (Maximizes remaining hole)</option>
          <option value="next">Next Fit (Rotational cursor pointer)</option>
        </select>
      </div>

      <!-- Memory Action Buttons -->
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onCompact}
          disabled={scheme !== 'dynamic'}
          className="px-3 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
          title="Compact Memory: Slide processes down to low memory and merge all free fragments"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Compact Memory
        </button>

        <button
          onClick={onReset}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset State
        </button>
      </div>

      <!-- Educational Preset Scenarios Quick Picker -->
      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Academic Textbook Presets:
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onLoadPreset('internal-frag-trap')}
            className="p-2 text-left bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-lg transition-all"
          >
            <div className="text-[11px] font-bold text-amber-400">Internal Frag Trap</div>
            <div className="text-[10px] text-slate-500">Fixed equal partitions</div>
          </button>

          <button
            onClick={() => onLoadPreset('external-frag-failure')}
            className="p-2 text-left bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 rounded-lg transition-all"
          >
            <div className="text-[11px] font-bold text-rose-400">External Frag Failure</div>
            <div className="text-[10px] text-slate-500">Non-contiguous holes</div>
          </button>

          <button
            onClick={() => onLoadPreset('best-vs-worst')}
            className="p-2 text-left bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-lg transition-all"
          >
            <div className="text-[11px] font-bold text-cyan-400">Best vs Worst Fit</div>
            <div className="text-[10px] text-slate-500">Residual fragment test</div>
          </button>

          <button
            onClick={() => onLoadPreset('compaction-demo')}
            className="p-2 text-left bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition-all"
          >
            <div className="text-[11px] font-bold text-indigo-400">Defragmentation</div>
            <div className="text-[10px] text-slate-500">Compaction demo</div>
          </button>
        </div>
      </div>
    </div>
  );
};

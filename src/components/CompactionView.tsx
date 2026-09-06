import React from 'react';
import { Metrics } from '../types';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CompactionViewProps {
  metrics: Metrics;
  onCompact: () => void;
}

export const CompactionView: React.FC<CompactionViewProps> = ({
  metrics,
  onCompact
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 fill-current" />
          Memory Compaction (Defragmentation Engine)
        </h4>
        <button
          onClick={onCompact}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Trigger Compaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Before Compaction Metrics -->
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 font-mono text-xs">
          <div className="font-extrabold text-rose-400 border-b border-slate-800 pb-1.5 flex justify-between">
            <span>CURRENT STATE (BEFORE)</span>
            <span>{metrics.freeHolesCount} Free Holes</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total Free RAM:</span>
            <strong className="text-white">{metrics.freeRam} KB</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Largest Contiguous Hole:</span>
            <strong className="text-rose-400">{metrics.largestFreeBlock} KB</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>External Fragmentation:</span>
            <strong className="text-amber-400">{metrics.externalFrag} KB</strong>
          </div>
        </div>

        <!-- After Compaction Projection -->
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2 font-mono text-xs shadow-inner">
          <div className="font-extrabold text-emerald-400 border-b border-slate-800 pb-1.5 flex justify-between">
            <span>PROJECTED STATE (AFTER)</span>
            <span className="text-emerald-400 font-bold">1 Contiguous Hole</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total Free RAM:</span>
            <strong className="text-white">{metrics.freeRam} KB</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Largest Contiguous Hole:</span>
            <strong className="text-emerald-400 font-bold">{metrics.freeRam} KB</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>External Fragmentation:</span>
            <strong className="text-emerald-400">0 KB (Eliminated!)</strong>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 italic">
        💡 <strong>OS Academic Concept:</strong> Compaction relocates active processes down to low physical memory, consolidating scattered free holes into a single contiguous block at high memory addresses.
      </p>
    </div>
  );
};

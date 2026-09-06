import React, { useState } from 'react';
import { MemoryBlock, FitAlgorithm, Metrics } from '../types';
import { AlertTriangle, Zap, Info } from 'lucide-react';

interface MemoryMapProps {
  blocks: MemoryBlock[];
  totalRam: number;
  algorithm: FitAlgorithm;
  nextFitPointer: number;
  metrics: Metrics;
  onSelectBlock: (block: MemoryBlock) => void;
  onDeallocateProcess: (processId: string) => void;
  onCompact: () => void;
}

export const MemoryMap: React.FC<MemoryMapProps> = ({
  blocks,
  totalRam,
  algorithm,
  nextFitPointer,
  metrics,
  onSelectBlock,
  onDeallocateProcess,
  onCompact
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<MemoryBlock | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent, block: MemoryBlock) => {
    setHoveredBlock(block);
    setTooltipPos({ x: e.clientX + 14, y: e.clientY + 14 });
  };

  const handleMouseLeave = () => {
    setHoveredBlock(null);
  };

  // Generate address ruler ticks every 128 KB
  const stepKb = 128;
  const rulerTicks: { kb: number; hex: string; pct: number }[] = [];
  for (let kb = 0; kb <= totalRam; kb += stepKb) {
    const pct = (kb / totalRam) * 100;
    const hex = '0x' + kb.toString(16).padStart(4, '0').toUpperCase();
    rulerTicks.push({ kb, hex, pct });
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4 relative">
      <!-- High Priority Fragmentation-Induced Allocation Failure Banner -->
      {metrics.fragInducedFailure && (
        <div className="bg-gradient-to-r from-rose-900/40 via-red-900/60 to-rose-900/40 border border-rose-500/80 rounded-xl p-4 text-rose-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-rose-900/30 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white font-extrabold text-sm block">
                🚨 ALLOCATION FAILURE: External Fragmentation Detected!
              </strong>
              <span>
                Total Free Memory ({metrics.freeRam} KB) is sufficient for process request, but distributed across {metrics.freeHolesCount} non-contiguous holes! Largest single block is only {metrics.largestFreeBlock} KB.
              </span>
            </div>
          </div>

          <button
            onClick={onCompact}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            Compact Memory Now
          </button>
        </div>
      )}

      <!-- Toolbar & Legend -->
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-600" /> OS Kernel Reserved
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-cyan-600 to-indigo-700" /> Allocated Process
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/60" /> Internal Frag (Fixed Mode)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-dashed border-rose-500" /> External Frag Hole
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" /> Free Memory Block
          </span>
        </div>

        {algorithm === 'next' && (
          <span className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px] bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            CPU Search Cursor: {nextFitPointer} KB
          </span>
        )}
      </div>

      <!-- Linear Physical Memory Track & Address Ruler -->
      <div className="memory-map-wrapper flex flex-col gap-1.5">
        <!-- Address Ruler in KB -->
        <div className="h-6 relative border-b border-slate-800 font-mono text-[10px] text-slate-500">
          {rulerTicks.map((tick) => (
            <div
              key={tick.kb}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${tick.pct}%` }}
            >
              <span>{tick.kb} KB ({tick.hex})</span>
              <span className="w-[1px] h-1.5 bg-slate-700 mt-0.5" />
            </div>
          ))}
        </div>

        <!-- Physical Memory Track Bar (STRICTLY CONTAINED STRICT RELATIVE LAYOUT) -->
        <div className="h-36 bg-slate-950 rounded-xl border border-slate-800 flex overflow-hidden relative shadow-inner">
          {blocks.map((block) => {
            const widthPct = (block.size / totalRam) * 100;

            if (block.status === 'os') {
              return (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock(block)}
                  onMouseMove={(e) => handleMouseMove(e, block)}
                  onMouseLeave={handleMouseLeave}
                  style={{ width: `${widthPct}%` }}
                  className="h-full bg-slate-800 border-r-2 border-slate-600/50 p-2.5 flex flex-col justify-between font-mono text-slate-400 cursor-pointer hover:brightness-110 transition-all select-none"
                >
                  <div className="font-extrabold text-xs text-cyan-400">OS Kernel</div>
                  <div className="text-[11px]">{block.size} KB</div>
                  <div className="text-[9px] opacity-75">{block.startAddr} - {block.endAddr} KB</div>
                </div>
              );
            }

            if (block.status === 'allocated') {
              const internalPct = block.internalFrag > 0 ? (block.internalFrag / block.size) * 100 : 0;

              return (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock(block)}
                  onMouseMove={(e) => handleMouseMove(e, block)}
                  onMouseLeave={handleMouseLeave}
                  style={{ width: `${widthPct}%` }}
                  className="h-full bg-gradient-to-br from-cyan-700 to-indigo-800 border-r border-white/20 p-2.5 flex flex-col justify-between font-mono text-white cursor-pointer hover:brightness-115 transition-all relative select-none shadow-md"
                >
                  <div className="font-extrabold text-xs flex justify-between items-center">
                    <span className="truncate">{block.processId}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        block.processId && onDeallocateProcess(block.processId);
                      }}
                      className="px-1.5 py-0.5 bg-rose-500/20 hover:bg-rose-500 text-slate-200 hover:text-white rounded text-[10px] font-sans font-bold border border-rose-500/30 transition-all"
                      title="Free Process Memory"
                    >
                      ×
                    </button>
                  </div>

                  <div className="text-[11px]">{block.reqSize || block.size} KB</div>
                  <div className="text-[9px] opacity-80">{block.startAddr} - {block.endAddr} KB</div>

                  {/* Fixed Mode Internal Frag Overlay */}
                  {block.internalFrag > 0 && (
                    <div
                      style={{ width: `${internalPct}%` }}
                      className="absolute top-0 right-0 bottom-0 bg-amber-500/30 border-l-2 border-dashed border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-200 shadow-inner"
                      title={`Internal Fragmentation: ${block.internalFrag} KB wasted inside fixed partition`}
                    >
                      Frag: {block.internalFrag}K
                    </div>
                  )}
                </div>
              );
            }

            // Free Hole Block
            const isAlert = metrics.fragInducedFailure;

            return (
              <div
                key={block.id}
                onClick={() => onSelectBlock(block)}
                onMouseMove={(e) => handleMouseMove(e, block)}
                onMouseLeave={handleMouseLeave}
                style={{ width: `${widthPct}%` }}
                className={`h-full bg-slate-950/70 border-r border-dashed border-slate-800 p-2.5 flex flex-col justify-between font-mono text-slate-500 cursor-pointer hover:brightness-125 transition-all select-none ${
                  isAlert ? 'bg-rose-500/20 border-2 border-dashed border-rose-500 animate-pulse' : ''
                }`}
              >
                <div className="font-bold text-xs text-slate-400">FREE</div>
                <div className="text-[11px]">{block.size} KB</div>
                <div className="text-[9px] opacity-70">{block.startAddr} - {block.endAddr} KB</div>
              </div>
            );
          })}

          {/* Next Fit Cursor Line (STRICTLY CONTAINED) */}
          {algorithm === 'next' && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_#fbbf24] z-20 pointer-events-none transition-all duration-300"
              style={{ left: `${(nextFitPointer / totalRam) * 100}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono shadow">
                CURSOR
              </span>
            </div>
          )}
        </div>
      </div>

      <!-- Floating Hover Tooltip -->
      {hoveredBlock && (
        <div
          className="fixed pointer-events-none bg-slate-900 border border-cyan-400/80 rounded-xl p-3 text-xs font-mono text-white shadow-2xl z-50 w-56 backdrop-blur-md"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
            <span>{hoveredBlock.processId || 'Free Memory Hole'}</span>
            <span className="uppercase text-[10px] text-slate-400">{hoveredBlock.status}</span>
          </div>
          <div className="flex flex-col gap-0.5 text-slate-300">
            <div>Address Range: <strong className="text-white">{hoveredBlock.startAddr} — {hoveredBlock.endAddr} KB</strong></div>
            <div>Hex Offset: <strong className="text-slate-400">0x{hoveredBlock.startAddr.toString(16).padStart(4,'0').toUpperCase()}</strong></div>
            <div>Capacity: <strong className="text-white">{hoveredBlock.size} KB</strong></div>
            {hoveredBlock.status === 'allocated' && (
              <>
                <div>Requested: <strong className="text-cyan-400">{hoveredBlock.reqSize} KB</strong></div>
                {hoveredBlock.internalFrag > 0 && (
                  <div className="text-amber-400 font-bold">Internal Frag: {hoveredBlock.internalFrag} KB</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

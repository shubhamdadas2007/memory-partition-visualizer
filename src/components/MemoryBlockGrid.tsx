import React from 'react';
import { MemoryBlock } from '../types';
import { Grid } from 'lucide-react';

interface MemoryBlockGridProps {
  blocks: MemoryBlock[];
  totalRam: number;
  onSelectBlock: (block: MemoryBlock) => void;
}

export const MemoryBlockGrid: React.FC<MemoryBlockGridProps> = ({
  blocks,
  totalRam,
  onSelectBlock
}) => {
  const totalGridBlocks = 64; // 1024 KB / 16 KB per frame/block
  const blockSizeKb = totalRam / totalGridBlocks; // 16 KB

  const gridCells = [];
  for (let i = 0; i < totalGridBlocks; i++) {
    const startAddr = i * blockSizeKb;
    const block = blocks.find(b => startAddr >= b.startAddr && startAddr < b.endAddr);

    gridCells.push({
      index: i,
      startAddr,
      endAddr: startAddr + blockSizeKb,
      block
    });
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Memory Block Partition Overview (64 Units @ {blockSizeKb} KB per Block Unit)
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Block #0 (0 KB) to Block #63 ({totalRam - blockSizeKb} KB)
        </span>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 font-mono text-[10px]">
        {gridCells.map((cell) => {
          const b = cell.block;
          let statusClass = 'bg-slate-950/80 border-slate-800 text-slate-600 hover:border-slate-600';
          let label = 'FREE';

          if (b) {
            if (b.status === 'os') {
              statusClass = 'bg-slate-800 border-slate-600 text-cyan-400 font-bold';
              label = 'SYS';
            } else if (b.status === 'allocated') {
              statusClass = 'bg-gradient-to-br from-cyan-700 to-indigo-800 border-cyan-500/50 text-white font-bold shadow-sm';
              label = b.processId || 'PROC';
            }
          }

          return (
            <div
              key={cell.index}
              onClick={() => b && onSelectBlock(b)}
              className={`h-11 rounded-lg border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${statusClass}`}
              title={`Block #${cell.index} (${cell.startAddr} - ${cell.endAddr} KB): ${b ? (b.processId || b.status) : 'Free'}`}
            >
              <span className="font-bold">B{cell.index.toString().padStart(2, '0')}</span>
              <span className="text-[9px] opacity-80 truncate max-w-full">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

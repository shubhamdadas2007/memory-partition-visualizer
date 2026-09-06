import React from 'react';
import { Process, MemoryBlock, PartitionScheme } from '../types';
import { Table, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface TablesProps {
  processes: Process[];
  blocks: MemoryBlock[];
  scheme: PartitionScheme;
  onDeallocateProcess: (id: string) => void;
}

export const Tables: React.FC<TablesProps> = ({
  processes,
  blocks,
  scheme,
  onDeallocateProcess
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Process Status Table -->
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            Process Allocation Queue & Status Table
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {processes.length} Processes Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-2">PID</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2 text-right">Req Size</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2 text-right">Internal Frag</th>
                <th className="py-2 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {processes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500 italic font-sans text-xs">
                    No processes added yet. Use Process Management panel to add processes.
                  </td>
                </tr>
              ) : (
                processes.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 font-bold text-cyan-400">{proc.id}</td>
                    <td className="py-2 px-2 font-sans font-medium text-slate-300">{proc.name}</td>
                    <td className="py-2 px-2 text-right font-bold">{proc.reqSize} KB</td>
                    <td className="py-2 px-2">
                      {proc.status === 'allocated' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> Allocated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {scheme === 'dynamic' ? (
                        <span className="text-slate-500">0 KB (Dynamic)</span>
                      ) : (
                        <span className="text-amber-400 font-bold">{proc.internalFrag || 0} KB</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {proc.status === 'allocated' && (
                        <button
                          onClick={() => onDeallocateProcess(proc.id)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded text-[10px] font-sans font-bold border border-rose-500/30 transition-all"
                        >
                          Free
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Memory Segment Table -->
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-400" />
            Physical Memory Segment Address Map
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {blocks.length} Memory Blocks
          </span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2 px-2">Block ID</th>
                <th className="py-2 px-2">Range (KB)</th>
                <th className="py-2 px-2">Hex Offset</th>
                <th className="py-2 px-2 text-right">Size</th>
                <th className="py-2 px-2">Status / Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {blocks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-2 font-bold text-slate-300">{b.id.substring(0, 14)}</td>
                  <td className="py-2 px-2 text-cyan-400 font-bold">{b.startAddr} — {b.endAddr} KB</td>
                  <td className="py-2 px-2 text-slate-400">0x{b.startAddr.toString(16).padStart(4, '0').toUpperCase()}</td>
                  <td className="py-2 px-2 text-right font-bold">{b.size} KB</td>
                  <td className="py-2 px-2">
                    {b.status === 'os' && <span className="text-cyan-400 font-bold">OS Kernel</span>}
                    {b.status === 'allocated' && <span className="text-emerald-400 font-bold">{b.processId} ({b.reqSize} KB)</span>}
                    {b.status === 'free' && <span className="text-slate-500 font-bold">FREE HOLE</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

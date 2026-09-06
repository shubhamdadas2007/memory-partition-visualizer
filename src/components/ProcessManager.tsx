import React, { useState } from 'react';
import { MemoryBlock } from '../types';
import { Plus, Trash2, AlertCircle, XCircle } from 'lucide-react';

interface ProcessManagerProps {
  allocatedBlocks: MemoryBlock[];
  maxAvailableKb: number;
  onAllocateProcess: (id: string, reqSize: number, name?: string) => void;
  onDeallocateProcess: (id: string) => void;
  onClearProcesses: () => void;
}

export const ProcessManager: React.FC<ProcessManagerProps> = ({
  allocatedBlocks,
  maxAvailableKb,
  onAllocateProcess,
  onDeallocateProcess,
  onClearProcesses
}) => {
  const [procId, setProcId] = useState('P1');
  const [procName, setProcName] = useState('Process 1');
  const [procSize, setProcSize] = useState(150);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [procCounter, setProcCounter] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!procId.trim()) {
      setErrorMsg('Process ID is required.');
      return;
    }

    if (procSize <= 0) {
      setErrorMsg('Process size must be greater than 0 KB.');
      return;
    }

    if (procSize > maxAvailableKb) {
      setErrorMsg(`Process size (${procSize} KB) exceeds total user memory capacity (${maxAvailableKb} KB).`);
      return;
    }

    onAllocateProcess(procId.trim(), procSize, procName.trim());
    
    // Auto increment default PID & Name
    const nextNum = procCounter + 1;
    setProcCounter(nextNum);
    setProcId(`P${nextNum}`);
    setProcName(`Process ${nextNum}`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
            2
          </span>
          Process Management
        </h3>
        <button
          onClick={onClearProcesses}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-all"
          title="Deallocate all active processes"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <!-- Inline Error Toast -->
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <!-- Allocation Form -->
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Process ID:</label>
            <input
              type="text"
              value={procId}
              onChange={(e) => setProcId(e.target.value)}
              placeholder="e.g. P1"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Process Name:</label>
            <input
              type="text"
              value={procName}
              onChange={(e) => setProcName(e.target.value)}
              placeholder="e.g. Chrome"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Memory Requirement (KB):
          </label>
          <input
            type="number"
            value={procSize}
            onChange={(e) => setProcSize(parseInt(e.target.value, 10) || 0)}
            min="10"
            max={maxAvailableKb}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Allocate Process Block
        </button>
      </form>

      <!-- Active Processes Termination Manager -->
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>Active Processes ({allocatedBlocks.length})</span>
          <span className="text-[10px] text-slate-500">Click Free to Deallocate</span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
          {allocatedBlocks.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-2 text-center bg-slate-950/40 rounded-xl border border-slate-800/50">
              No active allocated processes in memory.
            </div>
          ) : (
            allocatedBlocks.map((block) => (
              <div
                key={block.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between font-mono text-xs hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>{block.processId}</span>
                    <span className="text-[10px] font-sans font-normal text-slate-400">({block.processName || block.processId})</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {block.reqSize} KB @ {block.startAddr} — {block.endAddr} KB
                  </div>
                </div>

                <button
                  onClick={() => block.processId && onDeallocateProcess(block.processId)}
                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-lg text-[11px] font-sans font-bold transition-all"
                >
                  Free
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

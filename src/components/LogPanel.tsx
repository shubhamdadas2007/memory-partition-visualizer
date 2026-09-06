import React from 'react';
import { Terminal, Trash2, Download } from 'lucide-react';

interface LogPanelProps {
  logs: string[];
  onClearLogs: () => void;
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs, onClearLogs }) => {
  const handleExportLog = () => {
    const text = logs.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorymap-trace-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          OS Allocation Event Log & Algorithm Step Trace
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLog}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold transition-all"
            title="Download trace log text file"
          >
            <Download className="w-3.5 h-3.5" /> Export Log
          </button>
          <button
            onClick={onClearLogs}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition-all"
            title="Clear event trace console"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="bg-slate-955 border border-slate-900 rounded-xl p-3 font-mono text-xs text-slate-300 h-64 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic text-center py-6">
            Event console ready. Add a process or choose an algorithm to inspect real-time candidate search logs.
          </div>
        ) : (
          logs.map((log, idx) => {
            let colorClass = 'text-slate-300';
            if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400 font-bold';
            if (log.includes('🚨') || log.includes('[FAILED]')) colorClass = 'text-rose-400 font-bold';
            if (log.includes('[FIRST FIT TRACE]') || log.includes('[BEST FIT TRACE]') || log.includes('[WORST FIT TRACE]') || log.includes('[NEXT FIT TRACE]')) {
              colorClass = 'text-cyan-300 font-bold';
            }
            if (log.includes('[COALESCING]') || log.includes('[COMPACTION]')) colorClass = 'text-amber-400 font-bold';

            return (
              <div key={idx} className={`leading-relaxed ${colorClass}`}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

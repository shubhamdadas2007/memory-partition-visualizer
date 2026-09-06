import React from 'react';
import { Metrics, MemoryBlock, Process, PartitionScheme, FitAlgorithm } from '../types';
import { FileText, Download, Printer, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: Metrics;
  blocks: MemoryBlock[];
  processes: Process[];
  scheme: PartitionScheme;
  algorithm: FitAlgorithm;
  logs: string[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  blocks,
  processes,
  scheme,
  algorithm,
  logs
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'Process ID,Name,Required Size (KB),Status,Internal Frag (KB)\n';
    processes.forEach(p => {
      csv += `${p.id},"${p.name}",${p.reqSize},${p.status},${p.internalFrag || 0}\n`;
    });

    csv += '\nMemory Block,Start Address (KB),End Address (KB),Size (KB),Status,Process\n';
    blocks.forEach(b => {
      csv += `${b.id},${b.startAddr},${b.endAddr},${b.size},${b.status},${b.processId || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorymap-lab-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      configuration: { scheme, algorithm, totalRam: metrics.totalRam, osSize: metrics.osSize },
      metrics,
      processes,
      blocks
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorymap-scenario-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-white flex flex-col gap-5 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none">
        
        <!-- Header -->
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-extrabold">Academic OS Laboratory Report Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <!-- Printable Academic Document Container -->
        <div className="flex flex-col gap-4 font-mono text-xs print:font-sans">
          <!-- Report Header -->
          <div className="border-b-2 border-slate-700 pb-3 print:border-black">
            <div className="text-xl font-extrabold tracking-tight text-cyan-400 print:text-black">
              MEMORYMAP PRO // OPERATING SYSTEMS LAB REPORT
            </div>
            <div className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
              Subject: Main Memory Contiguous Partition Allocation & Fragmentation Laboratory
            </div>
            <div className="text-[11px] text-slate-500 print:text-gray-500 mt-1">
              Generated: {new Date().toLocaleString()} | Simulator Version 1.0 (Offline-First)
            </div>
          </div>

          <!-- Configuration & Metrics Summary -->
          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
            <div>
              <strong className="text-white print:text-black block mb-1">System Configuration:</strong>
              <div>Total RAM Capacity: <strong>{metrics.totalRam} KB</strong></div>
              <div>OS Kernel Space: <strong>{metrics.osSize} KB</strong></div>
              <div>User Space Available: <strong>{metrics.availableRam} KB</strong></div>
              <div>Partitioning Scheme: <strong>{scheme.toUpperCase()}</strong></div>
              <div>Placement Algorithm: <strong>{algorithm.toUpperCase()} FIT</strong></div>
            </div>

            <div>
              <strong className="text-white print:text-black block mb-1">Simulation Metrics:</strong>
              <div>Memory Utilization: <strong>{metrics.utilizationPct}%</strong></div>
              <div>Internal Fragmentation: <strong>{metrics.internalFrag} KB</strong></div>
              <div>External Fragmentation: <strong>{metrics.externalFrag} KB</strong></div>
              <div>Largest Contiguous Hole: <strong>{metrics.largestFreeBlock} KB</strong></div>
              <div>Average Block Search Cost: <strong>{metrics.avgSearchSteps} steps</strong></div>
            </div>
          </div>

          <!-- Process Queue Summary -->
          <div>
            <strong className="text-white print:text-black block mb-1.5 font-bold uppercase text-[11px]">
              Allocated Process Queue ({processes.length} Processes)
            </strong>
            <table className="w-full text-left border-collapse border border-slate-800 print:border-gray-300 text-[11px]">
              <thead className="bg-slate-950 print:bg-gray-100 border-b border-slate-800 print:border-gray-300 font-bold">
                <tr>
                  <th className="p-2">PID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2 text-right">Req Size</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Internal Frag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                {processes.map(p => (
                  <tr key={p.id}>
                    <td className="p-2 font-bold">{p.id}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 text-right font-bold">{p.reqSize} KB</td>
                    <td className="p-2">{p.status}</td>
                    <td className="p-2 text-right">{p.internalFrag || 0} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <!-- Event Trace Summary -->
          <div>
            <strong className="text-white print:text-black block mb-1 font-bold uppercase text-[11px]">
              Execution Trace Event Log Summary ({logs.length} Events)
            </strong>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto text-[10px] text-slate-300 print:bg-gray-50 print:text-black">
              {logs.slice(-10).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        <!-- Action Controls -->
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" /> Export CSV Data
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-indigo-400" /> Export JSON Scenario
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-400 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Academic PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

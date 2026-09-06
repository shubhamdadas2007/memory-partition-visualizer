import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MemoryEngine } from './engine/memoryEngine';
import { MemoryBlock, Process, PartitionScheme, FitAlgorithm, LabExperiment } from './types';
import { Header } from './components/Header';
import { MemoryConfig } from './components/MemoryConfig';
import { ProcessManager } from './components/ProcessManager';
import { MemoryMap } from './components/MemoryMap';
import { MemoryBlockGrid } from './components/MemoryBlockGrid';
import { Tables } from './components/Tables';
import { SimControls } from './components/SimControls';
import { CompactionView } from './components/CompactionView';
import { LogPanel } from './components/LogPanel';
import { ComparisonPanel } from './components/ComparisonPanel';
import { ExperimentMode } from './components/ExperimentMode';
import { DemoMode } from './components/DemoMode';
import { ExportModal } from './components/ExportModal';
import { PRESET_SCENARIOS } from './data/presetsData';
import { Cpu, HardDrive, AlertTriangle, Info, Zap, Trash2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [memorySize, setMemorySize] = useState<number>(1024);
  const [osSize, setOsSize] = useState<number>(128);
  const [scheme, setScheme] = useState<PartitionScheme>('dynamic');
  const [algorithm, setAlgorithm] = useState<FitAlgorithm>('first');

  const engineRef = useRef<MemoryEngine>(new MemoryEngine(1024, 128));
  const [engineState, setEngineState] = useState<{
    blocks: MemoryBlock[];
    processes: Process[];
    nextFitPointer: number;
    logs: string[];
  }>({
    blocks: engineRef.current.blocks,
    processes: engineRef.current.processes,
    nextFitPointer: engineRef.current.nextFitPointer,
    logs: ['[OS BOOT] MEMORYMAP PRO Engine initialized. 1024 KB RAM active.']
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(800);
  const [selectedBlock, setSelectedBlock] = useState<MemoryBlock | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Sync state helper
  const syncEngineState = useCallback((newLogs?: string[]) => {
    setEngineState((prev) => ({
      blocks: [...engineRef.current.blocks],
      processes: [...engineRef.current.processes],
      nextFitPointer: engineRef.current.nextFitPointer,
      logs: newLogs ? [...prev.logs, ...newLogs] : [...prev.logs]
    }));
  }, []);

  // Configuration change
  const handleConfigChange = (
    newScheme: PartitionScheme,
    newAlgorithm: FitAlgorithm,
    newMemSize?: number,
    newOsSize?: number
  ) => {
    const targetMem = newMemSize || memorySize;
    const targetOs = newOsSize || osSize;

    setMemorySize(targetMem);
    setOsSize(targetOs);
    setScheme(newScheme);
    setAlgorithm(newAlgorithm);

    engineRef.current = new MemoryEngine(targetMem, targetOs);
    engineRef.current.setConfiguration(newScheme, newAlgorithm);
    syncEngineState([`[CONFIG CHANGED] Scheme: ${newScheme.toUpperCase()}, Algorithm: ${newAlgorithm.toUpperCase()} FIT, Memory: ${targetMem} KB.`]);
  };

  // Allocate process
  const handleAllocateProcess = (id: string, reqSize: number, name?: string) => {
    const res = engineRef.current.allocate(id, reqSize, name);
    syncEngineState(res.logs);
  };

  // Deallocate process
  const handleDeallocateProcess = (id: string) => {
    const res = engineRef.current.deallocate(id);
    syncEngineState(res.logs);
  };

  // Clear processes
  const handleClearProcesses = () => {
    engineRef.current.initMemory();
    syncEngineState(['[MEMORY RESET] All user processes cleared. Memory returned to initial state.']);
  };

  // Compact Memory
  const handleCompact = () => {
    const res = engineRef.current.compactMemory();
    syncEngineState(res.logs);
  };

  // Reset State
  const handleReset = () => {
    engineRef.current.initMemory();
    syncEngineState(['[RESET] Memory Engine reset to default initial state.']);
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find(p => p.id === presetId);
    if (!preset) return;

    setMemorySize(preset.memorySize);
    setOsSize(preset.osSize);
    setScheme(preset.scheme);
    setAlgorithm(preset.algorithm);

    engineRef.current = new MemoryEngine(preset.memorySize, preset.osSize);
    engineRef.current.setConfiguration(preset.scheme, preset.algorithm);

    const logs: string[] = [`[PRESET LOADED] ${preset.name}: ${preset.description}`];

    preset.actions.forEach((act) => {
      if (act.type === 'allocate' && act.size) {
        const r = engineRef.current.allocate(act.id, act.size);
        logs.push(...r.logs);
      } else if (act.type === 'deallocate') {
        const r = engineRef.current.deallocate(act.id);
        logs.push(...r.logs);
      } else if (act.type === 'compact') {
        const r = engineRef.current.compactMemory();
        logs.push(...r.logs);
      }
    });

    syncEngineState(logs);
  };

  // Load Lab Experiment
  const handleLoadExperiment = (exp: LabExperiment) => {
    setActiveTab('simulator');
    setMemorySize(exp.memorySize);
    setOsSize(exp.osSize);
    setScheme(exp.scheme);
    setAlgorithm(exp.algorithm);

    engineRef.current = new MemoryEngine(exp.memorySize, exp.osSize);
    engineRef.current.setConfiguration(exp.scheme, exp.algorithm);

    const logs: string[] = [`[EXPERIMENT LOADED] ${exp.title}`];

    exp.actions.forEach((act) => {
      if (act.type === 'allocate' && act.size) {
        const r = engineRef.current.allocate(act.id, act.size);
        logs.push(...r.logs);
      } else if (act.type === 'deallocate') {
        const r = engineRef.current.deallocate(act.id);
        logs.push(...r.logs);
      } else if (act.type === 'compact') {
        const r = engineRef.current.compactMemory();
        logs.push(...r.logs);
      }
    });

    syncEngineState(logs);
  };

  // Random Scenario Generator (Reproducible with seed)
  const handleRandomScenario = () => {
    handleReset();
    const processSizes = [120, 200, 150, 300, 80, 220, 140];
    const logs: string[] = ['[RANDOM GENERATOR] Generated reproducible OS workload scenario.'];

    processSizes.forEach((sz, idx) => {
      const pid = `P${idx + 1}`;
      const r = engineRef.current.allocate(pid, sz);
      logs.push(...r.logs);
    });

    syncEngineState(logs);
  };

  // Demo step callback
  const handleDemoStep = (stepIdx: number) => {
    if (stepIdx === 0) handleLoadPreset('basic-allocation');
    if (stepIdx === 4) handleDeallocateProcess('P2');
    if (stepIdx === 5) handleAllocateProcess('P5', 300);
    if (stepIdx === 6) handleCompact();
    if (stepIdx === 11) setActiveTab('benchmark');
  };

  const metrics = engineRef.current.getMetrics();

  const activeAllocatedBlocks = engineState.blocks.filter(b => b.status === 'allocated');
  const benchmarkWorkload = activeAllocatedBlocks.map(b => ({
    id: b.processId || 'P',
    size: b.reqSize || b.size,
    name: b.processName
  }));

  if (benchmarkWorkload.length === 0) {
    // Default fallback benchmark workload if empty
    benchmarkWorkload.push(
      { id: 'P1', size: 180, name: 'Process 1' },
      { id: 'P2', size: 250, name: 'Process 2' },
      { id: 'P3', size: 180, name: 'Process 3' },
      { id: 'P4', size: 240, name: 'Process 4' }
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <!-- Header Navigation Bar -->
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemo={() => setIsDemoMode(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onRandomScenario={handleRandomScenario}
      />

      <!-- Main Body Content -->
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-6">
            <!-- Live Metrics Dashboard Header Cards -->
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total Memory</span>
                <span className="text-xl font-extrabold text-white">{metrics.totalRam} KB</span>
                <span className="text-[10px] text-slate-500">OS Kernel: {metrics.osSize} KB</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">RAM Utilization</span>
                <span className="text-xl font-extrabold text-cyan-400">{metrics.utilizationPct}%</span>
                <span className="text-[10px] text-slate-500">{metrics.usedRam} KB Used</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Internal Frag</span>
                <span className="text-xl font-extrabold text-amber-400">{metrics.internalFrag} KB</span>
                <span className="text-[10px] text-slate-500">{scheme === 'dynamic' ? '0 KB (Dynamic)' : 'Fixed Mode'}</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">External Frag</span>
                <span className="text-xl font-extrabold text-amber-400">{metrics.externalFrag} KB</span>
                <span className="text-[10px] text-slate-500">{metrics.freeHolesCount} Free Holes</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Largest Free Hole</span>
                <span className="text-xl font-extrabold text-emerald-400">{metrics.largestFreeBlock} KB</span>
                <span className="text-[10px] text-slate-500">Max Contiguous</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Avg Search Cost</span>
                <span className="text-xl font-extrabold text-indigo-400">{metrics.avgSearchSteps}</span>
                <span className="text-[10px] text-slate-500">Steps / Allocation</span>
              </div>
            </div>

            <!-- Dashboard Grid Layout -->
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left Column: Controls & Process Manager -->
              <div className="flex flex-col gap-6">
                <MemoryConfig
                  memorySize={memorySize}
                  osSize={osSize}
                  scheme={scheme}
                  algorithm={algorithm}
                  onConfigChange={handleConfigChange}
                  onCompact={handleCompact}
                  onReset={handleReset}
                  onLoadPreset={handleLoadPreset}
                />

                <ProcessManager
                  allocatedBlocks={activeAllocatedBlocks}
                  maxAvailableKb={metrics.availableRam}
                  onAllocateProcess={handleAllocateProcess}
                  onDeallocateProcess={handleDeallocateProcess}
                  onClearProcesses={handleClearProcesses}
                />
              </div>

              <!-- Center & Right Columns: Visual Arena & Trace Log -->
              <div className="lg:col-span-2 flex flex-col gap-6">
                <MemoryMap
                  blocks={engineState.blocks}
                  totalRam={metrics.totalRam}
                  algorithm={algorithm}
                  nextFitPointer={engineState.nextFitPointer}
                  metrics={metrics}
                  onSelectBlock={(b) => setSelectedBlock(b)}
                  onDeallocateProcess={handleDeallocateProcess}
                  onCompact={handleCompact}
                />

                <MemoryBlockGrid
                  blocks={engineState.blocks}
                  totalRam={metrics.totalRam}
                  onSelectBlock={(b) => setSelectedBlock(b)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CompactionView metrics={metrics} onCompact={handleCompact} />
                  <LogPanel logs={engineState.logs} onClearLogs={() => setEngineState(prev => ({ ...prev, logs: [] }))} />
                </div>
              </div>
            </div>

            <!-- Process & Memory Segment Tables -->
            <Tables
              processes={engineRef.current.processes}
              blocks={engineState.blocks}
              scheme={scheme}
              onDeallocateProcess={handleDeallocateProcess}
            />
          </div>
        )}

        {activeTab === 'benchmark' && (
          <ComparisonPanel
            memorySize={memorySize}
            osSize={osSize}
            scheme={scheme}
            workload={benchmarkWorkload}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentMode onLoadExperiment={handleLoadExperiment} />
        )}
      </main>

      <!-- Block Details Inspection Modal -->
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold text-cyan-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Inspect Block Details ({selectedBlock.id})
              </h4>
              <button onClick={() => setSelectedBlock(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Start Address:</span>
                <strong className="text-white">{selectedBlock.startAddr} KB (0x{selectedBlock.startAddr.toString(16).padStart(4, '0').toUpperCase()})</strong>
              </div>
              <div className="flex justify-between">
                <span>End Address:</span>
                <strong className="text-white">{selectedBlock.endAddr} KB (0x{selectedBlock.endAddr.toString(16).padStart(4, '0').toUpperCase()})</strong>
              </div>
              <div className="flex justify-between">
                <span>Block Size:</span>
                <strong className="text-cyan-400 font-bold">{selectedBlock.size} KB</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <strong className="uppercase text-emerald-400 font-bold">{selectedBlock.status}</strong>
              </div>

              {selectedBlock.status === 'allocated' && (
                <>
                  <div className="flex justify-between border-t border-slate-800 pt-2">
                    <span>Process ID / Name:</span>
                    <strong className="text-white">{selectedBlock.processId} ({selectedBlock.processName})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Process Requirement:</span>
                    <strong className="text-cyan-400">{selectedBlock.reqSize} KB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Internal Fragmentation:</span>
                    <strong className="text-amber-400 font-bold">{selectedBlock.internalFrag} KB</strong>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              {selectedBlock.status === 'allocated' && selectedBlock.processId && (
                <button
                  onClick={() => {
                    handleDeallocateProcess(selectedBlock.processId!);
                    setSelectedBlock(null);
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-all mr-2"
                >
                  Free Process Memory
                </button>
              )}
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <!-- Overlay Presentation Demo Mode -->
      {isDemoMode && (
        <DemoMode
          onExitDemo={() => setIsDemoMode(false)}
          onRunDemoStep={handleDemoStep}
        />
      )}

      <!-- Academic Lab Report & Export Modal -->
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        metrics={metrics}
        blocks={engineState.blocks}
        processes={engineRef.current.processes}
        scheme={scheme}
        algorithm={algorithm}
        logs={engineState.logs}
      />
    </div>
  );
};

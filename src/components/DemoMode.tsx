import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Pause, SkipForward, XCircle } from 'lucide-react';

interface DemoModeProps {
  onExitDemo: () => void;
  onRunDemoStep: (stepIdx: number) => void;
}

export const DemoMode: React.FC<DemoModeProps> = ({ onExitDemo, onRunDemoStep }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const demoSteps = [
    { title: '1. Initial RAM Configuration', desc: 'Configuring 1024 KB RAM with 128 KB reserved for OS Kernel.' },
    { title: '2. First Fit Allocation (P1)', desc: 'Allocating Process P1 (180 KB). First Fit scans from 0 KB and selects first available hole.' },
    { title: '3. First Fit Allocation (P2)', desc: 'Allocating Process P2 (250 KB) next to P1.' },
    { title: '4. First Fit Allocation (P3 & P4)', desc: 'Allocating P3 (180 KB) and P4 (240 KB) into remaining memory.' },
    { title: '5. Process Deallocation', desc: 'Deallocating P2 (250 KB) to create a free hole at address 308 KB.' },
    { title: '6. External Fragmentation Trap', desc: 'Attempting to allocate P5 (300 KB). Total free memory is 450 KB, but largest hole is 250 KB!' },
    { title: '7. Memory Compaction', desc: 'Compacting memory! Sliding P1, P3, P4 together to consolidate 450 KB into one contiguous block.' },
    { title: '8. Allocation Post Compaction', desc: 'Re-allocating P5 (300 KB) into the newly consolidated 450 KB free block.' },
    { title: '9. Best Fit Comparison', desc: 'Running identical workload through Best Fit to compare residual fragment waste.' },
    { title: '10. Worst Fit Comparison', desc: 'Running identical workload through Worst Fit to inspect large hole preservation.' },
    { title: '11. Next Fit Rotational Pointer', desc: 'Running Next Fit with rotational search pointer.' },
    { title: '12. Final 4-Algorithm Benchmark', desc: 'Generating side-by-side comparison table and dynamic workload recommendations.' }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % demoSteps.length;
          onRunDemoStep(next);
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, demoSteps.length, onRunDemoStep]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl w-96 text-white flex flex-col gap-3 animate-bounce-short">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
            PROJECT PRESENTATION DEMO MODE
          </h4>
        </div>
        <button onClick={onExitDemo} className="text-slate-400 hover:text-white">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div>
        <div className="text-xs font-mono font-bold text-cyan-400">
          Step {currentStep + 1} of {demoSteps.length}
        </div>
        <div className="text-sm font-extrabold text-white mt-0.5">
          {demoSteps[currentStep].title}
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {demoSteps[currentStep].desc}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
            isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isPlaying ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={() => {
            const next = (currentStep + 1) % demoSteps.length;
            setCurrentStep(next);
            onRunDemoStep(next);
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
        >
          Skip <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

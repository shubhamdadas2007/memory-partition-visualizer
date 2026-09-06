export type PartitionScheme = 'dynamic' | 'fixed-equal' | 'fixed-unequal';
export type FitAlgorithm = 'first' | 'best' | 'worst' | 'next';

export interface MemoryBlock {
  id: string;
  startAddr: number; // in KB
  endAddr: number;   // in KB (startAddr + size)
  size: number;      // in KB
  status: 'os' | 'allocated' | 'free';
  processId?: string;
  processName?: string;
  reqSize?: number;  // in KB
  internalFrag: number; // in KB (Partition Size - Process Size for Fixed mode)
  partitionId?: string;
}

export interface Process {
  id: string;
  name: string;
  reqSize: number;   // in KB
  allocatedSize?: number;
  blockId?: string;
  status: 'pending' | 'allocated' | 'failed' | 'terminated';
  internalFrag?: number;
}

export interface TraceStep {
  stepIndex: number;
  holeId: string;
  startAddr: number;
  holeSize: number;
  reqSize: number;
  decision: 'accepted' | 'rejected' | 'candidate';
  reason: string;
}

export interface AllocationResult {
  success: boolean;
  block?: MemoryBlock;
  internalFrag?: number;
  externalFragDetected?: boolean;
  reason?: string;
  logs: string[];
  traceSteps: TraceStep[];
}

export interface Metrics {
  totalRam: number;        // in KB
  osSize: number;          // in KB
  availableRam: number;    // in KB (totalRam - osSize)
  usedRam: number;         // in KB (active allocated process sizes)
  freeRam: number;         // in KB (total unallocated RAM)
  utilizationPct: number;  // (usedRam / availableRam) * 100
  internalFrag: number;    // in KB (Fixed mode internal waste sum)
  externalFrag: number;    // in KB (Free memory distributed across non-contiguous holes)
  largestFreeBlock: number;// in KB
  freeHolesCount: number;  // Count of free holes
  succeeded: number;       // Succeeded process count
  failed: number;          // Failed process count
  totalRequested: number;  // Total process requests
  avgSearchSteps: number;  // Average block search cost
  fragInducedFailure: boolean; // Total Free >= Req && Largest Free < Req
}

export interface LabExperiment {
  id: string;
  title: string;
  objective: string;
  scheme: PartitionScheme;
  algorithm: FitAlgorithm;
  memorySize: number;
  osSize: number;
  actions: { type: 'allocate' | 'deallocate' | 'compact'; id: string; size?: number }[];
  expectedConcept: string;
  observation: string;
  conclusion: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface VivaQuestion {
  id: number;
  question: string;
  answer: string;
  category: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

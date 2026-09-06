import { PartitionScheme, FitAlgorithm } from '../types';

export interface PresetScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  scheme: PartitionScheme;
  algorithm: FitAlgorithm;
  memorySize: number;
  osSize: number;
  actions: { type: 'allocate' | 'deallocate' | 'compact'; id: string; size?: number }[];
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'basic-allocation',
    name: '1. Basic Process Allocation',
    category: 'Basic',
    description: 'Demonstrates simple sequential process placement into dynamic memory.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 150 },
      { type: 'allocate', id: 'P2', size: 200 },
      { type: 'allocate', id: 'P3', size: 300 }
    ]
  },
  {
    id: 'internal-frag-trap',
    name: '2. Fixed Partition Internal Frag Trap',
    category: 'Fixed Partitions',
    description: 'Shows how fixed equal partitions waste space when process size < partition size.',
    scheme: 'fixed-equal',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 50 },
      { type: 'allocate', id: 'P2', size: 80 },
      { type: 'allocate', id: 'P3', size: 30 },
      { type: 'allocate', id: 'P4', size: 100 }
    ]
  },
  {
    id: 'external-frag-failure',
    name: '3. External Fragmentation & Failure',
    category: 'Dynamic Partitions',
    description: 'Creates non-contiguous free holes and demonstrates allocation failure when Total Free >= ReqSize but Largest Hole < ReqSize.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 180 },
      { type: 'allocate', id: 'P2', size: 250 },
      { type: 'allocate', id: 'P3', size: 180 },
      { type: 'allocate', id: 'P4', size: 240 },
      { type: 'deallocate', id: 'P2' },
      { type: 'allocate', id: 'P5', size: 300 }
    ]
  },
  {
    id: 'best-vs-worst',
    name: '4. Best Fit vs Worst Fit Residual Trap',
    category: 'Algorithms',
    description: 'Highlights Best Fit creating tiny residual fragments versus Worst Fit leaving usable leftover space.',
    scheme: 'dynamic',
    algorithm: 'best',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 120 },
      { type: 'allocate', id: 'P2', size: 200 },
      { type: 'allocate', id: 'P3', size: 120 },
      { type: 'allocate', id: 'P4', size: 400 },
      { type: 'deallocate', id: 'P2' },
      { type: 'allocate', id: 'P5', size: 150 }
    ]
  },
  {
    id: 'coalescing-demo',
    name: '5. Process Deallocation & Coalescing',
    category: 'Deallocation',
    description: 'Demonstrates process termination and automatic merging of adjacent free holes.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 150 },
      { type: 'allocate', id: 'P2', size: 150 },
      { type: 'allocate', id: 'P3', size: 150 },
      { type: 'deallocate', id: 'P1' },
      { type: 'deallocate', id: 'P2' }
    ]
  },
  {
    id: 'compaction-demo',
    name: '6. Memory Compaction (Defragmenter)',
    category: 'Compaction',
    description: 'Demonstrates process sliding and consolidates fragmented free memory into a single contiguous block.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 180 },
      { type: 'allocate', id: 'P2', size: 250 },
      { type: 'allocate', id: 'P3', size: 180 },
      { type: 'deallocate', id: 'P2' },
      { type: 'compact', id: 'COMPACT' },
      { type: 'allocate', id: 'P4', size: 300 }
    ]
  }
];

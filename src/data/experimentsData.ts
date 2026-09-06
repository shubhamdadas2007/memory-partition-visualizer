import { LabExperiment } from '../types';

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp-1',
    title: 'Experiment 1: First Fit Search Efficiency & Block Scanning',
    objective: 'Investigate how First Fit selects the first available memory block from address 0 KB and measure search cost.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 150 },
      { type: 'allocate', id: 'P2', size: 200 },
      { type: 'allocate', id: 'P3', size: 100 },
      { type: 'deallocate', id: 'P1' },
      { type: 'allocate', id: 'P4', size: 120 }
    ],
    expectedConcept: 'First Fit always scans from the beginning of memory and allocates into the first hole large enough, ignoring larger holes downstream.',
    observation: 'Process P4 (120 KB) was placed into P1\'s freed hole (150 KB) because it was the first suitable block encountered.',
    conclusion: 'First Fit minimizes search time for early allocations but tends to clutter low memory addresses with small residual fragments.'
  },
  {
    id: 'exp-2',
    title: 'Experiment 2: Best Fit Minimization of Residual Waste',
    objective: 'Demonstrate how Best Fit scans all free holes to find the smallest hole that fits the request.',
    scheme: 'dynamic',
    algorithm: 'best',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 100 },
      { type: 'allocate', id: 'P2', size: 300 },
      { type: 'allocate', id: 'P3', size: 100 },
      { type: 'allocate', id: 'P4', size: 200 },
      { type: 'deallocate', id: 'P2' },
      { type: 'allocate', id: 'P5', size: 150 }
    ],
    expectedConcept: 'Best Fit evaluates all candidate holes and chooses the one that leaves the smallest residual leftover space.',
    observation: 'Best Fit scanned both the 300 KB hole and high memory space, selecting the 300 KB hole to leave a 150 KB residual fragment.',
    conclusion: 'Best Fit achieves tight memory packing but can create tiny unusable residual fragments over time.'
  },
  {
    id: 'exp-3',
    title: 'Experiment 3: Worst Fit Preservation of Large Reusable Holes',
    objective: 'Observe how Worst Fit selects the largest available hole to keep the remaining fragment large enough for future processes.',
    scheme: 'dynamic',
    algorithm: 'worst',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 100 },
      { type: 'allocate', id: 'P2', size: 200 },
      { type: 'allocate', id: 'P3', size: 100 },
      { type: 'allocate', id: 'P4', size: 400 },
      { type: 'deallocate', id: 'P2' },
      { type: 'allocate', id: 'P5', size: 150 }
    ],
    expectedConcept: 'Worst Fit chooses the largest available hole, producing a large leftover fragment that remains usable.',
    observation: 'Worst Fit placed P5 (150 KB) into the 400 KB hole instead of the 200 KB hole, leaving a large 250 KB usable fragment.',
    conclusion: 'Worst Fit prevents the creation of tiny unusable fragments but rapidly consumes large contiguous holes.'
  },
  {
    id: 'exp-4',
    title: 'Experiment 4: Next Fit Rotational Pointer Search',
    objective: 'Analyze Next Fit behavior by tracking search cursor position after consecutive allocations and deallocations.',
    scheme: 'dynamic',
    algorithm: 'next',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 150 },
      { type: 'allocate', id: 'P2', size: 150 },
      { type: 'allocate', id: 'P3', size: 150 },
      { type: 'deallocate', id: 'P1' },
      { type: 'allocate', id: 'P4', size: 100 }
    ],
    expectedConcept: 'Next Fit continues searching from the last allocation address cursor rather than resetting to 0 KB.',
    observation: 'Even though P1 freed 150 KB at low memory, Next Fit allocated P4 at high memory past P3 because its cursor was at P3\'s end address.',
    conclusion: 'Next Fit spreads allocations evenly across memory and reduces re-scanning low addresses.'
  },
  {
    id: 'exp-5',
    title: 'Experiment 5: External Fragmentation & Allocation Failure',
    objective: 'Demonstrate the exact condition where Total Free Memory >= Process Size but no single contiguous block is large enough.',
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
    ],
    expectedConcept: 'External fragmentation occurs when memory is fragmented into non-contiguous holes.',
    observation: 'Total Free Memory was 450 KB (250 KB + 200 KB), but P5 (300 KB) failed because the largest hole was 250 KB.',
    conclusion: 'A process cannot be allocated unless a single contiguous hole is at least as large as the request.'
  },
  {
    id: 'exp-6',
    title: 'Experiment 6: Memory Compaction & Defragmentation',
    objective: 'Show how memory compaction slides active processes together to coalesce scattered free space into a single contiguous block.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 180 },
      { type: 'allocate', id: 'P2', size: 250 },
      { type: 'allocate', id: 'P3', size: 180 },
      { type: 'deallocate', id: 'P2' },
      { type: 'allocate', id: 'P4', size: 300 }, // Fails
      { type: 'compact', id: 'COMPACT' },
      { type: 'allocate', id: 'P4', size: 300 }  // Succeeds after compaction!
    ],
    expectedConcept: 'Compaction relocates active processes toward low memory, merging all free fragments into one large block at high memory.',
    observation: 'Before compaction P4 failed. After compaction, free space was consolidated into a 450 KB contiguous block, allowing P4 to allocate successfully.',
    conclusion: 'Compaction resolves external fragmentation but requires CPU overhead and process relocation.'
  },
  {
    id: 'exp-7',
    title: 'Experiment 7: Comprehensive 4-Algorithm Benchmark',
    objective: 'Compare First Fit, Best Fit, Worst Fit, and Next Fit on an identical process workload to evaluate memory utilization and search cost.',
    scheme: 'dynamic',
    algorithm: 'first',
    memorySize: 1024,
    osSize: 128,
    actions: [
      { type: 'allocate', id: 'P1', size: 200 },
      { type: 'allocate', id: 'P2', size: 150 },
      { type: 'allocate', id: 'P3', size: 250 },
      { type: 'allocate', id: 'P4', size: 100 },
      { type: 'deallocate', id: 'P2' },
      { type: 'allocate', id: 'P5', size: 180 }
    ],
    expectedConcept: 'Different fit algorithms exhibit trade-offs between execution speed (search steps) and fragmentation.',
    observation: 'Compare the memory map, external fragmentation, and search steps across all 4 algorithms in the Benchmark tab.',
    conclusion: 'No single algorithm is optimal for all workloads; choice depends on process size distribution and lifetime.'
  }
];

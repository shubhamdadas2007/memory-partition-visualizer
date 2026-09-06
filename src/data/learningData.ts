export interface Topic {
  id: string;
  title: string;
  category: string;
  definition: string;
  formula?: string;
  example: string;
  advantages: string[];
  disadvantages: string[];
}

export const LEARNING_TOPICS: Topic[] = [
  {
    id: 'contiguous-allocation',
    title: '1. Contiguous Memory Allocation',
    category: 'Fundamentals',
    definition: 'In contiguous memory allocation, each process is allocated a single continuous block of physical memory addresses. The main memory is partitioned into User Space and OS Space.',
    formula: 'End Address = Start Address + Process Size',
    example: 'Process P1 (150 KB) starting at address 128 KB occupies physical range 128 KB to 278 KB.',
    advantages: [
      'Simple hardware support using Relocation and Limit registers',
      'Fast address translation (Physical Addr = Logical Addr + Relocation Register)',
      'Low memory management overhead for small embedded systems'
    ],
    disadvantages: [
      'Requires contiguous physical memory space',
      'Leads to external fragmentation over time',
      'Limits multiprogramming degree when processes exceed contiguous hole sizes'
    ]
  },
  {
    id: 'fixed-partitioning',
    title: '2. Fixed Partitioning (Static)',
    category: 'Partitioning Schemes',
    definition: 'Memory is divided into fixed-size regions (equal or unequal) at system boot. Each partition holds exactly one process.',
    formula: 'Internal Fragmentation = Partition Size - Process Requirement',
    example: 'A 200 KB fixed partition allocated to a 150 KB process results in 50 KB internal fragmentation.',
    advantages: [
      'Simple implementation and low CPU overhead',
      'No external fragmentation within allocated partitions'
    ],
    disadvantages: [
      'High internal fragmentation when processes are smaller than partition bounds',
      'Process size is strictly limited by the largest partition size'
    ]
  },
  {
    id: 'dynamic-partitioning',
    title: '3. Dynamic Partitioning (Variable)',
    category: 'Partitioning Schemes',
    definition: 'Partitions are created dynamically to match exact process size requirements. As processes terminate, free holes are created.',
    formula: 'Internal Fragmentation = 0 KB (Free remainder becomes a new hole)',
    example: 'A 500 KB free block allocated to a 200 KB process splits into a 200 KB allocated block and a 300 KB free hole.',
    advantages: [
      'Zero internal fragmentation',
      'Efficient initial memory utilization'
    ],
    disadvantages: [
      'Generates external fragmentation over time as processes arrive and depart',
      'Requires periodic memory compaction'
    ]
  },
  {
    id: 'first-fit',
    title: '4. First Fit Placement Algorithm',
    category: 'Fit Algorithms',
    definition: 'Scans memory sequentially from the beginning (0 KB) and allocates the process in the first free hole that is large enough.',
    formula: 'Select Hole_i where Size(Hole_i) >= ProcessSize (First occurrence)',
    example: 'Hole 1 (100 KB - Too small), Hole 2 (300 KB - Fits). Hole 2 selected immediately.',
    advantages: [
      'Fastest allocation time for early requests',
      'Low search cost on average'
    ],
    disadvantages: [
      'Clutters low memory with small residual fragments',
      'Must scan past unusable early fragments repeatedly'
    ]
  },
  {
    id: 'best-fit',
    title: '5. Best Fit Placement Algorithm',
    category: 'Fit Algorithms',
    definition: 'Scans all free holes in memory and selects the smallest hole that is large enough for the process.',
    formula: 'Select Hole_i = min(Size(Hole_j) - ProcessSize) where Size(Hole_j) >= ProcessSize',
    example: 'Holes: 300 KB, 200 KB, 400 KB. For 150 KB request, 200 KB hole is selected (leaves min 50 KB waste).',
    advantages: [
      'Minimizes immediate leftover space per allocation',
      'Preserves larger holes for future large processes'
    ],
    disadvantages: [
      'Slow search time (must examine all holes)',
      'Produces tiny unusable residual fragments over time'
    ]
  },
  {
    id: 'worst-fit',
    title: '6. Worst Fit Placement Algorithm',
    category: 'Fit Algorithms',
    definition: 'Scans all free holes in memory and selects the largest available hole.',
    formula: 'Select Hole_i = max(Size(Hole_j) - ProcessSize) where Size(Hole_j) >= ProcessSize',
    example: 'Holes: 200 KB, 400 KB. For 150 KB request, 400 KB hole is selected (leaves 250 KB usable waste).',
    advantages: [
      'Leaves large remaining fragments that remain usable for subsequent requests'
    ],
    disadvantages: [
      'Slow search time (must scan all holes)',
      'Rapidly breaks down large contiguous free regions'
    ]
  },
  {
    id: 'next-fit',
    title: '7. Next Fit Placement Algorithm',
    category: 'Fit Algorithms',
    definition: 'Similar to First Fit, but starts searching from the location of the last allocation pointer rather than from 0 KB.',
    formula: 'Start search at LastPointer; wrap around to 0 KB if top memory bounds are reached',
    example: 'Cursor at 500 KB. Scans from 500 KB to top memory before wrapping to 0 KB.',
    advantages: [
      'Spreads allocations evenly across the physical address space',
      'Avoids scanning cluttered low memory repeatedly'
    ],
    disadvantages: [
      'Can skip large freed holes at low memory until cursor wraps around'
    ]
  },
  {
    id: 'fragmentation-types',
    title: '8. Internal vs External Fragmentation',
    category: 'Fragmentation',
    definition: 'Internal Fragmentation is wasted memory inside an allocated partition. External Fragmentation is total free memory distributed across isolated non-contiguous holes.',
    formula: 'External Frag Failure: Total Free >= Process Requirement AND Largest Hole < Process Requirement',
    example: 'Total Free RAM = 450 KB (Hole 1: 250 KB, Hole 2: 200 KB). Process P5 (300 KB) fails due to external fragmentation.',
    advantages: ['Understanding fragmentation drives modern OS paging design.'],
    disadvantages: ['External fragmentation forces memory compaction.']
  },
  {
    id: 'coalescing-compaction',
    title: '9. Coalescing & Memory Compaction',
    category: 'Memory Management',
    definition: 'Coalescing merges adjacent free holes upon deallocation. Compaction relocates active processes down to low memory to consolidate scattered free space into a single contiguous block.',
    formula: 'Compaction Free Block Size = Total RAM - OS Reserved - Sum(Active Process Sizes)',
    example: 'P1 | FREE 100K | P2 | FREE 200K  -->  Compact  -->  P1 | P2 | FREE 300K',
    advantages: ['Resolves external fragmentation and makes scattered memory usable'],
    disadvantages: ['Heavy CPU and memory bus overhead to copy bytes in RAM']
  }
];

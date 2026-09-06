import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which allocation algorithm searches from the beginning of memory and selects the first free block large enough for the process?',
    options: ['Best Fit', 'First Fit', 'Worst Fit', 'Next Fit'],
    answer: 1,
    explanation: 'First Fit begins its search at address 0 (or low memory past OS) and allocates into the first hole that meets or exceeds the required size.'
  },
  {
    id: 2,
    question: 'What is Internal Fragmentation?',
    options: [
      'Unused memory distributed in small non-contiguous holes between processes',
      'Wasted memory inside an allocated partition when the process size is smaller than the partition capacity',
      'Memory used by the Operating System Kernel',
      'The time taken to search for a memory block'
    ],
    answer: 1,
    explanation: 'Internal Fragmentation occurs inside fixed partitions when the allocated partition size exceeds the process requirement (Internal Frag = Partition Size - Process Size).'
  },
  {
    id: 3,
    question: 'In Dynamic Partitioning mode, how is internal fragmentation defined?',
    options: [
      'It is equal to the process size',
      'It is 0 KB, because partitions are allocated dynamically to match exact process size',
      'It is equal to total RAM size',
      'It is equal to OS reserved space'
    ],
    answer: 1,
    explanation: 'In Dynamic Partitioning, partitions are created dynamically to match exact process requirements, so internal fragmentation is 0 KB. Leftover space becomes a new free hole.'
  },
  {
    id: 4,
    question: 'When does a Fragmentation-Induced Allocation Failure occur?',
    options: [
      'When total free RAM is zero',
      'When total free RAM is sufficient for a process, but no single contiguous hole is large enough',
      'When the OS Kernel crashes',
      'When process size is negative'
    ],
    answer: 1,
    explanation: 'External fragmentation causes allocation failure when total free RAM >= process requirement, but free space is scattered across smaller non-contiguous holes.'
  },
  {
    id: 5,
    question: 'Which algorithm scans ALL candidate free holes and selects the smallest one that can accommodate the process?',
    options: ['First Fit', 'Best Fit', 'Worst Fit', 'Next Fit'],
    answer: 1,
    explanation: 'Best Fit searches all free holes to find the smallest hole that fits the request, minimizing immediate residual leftover space.'
  },
  {
    id: 6,
    question: 'What is the primary objective of Worst Fit allocation?',
    options: [
      'To allocate as fast as possible',
      'To choose the largest free hole so the remaining fragment is large enough to be useful for future processes',
      'To cause maximum internal fragmentation',
      'To lock memory blocks'
    ],
    answer: 1,
    explanation: 'Worst Fit selects the largest available hole so that the leftover fragment remains large enough to accommodate subsequent process requests.'
  },
  {
    id: 7,
    question: 'How does Next Fit differ from First Fit?',
    options: [
      'Next Fit searches in reverse',
      'Next Fit starts searching from the location of the last allocated pointer rather than starting from address 0 KB',
      'Next Fit only works on fixed partitions',
      'Next Fit has zero search cost'
    ],
    answer: 1,
    explanation: 'Next Fit maintains a search cursor pointer at the end of the last allocation and continues scanning clockwise/forward from that point.'
  },
  {
    id: 8,
    question: 'What operation is performed when two adjacent free memory holes are merged into a single larger hole?',
    options: ['Paging', 'Coalescing', 'Swapping', 'Thrashing'],
    answer: 1,
    explanation: 'Coalescing automatically merges adjacent free holes upon process deallocation to combine contiguous free space.'
  },
  {
    id: 9,
    question: 'What is Memory Compaction (Defragmentation)?',
    options: [
      'Deleting processes from memory',
      'Relocating active processes toward low memory to combine all scattered free holes into one large contiguous block',
      'Encrypting memory pages',
      'Compressing process data files'
    ],
    answer: 1,
    explanation: 'Compaction slides all allocated processes down to low memory, consolidating scattered free fragments into one contiguous block at high memory.'
  },
  {
    id: 10,
    question: 'If Total RAM = 1024 KB, OS Reserved = 128 KB, and Active Processes = 400 KB, what is the Memory Utilization %?',
    options: ['39%', '44.6%', '50%', '75%'],
    answer: 1,
    explanation: 'Available RAM = 1024 - 128 = 896 KB. Memory Utilization = (400 / 896) * 100 = 44.6%.'
  },
  {
    id: 11,
    question: 'Formula for calculating the End Address of a memory block starting at address S with size K:',
    options: ['End = S - K', 'End = S + K', 'End = S * K', 'End = S / K'],
    answer: 1,
    explanation: 'End Address = Start Address + Size (e.g. Start 128 KB + Size 150 KB = End Address 278 KB).'
  },
  {
    id: 12,
    question: 'According to Knuth\'s 50% Rule for First Fit, if N processes are allocated, approximately how many free holes exist?',
    options: ['N / 4', 'N / 2', 'N * 2', 'N'],
    answer: 1,
    explanation: 'Knuth\'s 50% Rule states that in steady-state First Fit allocation, the number of free holes tends to be approximately N / 2, where N is the number of allocated blocks.'
  },
  {
    id: 13,
    question: 'Which fit algorithm generally has the fastest search time for initial allocations?',
    options: ['Best Fit', 'Worst Fit', 'First Fit', 'Compaction'],
    answer: 2,
    explanation: 'First Fit stops scanning as soon as it finds the first fitting block, resulting in fewer block comparisons on average than Best Fit or Worst Fit.'
  },
  {
    id: 14,
    question: 'What is the main drawback of Memory Compaction?',
    options: [
      'It increases internal fragmentation',
      'It requires CPU overhead and memory bus bandwidth to physically relocate active processes in RAM',
      'It destroys process data',
      'It cannot be done in dynamic partitioning'
    ],
    answer: 1,
    explanation: 'Compaction incurs significant CPU and memory bus overhead because every byte of relocated process memory must be moved in RAM.'
  },
  {
    id: 15,
    question: 'Why does Best Fit often lead to high external fragmentation over time?',
    options: [
      'Because it allocates from top memory',
      'Because it leaves tiny, unusable residual leftover fragments after splitting candidate holes',
      'Because it ignores OS reserved space',
      'Because it never merges adjacent holes'
    ],
    answer: 1,
    explanation: 'By picking the smallest hole that fits, Best Fit minimizes leftover space per allocation, producing tiny residual fragments (e.g. 4 KB) that are too small for future process requests.'
  }
];

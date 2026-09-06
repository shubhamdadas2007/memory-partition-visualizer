import { VivaQuestion } from '../types';

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: 'Easy',
    topic: 'Basic Allocation',
    question: 'What is contiguous memory allocation and how does it differ from non-contiguous allocation?',
    answer: 'In contiguous memory allocation, each process is loaded into a single continuous block of physical memory addresses. In non-contiguous allocation (such as paging or segmentation), a process\'s logical address space can be split and scattered across different non-contiguous physical frames in RAM.'
  },
  {
    id: 2,
    category: 'Easy',
    topic: 'Fragmentation',
    question: 'Define internal fragmentation and state its mathematical formula.',
    answer: 'Internal fragmentation is wasted memory inside an allocated partition when the process requirement is smaller than the partition capacity. Formula: Internal Fragmentation = Partition Size - Process Size. It occurs in Fixed Partitioning Mode; in Dynamic Mode, internal fragmentation is 0 KB.'
  },
  {
    id: 3,
    category: 'Easy',
    topic: 'Fragmentation',
    question: 'Define external fragmentation and explain why it occurs.',
    answer: 'External fragmentation occurs when total free memory in RAM is sufficient to satisfy a process request, but the free space is divided into separate, non-contiguous holes. As a result, no single contiguous block is large enough to hold the process.'
  },
  {
    id: 4,
    category: 'Medium',
    topic: 'Algorithms',
    question: 'Compare First Fit, Best Fit, and Worst Fit in terms of search cost and memory utilization.',
    answer: 'First Fit is generally fastest (lowest search cost) because it stops at the first fitting hole. Best Fit achieves tight memory utilization initially but tends to leave tiny unusable residual fragments. Worst Fit preserves larger remaining fragments by placing processes into the largest available hole, though it quickly consumes large contiguous blocks.'
  },
  {
    id: 5,
    category: 'Medium',
    topic: 'Memory Operations',
    question: 'What is coalescing and when is it performed by the Operating System?',
    answer: 'Coalescing is the process of merging adjacent free memory holes into a single larger contiguous hole. It is automatically performed by the OS memory manager whenever a process terminates and its memory block is deallocated.'
  },
  {
    id: 6,
    category: 'Medium',
    topic: 'Memory Operations',
    question: 'What is memory compaction, and what conditions are required for compaction to be possible?',
    answer: 'Memory compaction is the process of relocating active allocated processes toward low memory so that all scattered free fragments are combined into one single contiguous block at high memory. Compaction is only possible if dynamic relocation is supported by hardware using base/relocation registers.'
  },
  {
    id: 7,
    category: 'Hard',
    topic: 'Viva Defense',
    question: 'In your simulator, why can an allocation fail even when Total Free Memory is 450 KB and process requirement is 300 KB?',
    answer: 'This is a classic Fragmentation-Induced Allocation Failure. Although Total Free Memory is 450 KB, it is distributed across multiple non-contiguous holes (e.g., 250 KB and 200 KB). Because memory allocation is contiguous, a 300 KB process cannot be placed because the largest single free block (250 KB) is smaller than 300 KB.'
  },
  {
    id: 8,
    category: 'Hard',
    topic: 'Algorithms',
    question: 'Explain Next Fit and describe a scenario where Next Fit performs worse than First Fit.',
    answer: 'Next Fit maintains a search cursor pointer at the last allocation address and resumes scanning forward from that point. If a large process is deallocated at low memory (e.g., address 0x0080), First Fit will immediately reuse that hole, whereas Next Fit will bypass it until its cursor wraps around memory, leading to premature allocation failure at high memory.'
  },
  {
    id: 9,
    category: 'Hard',
    topic: 'Theory & Trade-offs',
    question: 'What is Knuth\'s 50% Rule in memory management?',
    answer: 'Knuth\'s 50% Rule states that for First Fit in steady state, if N processes are allocated, approximately 0.5 * N free holes will exist in memory due to hole splitting over time. This implies that one-third of memory management efforts deal with hole fragmentation.'
  },
  {
    id: 10,
    category: 'Hard',
    topic: 'System Design',
    question: 'Why is paging preferred over contiguous dynamic partitioning in modern Operating Systems?',
    answer: 'Paging eliminates external fragmentation entirely by dividing physical memory into fixed-size frames and logical memory into pages. This avoids the need for expensive memory compaction and allows processes to be loaded into non-contiguous physical memory frames.'
  }
];

import { MemoryBlock, PartitionScheme } from '../types';

export interface FragmentationDetails {
  internalFrag: number;       // in KB
  externalFrag: number;       // in KB
  totalFreeMemory: number;    // in KB
  largestFreeBlock: number;   // in KB
  freeHolesCount: number;     // count
  isFragInducedFailure: boolean;
}

/**
 * Calculates fragmentation metrics based on academic OS principles.
 */
export function calculateFragmentation(
  blocks: MemoryBlock[],
  scheme: PartitionScheme,
  lastFailedReqSize: number = 0,
  lastFailedExtFrag: boolean = false
): FragmentationDetails {
  let internalFrag = 0;
  let totalFreeMemory = 0;
  const freeHoleSizes: number[] = [];

  blocks.forEach(block => {
    if (block.status === 'allocated') {
      if (scheme !== 'dynamic') {
        // Fixed Partition Mode: Internal Fragmentation = Partition Size - Process Size
        internalFrag += block.internalFrag;
      } else {
        // Dynamic Partition Mode: Internal Fragmentation is ALWAYS 0
        internalFrag += 0;
      }
    } else if (block.status === 'free') {
      totalFreeMemory += block.size;
      freeHoleSizes.push(block.size);
    }
  });

  const largestFreeBlock = freeHoleSizes.length > 0 ? Math.max(...freeHoleSizes) : 0;
  const freeHolesCount = freeHoleSizes.length;

  // External fragmentation definition: Total free memory distributed across non-contiguous holes
  let externalFrag = 0;
  if (scheme === 'dynamic') {
    externalFrag = freeHolesCount > 1 ? totalFreeMemory : 0;
  } else {
    externalFrag = totalFreeMemory;
  }

  // Fragmentation-Induced Allocation Failure check
  const isFragInducedFailure =
    lastFailedExtFrag &&
    (totalFreeMemory >= lastFailedReqSize) &&
    (largestFreeBlock < lastFailedReqSize);

  return {
    internalFrag,
    externalFrag,
    totalFreeMemory,
    largestFreeBlock,
    freeHolesCount,
    isFragInducedFailure
  };
}

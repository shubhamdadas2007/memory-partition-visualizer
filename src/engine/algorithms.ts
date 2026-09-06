import { MemoryBlock, FitAlgorithm, TraceStep } from '../types';

export interface AlgorithmResult {
  selectedBlock: MemoryBlock | null;
  searchCost: number;
  examinedBlocks: MemoryBlock[];
  success: boolean;
  failureReason?: string;
  nextPointer?: number;
  traceSteps: TraceStep[];
}

/**
 * Independent Algorithm Functions for Simulation Engine & UI Explanations
 */

export function runFirstFit(blocks: MemoryBlock[], reqSize: number): AlgorithmResult {
  const traceSteps: TraceStep[] = [];
  const examinedBlocks: MemoryBlock[] = [];
  let selectedBlock: MemoryBlock | null = null;
  let searchCost = 0;

  const freeBlocks = blocks.filter(b => b.status === 'free');

  for (let i = 0; i < freeBlocks.length; i++) {
    searchCost++;
    const b = freeBlocks[i];
    examinedBlocks.push(b);

    if (b.size >= reqSize) {
      selectedBlock = b;
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'accepted',
        reason: `Hole at ${b.startAddr} KB (${b.size} KB) fits request of ${reqSize} KB. FIT FOUND!`
      });
      break;
    } else {
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'rejected',
        reason: `Hole at ${b.startAddr} KB (${b.size} KB) is smaller than required ${reqSize} KB.`
      });
    }
  }

  return {
    selectedBlock,
    searchCost,
    examinedBlocks,
    success: selectedBlock !== null,
    failureReason: selectedBlock ? undefined : 'No free hole large enough.',
    traceSteps
  };
}

export function runBestFit(blocks: MemoryBlock[], reqSize: number): AlgorithmResult {
  const traceSteps: TraceStep[] = [];
  const examinedBlocks: MemoryBlock[] = [];
  let selectedBlock: MemoryBlock | null = null;
  let searchCost = 0;

  const candidateHoles = blocks.filter(b => b.status === 'free' && b.size >= reqSize);
  const freeBlocks = blocks.filter(b => b.status === 'free');

  freeBlocks.forEach((b, idx) => {
    searchCost++;
    examinedBlocks.push(b);
    if (b.size >= reqSize) {
      const waste = b.size - reqSize;
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'candidate',
        reason: `Hole at ${b.startAddr} KB (${b.size} KB) fits! Residual waste = ${waste} KB.`
      });
    } else {
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'rejected',
        reason: `Hole at ${b.startAddr} KB (${b.size} KB) < required ${reqSize} KB.`
      });
    }
  });

  if (candidateHoles.length > 0) {
    candidateHoles.sort((a, b) => a.size - b.size);
    selectedBlock = candidateHoles[0];
  }

  return {
    selectedBlock,
    searchCost,
    examinedBlocks,
    success: selectedBlock !== null,
    failureReason: selectedBlock ? undefined : 'No free hole large enough.',
    traceSteps
  };
}

export function runWorstFit(blocks: MemoryBlock[], reqSize: number): AlgorithmResult {
  const traceSteps: TraceStep[] = [];
  const examinedBlocks: MemoryBlock[] = [];
  let selectedBlock: MemoryBlock | null = null;
  let searchCost = 0;

  const candidateHoles = blocks.filter(b => b.status === 'free' && b.size >= reqSize);
  const freeBlocks = blocks.filter(b => b.status === 'free');

  freeBlocks.forEach((b, idx) => {
    searchCost++;
    examinedBlocks.push(b);
    if (b.size >= reqSize) {
      const waste = b.size - reqSize;
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'candidate',
        reason: `Hole at ${b.startAddr} KB (${b.size} KB) fits! Residual waste = ${waste} KB.`
      });
    } else {
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'rejected',
        reason: `Hole at ${b.startAddr} KB (${b.size} KB) < required ${reqSize} KB.`
      });
    }
  });

  if (candidateHoles.length > 0) {
    candidateHoles.sort((a, b) => b.size - a.size);
    selectedBlock = candidateHoles[0];
  }

  return {
    selectedBlock,
    searchCost,
    examinedBlocks,
    success: selectedBlock !== null,
    failureReason: selectedBlock ? undefined : 'No free hole large enough.',
    traceSteps
  };
}

export function runNextFit(blocks: MemoryBlock[], reqSize: number, pointer: number = 128): AlgorithmResult {
  const traceSteps: TraceStep[] = [];
  const examinedBlocks: MemoryBlock[] = [];
  let selectedBlock: MemoryBlock | null = null;
  let searchCost = 0;
  let nextPointer = pointer;

  const freeBlocks = blocks.filter(b => b.status === 'free');

  for (let i = 0; i < freeBlocks.length; i++) {
    searchCost++;
    const b = freeBlocks[i];
    if (b.startAddr >= pointer && b.size >= reqSize) {
      selectedBlock = b;
      examinedBlocks.push(b);
      traceSteps.push({
        stepIndex: searchCost,
        holeId: b.id,
        startAddr: b.startAddr,
        holeSize: b.size,
        reqSize,
        decision: 'accepted',
        reason: `Found hole past cursor at ${b.startAddr} KB (${b.size} KB). FIT FOUND!`
      });
      break;
    }
  }

  if (!selectedBlock) {
    for (let i = 0; i < freeBlocks.length; i++) {
      searchCost++;
      const b = freeBlocks[i];
      if (b.startAddr < pointer && b.size >= reqSize) {
        selectedBlock = b;
        examinedBlocks.push(b);
        traceSteps.push({
          stepIndex: searchCost,
          holeId: b.id,
          startAddr: b.startAddr,
          holeSize: b.size,
          reqSize,
          decision: 'accepted',
          reason: `Wrapped search hole found at ${b.startAddr} KB (${b.size} KB). FIT FOUND!`
        });
        break;
      }
    }
  }

  if (selectedBlock) {
    nextPointer = selectedBlock.endAddr;
  }

  return {
    selectedBlock,
    searchCost,
    examinedBlocks,
    success: selectedBlock !== null,
    failureReason: selectedBlock ? undefined : 'No free hole large enough.',
    nextPointer,
    traceSteps
  };
}

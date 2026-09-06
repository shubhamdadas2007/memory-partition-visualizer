import { MemoryBlock, Process, PartitionScheme, FitAlgorithm, Metrics, AllocationResult, TraceStep } from '../types';

export class MemoryEngine {
  totalSize: number; // in KB
  osSize: number;    // in KB
  scheme: PartitionScheme;
  algorithm: FitAlgorithm;

  blocks: MemoryBlock[];
  processes: Process[];
  nextFitPointer: number; // Search cursor address in KB
  searchStepsCount: number;

  stats: {
    totalRequested: number;
    succeeded: number;
    failed: number;
    compactionCount: number;
  };

  lastAllocationFailedExtFrag: boolean = false;
  lastFailedReqSize: number = 0;

  constructor(totalSize: number = 1024, osSize: number = 128) {
    this.totalSize = totalSize;
    this.osSize = osSize;
    this.scheme = 'dynamic';
    this.algorithm = 'first';

    this.blocks = [];
    this.processes = [];
    this.nextFitPointer = osSize;
    this.searchStepsCount = 0;

    this.stats = {
      totalRequested: 0,
      succeeded: 0,
      failed: 0,
      compactionCount: 0
    };

    this.initMemory();
  }

  initMemory() {
    this.blocks = [];
    this.processes = [];
    this.nextFitPointer = this.osSize;
    this.searchStepsCount = 0;

    this.stats = {
      totalRequested: 0,
      succeeded: 0,
      failed: 0,
      compactionCount: 0
    };

    this.lastAllocationFailedExtFrag = false;
    this.lastFailedReqSize = 0;

    // Always create OS Reserved Block at start
    const osBlock: MemoryBlock = {
      id: 'block-os',
      startAddr: 0,
      endAddr: this.osSize,
      size: this.osSize,
      status: 'os',
      processId: 'OS Kernel',
      processName: 'OS Kernel',
      reqSize: this.osSize,
      internalFrag: 0
    };
    this.blocks.push(osBlock);

    const userSpace = this.totalSize - this.osSize;

    if (this.scheme === 'dynamic') {
      this.blocks.push({
        id: 'block-free-0',
        startAddr: this.osSize,
        endAddr: this.totalSize,
        size: userSpace,
        status: 'free',
        internalFrag: 0
      });
    } else if (this.scheme === 'fixed-equal') {
      const partSize = 128;
      let addr = this.osSize;
      let partIdx = 1;
      while (addr + partSize <= this.totalSize) {
        this.blocks.push({
          id: `part-${partIdx}`,
          startAddr: addr,
          endAddr: addr + partSize,
          size: partSize,
          status: 'free',
          internalFrag: 0,
          partitionId: `Partition ${partIdx} (${partSize} KB)`
        });
        addr += partSize;
        partIdx++;
      }
    } else if (this.scheme === 'fixed-unequal') {
      const partSizes = [64, 128, 256, 448];
      let addr = this.osSize;
      partSizes.forEach((partSize, idx) => {
        if (addr + partSize <= this.totalSize) {
          this.blocks.push({
            id: `part-${idx + 1}`,
            startAddr: addr,
            endAddr: addr + partSize,
            size: partSize,
            status: 'free',
            internalFrag: 0,
            partitionId: `Partition ${idx + 1} (${partSize} KB)`
          });
          addr += partSize;
        }
      });
    }
  }

  setConfiguration(scheme: PartitionScheme, algorithm: FitAlgorithm) {
    this.scheme = scheme;
    this.algorithm = algorithm;
    this.initMemory();
  }

  allocate(processId: string, reqSize: number, processName?: string): AllocationResult {
    this.stats.totalRequested++;
    const name = processName || processId;

    if (reqSize <= 0 || reqSize > (this.totalSize - this.osSize)) {
      this.stats.failed++;
      return {
        success: false,
        reason: `Process size ${reqSize} KB is invalid or exceeds user space capacity!`,
        logs: [`[FAILED] ${processId} (${reqSize} KB) exceeds max available RAM bounds.`],
        traceSteps: []
      };
    }

    if (this.scheme === 'dynamic') {
      return this._allocateDynamic(processId, name, reqSize);
    } else {
      return this._allocateFixed(processId, name, reqSize);
    }
  }

  private _allocateDynamic(processId: string, name: string, reqSize: number): AllocationResult {
    const logs: string[] = [];
    const traceSteps: TraceStep[] = [];
    const freeHoles: { block: MemoryBlock; index: number }[] = [];

    this.blocks.forEach((block, index) => {
      if (block.status === 'free') {
        freeHoles.push({ block, index });
      }
    });

    if (freeHoles.length === 0) {
      this.stats.failed++;
      return {
        success: false,
        reason: 'Zero free memory holes remaining.',
        logs: [`[FAILED] ${processId} (${reqSize} KB): Memory is completely full.`],
        traceSteps: []
      };
    }

    const candidateHoles = freeHoles.filter(h => h.block.size >= reqSize);

    // Detect Fragmentation-Induced Allocation Failure
    if (candidateHoles.length === 0) {
      const totalFree = this.getMetrics().freeRam;
      const largestFree = Math.max(...freeHoles.map(h => h.block.size));
      this.stats.failed++;
      this.lastAllocationFailedExtFrag = true;
      this.lastFailedReqSize = reqSize;

      logs.push(`🚨 [EXTERNAL FRAGMENTATION FAILURE] Process ${processId} (${reqSize} KB) failed allocation.`);
      logs.push(`Total Free Memory = ${totalFree} KB across ${freeHoles.length} non-contiguous holes.`);
      logs.push(`Largest Single Free Block = ${largestFree} KB (Insufficient for ${reqSize} KB requirement).`);

      return {
        success: false,
        reason: `External Fragmentation! Total Free Memory is ${totalFree} KB across ${freeHoles.length} holes, but largest contiguous block is only ${largestFree} KB.`,
        externalFragDetected: true,
        logs,
        traceSteps: []
      };
    }

    let chosenHole: { block: MemoryBlock; index: number } | null = null;

    if (this.algorithm === 'first') {
      logs.push(`[FIRST FIT TRACE] Scanning memory holes sequentially from 0 KB (${this.osSize} KB OS Kernel end)...`);
      for (let i = 0; i < freeHoles.length; i++) {
        this.searchStepsCount++;
        const h = freeHoles[i];
        const hexAddr = '0x' + h.block.startAddr.toString(16).padStart(4, '0').toUpperCase();

        if (h.block.size >= reqSize) {
          traceSteps.push({
            stepIndex: i + 1,
            holeId: h.block.id,
            startAddr: h.block.startAddr,
            holeSize: h.block.size,
            reqSize,
            decision: 'accepted',
            reason: `Hole at ${h.block.startAddr} KB (${hexAddr}) has size ${h.block.size} KB >= ${reqSize} KB. FIT FOUND!`
          });
          logs.push(`  └─ Hole #${i + 1} at ${h.block.startAddr} KB (${hexAddr}, Size: ${h.block.size} KB): FIT FOUND! First fitting block selected.`);
          chosenHole = h;
          break;
        } else {
          traceSteps.push({
            stepIndex: i + 1,
            holeId: h.block.id,
            startAddr: h.block.startAddr,
            holeSize: h.block.size,
            reqSize,
            decision: 'rejected',
            reason: `Hole size ${h.block.size} KB is smaller than required ${reqSize} KB.`
          });
          logs.push(`  └─ Hole #${i + 1} at ${h.block.startAddr} KB (${hexAddr}, Size: ${h.block.size} KB): Skipped (Too small).`);
        }
      }
    } else if (this.algorithm === 'best') {
      logs.push(`[BEST FIT TRACE] Scanning all ${freeHoles.length} free holes to minimize residual waste...`);
      candidateHoles.sort((a, b) => a.block.size - b.block.size);

      freeHoles.forEach((h, idx) => {
        this.searchStepsCount++;
        const hexAddr = '0x' + h.block.startAddr.toString(16).padStart(4, '0').toUpperCase();
        if (h.block.size >= reqSize) {
          const waste = h.block.size - reqSize;
          traceSteps.push({
            stepIndex: idx + 1,
            holeId: h.block.id,
            startAddr: h.block.startAddr,
            holeSize: h.block.size,
            reqSize,
            decision: 'candidate',
            reason: `Hole at ${h.block.startAddr} KB fits with residual remainder ${waste} KB.`
          });
          logs.push(`  └─ Hole #${idx + 1} at ${h.block.startAddr} KB (${hexAddr}, Size: ${h.block.size} KB): Fits! Residual remainder = ${waste} KB.`);
        } else {
          traceSteps.push({
            stepIndex: idx + 1,
            holeId: h.block.id,
            startAddr: h.block.startAddr,
            holeSize: h.block.size,
            reqSize,
            decision: 'rejected',
            reason: `Hole size ${h.block.size} KB < required ${reqSize} KB.`
          });
          logs.push(`  └─ Hole #${idx + 1} at ${h.block.startAddr} KB (${hexAddr}, Size: ${h.block.size} KB): Too small.`);
        }
      });

      chosenHole = candidateHoles[0];
      const minWaste = chosenHole.block.size - reqSize;
      logs.push(`  👉 Selected smallest fitting hole at ${chosenHole.block.startAddr} KB (${chosenHole.block.size} KB, Min residual waste: ${minWaste} KB).`);
    } else if (this.algorithm === 'worst') {
      logs.push(`[WORST FIT TRACE] Scanning all ${freeHoles.length} free holes to maximize residual fragment size...`);
      candidateHoles.sort((a, b) => b.block.size - a.block.size);

      freeHoles.forEach((h, idx) => {
        this.searchStepsCount++;
        const hexAddr = '0x' + h.block.startAddr.toString(16).padStart(4, '0').toUpperCase();
        if (h.block.size >= reqSize) {
          const waste = h.block.size - reqSize;
          traceSteps.push({
            stepIndex: idx + 1,
            holeId: h.block.id,
            startAddr: h.block.startAddr,
            holeSize: h.block.size,
            reqSize,
            decision: 'candidate',
            reason: `Hole at ${h.block.startAddr} KB fits with residual remainder ${waste} KB.`
          });
          logs.push(`  └─ Hole #${idx + 1} at ${h.block.startAddr} KB (${hexAddr}, Size: ${h.block.size} KB): Fits! Residual remainder = ${waste} KB.`);
        } else {
          traceSteps.push({
            stepIndex: idx + 1,
            holeId: h.block.id,
            startAddr: h.block.startAddr,
            holeSize: h.block.size,
            reqSize,
            decision: 'rejected',
            reason: `Hole size ${h.block.size} KB < required ${reqSize} KB.`
          });
          logs.push(`  └─ Hole #${idx + 1} at ${h.block.startAddr} KB (${hexAddr}, Size: ${h.block.size} KB): Too small.`);
        }
      });

      chosenHole = candidateHoles[0];
      const maxWaste = chosenHole.block.size - reqSize;
      logs.push(`  👉 Selected largest hole at ${chosenHole.block.startAddr} KB (${chosenHole.block.size} KB, Max residual waste: ${maxWaste} KB).`);
    } else if (this.algorithm === 'next') {
      logs.push(`[NEXT FIT TRACE] Scanning starting from search cursor address ${this.nextFitPointer} KB...`);
      let found: { block: MemoryBlock; index: number } | null = null;

      for (let i = 0; i < freeHoles.length; i++) {
        this.searchStepsCount++;
        const h = freeHoles[i];
        if (h.block.startAddr >= this.nextFitPointer && h.block.size >= reqSize) {
          found = h;
          logs.push(`  └─ Found fitting hole past cursor at ${h.block.startAddr} KB (${h.block.size} KB). FIT FOUND!`);
          break;
        }
      }

      if (!found) {
        logs.push(`  └─ Reached top memory bounds. Wrapping search around to ${this.osSize} KB...`);
        for (let i = 0; i < freeHoles.length; i++) {
          this.searchStepsCount++;
          const h = freeHoles[i];
          if (h.block.startAddr < this.nextFitPointer && h.block.size >= reqSize) {
            found = h;
            logs.push(`  └─ Wrapped hole found at ${h.block.startAddr} KB (${h.block.size} KB). FIT FOUND!`);
            break;
          }
        }
      }

      chosenHole = found || candidateHoles[0];
    }

    if (!chosenHole) {
      chosenHole = candidateHoles[0];
    }

    const targetBlock = chosenHole.block;
    const targetIndex = this.blocks.indexOf(targetBlock);

    // In Dynamic mode, internal frag is ALWAYS 0. The remainder becomes a new free hole.
    const allocatedBlock: MemoryBlock = {
      id: `block-proc-${processId}-${Date.now()}`,
      startAddr: targetBlock.startAddr,
      endAddr: targetBlock.startAddr + reqSize,
      size: reqSize,
      status: 'allocated',
      processId,
      processName: name,
      reqSize,
      internalFrag: 0
    };

    const remainingSize = targetBlock.size - reqSize;

    if (remainingSize > 0) {
      const splitFreeBlock: MemoryBlock = {
        id: `block-free-${Date.now()}`,
        startAddr: targetBlock.startAddr + reqSize,
        endAddr: targetBlock.endAddr,
        size: remainingSize,
        status: 'free',
        internalFrag: 0
      };
      this.blocks.splice(targetIndex, 1, allocatedBlock, splitFreeBlock);
    } else {
      this.blocks.splice(targetIndex, 1, allocatedBlock);
    }

    this.nextFitPointer = (allocatedBlock.endAddr) % this.totalSize;
    if (this.nextFitPointer < this.osSize) this.nextFitPointer = this.osSize;

    this.stats.succeeded++;
    this.processes.push({
      id: processId,
      name,
      reqSize,
      allocatedSize: reqSize,
      blockId: allocatedBlock.id,
      status: 'allocated',
      internalFrag: 0
    });

    logs.push(`[SUCCESS] Allocated ${processId} (${reqSize} KB) at address range ${allocatedBlock.startAddr} - ${allocatedBlock.endAddr} KB.`);
    this.lastAllocationFailedExtFrag = false;

    return {
      success: true,
      block: allocatedBlock,
      internalFrag: 0,
      logs,
      traceSteps
    };
  }

  private _allocateFixed(processId: string, name: string, reqSize: number): AllocationResult {
    const logs: string[] = [];
    const traceSteps: TraceStep[] = [];
    const freePartitions: { block: MemoryBlock; index: number }[] = [];

    this.blocks.forEach((block, index) => {
      if (block.status === 'free') {
        freePartitions.push({ block, index });
      }
    });

    const candidatePartitions = freePartitions.filter(p => p.block.size >= reqSize);

    if (candidatePartitions.length === 0) {
      this.stats.failed++;
      logs.push(`[FAILED/EXTERNAL FRAG] Process ${processId} (${reqSize} KB) exceeds all free partition sizes.`);
      return {
        success: false,
        reason: `No free partition large enough for process ${processId} (${reqSize} KB).`,
        logs,
        traceSteps: []
      };
    }

    let chosenPart: { block: MemoryBlock; index: number } | null = null;

    if (this.algorithm === 'first') {
      chosenPart = candidatePartitions[0];
      logs.push(`[FIRST FIT] Selected partition ${chosenPart.block.partitionId || 'Block'}.`);
    } else if (this.algorithm === 'best') {
      candidatePartitions.sort((a, b) => a.block.size - b.block.size);
      chosenPart = candidatePartitions[0];
      logs.push(`[BEST FIT] Selected partition ${chosenPart.block.partitionId || 'Block'} (Min internal frag: ${chosenPart.block.size - reqSize} KB).`);
    } else if (this.algorithm === 'worst') {
      candidatePartitions.sort((a, b) => b.block.size - a.block.size);
      chosenPart = candidatePartitions[0];
      logs.push(`[WORST FIT] Selected partition ${chosenPart.block.partitionId || 'Block'} (Max internal frag: ${chosenPart.block.size - reqSize} KB).`);
    } else if (this.algorithm === 'next') {
      let found: { block: MemoryBlock; index: number } | null = null;
      for (const p of freePartitions) {
        if (p.block.startAddr >= this.nextFitPointer && p.block.size >= reqSize) {
          found = p;
          break;
        }
      }
      if (!found) {
        for (const p of freePartitions) {
          if (p.block.startAddr < this.nextFitPointer && p.block.size >= reqSize) {
            found = p;
            break;
          }
        }
      }
      chosenPart = found || candidatePartitions[0];
    }

    if (!chosenPart) chosenPart = candidatePartitions[0];

    const pBlock = chosenPart.block;
    // In Fixed Partition Mode: Internal Fragmentation = Partition Size - Process Size
    const internalWaste = pBlock.size - reqSize;

    pBlock.status = 'allocated';
    pBlock.processId = processId;
    pBlock.processName = name;
    pBlock.reqSize = reqSize;
    pBlock.internalFrag = internalWaste;

    this.nextFitPointer = (pBlock.endAddr) % this.totalSize;
    if (this.nextFitPointer < this.osSize) this.nextFitPointer = this.osSize;

    this.stats.succeeded++;
    this.processes.push({
      id: processId,
      name,
      reqSize,
      allocatedSize: pBlock.size,
      blockId: pBlock.id,
      status: 'allocated',
      internalFrag: internalWaste
    });

    logs.push(`[SUCCESS] Allocated ${processId} (${reqSize} KB) in ${pBlock.partitionId}. Internal Frag: ${internalWaste} KB.`);

    return {
      success: true,
      block: pBlock,
      internalFrag: internalWaste,
      logs,
      traceSteps
    };
  }

  deallocate(processId: string): { success: boolean; logs: string[] } {
    const logs: string[] = [];
    let found = false;

    if (this.scheme === 'dynamic') {
      this.blocks.forEach(block => {
        if (block.status === 'allocated' && block.processId === processId) {
          block.status = 'free';
          block.processId = undefined;
          block.processName = undefined;
          block.reqSize = 0;
          block.internalFrag = 0;
          found = true;
          logs.push(`Deallocated process ${processId} at address range ${block.startAddr} - ${block.endAddr} KB.`);
        }
      });

      if (found) {
        this.mergeAdjacentFreeBlocks(logs);
      }
    } else {
      // Fixed Mode
      this.blocks.forEach(block => {
        if (block.status === 'allocated' && block.processId === processId) {
          block.status = 'free';
          block.processId = undefined;
          block.processName = undefined;
          block.reqSize = 0;
          block.internalFrag = 0;
          found = true;
          logs.push(`Deallocated process ${processId} from ${block.partitionId || 'partition'}.`);
        }
      });
    }

    this.processes = this.processes.filter(p => p.id !== processId);
    return { success: found, logs };
  }

  mergeAdjacentFreeBlocks(logs?: string[]) {
    if (this.scheme !== 'dynamic') return;

    let i = 0;
    let mergedCount = 0;

    while (i < this.blocks.length - 1) {
      const current = this.blocks[i];
      const next = this.blocks[i + 1];

      if (current.status === 'free' && next.status === 'free') {
        current.size += next.size;
        current.endAddr = next.endAddr;
        this.blocks.splice(i + 1, 1);
        mergedCount++;
      } else {
        i++;
      }
    }

    if (mergedCount > 0 && logs) {
      logs.push(`[COALESCING] Merged ${mergedCount + 1} adjacent free blocks into a single contiguous hole.`);
    }
  }

  compactMemory(): { success: boolean; freeHoleSize?: number; reason?: string; logs: string[] } {
    if (this.scheme !== 'dynamic') {
      return { success: false, reason: 'Compaction is only applicable to Dynamic Partitioning Mode.', logs: [] };
    }

    const logs: string[] = [];
    this.stats.compactionCount++;

    const osBlock = this.blocks[0];
    const allocatedBlocks = this.blocks.filter(b => b.status === 'allocated');

    let currentAddr = this.osSize;
    const newBlocks: MemoryBlock[] = [osBlock];

    allocatedBlocks.forEach(block => {
      block.startAddr = currentAddr;
      block.endAddr = currentAddr + block.size;
      currentAddr += block.size;
      newBlocks.push(block);
    });

    const totalFreeSize = this.totalSize - currentAddr;

    if (totalFreeSize > 0) {
      newBlocks.push({
        id: `block-free-compact-${Date.now()}`,
        startAddr: currentAddr,
        endAddr: this.totalSize,
        size: totalFreeSize,
        status: 'free',
        internalFrag: 0
      });
    }

    this.blocks = newBlocks;
    this.nextFitPointer = currentAddr % this.totalSize;
    if (this.nextFitPointer < this.osSize) this.nextFitPointer = this.osSize;

    logs.push(`[COMPACTION COMPLETED] Moved ${allocatedBlocks.length} processes down to low memory. Consolidated ${totalFreeSize} KB free space into a single contiguous hole.`);

    return {
      success: true,
      freeHoleSize: totalFreeSize,
      logs
    };
  }

  getMetrics(): Metrics {
    let usedRam = 0;
    let freeRam = 0;
    let internalFrag = 0;
    let externalFrag = 0;

    const freeHoles: number[] = [];

    this.blocks.forEach(block => {
      if (block.status === 'allocated') {
        usedRam += (block.reqSize || block.size);
        internalFrag += block.internalFrag;
      } else if (block.status === 'free') {
        freeRam += block.size;
        freeHoles.push(block.size);
      }
    });

    const availableRam = this.totalSize - this.osSize;
    const utilizationPct = availableRam > 0 ? Math.round((usedRam / availableRam) * 100) : 0;
    const largestFreeBlock = freeHoles.length > 0 ? Math.max(...freeHoles) : 0;
    const freeHolesCount = freeHoles.length;

    // External fragmentation definition: Total free memory distributed across non-contiguous holes
    if (this.scheme === 'dynamic') {
      externalFrag = freeHolesCount > 1 ? freeRam : 0;
    } else {
      externalFrag = freeRam;
    }

    // Fragmentation-induced allocation failure check
    const fragInducedFailure = this.lastAllocationFailedExtFrag && (freeRam >= this.lastFailedReqSize) && (largestFreeBlock < this.lastFailedReqSize);

    const avgSearchSteps = this.stats.totalRequested > 0 ? parseFloat((this.searchStepsCount / this.stats.totalRequested).toFixed(1)) : 0;

    return {
      totalRam: this.totalSize,
      osSize: this.osSize,
      availableRam,
      usedRam,
      freeRam,
      utilizationPct,
      internalFrag,
      externalFrag,
      largestFreeBlock,
      freeHolesCount,
      succeeded: this.stats.succeeded,
      failed: this.stats.failed,
      totalRequested: this.stats.totalRequested,
      avgSearchSteps,
      fragInducedFailure
    };
  }
}

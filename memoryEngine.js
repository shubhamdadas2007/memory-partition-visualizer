/**
 * MemoryEngine - Core Memory Management Data Structures and Partition Algorithms
 */

class MemoryEngine {
  constructor(totalSize = 1024, osSize = 128) {
    this.totalSize = totalSize;
    this.osSize = osSize;
    this.scheme = 'dynamic'; // 'dynamic', 'fixed-equal', 'fixed-unequal'
    this.algorithm = 'first'; // 'first', 'best', 'worst', 'next'
    
    this.blocks = [];
    this.nextFitPointer = osSize; // Starts right after OS block
    this.processes = []; // Active allocated processes
    this.allocationStats = {
      totalRequested: 0,
      succeeded: 0,
      failed: 0,
      compactionCount: 0
    };

    this.initMemory();
  }

  initMemory() {
    this.blocks = [];
    this.nextFitPointer = this.osSize;
    this.processes = [];
    this.allocationStats = {
      totalRequested: 0,
      succeeded: 0,
      failed: 0,
      compactionCount: 0
    };

    // Always create OS Reserved Block at start
    const osBlock = {
      id: 'block-os',
      startAddr: 0,
      size: this.osSize,
      type: 'os',
      processId: 'OS',
      reqSize: this.osSize,
      internalFrag: 0
    };
    this.blocks.push(osBlock);

    const userSpaceSize = this.totalSize - this.osSize;

    if (this.scheme === 'dynamic') {
      // Dynamic: Single large free block for user space
      this.blocks.push({
        id: 'block-free-0',
        startAddr: this.osSize,
        size: userSpaceSize,
        type: 'free',
        processId: null,
        reqSize: 0,
        internalFrag: 0
      });
    } else if (this.scheme === 'fixed-equal') {
      // Fixed equal partitions e.g., 7 partitions of 128 KB each (OS takes 1st 128KB)
      const partSize = 128;
      let addr = this.osSize;
      let partIdx = 1;
      while (addr + partSize <= this.totalSize) {
        this.blocks.push({
          id: `part-${partIdx}`,
          startAddr: addr,
          size: partSize,
          type: 'free',
          processId: null,
          reqSize: 0,
          internalFrag: 0,
          partitionId: `Partition ${partIdx} (${partSize}KB)`
        });
        addr += partSize;
        partIdx++;
      }
    } else if (this.scheme === 'fixed-unequal') {
      // Fixed unequal partitions: 64KB, 128KB, 256KB, 448KB (Total = 896KB user space)
      const partSizes = [64, 128, 256, 448];
      let addr = this.osSize;
      partSizes.forEach((partSize, idx) => {
        if (addr + partSize <= this.totalSize) {
          this.blocks.push({
            id: `part-${idx + 1}`,
            startAddr: addr,
            size: partSize,
            type: 'free',
            processId: null,
            reqSize: 0,
            internalFrag: 0,
            partitionId: `Partition ${idx + 1} (${partSize}KB)`
          });
          addr += partSize;
        }
      });
    }
  }

  setConfiguration(scheme, algorithm) {
    this.scheme = scheme;
    this.algorithm = algorithm;
    this.initMemory();
  }

  /**
   * Allocate process by request size
   */
  allocate(processId, reqSize) {
    this.allocationStats.totalRequested++;
    const logs = [];

    if (reqSize <= 0 || reqSize > (this.totalSize - this.osSize)) {
      this.allocationStats.failed++;
      return {
        success: false,
        reason: `Process size ${reqSize} KB exceeds total user space!`,
        logs: [`Process ${processId} (${reqSize} KB) is invalid or exceeds max memory size.`]
      };
    }

    if (this.scheme === 'dynamic') {
      return this._allocateDynamic(processId, reqSize);
    } else {
      return this._allocateFixed(processId, reqSize);
    }
  }

  _allocateDynamic(processId, reqSize) {
    const logs = [];
    const freeHoles = [];

    // Collect all free blocks
    this.blocks.forEach((block, index) => {
      if (block.type === 'free') {
        freeHoles.push({ block, index });
      }
    });

    if (freeHoles.length === 0) {
      this.allocationStats.failed++;
      return {
        success: false,
        reason: 'No free memory holes available.',
        logs: [`[FAILED] ${processId} (${reqSize} KB): No free holes available in memory.`]
      };
    }

    // Filter holes big enough
    const candidateHoles = freeHoles.filter(h => h.block.size >= reqSize);

    if (candidateHoles.length === 0) {
      const totalFree = this.getMetrics().freeRam;
      this.allocationStats.failed++;
      logs.push(`[EXTERNAL FRAGMENTATION] ${processId} (${reqSize} KB) cannot fit in any single hole!`);
      logs.push(`Total free space is ${totalFree} KB, but scattered across smaller holes.`);
      return {
        success: false,
        reason: `External Fragmentation! Total free RAM is ${totalFree} KB, but no contiguous hole >= ${reqSize} KB exists.`,
        externalFragDetected: true,
        failedReqSize: reqSize,
        logs
      };
    }

    let chosenHole = null;

    if (this.algorithm === 'first') {
      chosenHole = candidateHoles[0];
      logs.push(`[FIRST FIT] Selected first hole at 0x${chosenHole.block.startAddr.toString(16).padStart(4, '0')} (Size: ${chosenHole.block.size} KB).`);
    } else if (this.algorithm === 'best') {
      candidateHoles.sort((a, b) => a.block.size - b.block.size);
      chosenHole = candidateHoles[0];
      logs.push(`[BEST FIT] Selected smallest fitting hole at 0x${chosenHole.block.startAddr.toString(16).padStart(4, '0')} (Size: ${chosenHole.block.size} KB, Residual: ${chosenHole.block.size - reqSize} KB).`);
    } else if (this.algorithm === 'worst') {
      candidateHoles.sort((a, b) => b.block.size - a.block.size);
      chosenHole = candidateHoles[0];
      logs.push(`[WORST FIT] Selected largest fitting hole at 0x${chosenHole.block.startAddr.toString(16).padStart(4, '0')} (Size: ${chosenHole.block.size} KB, Residual: ${chosenHole.block.size - reqSize} KB).`);
    } else if (this.algorithm === 'next') {
      // Next Fit: Search starting from nextFitPointer
      let found = null;
      
      // First scan from pointer to end
      for (const h of freeHoles) {
        if (h.block.startAddr >= this.nextFitPointer && h.block.size >= reqSize) {
          found = h;
          logs.push(`[NEXT FIT] Found hole at 0x${h.block.startAddr.toString(16).padStart(4, '0')} past pointer (0x${this.nextFitPointer.toString(16).padStart(4, '0')}).`);
          break;
        }
      }

      // Wrap around from OS size to pointer if not found
      if (!found) {
        for (const h of freeHoles) {
          if (h.block.startAddr < this.nextFitPointer && h.block.size >= reqSize) {
            found = h;
            logs.push(`[NEXT FIT] Wrapped around and found hole at 0x${h.block.startAddr.toString(16).padStart(4, '0')}.`);
            break;
          }
        }
      }

      chosenHole = found || candidateHoles[0];
    }

    // Perform allocation & hole splitting
    const targetBlock = chosenHole.block;
    const targetIndex = this.blocks.indexOf(targetBlock);

    const allocatedBlock = {
      id: `proc-${processId}-${Date.now()}`,
      startAddr: targetBlock.startAddr,
      size: reqSize,
      type: 'allocated',
      processId: processId,
      reqSize: reqSize,
      internalFrag: 0
    };

    const remainingSize = targetBlock.size - reqSize;

    if (remainingSize > 0) {
      const splitFreeBlock = {
        id: `block-free-${Date.now()}`,
        startAddr: targetBlock.startAddr + reqSize,
        size: remainingSize,
        type: 'free',
        processId: null,
        reqSize: 0,
        internalFrag: 0
      };
      this.blocks.splice(targetIndex, 1, allocatedBlock, splitFreeBlock);
    } else {
      this.blocks.splice(targetIndex, 1, allocatedBlock);
    }

    // Update Next Fit pointer to end of newly allocated block
    this.nextFitPointer = (allocatedBlock.startAddr + allocatedBlock.size) % this.totalSize;
    if (this.nextFitPointer < this.osSize) this.nextFitPointer = this.osSize;

    this.allocationStats.succeeded++;
    this.processes.push({ id: processId, size: reqSize, startAddr: allocatedBlock.startAddr });

    logs.push(`[SUCCESS] Allocated ${processId} (${reqSize} KB) at address 0x${allocatedBlock.startAddr.toString(16).padStart(4, '0')}.`);

    return {
      success: true,
      block: allocatedBlock,
      logs
    };
  }

  _allocateFixed(processId, reqSize) {
    const logs = [];
    const freePartitions = [];

    this.blocks.forEach((block, index) => {
      if (block.type === 'free') {
        freePartitions.push({ block, index });
      }
    });

    const candidatePartitions = freePartitions.filter(p => p.block.size >= reqSize);

    if (candidatePartitions.length === 0) {
      this.allocationStats.failed++;
      logs.push(`[FAILED/EXTERNAL FRAG] ${processId} (${reqSize} KB) is too large for any free partition!`);
      return {
        success: false,
        reason: `No free partition large enough for process ${processId} (${reqSize} KB).`,
        logs
      };
    }

    let chosenPart = null;

    if (this.algorithm === 'first') {
      chosenPart = candidatePartitions[0];
      logs.push(`[FIRST FIT] Selected partition ${chosenPart.block.partitionId}.`);
    } else if (this.algorithm === 'best') {
      candidatePartitions.sort((a, b) => a.block.size - b.block.size);
      chosenPart = candidatePartitions[0];
      logs.push(`[BEST FIT] Selected partition ${chosenPart.block.partitionId} (Min internal frag: ${chosenPart.block.size - reqSize} KB).`);
    } else if (this.algorithm === 'worst') {
      candidatePartitions.sort((a, b) => b.block.size - a.block.size);
      chosenPart = candidatePartitions[0];
      logs.push(`[WORST FIT] Selected partition ${chosenPart.block.partitionId} (Max internal frag: ${chosenPart.block.size - reqSize} KB).`);
    } else if (this.algorithm === 'next') {
      let found = null;
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

    const pBlock = chosenPart.block;
    const internalWaste = pBlock.size - reqSize;

    pBlock.type = 'allocated';
    pBlock.processId = processId;
    pBlock.reqSize = reqSize;
    pBlock.internalFrag = internalWaste;

    this.nextFitPointer = (pBlock.startAddr + pBlock.size) % this.totalSize;
    if (this.nextFitPointer < this.osSize) this.nextFitPointer = this.osSize;

    this.allocationStats.succeeded++;
    this.processes.push({ id: processId, size: reqSize, startAddr: pBlock.startAddr });

    logs.push(`[SUCCESS] Allocated ${processId} (${reqSize} KB) in ${pBlock.partitionId}. Internal Frag: ${internalWaste} KB.`);

    return {
      success: true,
      block: pBlock,
      internalFrag: internalWaste,
      logs
    };
  }

  /**
   * Deallocate process by process ID
   */
  deallocate(processId) {
    const logs = [];
    let found = false;

    if (this.scheme === 'dynamic') {
      this.blocks.forEach(block => {
        if (block.type === 'allocated' && block.processId === processId) {
          block.type = 'free';
          block.processId = null;
          block.reqSize = 0;
          block.internalFrag = 0;
          found = true;
          logs.push(`Deallocated process ${processId} at 0x${block.startAddr.toString(16).padStart(4, '0')}.`);
        }
      });

      if (found) {
        this.mergeAdjacentFreeHoles();
      }
    } else {
      // Fixed partitioning
      this.blocks.forEach(block => {
        if (block.type === 'allocated' && block.processId === processId) {
          block.type = 'free';
          block.processId = null;
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

  /**
   * Merge adjacent free holes in dynamic mode
   */
  mergeAdjacentFreeHoles() {
    if (this.scheme !== 'dynamic') return;

    let i = 0;
    while (i < this.blocks.length - 1) {
      const current = this.blocks[i];
      const next = this.blocks[i + 1];

      if (current.type === 'free' && next.type === 'free') {
        current.size += next.size;
        this.blocks.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }

  /**
   * Compact memory in dynamic partitioning mode
   */
  compactMemory() {
    if (this.scheme !== 'dynamic') {
      return { success: false, reason: 'Compaction is only applicable to Dynamic Partitioning.' };
    }

    const logs = [];
    this.allocationStats.compactionCount++;

    const osBlock = this.blocks[0];
    const allocatedBlocks = this.blocks.filter(b => b.type === 'allocated');

    let currentAddr = this.osSize;
    const newBlocks = [osBlock];

    allocatedBlocks.forEach(block => {
      block.startAddr = currentAddr;
      currentAddr += block.size;
      newBlocks.push(block);
    });

    const totalFreeSize = this.totalSize - currentAddr;

    if (totalFreeSize > 0) {
      newBlocks.push({
        id: `block-free-compact-${Date.now()}`,
        startAddr: currentAddr,
        size: totalFreeSize,
        type: 'free',
        processId: null,
        reqSize: 0,
        internalFrag: 0
      });
    }

    this.blocks = newBlocks;
    this.nextFitPointer = currentAddr % this.totalSize;
    if (this.nextFitPointer < this.osSize) this.nextFitPointer = this.osSize;

    logs.push(`[COMPACTION COMPLETED] Moved ${allocatedBlocks.length} processes to low memory. Consolidated ${totalFreeSize} KB free space into a single contiguous hole.`);

    return {
      success: true,
      freeHoleSize: totalFreeSize,
      logs
    };
  }

  /**
   * Calculate live statistics
   */
  getMetrics() {
    let allocatedRam = 0;
    let freeRam = 0;
    let internalFrag = 0;
    let externalFrag = 0;

    const freeHoles = [];

    this.blocks.forEach(block => {
      if (block.type === 'os') {
        // OS block
      } else if (block.type === 'allocated') {
        allocatedRam += block.reqSize;
        internalFrag += (block.internalFrag || 0);
      } else if (block.type === 'free') {
        freeRam += block.size;
        freeHoles.push(block.size);
      }
    });

    // In dynamic mode, external fragmentation exists if there are multiple free holes
    // or if free space exists but is non-contiguous
    if (this.scheme === 'dynamic') {
      if (freeHoles.length > 1) {
        externalFrag = freeRam; // Entire free space is fragmented across multiple non-contiguous holes
      }
    } else {
      // In fixed mode, external fragmentation is free partitions that couldn't accommodate process
      externalFrag = freeRam;
    }

    const totalUserSpace = this.totalSize - this.osSize;
    const efficiency = totalUserSpace > 0 ? Math.round((allocatedRam / totalUserSpace) * 100) : 0;

    return {
      totalRam: this.totalSize,
      osSize: this.osSize,
      allocatedRam,
      freeRam,
      internalFrag,
      externalFrag,
      efficiency,
      succeeded: this.allocationStats.succeeded,
      failed: this.allocationStats.failed,
      totalRequested: this.allocationStats.totalRequested
    };
  }
}

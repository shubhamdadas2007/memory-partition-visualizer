/**
 * Presets - Pre-configured educational OS workload scenarios
 */

const PRESET_SCENARIOS = {
  internalFrag: {
    title: "Fixed Partition Internal Fragmentation Trap",
    description: "Allocates processes into fixed 128KB partitions, highlighting internal wasted space inside each block.",
    scheme: "fixed-equal",
    algorithm: "first",
    actions: [
      { type: "allocate", id: "P1", size: 50 },
      { type: "allocate", id: "P2", size: 80 },
      { type: "allocate", id: "P3", size: 30 },
      { type: "allocate", id: "P4", size: 100 }
    ]
  },

  externalFrag: {
    title: "Dynamic Partition External Fragmentation & Hole Split",
    description: "Allocates and terminates processes to create isolated holes, then attempts a large allocation that fails despite total free memory being sufficient.",
    scheme: "dynamic",
    algorithm: "first",
    actions: [
      { type: "allocate", id: "P1", size: 180 },
      { type: "allocate", id: "P2", size: 250 },
      { type: "allocate", id: "P3", size: 180 },
      { type: "allocate", id: "P4", size: 240 },
      { type: "deallocate", id: "P2" },
      { type: "allocate", id: "P5", size: 300 } // FAILS due to external fragmentation!
    ]
  },

  bestVsWorst: {
    title: "Best Fit vs Worst Fit Residual Fragment Creation",
    description: "Demonstrates how Best Fit leaves tiny unusable leftover holes versus Worst Fit leaving larger reusable fragments.",
    scheme: "dynamic",
    algorithm: "best",
    actions: [
      { type: "allocate", id: "P1", size: 120 },
      { type: "allocate", id: "P2", size: 200 },
      { type: "allocate", id: "P3", size: 120 },
      { type: "allocate", id: "P4", size: 400 },
      { type: "deallocate", id: "P2" }, // 200KB hole
      { type: "allocate", id: "P5", size: 150 } // Best fit puts 150 in 200KB hole, leaving 50KB residual fragment
    ]
  },

  nextFitWalk: {
    title: "Next Fit Rotational Pointer Search",
    description: "Shows how Next Fit remembers its last allocation pointer location rather than always scanning from memory address 0x0000.",
    scheme: "dynamic",
    algorithm: "next",
    actions: [
      { type: "allocate", id: "P1", size: 150 },
      { type: "allocate", id: "P2", size: 150 },
      { type: "allocate", id: "P3", size: 150 },
      { type: "deallocate", id: "P1" }, // 150KB hole at low memory
      { type: "allocate", id: "P4", size: 100 } // Next Fit allocates past P3 at high memory!
    ]
  }
};

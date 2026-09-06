# MEMORYMAP PRO — Main Memory Allocation & Fragmentation Laboratory

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-cyan?style=for-the-badge&logo=github)](https://shubhamdadas2007.github.io/memory-partition-visualizer/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Offline--First-emerald?style=for-the-badge)](index.html)

**MEMORYMAP PRO** is an educational Operating Systems laboratory and interactive contiguous memory allocation simulator designed for computer science students, educators, and systems researchers.

It simulates real-time physical memory management, partition schemes, placement fit algorithms, internal and external fragmentation metrics, coalescing, dynamic compaction, and controlled 4-algorithm benchmarking.

---

## 🌟 Key Features

### 1. 🖥️ Physical Contiguous Memory Model
- **Physical Memory Space**: Real $1024\text{ KB}$ RAM simulated with physical byte addresses ($0\text{ KB} \to 1024\text{ KB}$) and hexadecimal offsets (`0x0000` to `0x0400`).
- **OS Kernel Reservation**: High-priority low memory reservation ($128\text{ KB}$ at `0x0000`–`0x0080`), leaving $896\text{ KB}$ for user process allocations.
- **Partitioning Schemes**:
  - **Dynamic Partitioning**: Variable-sized partitions created on-demand, hole splitting, $0\text{ KB}$ internal fragmentation.
  - **Fixed Partitioning**: $8 \times 128\text{ KB}$ uniform partitions with mathematically exact internal fragmentation calculation ($S_{\text{partition}} - S_{\text{req}}$).

### 2. ⚡ Real 4-Algorithm Benchmark Arena
- **Equal Testing Ground**: Evaluates **First Fit**, **Best Fit**, **Worst Fit**, and **Next Fit** on the **exact same initial memory state** and **exact same process workload**.
- **Independent Simulation**: Runs 4 isolated simulation engines in memory; no algorithm's decisions affect another.
- **Academic Verification Checklist**: Validates 8 core OS principles before rendering results.
- **Search Cost Metrics**: Tracks actual holes examined per allocation (Average Search Cost = $\frac{\sum \text{Holes Examined}}{\text{Total Requests}}$).
- **Comprehensive Analysis**:
  - Side-by-side visual memory tracks for all 4 algorithms.
  - 12-metric dynamic comparison table.
  - 3 comparative bar charts (RAM Utilization %, Avg Search Cost, External Fragmentation).
  - 4 independent algorithm trace logs for step-by-step verification.
  - Dynamic academic recommendation engine with graceful tie-handling.

### 3. 🔬 7 Structured OS Lab Experiments
Pre-configured, one-click laboratory experiments demonstrating fundamental OS concepts:
1. **First Fit Search Efficiency & Block Scanning**
2. **Best Fit Minimization of Residual Waste**
3. **Worst Fit Preservation of Large Reusable Holes**
4. **Next Fit Circular Cursor & High-Memory Bias**
5. **External Fragmentation Allocation Failure Demonstration**
6. **Memory Compaction & Hole Consolidation**
7. **4-Algorithm Comparative Benchmark Experiment**

### 4. 🧩 External Fragmentation & Dynamic Compaction
- **Formal Academic External Fragmentation Trigger**:
  $$\text{Total Free Memory} \ge S_{\text{req}} \quad \text{AND} \quad \text{Largest Free Hole} < S_{\text{req}}$$
- **Diagnostic Alert Banner**: Pinpoints required size, total free RAM, largest available hole, scattered hole count, and academic cause.
- **1-Click Compaction**: Slides allocated processes to low memory, preserves process ordering, and coalesces all free space into one continuous hole at high memory.
- **Automatic Coalescing**: Merges adjacent free blocks immediately upon deallocation.

### 5. 📊 Real-Time Interactive Visualizations
- **Memory Spectrum Track**: Dynamic horizontal bar with process badges, size labels, fragmentation hatches, and Next-Fit cursor indicator.
- **64-Unit Physical Block Grid**: 64 uniform $16\text{ KB}$ address cells ($B00$ to $B63$) displaying physical start/end boundaries and allocations.
- **Trace Console**: Real-time chronological audit trail of all searches, candidate hole evaluations, allocations, deallocations, and compaction routines.
- **Printable Lab Report**: Clean, academic, print-ready laboratory report stylesheet (`Ctrl+P` / `Print Report`).

---

## 🚀 Live Demo & Usage

### Option A: Open directly in any browser (Zero Dependencies)
Clone this repository and open `index.html`:
```bash
git clone https://github.com/shubhamdadas2007/memory-partition-visualizer.git
cd memory-partition-visualizer
# Open index.html in Chrome, Firefox, Edge, or Safari
start index.html
```

### Option B: Run via local HTTP server
```bash
python -m http.server 8080
# Visit http://localhost:8080 in your browser
```

### Option C: Developer / React Build
```bash
npm install
npm run dev
```

---

## 📐 Allocation Algorithms Overview

| Algorithm | Search Strategy | Advantages | Trade-offs |
|---|---|---|---|
| **First Fit** | Scans from address $0\text{ KB}$ and allocates into the first hole $\ge S_{\text{req}}$. | Fastest search for early allocations; low overhead. | Clutters low memory with small residual fragments. |
| **Best Fit** | Scans all free holes to find the smallest hole $\ge S_{\text{req}}$. | Minimizes immediate leftover space; preserves larger holes. | Highest search cost; creates tiny unusable slivers. |
| **Worst Fit** | Scans all free holes to find the largest hole $\ge S_{\text{req}}$. | Leaves large, reusable leftover holes. | Rapidly breaks up largest contiguous blocks. |
| **Next Fit** | Scans starting from the last allocation pointer (rotational). | Distributes allocations across entire address space. | Tends to exhaust large holes at high memory addresses. |

---

## 🛠️ Project Structure

```
memory-partition-visualizer/
├── index.html            # Complete standalone zero-dependency simulator application
├── src/                  # Modular React + TypeScript implementation
│   ├── App.tsx           # Application orchestrator
│   ├── types.ts          # OS memory data models & interfaces
│   ├── components/       # UI cards, memory tracks, metrics, and trace console
│   └── algorithms/       # Core First/Best/Worst/Next fit allocation logic
├── package.json          # Node package definition
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # Tailwind CSS design system configuration
├── tsconfig.json         # TypeScript compiler configuration
└── README.md             # Documentation
```

---

## 🎓 Academic Viva & Exam Notes

- **Internal Fragmentation**: Occurs when memory is allocated in fixed-size partitions larger than the process requested. The difference is wasted internally and cannot be used by other processes.
- **External Fragmentation**: Occurs when total free memory is sufficient to satisfy an allocation request, but no single contiguous hole is large enough. Solved by memory compaction.
- **50% Rule (Knuth)**: In dynamic memory allocation with First Fit, for every $N$ allocated blocks, approximately $0.5 N$ blocks are lost to fragmentation.

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).

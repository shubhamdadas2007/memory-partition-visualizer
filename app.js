/**
 * App - Application Controller & Simulation Manager
 */

class Application {
  constructor() {
    this.engine = new MemoryEngine(1024, 128);
    this.ui = new UIRenderer();

    // 4 Engines for comparison mode
    this.compareEngines = {
      first: new MemoryEngine(1024, 128),
      best: new MemoryEngine(1024, 128),
      worst: new MemoryEngine(1024, 128),
      next: new MemoryEngine(1024, 128)
    };

    this.activeView = 'single'; // 'single' or 'compare'
    this.actionQueue = [];
    this.processCounter = 1;
    this.simulationTimer = null;
    this.simSpeed = 800;

    this.initEventListeners();
    this.updateAll();
  }

  initEventListeners() {
    // Partition Scheme Selector
    const schemeSelect = document.getElementById('partitionScheme');
    const algoSelect = document.getElementById('fitAlgorithm');

    schemeSelect.addEventListener('change', (e) => {
      const scheme = e.target.value;
      const algo = algoSelect.value;
      this.engine.setConfiguration(scheme, algo);

      // Also configure comparison engines
      Object.keys(this.compareEngines).forEach(key => {
        this.compareEngines[key].setConfiguration(scheme, key);
      });

      this.ui.appendLog(`Changed partition scheme to: ${scheme.toUpperCase()}`, 'info');
      this.updateAll();
    });

    // Fit Algorithm Selector
    algoSelect.addEventListener('change', (e) => {
      const algo = e.target.value;
      const scheme = schemeSelect.value;
      this.engine.setConfiguration(scheme, algo);
      this.ui.appendLog(`Changed placement algorithm to: ${algo.toUpperCase()} FIT`, 'info');
      this.updateAll();
    });

    // Compact Button
    document.getElementById('compactBtn').addEventListener('click', () => {
      this.compactMemory();
    });

    // Reset Button
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetMemory();
    });

    // Add Process Form
    document.getElementById('addProcessForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('procName');
      const sizeInput = document.getElementById('procSize');

      const name = nameInput.value.trim() || `P${this.processCounter}`;
      const size = parseInt(sizeInput.value, 10);

      if (size > 0) {
        this.allocateProcess(name, size);
        this.processCounter++;
        nameInput.value = `P${this.processCounter}`;
      }
    });

    // View Toggles
    const singleViewBtn = document.getElementById('singleViewBtn');
    const compareViewBtn = document.getElementById('compareViewBtn');
    const singleContainer = document.getElementById('singleMapContainer');
    const compareContainer = document.getElementById('compareMapContainer');

    singleViewBtn.addEventListener('click', () => {
      this.activeView = 'single';
      singleViewBtn.classList.add('active');
      compareViewBtn.classList.remove('active');
      singleContainer.classList.remove('hidden');
      singleContainer.classList.add('active');
      compareContainer.classList.add('hidden');
      compareContainer.classList.remove('active');
      this.updateAll();
    });

    compareViewBtn.addEventListener('click', () => {
      this.activeView = 'compare';
      compareViewBtn.classList.add('active');
      singleViewBtn.classList.remove('active');
      compareContainer.classList.remove('hidden');
      compareContainer.classList.add('active');
      singleContainer.classList.add('hidden');
      singleContainer.classList.remove('active');
      this.updateAll();
    });

    // Preset Buttons
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        this.loadPreset(presetKey);
      });
    });

    // Sim Control Buttons
    const stepBtn = document.getElementById('stepBtn');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const speedSlider = document.getElementById('speedSlider');

    stepBtn.addEventListener('click', () => this.stepSimulation());
    playBtn.addEventListener('click', () => this.startSimulation());
    pauseBtn.addEventListener('click', () => this.pauseSimulation());

    speedSlider.addEventListener('input', (e) => {
      this.simSpeed = parseInt(e.target.value, 10);
      if (this.simulationTimer) {
        this.pauseSimulation();
        this.startSimulation();
      }
    });

    // Clear log button
    document.getElementById('clearLogBtn').addEventListener('click', () => {
      this.ui.clearLog();
    });
  }

  allocateProcess(processId, reqSize) {
    const result = this.engine.allocate(processId, reqSize);

    // Also run on comparison engines
    Object.keys(this.compareEngines).forEach(key => {
      this.compareEngines[key].allocate(processId, reqSize);
    });

    if (result.logs) {
      result.logs.forEach(log => {
        const logType = result.success ? 'success' : (result.externalFragDetected ? 'danger' : 'warning');
        this.ui.appendLog(log, logType);
      });
    }

    this.updateAll(result);
    return result;
  }

  deallocateProcess(processId) {
    const result = this.engine.deallocate(processId);

    Object.keys(this.compareEngines).forEach(key => {
      this.compareEngines[key].deallocate(processId);
    });

    if (result.logs) {
      result.logs.forEach(log => this.ui.appendLog(log, 'info'));
    }

    this.updateAll();
  }

  compactMemory() {
    const result = this.engine.compactMemory();

    Object.keys(this.compareEngines).forEach(key => {
      this.compareEngines[key].compactMemory();
    });

    if (result.logs) {
      result.logs.forEach(log => this.ui.appendLog(log, 'warning'));
    } else if (result.reason) {
      this.ui.appendLog(`Compaction skipped: ${result.reason}`, 'info');
    }

    this.updateAll();
  }

  resetMemory() {
    this.pauseSimulation();
    this.actionQueue = [];
    this.processCounter = 1;
    document.getElementById('procName').value = 'P1';

    const scheme = document.getElementById('partitionScheme').value;
    const algo = document.getElementById('fitAlgorithm').value;

    this.engine.setConfiguration(scheme, algo);

    Object.keys(this.compareEngines).forEach(key => {
      this.compareEngines[key].setConfiguration(scheme, key);
    });

    this.ui.clearLog();
    this.ui.appendLog('Main Memory reset to initial state.', 'info');
    this.updateAll();
  }

  loadPreset(presetKey) {
    const preset = PRESET_SCENARIOS[presetKey];
    if (!preset) return;

    this.pauseSimulation();
    this.resetMemory();

    document.getElementById('partitionScheme').value = preset.scheme;
    document.getElementById('fitAlgorithm').value = preset.algorithm;

    this.engine.setConfiguration(preset.scheme, preset.algorithm);
    Object.keys(this.compareEngines).forEach(key => {
      this.compareEngines[key].setConfiguration(preset.scheme, key);
    });

    this.actionQueue = [...preset.actions];

    this.ui.appendLog(`--- Loaded Scenario: ${preset.title} ---`, 'info');
    this.ui.appendLog(preset.description, 'info');

    this.updateAll();
  }

  stepSimulation() {
    if (this.actionQueue.length === 0) {
      this.ui.appendLog('Queue empty. Add more processes or select a preset scenario.', 'info');
      this.pauseSimulation();
      return;
    }

    const action = this.actionQueue.shift();
    if (action.type === 'allocate') {
      this.allocateProcess(action.id, action.size);
    } else if (action.type === 'deallocate') {
      this.deallocateProcess(action.id);
    } else if (action.type === 'compact') {
      this.compactMemory();
    }
  }

  startSimulation() {
    if (this.simulationTimer) return;

    document.getElementById('playBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');

    this.simulationTimer = setInterval(() => {
      if (this.actionQueue.length > 0) {
        this.stepSimulation();
      } else {
        this.pauseSimulation();
      }
    }, this.simSpeed);
  }

  pauseSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    document.getElementById('playBtn').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
  }

  updateAll(lastResult = null) {
    if (this.activeView === 'single') {
      this.ui.renderAll(this.engine, lastResult);
    } else {
      this.ui.renderCompareView(this.compareEngines);
    }
  }
}

// Instantiate global app instance when DOM is ready
let app = null;
document.addEventListener('DOMContentLoaded', () => {
  app = new Application();
});

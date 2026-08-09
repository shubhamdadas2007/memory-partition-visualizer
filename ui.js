/**
 * UI - Rendering and DOM Visualization Module
 */

class UIRenderer {
  constructor() {
    this.memoryRuler = document.getElementById('memoryRuler');
    this.memoryTrack = document.getElementById('memoryTrack');
    this.blockDetailsGrid = document.getElementById('blockDetailsGrid');
    this.logContent = document.getElementById('logContent');

    this.statTotalRam = document.getElementById('statTotalRam');
    this.statAddressRange = document.getElementById('statAddressRange');
    this.statAllocated = document.getElementById('statAllocated');
    this.statAllocatedPct = document.getElementById('statAllocatedPct');
    this.statFree = document.getElementById('statFree');
    this.statFreePct = document.getElementById('statFreePct');
    this.statInternal = document.getElementById('statInternal');
    this.statExternal = document.getElementById('statExternal');
    this.statEfficiency = document.getElementById('statEfficiency');
    this.statSuccessCount = document.getElementById('statSuccessCount');

    this.pointerLegend = document.getElementById('pointerLegend');
    
    // Modal elements
    this.blockModal = document.getElementById('blockModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    this.closeModalBtn = document.getElementById('closeModalBtn');

    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.hideModal());
    }
  }

  renderAll(engine, lastResult = null) {
    this.renderStats(engine);
    this.renderRuler(engine.totalSize);
    this.renderMemoryTrack(engine, this.memoryTrack, lastResult);
    this.renderBlockDetails(engine);

    if (engine.algorithm === 'next') {
      this.pointerLegend.style.display = 'flex';
    } else {
      this.pointerLegend.style.display = 'none';
    }
  }

  renderStats(engine) {
    const m = engine.getMetrics();
    const hexMax = '0x' + m.totalRam.toString(16).padStart(4, '0').toUpperCase();

    this.statTotalRam.textContent = `${m.totalRam} KB`;
    this.statAddressRange.textContent = `0x0000 - ${hexMax}`;

    const allocPct = m.totalRam > 0 ? ((m.allocatedRam / (m.totalRam - m.osSize)) * 100).toFixed(1) : 0;
    this.statAllocated.textContent = `${m.allocatedRam} KB`;
    this.statAllocatedPct.textContent = `${allocPct}% of user space`;

    const freePct = m.totalRam > 0 ? ((m.freeRam / (m.totalRam - m.osSize)) * 100).toFixed(1) : 0;
    this.statFree.textContent = `${m.freeRam} KB`;
    this.statFreePct.textContent = `${freePct}% free`;

    this.statInternal.textContent = `${m.internalFrag} KB`;
    this.statExternal.textContent = `${m.externalFrag} KB`;

    this.statEfficiency.textContent = `${m.efficiency}%`;
    this.statSuccessCount.textContent = `${m.succeeded} / ${m.totalRequested} succeeded`;
  }

  renderRuler(totalRam) {
    this.memoryRuler.innerHTML = '';
    const stepKB = 128;

    for (let addr = 0; addr <= totalRam; addr += stepKB) {
      const pct = (addr / totalRam) * 100;
      const hex = '0x' + addr.toString(16).padStart(4, '0').toUpperCase();

      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      tick.style.left = `${pct}%`;
      tick.innerHTML = `<span>${addr}KB (${hex})</span>`;
      this.memoryRuler.appendChild(tick);
    }
  }

  renderMemoryTrack(engine, trackElement, lastResult = null) {
    trackElement.innerHTML = '';
    const totalRam = engine.totalSize;

    engine.blocks.forEach(block => {
      const widthPct = (block.size / totalRam) * 100;
      const blockEl = document.createElement('div');
      blockEl.className = `mem-block ${block.type}-block`;
      blockEl.style.width = `${widthPct}%`;

      const startHex = '0x' + block.startAddr.toString(16).padStart(4, '0').toUpperCase();
      const endAddr = block.startAddr + block.size;
      const endHex = '0x' + endAddr.toString(16).padStart(4, '0').toUpperCase();

      if (block.type === 'os') {
        blockEl.innerHTML = `
          <div class="block-title">OS Reserved</div>
          <div class="block-size">${block.size} KB</div>
          <div class="block-addr">${startHex} - ${endHex}</div>
        `;
      } else if (block.type === 'allocated') {
        let contentHTML = `
          <div class="block-title">
            <span>${block.processId}</span>
            <span class="dealloc-btn" title="Click to deallocate" onclick="event.stopPropagation(); app.deallocateProcess('${block.processId}')">&times;</span>
          </div>
          <div class="block-size">${block.reqSize} KB</div>
          <div class="block-addr">${startHex} - ${endHex}</div>
        `;

        // Render Internal Fragmentation overlay for fixed partitioning
        if (block.internalFrag > 0) {
          const internalPct = (block.internalFrag / block.size) * 100;
          contentHTML += `
            <div class="internal-frag-overlay" style="width: ${internalPct}%" title="Internal Fragmentation: ${block.internalFrag} KB wasted">
              Frag: ${block.internalFrag}K
            </div>
          `;
        }

        blockEl.innerHTML = contentHTML;
      } else if (block.type === 'free') {
        // Highlight external fragmentation if an allocation failed
        if (lastResult && lastResult.externalFragDetected) {
          blockEl.classList.add('external-frag-alert');
        }

        blockEl.innerHTML = `
          <div class="block-title">Free</div>
          <div class="block-size">${block.size} KB</div>
          <div class="block-addr">${startHex} - ${endHex}</div>
        `;
      }

      blockEl.addEventListener('click', () => this.showBlockDetailsModal(block));
      trackElement.appendChild(blockEl);
    });

    // Render Next Fit Pointer line
    if (engine.algorithm === 'next') {
      const pointerPct = (engine.nextFitPointer / totalRam) * 100;
      const pointerEl = document.createElement('div');
      pointerEl.className = 'pointer-line';
      pointerEl.style.left = `${pointerPct}%`;
      trackElement.appendChild(pointerEl);
    }
  }

  renderBlockDetails(engine) {
    this.blockDetailsGrid.innerHTML = '';

    engine.blocks.forEach(block => {
      const startHex = '0x' + block.startAddr.toString(16).padStart(4, '0').toUpperCase();
      const endHex = '0x' + (block.startAddr + block.size).toString(16).padStart(4, '0').toUpperCase();

      const item = document.createElement('div');
      item.className = 'block-card-item';

      if (block.type === 'os') {
        item.innerHTML = `
          <div><strong>Block:</strong> OS Reserved</div>
          <div><strong>Address:</strong> ${startHex} - ${endHex}</div>
          <div><strong>Capacity:</strong> ${block.size} KB</div>
        `;
      } else if (block.type === 'allocated') {
        item.innerHTML = `
          <div><strong class="badge-proc">Process ${block.processId}</strong> (${block.partitionId || 'Dynamic'})</div>
          <div><strong>Address:</strong> ${startHex} - ${endHex}</div>
          <div><strong>Used / Capacity:</strong> ${block.reqSize} KB / ${block.size} KB</div>
          ${block.internalFrag > 0 ? `<div class="badge-frag">Internal Frag: ${block.internalFrag} KB</div>` : ''}
        `;
      } else if (block.type === 'free') {
        item.innerHTML = `
          <div><strong class="badge-free">Free Hole</strong> (${block.partitionId || 'Unallocated'})</div>
          <div><strong>Address:</strong> ${startHex} - ${endHex}</div>
          <div><strong>Available Hole Size:</strong> ${block.size} KB</div>
        `;
      }

      this.blockDetailsGrid.appendChild(item);
    });
  }

  appendLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    this.logContent.appendChild(entry);
    this.logContent.scrollTop = this.logContent.scrollHeight;
  }

  clearLog() {
    this.logContent.innerHTML = '';
  }

  showBlockDetailsModal(block) {
    const startHex = '0x' + block.startAddr.toString(16).padStart(4, '0').toUpperCase();
    const endHex = '0x' + (block.startAddr + block.size).toString(16).padStart(4, '0').toUpperCase();

    this.modalTitle.textContent = `Memory Block Inspector: ${block.processId || 'Free Space'}`;
    
    let html = `
      <table style="width:100%; font-size:0.9rem; border-collapse:collapse;">
        <tr><td style="padding:6px 0; color:#94a3b8;">Start Address:</td><td style="font-family:monospace; font-weight:bold;">${startHex} (${block.startAddr} KB)</td></tr>
        <tr><td style="padding:6px 0; color:#94a3b8;">End Address:</td><td style="font-family:monospace; font-weight:bold;">${endHex} (${block.startAddr + block.size} KB)</td></tr>
        <tr><td style="padding:6px 0; color:#94a3b8;">Total Block Size:</td><td style="font-weight:bold;">${block.size} KB</td></tr>
        <tr><td style="padding:6px 0; color:#94a3b8;">Block Type:</td><td style="text-transform:capitalize; font-weight:bold;">${block.type}</td></tr>
    `;

    if (block.type === 'allocated') {
      html += `
        <tr><td style="padding:6px 0; color:#94a3b8;">Process ID:</td><td style="color:#38bdf8; font-weight:bold;">${block.processId}</td></tr>
        <tr><td style="padding:6px 0; color:#94a3b8;">Requested Memory:</td><td>${block.reqSize} KB</td></tr>
        <tr><td style="padding:6px 0; color:#94a3b8;">Internal Fragmentation:</td><td style="color:#f59e0b; font-weight:bold;">${block.internalFrag} KB</td></tr>
      `;
    }

    html += `</table>`;

    if (block.type === 'allocated') {
      html += `
        <button class="btn btn-danger btn-block" style="margin-top:1rem;" onclick="app.deallocateProcess('${block.processId}'); app.ui.hideModal();">
          Terminate & Deallocate Process
        </button>
      `;
    }

    this.modalBody.innerHTML = html;
    this.blockModal.classList.remove('hidden');
  }

  hideModal() {
    this.blockModal.classList.add('hidden');
  }

  renderCompareView(enginesMap) {
    ['first', 'best', 'worst', 'next'].forEach(algo => {
      const engine = enginesMap[algo];
      if (!engine) return;

      const trackEl = document.getElementById(`track-${algo}`);
      const badgeEl = document.getElementById(`badge-${algo}`);
      const intEl = document.getElementById(`int-${algo}`);
      const extEl = document.getElementById(`ext-${algo}`);
      const freeEl = document.getElementById(`free-${algo}`);

      if (trackEl) {
        this.renderMemoryTrack(engine, trackEl);
      }

      const m = engine.getMetrics();
      if (badgeEl) badgeEl.textContent = `${m.succeeded}/${m.totalRequested} Succeeded`;
      if (intEl) intEl.textContent = `${m.internalFrag} KB`;
      if (extEl) extEl.textContent = `${m.externalFrag} KB`;
      if (freeEl) freeEl.textContent = `${m.freeRam} KB`;
    });
  }
}

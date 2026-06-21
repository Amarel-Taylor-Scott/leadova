<script>
  import { onMount } from 'svelte';

  let verticals = [];
  let selectedVertical = '';
  let selectedCountry = '';
  let countries = [];
  let loading = true;

  // CSV state
  let csvFile = null;
  let csvText = '';
  let parsedHeaders = [];
  let parsedRows = [];
  let formFields = [];
  let columnMapping = {};
  let step = 'upload'; // upload, preview, mapping, importing, results
  let dragOver = false;

  // Import results
  let importing = false;
  let importResults = null;
  let importError = '';

  const headers = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    try {
      const res = await fetch('/api/v1/verticals');
      const data = await res.json();
      if (data.success) verticals = data.data.verticals || [];
    } catch (err) {
      console.error('Failed to load verticals', err);
    }
    loading = false;
  });

  function onVerticalChange() {
    const v = verticals.find(v => v.slug === selectedVertical);
    if (!v) { countries = []; formFields = []; return; }
    countries = (v.countries || []).filter(c => c.status === 'active');
    const ff = typeof v.form_fields === 'string' ? JSON.parse(v.form_fields) : (v.form_fields || []);
    formFields = ff;
    selectedCountry = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleDrop(e) {
    e.preventDefault();
    dragOver = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleFileInput(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function processFile(file) {
    if (!file.name.endsWith('.csv')) {
      importError = 'Please upload a CSV file.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      importError = 'File size must be under 10MB.';
      return;
    }
    importError = '';
    csvFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      csvText = e.target.result;
      parseCSV(csvText);
    };
    reader.readAsText(file);
  }

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      importError = 'CSV must have a header row and at least one data row.';
      return;
    }

    parsedHeaders = parseCsvLine(lines[0]);
    parsedRows = [];

    for (let i = 1; i < Math.min(lines.length, 101); i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;
      const row = {};
      for (let j = 0; j < parsedHeaders.length; j++) {
        row[parsedHeaders[j]] = values[j] || '';
      }
      parsedRows.push(row);
    }

    // Auto-map columns that match field names
    columnMapping = {};
    for (const h of parsedHeaders) {
      const match = formFields.find(f => f.name === h || f.label.toLowerCase() === h.toLowerCase());
      if (match) columnMapping[h] = match.name;
      else columnMapping[h] = '';
    }

    step = 'preview';
  }

  function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = false;
        } else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { result.push(current.trim()); current = ''; }
        else current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  function goToMapping() {
    step = 'mapping';
  }

  function getMappedCount() {
    return Object.values(columnMapping).filter(v => v).length;
  }

  function getRequiredFieldsMapped() {
    const requiredNames = formFields.filter(f => f.required).map(f => f.name);
    const mappedTargets = Object.values(columnMapping);
    return requiredNames.filter(r => mappedTargets.includes(r));
  }

  function getUnmappedRequired() {
    const requiredNames = formFields.filter(f => f.required).map(f => f.name);
    const mappedTargets = Object.values(columnMapping);
    return requiredNames.filter(r => !mappedTargets.includes(r));
  }

  async function startImport() {
    if (!selectedVertical || !selectedCountry) {
      importError = 'Please select a vertical and country.';
      return;
    }

    const unmapped = getUnmappedRequired();
    if (unmapped.length > 0) {
      importError = `Required fields not mapped: ${unmapped.join(', ')}`;
      return;
    }

    importing = true;
    importError = '';
    step = 'importing';

    const v = verticals.find(v => v.slug === selectedVertical);
    const consentText = `Leads imported via CSV by subscriber. Original consent captured at source for ${v?.name || selectedVertical} services.`;

    try {
      const res = await fetch('/api/v1/import/csv', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          csv_text: csvText,
          vertical_slug: selectedVertical,
          country_code: selectedCountry,
          consent_text: consentText,
          column_mapping: columnMapping,
        }),
      });

      const data = await res.json();
      if (data.success) {
        importResults = data.data;
        step = 'results';
      } else {
        importError = data.error?.message || 'Import failed';
        step = 'mapping';
      }
    } catch (err) {
      importError = 'Connection error. Please try again.';
      step = 'mapping';
    }
    importing = false;
  }

  function reset() {
    csvFile = null;
    csvText = '';
    parsedHeaders = [];
    parsedRows = [];
    columnMapping = {};
    importResults = null;
    importError = '';
    step = 'upload';
  }
</script>

<svelte:head><title>Import Leads | Leadova</title></svelte:head>

<div class="import-page container">
  <div class="page-header">
    <a href="/dashboard" class="back-link">Back to Dashboard</a>
    <h1>Import Leads from CSV</h1>
    <p class="page-sub">Upload a CSV file to bulk import leads into a vertical.</p>
  </div>

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}

    <!-- Step indicator -->
    <div class="steps-indicator">
      <div class="step-item" class:active={step === 'upload'} class:done={step !== 'upload'}>
        <span class="step-num">1</span>
        <span>Upload</span>
      </div>
      <div class="step-line"></div>
      <div class="step-item" class:active={step === 'preview'} class:done={step === 'mapping' || step === 'importing' || step === 'results'}>
        <span class="step-num">2</span>
        <span>Preview</span>
      </div>
      <div class="step-line"></div>
      <div class="step-item" class:active={step === 'mapping'} class:done={step === 'importing' || step === 'results'}>
        <span class="step-num">3</span>
        <span>Map Columns</span>
      </div>
      <div class="step-line"></div>
      <div class="step-item" class:active={step === 'importing' || step === 'results'}>
        <span class="step-num">4</span>
        <span>Import</span>
      </div>
    </div>

    {#if importError}
      <div class="alert-error">{importError}</div>
    {/if}

    <!-- STEP 1: Upload -->
    {#if step === 'upload'}
      <div class="upload-section">
        <!-- Vertical/country selection -->
        <div class="select-row">
          <label>
            Vertical
            <select bind:value={selectedVertical} on:change={onVerticalChange}>
              <option value="">Choose vertical...</option>
              {#each verticals.filter(v => v.status === 'active') as v}
                <option value={v.slug}>{v.name}</option>
              {/each}
            </select>
          </label>
          {#if countries.length > 0}
            <label>
              Country
              <select bind:value={selectedCountry}>
                <option value="">Choose country...</option>
                {#each countries as c}
                  <option value={c.code}>{c.flag_emoji} {c.name}</option>
                {/each}
              </select>
            </label>
          {/if}
        </div>

        {#if selectedVertical && selectedCountry}
          <div class="expected-fields card">
            <h3>Expected Fields</h3>
            <div class="field-chips">
              {#each formFields as f}
                <span class="field-chip" class:required={f.required}>{f.name}{f.required ? ' *' : ''}</span>
              {/each}
            </div>
          </div>

          <!-- Drop zone -->
          <div
            class="drop-zone"
            class:drag-over={dragOver}
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Drag and drop your CSV file here</p>
            <span class="drop-or">or</span>
            <label class="btn btn-secondary file-btn">
              Browse Files
              <input type="file" accept=".csv" on:change={handleFileInput} hidden />
            </label>
            <p class="drop-hint">Max 5,000 rows. 10MB limit.</p>
          </div>
        {:else}
          <div class="hint-box card">
            <p>Select a vertical and country above to see expected fields and upload your CSV.</p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- STEP 2: Preview -->
    {#if step === 'preview'}
      <div class="preview-section">
        <div class="preview-header">
          <div>
            <h2>Preview ({parsedRows.length} rows)</h2>
            <p class="text-muted">{csvFile?.name || 'CSV file'}</p>
          </div>
          <div class="preview-actions">
            <button class="btn btn-ghost" on:click={reset}>Upload Different File</button>
            <button class="btn btn-primary" on:click={goToMapping}>Continue to Mapping</button>
          </div>
        </div>

        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>#</th>
                {#each parsedHeaders as h}
                  <th>{h}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each parsedRows.slice(0, 10) as row, i}
                <tr>
                  <td class="row-num">{i + 1}</td>
                  {#each parsedHeaders as h}
                    <td>{row[h] || ''}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if parsedRows.length > 10}
          <p class="text-muted" style="text-align:center; margin-top:0.5rem;">Showing first 10 of {parsedRows.length} rows.</p>
        {/if}
      </div>
    {/if}

    <!-- STEP 3: Column Mapping -->
    {#if step === 'mapping'}
      <div class="mapping-section">
        <h2>Map CSV Columns to Fields</h2>
        <p class="text-muted">Match each CSV column to the corresponding lead field. Required fields are marked with *.</p>

        <div class="mapping-grid">
          {#each parsedHeaders as csvCol}
            <div class="mapping-row card">
              <div class="csv-col">
                <span class="csv-col-label">CSV Column</span>
                <strong>{csvCol}</strong>
                <span class="csv-sample">{parsedRows[0]?.[csvCol] || ''}</span>
              </div>
              <div class="map-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <div class="field-col">
                <select bind:value={columnMapping[csvCol]}>
                  <option value="">-- Skip --</option>
                  {#each formFields as f}
                    <option value={f.name}>{f.label}{f.required ? ' *' : ''}</option>
                  {/each}
                </select>
              </div>
            </div>
          {/each}
        </div>

        <div class="mapping-summary">
          <span>{getMappedCount()} of {parsedHeaders.length} columns mapped</span>
          {#if getUnmappedRequired().length > 0}
            <span class="unmapped-warn">Missing required: {getUnmappedRequired().join(', ')}</span>
          {/if}
        </div>

        <div class="mapping-actions">
          <button class="btn btn-ghost" on:click={() => step = 'preview'}>Back</button>
          <button class="btn btn-primary" on:click={startImport} disabled={getUnmappedRequired().length > 0}>
            Import {parsedRows.length} Leads
          </button>
        </div>
      </div>
    {/if}

    <!-- STEP 4: Importing / Results -->
    {#if step === 'importing'}
      <div class="importing-screen">
        <div class="spinner"></div>
        <p>Importing leads... This may take a moment.</p>
      </div>
    {/if}

    {#if step === 'results' && importResults}
      <div class="results-section">
        <div class="results-card card">
          <h2>Import Complete</h2>
          <div class="results-stats">
            <div class="result-stat">
              <span class="result-num green">{importResults.imported}</span>
              <span>Imported</span>
            </div>
            <div class="result-stat">
              <span class="result-num orange">{importResults.skipped}</span>
              <span>Skipped</span>
            </div>
            <div class="result-stat">
              <span class="result-num">{importResults.total}</span>
              <span>Total Rows</span>
            </div>
          </div>

          {#if importResults.errors && importResults.errors.length > 0}
            <div class="errors-section">
              <h3>Errors ({importResults.errors.length})</h3>
              <div class="errors-list">
                {#each importResults.errors.slice(0, 20) as err}
                  <div class="error-row">
                    <span class="error-row-num">Row {err.row}</span>
                    <span>{err.message}</span>
                  </div>
                {/each}
                {#if importResults.errors.length > 20}
                  <p class="text-muted">...and {importResults.errors.length - 20} more errors.</p>
                {/if}
              </div>
            </div>
          {/if}

          <div class="results-actions">
            <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
            <button class="btn btn-secondary" on:click={reset}>Import More</button>
          </div>
        </div>
      </div>
    {/if}

  {/if}
</div>

<style>
  .import-page { padding: 2rem 0; max-width: 800px; }
  .page-header { margin-bottom: 2rem; }
  .back-link { font-size: 0.85rem; color: var(--text-muted); }
  .back-link:hover { color: var(--navy); }
  .page-header h1 { font-size: 1.75rem; margin: 0.5rem 0 0.25rem; }
  .page-sub { color: var(--text-muted); }
  .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
  .text-muted { color: var(--text-muted); font-size: 0.85rem; }

  /* Steps indicator */
  .steps-indicator { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; }
  .step-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--text-dim); }
  .step-item.active { color: var(--navy); font-weight: 600; }
  .step-item.done { color: var(--green); }
  .step-num {
    width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; background: var(--bg-surface); color: var(--text-dim);
  }
  .step-item.active .step-num { background: var(--navy); color: white; }
  .step-item.done .step-num { background: var(--green); color: white; }
  .step-line { width: 30px; height: 2px; background: var(--border); }

  .alert-error { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.88rem; margin-bottom: 1rem; background: rgba(239,68,68,0.08); border: 1px solid var(--red); color: var(--red); }

  /* Upload */
  .select-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  .select-row label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.88rem; color: var(--text-muted); font-weight: 500; }

  .expected-fields { margin-bottom: 1.5rem; }
  .expected-fields h3 { font-size: 0.95rem; margin-bottom: 0.5rem; }
  .field-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .field-chip {
    padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.78rem; font-weight: 500;
    background: var(--bg-surface); color: var(--text-muted); font-family: monospace;
  }
  .field-chip.required { background: rgba(31,56,100,0.08); color: var(--navy); }

  .drop-zone {
    border: 2px dashed var(--border); border-radius: 12px; padding: 3rem 2rem;
    text-align: center; transition: all 0.2s; cursor: pointer;
  }
  .drop-zone.drag-over { border-color: var(--green); background: rgba(34,197,94,0.05); }
  .drop-zone p { color: var(--text-muted); margin: 0.75rem 0; }
  .drop-or { font-size: 0.82rem; color: var(--text-dim); }
  .file-btn { margin-top: 0.75rem; cursor: pointer; }
  .drop-hint { font-size: 0.78rem; color: var(--text-dim); }

  .hint-box { text-align: center; color: var(--text-muted); }

  /* Preview */
  .preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
  .preview-header h2 { font-size: 1.15rem; margin-bottom: 0.1rem; }
  .preview-actions { display: flex; gap: 0.5rem; }
  .preview-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; }
  .preview-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  .preview-table th {
    background: var(--bg-surface); padding: 0.6rem 0.75rem; text-align: left;
    font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;
    font-size: 0.72rem; white-space: nowrap; border-bottom: 1px solid var(--border);
  }
  .preview-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border-subtle); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .row-num { color: var(--text-dim); font-size: 0.75rem; }

  /* Mapping */
  .mapping-section h2 { font-size: 1.15rem; margin-bottom: 0.25rem; }
  .mapping-grid { display: flex; flex-direction: column; gap: 0.5rem; margin: 1.5rem 0; }
  .mapping-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; }
  .csv-col { flex: 1; }
  .csv-col-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; display: block; }
  .csv-col strong { font-size: 0.92rem; }
  .csv-sample { display: block; font-size: 0.78rem; color: var(--text-dim); margin-top: 0.15rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .map-arrow { flex-shrink: 0; }
  .field-col { flex: 1; }
  .field-col select { width: 100%; }
  .mapping-summary { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); }
  .unmapped-warn { color: var(--red); font-weight: 600; }
  .mapping-actions { display: flex; justify-content: space-between; margin-top: 1.5rem; }

  /* Results */
  .importing-screen { text-align: center; padding: 4rem; }
  .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--green); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .results-section { display: flex; justify-content: center; }
  .results-card { max-width: 500px; width: 100%; text-align: center; }
  .results-card h2 { margin-bottom: 1.5rem; }
  .results-stats { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.5rem; }
  .result-stat { display: flex; flex-direction: column; align-items: center; }
  .result-num { font-size: 2rem; font-weight: 700; font-family: var(--font-heading); color: var(--navy); }
  .result-num.green { color: var(--green); }
  .result-num.orange { color: var(--orange); }
  .result-stat span:last-child { font-size: 0.82rem; color: var(--text-muted); }

  .errors-section { text-align: left; margin-bottom: 1.5rem; }
  .errors-section h3 { font-size: 0.95rem; margin-bottom: 0.5rem; }
  .errors-list { background: var(--bg-surface); border-radius: 8px; padding: 0.5rem; max-height: 200px; overflow-y: auto; }
  .error-row { display: flex; gap: 0.5rem; padding: 0.4rem 0.5rem; font-size: 0.82rem; border-bottom: 1px solid var(--border-subtle); }
  .error-row:last-child { border-bottom: none; }
  .error-row-num { font-weight: 700; color: var(--red); white-space: nowrap; }
  .results-actions { display: flex; gap: 0.75rem; justify-content: center; }

  @media (max-width: 768px) {
    .select-row { grid-template-columns: 1fr; }
    .mapping-row { flex-direction: column; align-items: stretch; gap: 0.5rem; }
    .map-arrow { transform: rotate(90deg); align-self: center; }
    .preview-actions { flex-direction: column; width: 100%; }
    .preview-actions .btn { width: 100%; justify-content: center; }
  }
</style>

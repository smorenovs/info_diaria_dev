/* VS Ingeniería — Daily Status Editor (File System Access API) */

let dirHandle = null;
let state = { date: todayStr(), developers: [] };

/* ─── Init ──────────────────────────────────────────────────── */
function editorInit() {
  document.getElementById('date-input').value = todayStr();
  document.getElementById('date-input').addEventListener('change', e => {
    state.date = e.target.value;
    updatePreview();
  });
  document.getElementById('btn-connect').addEventListener('click', connectFolder);
  document.getElementById('btn-recover').addEventListener('click', recoverYesterday);
  document.getElementById('btn-save').addEventListener('click', saveJSON);
  document.getElementById('btn-add-dev').addEventListener('click', addDeveloper);

  // Iniciar con devs vacíos (plantilla)
  loadTemplate();
  updatePreview();
}

requireAuth(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', editorInit);
  } else {
    editorInit();
  }
});

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function prevDayStr(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* ─── Plantilla inicial ─────────────────────────────────────── */
function loadTemplate() {
  state.developers = [
    { name: 'AGUSTIN',  en_curso: [], pausadas: [], bloqueadas: [], proximas: [], testing: [], terminadas: [] },
    { name: 'EXEQUIEL', en_curso: [], pausadas: [], bloqueadas: [], proximas: [], testing: [], terminadas: [] },
    { name: 'MARIANO',  en_curso: [], pausadas: [], bloqueadas: [], proximas: [], testing: [], terminadas: [] },
    { name: 'MAURICIO', en_curso: [], pausadas: [], bloqueadas: [], proximas: [], testing: [], terminadas: [] },
  ];
  renderForm();
}

/* ─── Conectar carpeta ──────────────────────────────────────── */
async function connectFolder() {
  try {
    dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    // Buscar subcarpeta data/
    try {
      dirHandle = await dirHandle.getDirectoryHandle('data', { create: true });
    } catch {
      // Si ya estamos dentro de data, está bien
    }
    toast('Carpeta conectada correctamente', 'success');
    updateStatus('Carpeta conectada: ' + dirHandle.name);
    document.getElementById('btn-save').disabled = false;
  } catch (e) {
    if (e.name !== 'AbortError') toast('No se pudo conectar la carpeta', 'error');
  }
}

/* ─── Recuperar tareas de ayer ──────────────────────────────── */
async function recoverYesterday() {
  const prev = prevDayStr(document.getElementById('date-input').value);

  // Intento 1: fetch HTTP (funciona desde servidor local o GitHub Pages)
  try {
    const res = await fetch(`data/${prev}.json`);
    if (res.ok) {
      const data = await res.json();
      state.developers = data.developers || [];
      renderForm();
      updatePreview();
      toast(`Tareas del ${prev} recuperadas`, 'success');
      return;
    }
  } catch {}

  // Intento 2: File System API (requiere carpeta conectada)
  if (!dirHandle) {
    toast('Conectá la carpeta para recuperar datos sin servidor', 'error');
    return;
  }
  try {
    const fileHandle = await dirHandle.getFileHandle(`${prev}.json`);
    const file = await fileHandle.getFile();
    const data = JSON.parse(await file.text());
    state.developers = data.developers || [];
    renderForm();
    updatePreview();
    toast(`Tareas del ${prev} recuperadas`, 'success');
  } catch {
    toast(`No se encontró el archivo ${prev}.json`, 'error');
  }
}

/* ─── Guardar JSON ──────────────────────────────────────────── */
async function saveJSON() {
  if (!dirHandle) { toast('Primero conectá la carpeta data/', 'error'); return; }
  state.date = document.getElementById('date-input').value;
  const json = JSON.stringify(buildStateFromForm(), null, 2);
  try {
    // Guardar el archivo del día
    const fileHandle = await dirHandle.getFileHandle(`${state.date}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();

    // Actualizar index.json
    await updateIndex(state.date);

    toast(`Guardado: ${state.date}.json`, 'success');
  } catch (e) {
    toast('Error al guardar: ' + e.message, 'error');
  }
}

/* ─── Actualizar index.json ─────────────────────────────────── */
async function updateIndex(newDate) {
  let dates = [];
  try {
    const idxHandle = await dirHandle.getFileHandle('index.json');
    const file = await idxHandle.getFile();
    const text = await file.text();
    const idx = JSON.parse(text);
    dates = idx.dates || [];
  } catch {}

  if (!dates.includes(newDate)) {
    dates.push(newDate);
    dates.sort();
  }

  const idxHandle = await dirHandle.getFileHandle('index.json', { create: true });
  const writable = await idxHandle.createWritable();
  await writable.write(JSON.stringify({ dates }, null, 2));
  await writable.close();
}

/* ─── Construir estado desde el formulario ───────────────────── */
function buildStateFromForm() {
  const devEls = document.querySelectorAll('.dev-block');
  const developers = [];
  devEls.forEach(block => {
    const devIndex = Number(block.dataset.dev);
    const name = block.querySelector('.dev-name-input').value.trim().toUpperCase();
    developers.push({
      name,
      en_curso:   collectTasks(block, 'en_curso'),
      pausadas:   collectTasks(block, 'pausadas'),
      bloqueadas: collectTasks(block, 'bloqueadas'),
      proximas:   collectTasks(block, 'proximas'),
      testing:    collectTasks(block, 'testing'),
      terminadas: collectTasks(block, 'terminadas'),
    });
  });
  return { date: document.getElementById('date-input').value, developers };
}

function collectTasks(block, section) {
  const rows = block.querySelectorAll(`.task-input-row[data-section="${section}"]`);
  const tasks = [];
  rows.forEach(row => {
    const rawId  = row.querySelector('.ti-id')?.value.trim();
    const title  = row.querySelector('.ti-title')?.value.trim();
    const tag    = row.querySelector('.ti-tag')?.value.trim();
    const reason = row.querySelector('.ti-reason')?.value.trim();
    if (!rawId && !title) return; // fila vacía
    // Normalizar ID: agregar prefijo "TAREA " si el usuario no lo escribió
    const id = rawId
      ? (rawId.toUpperCase().startsWith('TAREA ') ? rawId.toUpperCase() : `TAREA ${rawId}`)
      : rawId;
    const t = { id, title };
    if (tag)                 t.tag = tag;
    if (reason !== undefined) t.reason = reason;
    tasks.push(t);
  });
  return tasks;
}

/* ─── Render del formulario ──────────────────────────────────── */
function renderForm() {
  const container = document.getElementById('devs-form');
  container.innerHTML = '';
  state.developers.forEach((dev, i) => {
    container.appendChild(buildDevBlock(dev, i));
  });
  bindFormEvents();
  updatePreview();
}

function buildDevBlock(dev, i) {
  const div = document.createElement('div');
  div.className = 'dev-block';
  div.dataset.dev = i;

  const initials = (dev.name || '??').slice(0, 2).toUpperCase();

  div.innerHTML = `
    <div class="dev-block-header">
      <div class="dev-avatar">${initials}</div>
      <input class="input dev-name-input" type="text" value="${escHtml(dev.name)}" placeholder="Nombre del desarrollador" style="font-weight:700;font-size:14px;max-width:220px;">
      <button class="btn btn-danger btn-sm btn-remove-dev" title="Eliminar desarrollador">✕</button>
      <button class="btn btn-ghost btn-sm btn-toggle-dev" title="Colapsar">▾</button>
    </div>
    <div class="dev-block-body">
      ${buildSection(dev, 'en_curso',   'En Curso',   false)}
      ${buildSection(dev, 'pausadas',   'Pausadas',   true)}
      ${buildSection(dev, 'bloqueadas', 'Bloqueadas', true)}
      ${buildSection(dev, 'proximas',   'Próximas',   false)}
      ${buildSection(dev, 'testing',   'Testing',    false)}
      ${buildSection(dev, 'terminadas', 'Terminadas', false)}
    </div>`;
  return div;
}

function buildSection(dev, key, label, hasReason) {
  const tasks = dev[key] || [];
  const colorMap = {
    en_curso:   'badge-en-curso',
    pausadas:   'badge-pausada',
    bloqueadas: 'badge-bloqueada',
    proximas:   'badge-proxima',
    testing:    'badge-testing',
    terminadas: 'badge-terminada',
  };
  const rows = tasks.map(t => taskInputRow(key, t, hasReason)).join('');
  return `
    <div class="section-block">
      <div class="section-block-header">
        <span class="status-badge ${colorMap[key]}">${label}</span>
        <button type="button" class="btn btn-ghost btn-xs btn-add-task" data-section="${key}">+ Agregar</button>
      </div>
      <div class="task-inputs" data-section-tasks="${key}">
        ${rows}
      </div>
    </div>`;
}

const SECTION_LABELS = {
  en_curso:   'En Curso',
  pausadas:   'Pausadas',
  bloqueadas: 'Bloqueadas',
  proximas:   'Próximas',
  testing:    'Testing',
  terminadas: 'Terminadas',
};

function taskInputRow(section, task = {}, hasReason = false) {
  // Mostrar solo el número en el input (sin el prefijo "TAREA ")
  const displayId = (task.id || '').replace(/^TAREA\s*/i, '');
  const tagField = (section === 'en_curso' || section === 'testing' || section === 'terminadas')
    ? `<input class="input ti-tag" type="text" value="${escHtml(task.tag || '')}" placeholder="Tag" style="width:80px;">`
    : '';
  const reasonField = hasReason
    ? `<input class="input ti-reason" type="text" value="${escHtml(task.reason || '')}" placeholder="Motivo (opcional)" style="flex:2;">`
    : '';
  const moveOptions = Object.entries(SECTION_LABELS)
    .filter(([key]) => key !== section)
    .map(([key, label]) => `<option value="${key}">${label}</option>`)
    .join('');
  const moveSelect = `
    <select class="select-move-to" title="Mover a otro estado">
      <option value="">Mover a…</option>
      ${moveOptions}
    </select>`;
  return `
    <div class="task-input-row" data-section="${section}">
      <input class="input ti-id" type="text" inputmode="numeric" value="${escHtml(displayId)}"
             placeholder="100" style="width:72px;" title="Número de tarea (se agrega TAREA automáticamente)">
      <input class="input ti-title" type="text" value="${escHtml(task.title || '')}" placeholder="Título de la tarea" style="flex:3;">
      ${tagField}
      ${reasonField}
      ${moveSelect}
      <button type="button" class="btn btn-danger btn-xs btn-remove-task" title="Eliminar tarea">✕</button>
    </div>`;
}

/* ─── Event delegation ───────────────────────────────────────── */
function bindFormEvents() {
  const container = document.getElementById('devs-form');

  container.addEventListener('click', e => {
    const addTask = e.target.closest('.btn-add-task');
    if (addTask) {
      const section = addTask.dataset.section;
      const devBlock = addTask.closest('.dev-block');
      const taskInputs = devBlock.querySelector(`[data-section-tasks="${section}"]`);
      const hasReason = section === 'pausadas' || section === 'bloqueadas';
      const div = document.createElement('div');
      div.innerHTML = taskInputRow(section, {}, hasReason);
      taskInputs.appendChild(div.firstElementChild);
      taskInputs.querySelector('.task-input-row:last-child .ti-id')?.focus();
      debouncedPreview();
    }

    if (e.target.closest('.btn-remove-task')) {
      e.target.closest('.task-input-row').remove();
      debouncedPreview();
    }

    if (e.target.closest('.btn-remove-dev')) {
      e.target.closest('.dev-block').remove();
      debouncedPreview();
    }

    const toggleDev = e.target.closest('.btn-toggle-dev');
    if (toggleDev) {
      const body = toggleDev.closest('.dev-block').querySelector('.dev-block-body');
      body.classList.toggle('collapsed');
      toggleDev.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
    }
  });

  container.addEventListener('change', e => {
    const sel = e.target.closest('.select-move-to');
    if (!sel || !sel.value) return;
    const target  = sel.value;
    const row     = sel.closest('.task-input-row');
    const devBlock = sel.closest('.dev-block');
    const rawId   = row.querySelector('.ti-id')?.value.trim();
    const title   = row.querySelector('.ti-title')?.value.trim();
    const tag     = row.querySelector('.ti-tag')?.value.trim();
    const reason  = row.querySelector('.ti-reason')?.value.trim();
    sel.value = ''; // resetear el select
    if (!rawId && !title) { row.remove(); debouncedPreview(); return; }
    const hasReason = target === 'pausadas' || target === 'bloqueadas';
    const targetContainer = devBlock.querySelector(`[data-section-tasks="${target}"]`);
    const div = document.createElement('div');
    div.innerHTML = taskInputRow(target, { id: rawId, title, tag, reason: hasReason ? reason : undefined }, hasReason);
    targetContainer.appendChild(div.firstElementChild);
    row.remove();
    debouncedPreview();
  });

  container.addEventListener('input', debouncedPreview);
}

function addDeveloper() {
  const container = document.getElementById('devs-form');
  const block = buildDevBlock({ name: '', en_curso: [], pausadas: [], bloqueadas: [], proximas: [], testing: [], terminadas: [] }, Date.now());
  container.appendChild(block);
  block.querySelector('.dev-name-input')?.focus();
  debouncedPreview();
}

/* ─── Preview ────────────────────────────────────────────────── */
let previewTimer = null;
function debouncedPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 300);
}

function updatePreview() {
  const data = buildStateFromForm();
  const pre = document.getElementById('json-preview');
  if (pre) pre.textContent = JSON.stringify(data, null, 2);
}

/* ─── Status bar ─────────────────────────────────────────────── */
function updateStatus(msg) {
  const el = document.getElementById('status-bar');
  if (el) el.textContent = msg;
}

/* ─── Toast ──────────────────────────────────────────────────── */
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-show'));
  setTimeout(() => {
    t.classList.remove('toast-show');
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

/* ─── Helpers ────────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* VS Ingeniería — Daily Status Viewer */

let latestData     = null;   // datos del día más reciente (tareas activas)
let availableDates = [];
let terminadasByDev = {};    // { devName: task[] } agregado del período
let currentPeriod  = 'day';

/* ─── Init ─────────────────────────────────────────────────── */
async function init() {
  // Listeners siempre se registran, independientemente de errores de carga
  document.getElementById('kpi-terminadas-card').addEventListener('click', openTerminadasModal);
  document.getElementById('devs-grid').addEventListener('click', e => {
    const row = e.target.closest('.task-row[data-task-id]');
    if (row) openTaskHistory(row.dataset.taskId);
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('task-history-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadTerminadasForPeriod(btn.dataset.period);
    });
  });

  await discoverAvailableDates();
  const latest = availableDates[availableDates.length - 1];
  if (latest) {
    await loadLatest(latest);
    await loadTerminadasForPeriod('day');
  } else {
    renderEmpty();
  }
}

/* ─── Date discovery ─────────────────────────────────────────
   GitHub Pages no lista directorios, así que mantenemos un
   índice: data/index.json con la lista de fechas disponibles.
   Si no existe, intentamos los últimos 60 días.
──────────────────────────────────────────────────────────── */
async function discoverAvailableDates() {
  try {
    const res = await fetch('data/index.json');
    if (res.ok) {
      const idx = await res.json();
      availableDates = (idx.dates || []).sort();
      return;
    }
  } catch {}

  // Fallback: probar los últimos 60 días
  const found = [];
  const today = new Date();
  const checks = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    checks.push(dateStr(d));
  }
  await Promise.all(checks.map(async (d) => {
    try {
      const res = await fetch(`data/${d}.json`, { method: 'HEAD' });
      if (res.ok) found.push(d);
    } catch {}
  }));
  availableDates = found.sort();
}

/* ─── Load latest day (tareas activas) ─────────────────────── */
async function loadLatest(date) {
  showLoading();
  try {
    const res = await fetch(`data/${date}.json`);
    if (!res.ok) throw new Error('not found');
    latestData = await res.json();
    document.getElementById('last-update').textContent =
      `Datos activos del ${formatDateLabel(date)}`;
    renderActiveKPIs();
    renderDevs();
  } catch {
    showError(date);
  }
}

/* ─── Load terminadas por período ───────────────────────────── */
async function loadTerminadasForPeriod(period) {
  currentPeriod = period;
  const latest = availableDates[availableDates.length - 1];
  if (!latest) return;

  let datesInPeriod;
  if (period === 'day') {
    datesInPeriod = [latest];
  } else {
    const cutoffDays = period === 'week' ? 7 : 30;
    const latestDate = new Date(latest + 'T12:00:00');
    datesInPeriod = availableDates.filter(d => {
      const dd = new Date(d + 'T12:00:00');
      return (latestDate - dd) / 86400000 <= cutoffDays;
    });
  }

  const results = await Promise.all(
    datesInPeriod.map((d, i) =>
      fetch(`data/${d}.json`).then(r => r.ok ? r.json() : null).catch(() => null)
        .then(data => ({ date: datesInPeriod[i], data }))
    )
  );

  // Acumular terminadas por dev, guardando fecha de terminación, deduplicando por id
  const byDev = {};
  for (const { date, data } of results) {
    if (!data) continue;
    for (const dev of data.developers || []) {
      if (!byDev[dev.name]) byDev[dev.name] = new Map();
      for (const task of dev.terminadas || []) {
        const key = task.id || task.title || JSON.stringify(task);
        if (!byDev[dev.name].has(key)) {
          byDev[dev.name].set(key, { ...task, terminatedOn: date });
        }
      }
    }
  }
  terminadasByDev = {};
  for (const name of Object.keys(byDev)) {
    terminadasByDev[name] = Array.from(byDev[name].values());
  }

  renderTerminadasKPI();
  renderDevs();
}

/* ─── KPIs ───────────────────────────────────────────────────── */
function renderActiveKPIs() {
  if (!latestData) return;
  let enCurso = 0, pausadas = 0, bloqueadas = 0, proximas = 0, testing = 0;
  for (const dev of latestData.developers || []) {
    enCurso    += (dev.en_curso    || []).length;
    pausadas   += (dev.pausadas    || []).length;
    bloqueadas += (dev.bloqueadas  || []).length;
    proximas   += (dev.proximas    || []).length;
    testing    += (dev.testing     || []).length;
  }
  setText('kpi-en-curso',   enCurso);
  setText('kpi-pausadas',   pausadas);
  setText('kpi-bloqueadas', bloqueadas);
  setText('kpi-proximas',   proximas);
  setText('kpi-testing',    testing);
}

function renderTerminadasKPI() {
  const total = Object.values(terminadasByDev)
    .reduce((acc, tasks) => acc + tasks.length, 0);
  setText('kpi-terminadas', total);
}

/* ─── Render devs ────────────────────────────────────────────── */
function renderDevs() {
  if (!latestData) return;
  const grid = document.getElementById('devs-grid');
  if (!latestData.developers || latestData.developers.length === 0) {
    grid.innerHTML = emptyStateHTML('Sin desarrolladores', 'No hay datos de desarrolladores para este día.');
    return;
  }
  grid.innerHTML = latestData.developers.map(devCardHTML).join('');
}

function devCardHTML(dev) {
  const initials   = dev.name.slice(0, 2).toUpperCase();
  const enCurso    = dev.en_curso    || [];
  const pausadas   = dev.pausadas    || [];
  const bloqueadas = dev.bloqueadas  || [];
  const proximas   = dev.proximas    || [];
  const testing    = dev.testing     || [];
  const activeCount = enCurso.length + pausadas.length + bloqueadas.length + testing.length;

  let body = '';

  if (enCurso.length > 0) {
    body += taskGroupHTML('En Curso', 'en-curso', enCurso.map(t => taskRowHTML(t)));
  }
  if (pausadas.length > 0) {
    body += taskGroupHTML('Pausadas', 'pausadas', pausadas.map(t => taskRowHTML(t, true)));
  }
  if (bloqueadas.length > 0) {
    body += taskGroupHTML('Bloqueadas', 'bloqueadas', bloqueadas.map(t => taskRowHTML(t, true)));
  }
  if (proximas.length > 0) {
    const pills = proximas.map(t => {
      const lbl = /^TAREA\s/i.test(t.id || '') ? t.id : `#${t.id}`;
      return `<span class="pill-id" title="${escHtml(t.title)}">${escHtml(lbl)}</span>`;
    }).join('');
    body += `
      <div class="task-group">
        <div class="task-group-label proximas"><span class="dot"></span>Próximas</div>
        <div class="proximas-pills">${pills}</div>
      </div>`;
  }
  if (testing.length > 0) {
    body += taskGroupHTML('Testing', 'testing', testing.map(t => taskRowHTML(t)));
  }

  if (!body) {
    body = `<p style="font-size:13px;color:var(--vs-gray-dark);font-style:italic;">Sin novedades para este día.</p>`;
  }

  return `
    <div class="dev-card">
      <div class="dev-card-header">
        <div class="dev-avatar">${escHtml(initials)}</div>
        <div>
          <div class="dev-name">${escHtml(dev.name)}</div>
          <div class="dev-task-count">${activeCount} tarea${activeCount !== 1 ? 's' : ''} activa${activeCount !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="dev-card-body">${body}</div>
    </div>`;
}

function taskGroupHTML(label, cssClass, rowsHTML) {
  return `
    <div class="task-group">
      <div class="task-group-label ${cssClass}"><span class="dot"></span>${label}</div>
      ${rowsHTML.join('')}
    </div>`;
}

function taskRowHTML(task, showReason = false) {
  const tagHtml = task.tag
    ? `<span class="task-tag">${escHtml(task.tag)}</span>`
    : '';
  const reasonHtml = showReason && task.reason
    ? `<div class="task-reason">${escHtml(task.reason)}</div>`
    : '';
  const idLabel = /^TAREA\s/i.test(task.id || '')
    ? task.id
    : (task.id ? `#${task.id}` : '');
  return `
    <div class="task-row" data-task-id="${escHtml(task.id || '')}" title="Ver historial de esta tarea">
      <div class="task-main">
        ${idLabel ? `<span class="task-id">${escHtml(idLabel)}</span>` : ''}
        <span class="task-title">${escHtml(task.title)}</span>
        ${tagHtml}
      </div>
      ${reasonHtml}
    </div>`;
}

function emptyStateHTML(title, desc) {
  return `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      </svg>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-desc">${desc}</div>
    </div>`;
}

/* ─── Loading / Error ────────────────────────────────────────── */
function showLoading() {
  const grid = document.getElementById('devs-grid');
  grid.innerHTML = [1,2,3,4].map(() => `
    <div class="dev-card">
      <div class="dev-card-header">
        <div class="dev-avatar skeleton" style="background:none;"></div>
        <div style="flex:1;">
          <div class="skeleton" style="height:14px;width:60%;margin-bottom:6px;"></div>
          <div class="skeleton" style="height:11px;width:40%;"></div>
        </div>
      </div>
      <div class="dev-card-body">
        <div class="skeleton" style="height:12px;width:30%;margin-bottom:8px;"></div>
        <div class="skeleton" style="height:13px;width:85%;margin-bottom:6px;"></div>
        <div class="skeleton" style="height:13px;width:70%;"></div>
      </div>
    </div>`).join('');
}

function showError(date) {
  const grid = document.getElementById('devs-grid');
  grid.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-state-title">No hay datos para el ${date}</div>
      <div class="empty-state-desc">Verificá que el archivo data/${date}.json exista en el repositorio.</div>
    </div>`;
}

function renderEmpty() {
  const grid = document.getElementById('devs-grid');
  grid.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-state-title">Sin datos cargados</div>
      <div class="empty-state-desc">Usá el editor local para crear el primer reporte diario.</div>
    </div>`;
  ['kpi-en-curso','kpi-pausadas','kpi-bloqueadas','kpi-proximas','kpi-testing','kpi-terminadas']
    .forEach(id => setText(id, 0));
}

/* ─── Helpers ────────────────────────────────────────────────── */
function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── Historial de tarea ─────────────────────────────────────── */
const SECTIONS = ['en_curso','pausadas','bloqueadas','proximas','testing','terminadas'];
const STATUS_LABEL = {
  en_curso: 'En Curso', pausadas: 'Pausadas', bloqueadas: 'Bloqueadas',
  proximas: 'Próximas', testing: 'Testing', terminadas: 'Terminadas',
};

async function openTaskHistory(taskId) {
  if (!taskId) return;
  showModal('<p style="color:var(--vs-gray-mid);font-size:13px;">Cargando historial…</p>');

  const results = await Promise.all(
    availableDates.map(d =>
      fetch(`data/${d}.json`).then(r => r.ok ? r.json() : null).catch(() => null)
    )
  );

  const history = [];
  for (let i = 0; i < availableDates.length; i++) {
    const data = results[i];
    if (!data) continue;
    for (const dev of data.developers || []) {
      for (const section of SECTIONS) {
        const found = (dev[section] || []).find(t =>
          (t.id || '').toUpperCase() === taskId.toUpperCase()
        );
        if (found) {
          history.push({
            date: availableDates[i],
            dev: dev.name,
            status: section,
            reason: found.reason || null,
            title: found.title,
          });
          break;
        }
      }
    }
  }

  // Solo mostrar la primera vez que la tarea entró en cada estado (transiciones)
  const transitions = history.filter((h, i) =>
    i === 0 || h.status !== history[i - 1].status
  );

  renderTaskHistoryModal(taskId, transitions);
}

function renderTaskHistoryModal(taskId, history) {
  if (history.length === 0) {
    showModal(`
      <div style="text-align:center;padding:var(--space-5);color:var(--vs-gray-mid);">
        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">Sin historial</div>
        <div style="font-size:12px;">La tarea <strong>${escHtml(taskId)}</strong> no aparece en ningún registro.</div>
      </div>`);
    return;
  }

  const title = history[history.length - 1].title;

  const events = history.map((h, i) => {
    const isLast = i === history.length - 1;
    const reasonHtml = h.reason
      ? `<div class="timeline-reason">${escHtml(h.reason)}</div>`
      : '';
    return `
      <div class="timeline-event">
        <div class="timeline-dot ${h.status}"></div>
        <div class="timeline-connector${isLast ? ' hidden' : ''}"></div>
        <div class="timeline-info">
          <span class="timeline-date">${formatDateLabel(h.date)}</span>
          <span class="task-group-label ${h.status}">${STATUS_LABEL[h.status]}</span>
          <span class="timeline-dev">${escHtml(h.dev)}</span>
          ${reasonHtml}
        </div>
      </div>`;
  }).join('');

  showModal(`
    <div class="modal-task-header">
      <span class="task-id">${escHtml(taskId)}</span>
      <span class="modal-task-title">${escHtml(title)}</span>
    </div>
    <div class="timeline">${events}</div>
  `);
}

function openTerminadasModal() {
  const PERIOD_LABEL = { day: 'Hoy', week: 'Esta semana', month: 'Este mes' };
  const devNames = Object.keys(terminadasByDev).filter(n => terminadasByDev[n].length > 0);

  if (devNames.length === 0) {
    showModal(`
      <div style="text-align:center;padding:var(--space-5);color:var(--vs-gray-mid);">
        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">Sin tareas finalizadas</div>
        <div style="font-size:12px;">No hay terminadas para el período seleccionado.</div>
      </div>`);
    return;
  }

  const sections = devNames.map(name => {
    const tasks = terminadasByDev[name];
    const rows = tasks.map(t => {
      const idLabel = /^TAREA\s/i.test(t.id || '') ? t.id : (t.id ? `#${t.id}` : '');
      const dateLabel = t.terminatedOn ? `<span class="timeline-date">${formatDateLabel(t.terminatedOn)}</span>` : '';
      const tagHtml = t.tag ? `<span class="task-tag">${escHtml(t.tag)}</span>` : '';
      return `
        <div class="terminadas-modal-row">
          <svg class="terminadas-check" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div class="terminadas-modal-info">
            <div class="task-main">
              ${idLabel ? `<span class="task-id">${escHtml(idLabel)}</span>` : ''}
              <span class="task-title">${escHtml(t.title)}</span>
              ${tagHtml}
            </div>
            ${dateLabel}
          </div>
        </div>`;
    }).join('');

    const initials = name.slice(0, 2).toUpperCase();
    return `
      <div class="terminadas-modal-dev">
        <div class="terminadas-modal-dev-header">
          <div class="dev-avatar" style="width:28px;height:28px;font-size:10px;">${escHtml(initials)}</div>
          <span class="dev-name" style="font-size:13px;">${escHtml(name)}</span>
          <span class="timeline-date">${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}</span>
        </div>
        ${rows}
      </div>`;
  }).join('');

  showModal(`
    <div class="modal-task-header">
      <span class="task-group-label terminadas" style="font-size:14px;">Terminadas</span>
      <span class="timeline-date">${PERIOD_LABEL[currentPeriod] || ''}</span>
    </div>
    ${sections}
  `);
}

function showModal(html) {
  const modal = document.getElementById('task-history-modal');
  document.getElementById('modal-content').innerHTML = html;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('task-history-modal').hidden = true;
  document.body.style.overflow = '';
}

/* init() es llamado por auth.js vía requireAuth() */

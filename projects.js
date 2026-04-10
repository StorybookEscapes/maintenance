// ── Projects Module ──────────────────────────────────────────
// KV key: se_projects  (array of project objects)
// Tasks stay in se_t with optional project_id / project_title fields.
// This file expects app.js globals: S, save, tasks, saveTasks, PROPS, NBS,
// getProp, getNb, showToast, closeModal, getCurrentUserName, populatePropSel.

let projects = [];
const PJ_KEY = 'se_projects';
const savePJ = () => save(PJ_KEY, projects);

// ── LOAD ────────────────────────────────────────────────────
async function pjLoad() {
  try {
    const r = await S.get(PJ_KEY);
    if (r && r.value) projects = JSON.parse(r.value);
    else projects = [];
  } catch (e) { projects = []; }
}

// ── LIST VIEW ───────────────────────────────────────────────
function pjRenderList() {
  const el = document.getElementById('pj-list');
  const det = document.getElementById('pj-detail');
  if (!el) return;
  el.style.display = '';
  det.style.display = 'none';

  if (!projects.length) {
    el.innerHTML = '<div class="empty">No projects yet. Click <strong>+ New Project</strong> to import an inspection report or start a project.</div>';
    return;
  }

  // Separate open vs complete
  const open = projects.filter(p => p.status !== 'complete');
  const done = projects.filter(p => p.status === 'complete');

  let html = '';
  if (open.length) {
    html += `<div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--green);font-weight:700;margin-bottom:10px">Open Projects</div>`;
    html += '<div class="pj-cards">';
    open.forEach(p => { html += pjCard(p); });
    html += '</div>';
  }
  if (done.length) {
    html += `<div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--text2);font-weight:700;margin:24px 0 10px">Completed</div>`;
    html += '<div class="pj-cards">';
    done.forEach(p => { html += pjCard(p); });
    html += '</div>';
  }
  el.innerHTML = html;
}

function pjCard(p) {
  const prop = getProp(p.property);
  const nb = getNb(p.property);
  const nbcls = nb ? 'nb-' + nb.cls : '';
  const projTasks = tasks.filter(t => t.project_id === p.id);
  const doneCount = projTasks.filter(t => t.status === 'complete' || t.status === 'resolved_by_guest').length;
  const total = projTasks.length;
  const pct = total ? Math.round(doneCount / total * 100) : 0;
  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'complete';
  const dueClass = isOverdue ? ' overdue' : '';

  return `<div class="pj-card ${p.status === 'complete' ? 'pj-complete' : ''} ${nbcls}" onclick="pjShowDetail('${p.id}')">
    <div class="pj-card-title">${p.title}</div>
    <div class="pj-card-meta">
      <span class="pj-pill pj-pill-prop">${prop ? prop.name : p.property}</span>
      ${p.type ? `<span class="pj-pill pj-pill-type">${p.type}</span>` : ''}
      ${p.due_date ? `<span class="pj-pill pj-pill-due${dueClass}">Due: ${p.due_date}</span>` : ''}
    </div>
    ${total ? `<div class="pj-progress">
      <div class="pj-bar"><div class="pj-bar-fill" style="width:${pct}%"></div></div>
      <div class="pj-progress-label">${doneCount} of ${total} tasks complete (${pct}%)</div>
    </div>` : '<div class="pj-progress-label" style="font-size:.68rem;color:var(--text3)">No tasks created yet</div>'}
  </div>`;
}

// ── DETAIL VIEW ─────────────────────────────────────────────
function pjShowDetail(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const el = document.getElementById('pj-detail');
  const list = document.getElementById('pj-list');
  list.style.display = 'none';
  el.style.display = '';

  const prop = getProp(p.property);
  const nb = getNb(p.property);
  const projTasks = tasks.filter(t => t.project_id === pid);
  const doneCount = projTasks.filter(t => t.status === 'complete' || t.status === 'resolved_by_guest').length;
  const failCount = p.items ? p.items.filter(i => i.status === 'fail').length : 0;
  const total = projTasks.length;
  const pct = total ? Math.round(doneCount / total * 100) : 0;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (pct / 100) * circumference;

  let html = '';

  // Back button + header
  html += `<div style="margin-bottom:12px"><span style="font-size:.76rem;color:var(--green);cursor:pointer;font-weight:500" onclick="pjRenderList()">&#x2190; All Projects</span></div>`;
  html += `<div class="pj-detail-hdr">
    <div>
      <div class="pj-detail-title">${p.title}</div>
      <div class="pj-card-meta" style="margin-top:6px">
        <span class="pj-pill pj-pill-prop">${prop ? prop.name : p.property}</span>
        ${p.type ? `<span class="pj-pill pj-pill-type">${p.type}</span>` : ''}
        ${p.due_date ? `<span class="pj-pill pj-pill-due">${p.due_date}</span>` : ''}
        <span class="pj-pill" style="background:${p.status === 'complete' ? 'var(--green-light);color:var(--green)' : 'var(--gold-pale);color:#8b7120'};border:1px solid var(--border)">${p.status === 'complete' ? 'Complete' : 'Open'}</span>
      </div>
    </div>
    <div class="pj-detail-actions">
      <button class="btn" onclick="pjToggleVisibility('${pid}')">${p.visible !== false ? '👁 Hide Tasks' : '👁 Show Tasks'}</button>
      ${p.status !== 'complete' ? `<button class="btn btn-g" onclick="pjConfirmComplete('${pid}')">Mark Complete</button>` : ''}
    </div>
  </div>`;

  // Source info bar
  if (p.source) {
    const s = p.source;
    html += `<div class="pj-source-bar">
      <div>
        <div class="pj-src-label">Source Document</div>
        <div style="font-size:.82rem;color:var(--text);margin-top:2px">${s.inspector || ''} ${s.inspection_date ? '· ' + s.inspection_date : ''}</div>
      </div>
      ${s.pdf_url ? `<span class="pj-src-link" onclick="pjOpenPdf('${s.pdf_url}',null,'${p.title.replace(/'/g, "\\'")}')">📄 View Full Report</span>` : ''}
    </div>`;
  }

  // Progress ring
  if (total) {
    html += `<div class="pj-ring">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--green-light)" stroke-width="5"/>
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--green)" stroke-width="5"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 32 32)" style="transition:stroke-dashoffset .5s"/>
        <text x="32" y="36" text-anchor="middle" fill="var(--green)" font-size="14" font-weight="700">${pct}%</text>
      </svg>
      <div>
        <div class="pj-ring-label">${doneCount} of ${total} tasks complete</div>
        <div class="pj-ring-sub">${failCount} fail items · ${p.items ? p.items.length : 0} total items</div>
      </div>
    </div>`;
  }

  // Items table
  if (p.items && p.items.length) {
    const sorted = [...p.items].sort((a, b) => {
      if (a.status === 'fail' && b.status !== 'fail') return -1;
      if (a.status !== 'fail' && b.status === 'fail') return 1;
      return 0;
    });

    html += `<div class="pj-items-panel"><div class="pj-items-hdr">
      <span>Inspection Items (${p.items.length})</span>
      <span>${failCount} fail · ${p.items.length - failCount} pass</span>
    </div>
    <table class="pj-tbl"><thead><tr>
      <th style="width:55px">Result</th><th>Item</th><th style="width:110px">Room</th><th>Remark</th><th style="width:155px">Task</th>
    </tr></thead><tbody>`;

    sorted.forEach(item => {
      const rowCls = item.status === 'fail' ? 'pj-row-fail' : 'pj-row-pass';
      const task = item.task_id ? tasks.find(t => t.id === item.task_id) : null;
      const isComplete = task && task.status === 'complete';
      let taskCell = '';
      if (task) {
        taskCell = isComplete
          ? `<button class="pj-inspect-btn ready" onclick="event.stopPropagation();pjToggleTask('${task.id}','${pid}')">✓ Ready for Inspection</button>`
          : `<button class="pj-inspect-btn not-done" onclick="event.stopPropagation();pjToggleTask('${task.id}','${pid}')">Not Complete</button>`;
      }

      const pdfUrl = p.source && p.source.pdf_url ? p.source.pdf_url : '';
      const remarkText = item.remark || '—';
      const remarkHtml = pdfUrl && item.page
        ? `<span class="pj-remark" onclick="pjOpenPdf('${pdfUrl}',${item.page},'${item.name.replace(/'/g, "\\'")}')">${remarkText}</span>`
        : remarkText;

      const roomHtml = `<span contenteditable="true" style="display:inline-block;min-width:50px;padding:2px 4px;border-radius:3px;border:1px dashed var(--border);font-size:.76rem;color:var(--text2);cursor:text" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border)';pjUpdateRoom('${pid}','${item.item_id}',this.textContent)">${item.room || '<span style="color:var(--text3)">+ add</span>'}</span>`;

      html += `<tr class="${rowCls}">
        <td><span class="pj-status-pill ${item.status}">${item.status.toUpperCase()}</span></td>
        <td><strong>${item.name}</strong></td>
        <td>${roomHtml}</td>
        <td>${remarkHtml}</td>
        <td>${taskCell}</td>
      </tr>`;
    });

    html += '</tbody></table></div>';
  }

  // Notes
  html += `<div class="pj-notes"><div class="pj-notes-title">Project Notes</div>`;
  if (p.notes && p.notes.length) {
    p.notes.forEach(n => {
      html += `<div class="pj-note"><div class="pj-note-text">${n.text}</div><div class="pj-note-meta">${n.by} · ${new Date(n.time).toLocaleDateString()}</div></div>`;
    });
  }
  html += `<div style="margin-top:10px;display:flex;gap:8px">
    <input type="text" id="pj-note-input" placeholder="Add a note..." style="flex:1;font-size:.82rem">
    <button class="btn btn-g" onclick="pjAddNote('${pid}')" style="font-size:.76rem">Add</button>
  </div></div>`;

  el.innerHTML = html;
}

// ── ACTIONS ─────────────────────────────────────────────────
function pjToggleTask(taskId, pid) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.status = task.status === 'complete' ? 'open' : 'complete';
  saveTasks();
  pjShowDetail(pid);
  showToast(task.status === 'complete' ? 'Marked ready for inspection' : 'Marked not complete');
}

function pjToggleVisibility(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  p.visible = p.visible === false ? true : false;
  savePJ();
  pjShowDetail(pid);
  showToast(p.visible ? 'Project tasks now visible on Tasks tab' : 'Project tasks hidden from Tasks tab');
}

function pjConfirmComplete(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const projTasks = tasks.filter(t => t.project_id === pid);
  const openCount = projTasks.filter(t => t.status !== 'complete' && t.status !== 'resolved_by_guest').length;
  let msg = 'Mark this project as complete?';
  if (openCount > 0) msg = `⚠️ ${openCount} task${openCount > 1 ? 's are' : ' is'} still open.\n\nMark this project complete anyway?`;
  if (confirm(msg)) {
    p.status = 'complete';
    savePJ();
    pjRenderList();
    showToast('Project marked complete');
  }
}

function pjAddNote(pid) {
  const input = document.getElementById('pj-note-input');
  const text = input.value.trim();
  if (!text) return;
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  if (!p.notes) p.notes = [];
  p.notes.push({ text, by: getCurrentUserName(), time: new Date().toISOString() });
  savePJ();
  pjShowDetail(pid);
}

function pjUpdateRoom(pid, itemId, val) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const item = p.items.find(i => i.item_id === itemId);
  if (item) { item.room = val.trim(); savePJ(); }
}

// ── PDF VIEWER ──────────────────────────────────────────────
function pjOpenPdf(url, page, title) {
  const modal = document.getElementById('pj-pdf-modal');
  const frame = document.getElementById('pj-pdf-frame');
  const titleEl = document.getElementById('pj-pdf-title');
  const pageEl = document.getElementById('pj-pdf-page');
  titleEl.textContent = title || 'Source Document';
  pageEl.textContent = page ? 'Page ' + page : 'Full Report';
  frame.src = url + (page ? '#page=' + page : '');
  modal.classList.add('open');
}

// ── IMPORT WIZARD ───────────────────────────────────────────
// Step 1: Title, Property, Type (required — manual)
// Step 2: Paste report text (auto-detects inspector, dates, items)
// Step 3: Review everything — auto-detected fields editable, items table
let pjImportData = { step: 1, title: '', property: '', type: 'inspection', due: '', inspector: '', inspDate: '', reinspDate: '', pdfUrl: '', items: [], _rawText: '' };

function pjOpenImport() {
  pjImportData = { step: 1, title: '', property: '', type: 'inspection', due: '', inspector: '', inspDate: '', reinspDate: '', pdfUrl: '', items: [], _rawText: '' };
  document.getElementById('pj-import-modal').classList.add('open');
  document.getElementById('pj-import-title').textContent = 'New Project';
  pjRenderStep();
}

function pjRenderStep() {
  const body = document.getElementById('pj-import-body');
  const step = pjImportData.step;
  const dots = [1, 2, 3].map(n => `<span class="pj-step-dot${n <= step ? ' active' : ''}"></span>`).join('');

  // ── STEP 1: Just the basics ──
  if (step === 1) {
    body.innerHTML = `<div class="pj-step-indicator">${dots}</div>
      <div style="font-size:.72rem;color:var(--text2);margin-bottom:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Step 1 — Project Basics</div>
      <div class="fg">
        <div class="fgr full"><label>Project Title</label><input type="text" id="pji-title" value="${pjImportData.title}" placeholder="e.g. Fire Inspection - Bearadise Lodge - 2026"></div>
        <div class="fgr"><label>Property</label><select id="pji-property"></select></div>
        <div class="fgr"><label>Project Type</label><select id="pji-type">
          <option value="inspection"${pjImportData.type === 'inspection' ? ' selected' : ''}>Inspection</option>
          <option value="renovation"${pjImportData.type === 'renovation' ? ' selected' : ''}>Renovation</option>
          <option value="compliance"${pjImportData.type === 'compliance' ? ' selected' : ''}>Compliance</option>
          <option value="other"${pjImportData.type === 'other' ? ' selected' : ''}>Other</option>
        </select></div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn btn-g" onclick="pjStep1Next()">Next →</button></div>`;
    populatePropSel('pji-property');
    if (pjImportData.property) document.getElementById('pji-property').value = pjImportData.property;
  }

  // ── STEP 2: Paste report text ──
  if (step === 2) {
    body.innerHTML = `<div class="pj-step-indicator">${dots}</div>
      <div style="font-size:.72rem;color:var(--text2);margin-bottom:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Step 2 — Import Report</div>
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:12px;line-height:1.4">Paste the inspection report text below. The parser will auto-detect <strong>items, inspector name, dates, and page numbers</strong>.</p>
      <div class="fgr full" style="margin-bottom:14px">
        <label>Paste Report Text</label>
        <textarea id="pji-paste" rows="12" placeholder="Paste the full inspection report text here..." style="font-size:.78rem;font-family:monospace">${pjImportData._rawText || ''}</textarea>
      </div>
      <div style="display:flex;justify-content:space-between">
        <button class="btn" onclick="pjImportData.step=1;pjRenderStep()">← Back</button>
        <div style="display:flex;gap:8px">
          <button class="btn" onclick="pjSkipToReview()">Skip — Add Items Manually</button>
          <button class="btn btn-g" onclick="pjStep2Parse()">Parse & Review →</button>
        </div>
      </div>`;
  }

  // ── STEP 3: Review everything ──
  if (step === 3) {
    const d = pjImportData;
    const items = d.items;
    const failCount = items.filter(i => i.status === 'fail').length;

    // Auto-detected details bar (editable)
    let detectedHtml = `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:16px">
      <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:var(--green);font-weight:700;margin-bottom:10px">Auto-Detected Details <span style="font-weight:400;color:var(--text3);text-transform:none;letter-spacing:0">(edit if needed)</span></div>
      <div class="fg">
        <div class="fgr"><label>Inspector</label><input type="text" id="pji-inspector" value="${d.inspector}" placeholder="Not detected"></div>
        <div class="fgr"><label>Inspection Date</label><input type="date" id="pji-inspdate" value="${d.inspDate}"></div>
        <div class="fgr"><label>Re-inspection / Due Date</label><input type="date" id="pji-due" value="${d.due}"></div>
        <div class="fgr"><label>PDF URL (optional)</label><input type="text" id="pji-pdf" value="${d.pdfUrl}" placeholder="https://..."></div>
      </div>
    </div>`;

    // Items table
    let rows = '';
    items.forEach((item, i) => {
      rows += `<tr class="${item.status === 'fail' ? 'fail-row' : ''}">
        <td><input type="checkbox" ${item._create !== false ? 'checked' : ''} onchange="pjImportData.items[${i}]._create=this.checked"></td>
        <td><span class="pj-status-pill ${item.status}">${item.status.toUpperCase()}</span></td>
        <td><input type="text" value="${item.name.replace(/"/g, '&quot;')}" onchange="pjImportData.items[${i}].name=this.value" style="width:100%;font-size:.78rem"></td>
        <td><input type="text" value="${(item.remark || '').replace(/"/g, '&quot;')}" onchange="pjImportData.items[${i}].remark=this.value" style="width:100%;font-size:.78rem"></td>
        <td><input type="number" value="${item.page || ''}" onchange="pjImportData.items[${i}].page=parseInt(this.value)||0" style="width:50px;font-size:.78rem"></td>
      </tr>`;
    });

    body.innerHTML = `<div class="pj-step-indicator">${dots}</div>
      <div style="font-size:.72rem;color:var(--text2);margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Step 3 — Review & Create</div>
      ${detectedHtml}
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:10px">${items.length} items found (${failCount} fail, ${items.length - failCount} pass). Tasks auto-created for checked <strong>FAIL</strong> items.</p>
      ${items.length ? `<table class="pj-review-tbl"><thead><tr><th style="width:30px">✓</th><th style="width:50px">Result</th><th>Item</th><th>Remark</th><th style="width:55px">Page</th></tr></thead><tbody>${rows}</tbody></table>` : '<div class="empty" style="margin:10px 0">No items detected. Add items manually below.</div>'}
      <div style="margin-top:8px"><button class="btn" onclick="pjAddManualItem()" style="font-size:.74rem">+ Add Item Manually</button></div>
      <div style="display:flex;justify-content:space-between;margin-top:18px">
        <button class="btn" onclick="pjImportData.step=2;pjRenderStep()">← Back</button>
        <button class="btn btn-g" onclick="pjSaveReviewFields();pjCreateProject()">Create Project</button>
      </div>`;
  }
}

function pjStep1Next() {
  pjImportData.title = document.getElementById('pji-title').value.trim();
  pjImportData.property = document.getElementById('pji-property').value;
  pjImportData.type = document.getElementById('pji-type').value;
  if (!pjImportData.title) { showToast('Please enter a project title'); return; }
  if (!pjImportData.property) { showToast('Please select a property'); return; }
  pjImportData.step = 2;
  pjRenderStep();
}

function pjStep2Parse() {
  const text = document.getElementById('pji-paste').value;
  pjImportData._rawText = text;
  if (text.trim()) {
    const parsed = pjParseReport(text);
    pjImportData.items = parsed.items;
    // Auto-fill detected metadata (only if not already manually set)
    if (parsed.inspector && !pjImportData.inspector) pjImportData.inspector = parsed.inspector;
    if (parsed.inspDate && !pjImportData.inspDate) pjImportData.inspDate = parsed.inspDate;
    if (parsed.reinspDate && !pjImportData.due) pjImportData.due = parsed.reinspDate;
  }
  if (!pjImportData.items.length && text.trim()) {
    showToast('Could not detect items — you can add them manually on the next screen');
  }
  pjImportData.step = 3;
  pjRenderStep();
}

function pjSkipToReview() {
  pjImportData.items = [];
  pjImportData.step = 3;
  pjRenderStep();
}

// Save editable fields from Step 3 before creating
function pjSaveReviewFields() {
  const insp = document.getElementById('pji-inspector');
  const inspDate = document.getElementById('pji-inspdate');
  const due = document.getElementById('pji-due');
  const pdf = document.getElementById('pji-pdf');
  if (insp) pjImportData.inspector = insp.value.trim();
  if (inspDate) pjImportData.inspDate = inspDate.value;
  if (due) pjImportData.due = due.value;
  if (pdf) pjImportData.pdfUrl = pdf.value.trim();
}

function pjAddManualItem() {
  pjSaveReviewFields();
  pjImportData.items.push({
    item_id: 'i_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: 'New Item',
    status: 'fail',
    remark: '',
    page: 0,
    room: '',
    _create: true
  });
  pjRenderStep();  // stays on step 3
}

// ── REPORT PARSER ───────────────────────────────────────────
// Returns { items:[], inspector:'', inspDate:'', reinspDate:'' }
function pjParseReport(text) {
  const items = [];
  const lines = text.split('\n');
  let currentPage = 1;
  let idCounter = 1;
  let inspector = '';
  let inspDate = '';
  let reinspDate = '';

  // Helper: try to parse a date from text into YYYY-MM-DD
  function tryParseDate(str) {
    if (!str) return '';
    // Match MM/DD/YYYY or MM-DD-YYYY
    let m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    // Match Month DD, YYYY
    m = str.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (m) {
      const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
      const mon = months[m[1].toLowerCase().slice(0,3)];
      if (mon) return `${m[3]}-${String(mon).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    }
    return '';
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // ── Detect metadata ──
    // Inspector name
    const inspMatch = line.match(/(?:inspector|inspected\s+by|fire\s+marshal|examiner)\s*[:–-]\s*(.+)/i);
    if (inspMatch && !inspector) { inspector = inspMatch[1].trim(); continue; }

    // Inspection date
    const dateMatch = line.match(/(?:inspection\s+date|date\s+of\s+inspection|inspected\s+on)\s*[:–-]\s*(.+)/i);
    if (dateMatch && !inspDate) { inspDate = tryParseDate(dateMatch[1].trim()); continue; }

    // Re-inspection / due date
    const reinspMatch = line.match(/(?:re-?inspection|follow.?up|due\s+date|next\s+inspection|annual\s+inspection)\s*[:–-]\s*(.+)/i);
    if (reinspMatch && !reinspDate) { reinspDate = tryParseDate(reinspMatch[1].trim()); continue; }

    // ── Detect page markers ──
    const pageMatch = line.match(/page\s+(\d+)/i) || line.match(/^(\d+)\s*of\s*\d+$/i);
    if (pageMatch) { currentPage = parseInt(pageMatch[1]); continue; }

    // ── Detect FAIL / PASS lines ──
    const failMatch = line.match(/^(?:FAIL|Failed|✗|✘|X)\s*[-–:]\s*(.+)/i) || line.match(/^(.+?)\s*[-–:]\s*(?:FAIL|Failed)$/i);
    const passMatch = line.match(/^(?:PASS|Passed|✓|✔)\s*[-–:]\s*(.+)/i) || line.match(/^(.+?)\s*[-–:]\s*(?:PASS|Passed)$/i);

    if (failMatch || passMatch) {
      const status = failMatch ? 'fail' : 'pass';
      const name = (failMatch || passMatch)[1].trim();
      let remark = '';
      let j = i + 1;
      while (j < lines.length && j <= i + 3) {
        const next = lines[j].trim();
        if (!next) { j++; continue; }
        const remarkMatch = next.match(/^(?:REMARK|Remark|Note|Comment)\s*[-–:]\s*(.+)/i);
        if (remarkMatch) { remark = remarkMatch[1].trim(); break; }
        if (!next.match(/^(?:FAIL|PASS|Failed|Passed|✗|✘|✓|✔|X)\s*[-–:]/i) && !next.match(/[-–:]\s*(?:FAIL|PASS|Failed|Passed)$/i)) {
          remark = next;
          break;
        }
        j++;
      }

      items.push({
        item_id: 'i_' + (idCounter++),
        name,
        status,
        remark,
        page: currentPage,
        room: '',
        _create: true
      });
    }
  }
  return { items, inspector, inspDate, reinspDate };
}

// ── CREATE PROJECT ──────────────────────────────────────────
function pjCreateProject() {
  const d = pjImportData;
  const pid = 'proj_' + Date.now();
  const selectedItems = d.items.filter(i => i._create !== false);

  // Clean items
  const finalItems = selectedItems.map((item, idx) => ({
    item_id: item.item_id || ('i_' + (idx + 1)),
    name: item.name,
    status: item.status,
    remark: item.remark || '',
    page: item.page || 0,
    room: item.room || '',
    task_id: null
  }));

  // Auto-create tasks for fail items
  finalItems.forEach(item => {
    if (item.status === 'fail') {
      const tid = 'pt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      tasks.push({
        id: tid,
        property: d.property,
        problem: item.remark || item.name,
        category: 'General',
        status: 'open',
        date: '',
        vendor: '',
        guest: '',
        urgent: false,
        created: new Date().toISOString(),
        notes: [],
        project_id: pid,
        project_title: d.title
      });
      item.task_id = tid;
    }
  });

  const project = {
    id: pid,
    title: d.title,
    property: d.property,
    type: d.type,
    status: 'open',
    visible: true,
    due_date: d.due || null,
    created: new Date().toISOString(),
    source: {
      inspector: d.inspector || null,
      inspection_date: d.inspDate || null,
      reinspection_date: d.reinspDate || null,
      pdf_url: d.pdfUrl || null
    },
    items: finalItems,
    notes: []
  };

  projects.push(project);
  savePJ();
  saveTasks();
  closeModal('pj-import-modal');
  pjRenderList();
  renderAll();
  const failTasks = finalItems.filter(i => i.status === 'fail').length;
  showToast(`Project created — ${failTasks} task${failTasks !== 1 ? 's' : ''} added`);
}

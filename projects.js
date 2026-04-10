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
  // Rehydrate blob URLs from stored base64 PDF data
  projects.forEach(p => {
    if (p._pdf_data && p.source) {
      try {
        const byteStr = atob(p._pdf_data.split(',')[1]);
        const bytes = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        p.source.pdf_url = URL.createObjectURL(blob);
      } catch (e) { /* if base64 is bad, leave pdf_url as-is */ }
    }
  });
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

// Helper: get unique property IDs for a project (from linked tasks + project.property)
function pjGetProperties(p) {
  const projTasks = tasks.filter(t => t.project_id === p.id);
  const propIds = new Set(projTasks.map(t => t.property).filter(Boolean));
  if (p.property) propIds.add(p.property);
  return [...propIds];
}

function pjCard(p) {
  const propIds = pjGetProperties(p);
  // Use first property's neighborhood for card accent color
  const firstNb = propIds.length ? getNb(propIds[0]) : null;
  const nbcls = firstNb ? 'nb-' + firstNb.cls : '';
  const projTasks = tasks.filter(t => t.project_id === p.id);
  const doneCount = projTasks.filter(t => t.status === 'complete' || t.status === 'resolved_by_guest').length;
  const total = projTasks.length;
  const pct = total ? Math.round(doneCount / total * 100) : 0;
  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'complete';
  const dueClass = isOverdue ? ' overdue' : '';

  // Build property pills — show up to 3, then "+N more"
  let propPills = '';
  const maxShow = 3;
  propIds.slice(0, maxShow).forEach(pid => {
    const pr = getProp(pid);
    propPills += `<span class="pj-pill pj-pill-prop">${pr ? pr.name : pid}</span>`;
  });
  if (propIds.length > maxShow) propPills += `<span class="pj-pill pj-pill-prop" style="background:var(--surface2)">+${propIds.length - maxShow} more</span>`;
  if (!propIds.length) propPills = '<span class="pj-pill pj-pill-prop" style="opacity:.5">No properties yet</span>';

  return `<div class="pj-card ${p.status === 'complete' ? 'pj-complete' : ''} ${nbcls}" onclick="pjShowDetail('${p.id}')">
    <div class="pj-card-title">${p.title}</div>
    <div class="pj-card-meta">
      ${propPills}
      ${p.type ? `<span class="pj-pill pj-pill-type">${p.type}</span>` : ''}
      ${p.due_date ? `<span class="pj-pill pj-pill-due${dueClass}">Due: ${p.due_date}</span>` : ''}
    </div>
    ${total ? `<div class="pj-progress">
      <div class="pj-bar"><div class="pj-bar-fill" style="width:${pct}%"></div></div>
      <div class="pj-progress-label">${doneCount} of ${total} tasks complete (${pct}%)</div>
    </div>` : '<div class="pj-progress-label" style="font-size:.68rem;color:var(--text3)">No tasks yet</div>'}
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

  const propIds = pjGetProperties(p);
  const projTasks = tasks.filter(t => t.project_id === pid);
  const doneCount = projTasks.filter(t => t.status === 'complete' || t.status === 'resolved_by_guest').length;
  const failCount = p.items ? p.items.filter(i => i.status === 'fail').length : 0;
  const total = projTasks.length;
  const pct = total ? Math.round(doneCount / total * 100) : 0;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (pct / 100) * circumference;

  // Build property pills from linked tasks
  let propPills = '';
  propIds.forEach(pid2 => {
    const pr = getProp(pid2);
    propPills += `<span class="pj-pill pj-pill-prop">${pr ? pr.name : pid2}</span>`;
  });
  if (!propIds.length) propPills = '<span class="pj-pill pj-pill-prop" style="opacity:.5">No properties yet</span>';

  let html = '';

  // Back button + header
  html += `<div style="margin-bottom:12px"><span style="font-size:.76rem;color:var(--green);cursor:pointer;font-weight:500" onclick="pjRenderList()">&#x2190; All Projects</span></div>`;
  html += `<div class="pj-detail-hdr">
    <div>
      <div class="pj-detail-title">${p.title}</div>
      <div class="pj-card-meta" style="margin-top:6px">
        ${propPills}
        ${p.type ? `<span class="pj-pill pj-pill-type">${p.type}</span>` : ''}
        ${p.due_date ? `<span class="pj-pill pj-pill-due">${p.due_date}</span>` : ''}
        <span class="pj-pill" style="background:${p.status === 'complete' ? 'var(--green-light);color:var(--green)' : 'var(--gold-pale);color:#8b7120'};border:1px solid var(--border)">${p.status === 'complete' ? 'Complete' : 'Open'}</span>
      </div>
    </div>
    <div class="pj-detail-actions">
      <button class="btn" onclick="pjToggleVisibility('${pid}')">${p.visible !== false ? '👁 Hide Tasks' : '👁 Show Tasks'}</button>
      ${p.status !== 'complete' ? `<button class="btn btn-g" onclick="pjConfirmComplete('${pid}')">Mark Complete</button>` : ''}
      <button class="btn btn-red" onclick="pjDeleteProject('${pid}')">Delete</button>
    </div>
  </div>`;

  // Source info bar — full metadata display
  if (p.source) {
    const s = p.source;
    let contactParts = [];
    if (s.inspector_phone) contactParts.push(s.inspector_phone);
    if (s.inspector_email) contactParts.push(`<a href="mailto:${s.inspector_email}" style="color:inherit;text-decoration:none">${s.inspector_email}</a>`);
    const contactStr = contactParts.join(' · ');

    let dateBxs = '';
    if (s.inspection_date) dateBxs += `<div class="pj-src-date-box"><div class="pj-src-date-lbl">Inspection</div><div class="pj-src-date-val">${s.inspection_date}</div></div>`;
    if (s.reinspection_date) dateBxs += `<div class="pj-src-date-box pj-src-date-urgent"><div class="pj-src-date-lbl">Re-Inspection</div><div class="pj-src-date-val">${s.reinspection_date}</div></div>`;
    if (s.next_annual) dateBxs += `<div class="pj-src-date-box"><div class="pj-src-date-lbl">Next Annual</div><div class="pj-src-date-val">${s.next_annual}</div></div>`;

    const safeTitle = p.title.replace(/'/g, "\\'");
    html += `<div class="pj-source-bar">
      <div class="pj-src-top">
        <div class="pj-src-label">Source Document</div>
        ${s.pdf_url ? `<button class="btn btn-g pj-src-pdf-btn" onclick="pjOpenPdf('${s.pdf_url}',null,'${safeTitle}')">&#128196; View Full Report</button>` : ''}
      </div>
      <div class="pj-src-body">
        <div class="pj-src-person">
          ${s.inspector ? `<div class="pj-src-name">${s.inspector}</div>` : ''}
          ${contactStr ? `<div class="pj-src-contact">${contactStr}</div>` : ''}
          ${s.address ? `<div class="pj-src-address">&#128205; ${s.address}</div>` : ''}
        </div>
        ${dateBxs ? `<div class="pj-src-dates">${dateBxs}</div>` : ''}
      </div>
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

  // Vendors panel
  html += pjRenderVendorsPanel(p, pid);

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

      const hasRoom = item.room && item.room.trim();
      const roomHtml = `<span contenteditable="true" data-placeholder="+ add" data-pid="${pid}" data-iid="${item.item_id}" class="pj-room-edit" onfocus="pjRoomFocus(this)" onblur="pjRoomBlur(this)">${hasRoom ? item.room : '<span class="pj-room-ph">+ add</span>'}</span>`;

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

  // ── Project Tasks (grouped by property) ──
  html += `<div class="pj-items-panel" style="margin-bottom:18px">
    <div class="pj-items-hdr">
      <span>Project Tasks (${total})</span>
      <div style="display:flex;gap:6px">
        <button class="btn" style="font-size:.72rem;padding:4px 10px" onclick="pjOpenTaskPicker('${pid}')">+ Add Existing</button>
        <button class="btn btn-g" style="font-size:.72rem;padding:4px 10px" onclick="pjOpenCreateTask('${pid}')">+ Create Task</button>
      </div>
    </div>`;
  if (projTasks.length) {
    // Group tasks by property
    const byProp = {};
    projTasks.forEach(t => {
      const key = t.property || '_none';
      if (!byProp[key]) byProp[key] = [];
      byProp[key].push(t);
    });
    Object.keys(byProp).sort().forEach(propKey => {
      const pr = getProp(propKey);
      const prName = pr ? pr.name : (propKey === '_none' ? 'No Property' : propKey);
      html += `<div style="padding:6px 16px 2px;font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:var(--text3);font-weight:600;background:var(--surface2);border-bottom:1px solid var(--border)">${prName}</div>`;
      byProp[propKey].forEach(t => {
        const isDone = t.status === 'complete' || t.status === 'resolved_by_guest';
        html += `<div class="pj-task-row ${isDone ? 'done' : ''}" onclick="openDetail('${t.id}')">
          <button class="pj-inspect-btn ${isDone ? 'ready' : 'not-done'}" onclick="event.stopPropagation();pjToggleTask('${t.id}','${pid}')">${isDone ? '✓ Done' : 'Open'}</button>
          <span class="pj-task-desc">${t.problem}</span>
          <span class="pj-task-meta">${t.vendor ? t.vendor : ''} ${t.date ? '· ' + t.date : ''}</span>
          <button class="pj-task-unlink" onclick="event.stopPropagation();pjUnlinkTask('${t.id}','${pid}')" title="Remove from project">✕</button>
        </div>`;
      });
    });
  } else {
    html += '<div style="padding:16px;text-align:center;font-size:.8rem;color:var(--text3)">No tasks yet — add existing tasks or create new ones above.</div>';
  }
  html += '</div>';

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

function pjDeleteProject(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const projTasks = tasks.filter(t => t.project_id === pid);
  let msg = `Delete "${p.title}"?\n\nThis will permanently remove the project.`;
  if (projTasks.length) msg += `\n\n${projTasks.length} linked task${projTasks.length !== 1 ? 's' : ''} will be unlinked and kept on the Tasks tab.`;
  msg += '\n\nThis cannot be undone.';
  if (!confirm(msg)) return;
  // Unlink tasks (keep them, just remove project association)
  projTasks.forEach(t => {
    delete t.project_id;
    delete t.project_title;
  });
  // Remove project
  const idx = projects.findIndex(x => x.id === pid);
  if (idx !== -1) projects.splice(idx, 1);
  savePJ();
  saveTasks();
  pjRenderList();
  renderAll();
  showToast('Project deleted — tasks kept on Tasks tab');
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

function pjRoomFocus(el) {
  el.style.borderColor = 'var(--green)';
  // Clear placeholder on focus
  const ph = el.querySelector('.pj-room-ph');
  if (ph) { el.textContent = ''; }
}
function pjRoomBlur(el) {
  el.style.borderColor = 'var(--border)';
  const val = el.textContent.trim();
  const pid = el.dataset.pid;
  const iid = el.dataset.iid;
  if (val) {
    pjUpdateRoom(pid, iid, val);
  } else {
    // Restore placeholder
    el.innerHTML = '<span class="pj-room-ph">+ add</span>';
    pjUpdateRoom(pid, iid, '');
  }
}
function pjUpdateRoom(pid, itemId, val) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const item = p.items.find(i => i.item_id === itemId);
  if (item) { item.room = val.trim(); savePJ(); }
}

// ── TASK PICKER (Add Existing Tasks) ────────────────────────
function pjOpenTaskPicker(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  // Show tasks that are NOT already in any project, grouped by property
  const available = tasks.filter(t => !t.project_id && t.status !== 'complete' && t.status !== 'resolved_by_guest');
  const byProp = {};
  available.forEach(t => {
    const key = t.property || '_none';
    if (!byProp[key]) byProp[key] = [];
    byProp[key].push(t);
  });

  let body = `<div style="max-height:60vh;overflow-y:auto;padding:4px 0">`;
  if (!available.length) {
    body += '<div style="padding:20px;text-align:center;font-size:.82rem;color:var(--text3)">All open tasks are already assigned to projects.</div>';
  } else {
    // Sort property groups by neighborhood order
    const sortedKeys = Object.keys(byProp).sort((a, b) => {
      const pa = getProp(a), pb = getProp(b);
      return (pa ? pa.name : a).localeCompare(pb ? pb.name : b);
    });
    sortedKeys.forEach(propKey => {
      const pr = getProp(propKey);
      const prName = pr ? pr.name : (propKey === '_none' ? 'No Property' : propKey);
      body += `<div style="padding:8px 16px 4px;font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:var(--green);font-weight:700;background:var(--surface2);border-bottom:1px solid var(--border)">${prName}</div>`;
      byProp[propKey].forEach(t => {
        body += `<label class="pj-picker-row" style="display:flex;align-items:center;gap:10px;padding:8px 16px;cursor:pointer;border-bottom:1px solid var(--green-light)">
          <input type="checkbox" value="${t.id}" class="pj-pick-cb">
          <span style="flex:1;font-size:.82rem">${t.problem}</span>
          <span style="font-size:.68rem;color:var(--text3)">${t.category || ''}</span>
        </label>`;
      });
    });
  }
  body += '</div>';

  const modal = document.getElementById('pj-import-modal');
  document.getElementById('pj-import-title').textContent = 'Add Tasks to Project';
  document.getElementById('pj-import-body').innerHTML = body + `
    <div style="display:flex;justify-content:space-between;padding:14px 0 0">
      <button class="btn" onclick="closeModal('pj-import-modal')">Cancel</button>
      <button class="btn btn-g" onclick="pjLinkSelected('${pid}')">Add Selected</button>
    </div>`;
  modal.classList.add('open');
}

function pjLinkSelected(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const cbs = document.querySelectorAll('.pj-pick-cb:checked');
  let count = 0;
  cbs.forEach(cb => {
    const t = tasks.find(x => x.id === cb.value);
    if (t) {
      t.project_id = pid;
      t.project_title = p.title;
      count++;
    }
  });
  if (count) {
    saveTasks();
    closeModal('pj-import-modal');
    pjShowDetail(pid);
    renderAll();
    showToast(`${count} task${count !== 1 ? 's' : ''} added to project`);
  } else {
    showToast('No tasks selected');
  }
}

function pjUnlinkTask(taskId, pid) {
  const t = tasks.find(x => x.id === taskId);
  if (!t) return;
  if (!confirm('Remove this task from the project? The task will remain on the main Tasks tab.')) return;
  delete t.project_id;
  delete t.project_title;
  saveTasks();
  pjShowDetail(pid);
  renderAll();
  showToast('Task removed from project');
}

// ── CREATE TASK (within project) ────────────────────────────
function pjOpenCreateTask(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const modal = document.getElementById('pj-import-modal');
  document.getElementById('pj-import-title').textContent = 'Create Task';

  let body = `<div class="fg" style="padding-top:6px">
    <div class="fgr"><label>Property</label><select id="pjt-property"></select></div>
    <div class="fgr"><label>Category</label>
      <select id="pjt-category">
        <option value="">Select category</option>
        <option value="replacement">Replacement</option>
        <option value="cleaning">Cleaning</option>
        <option value="handyman">Handyman</option>
        <option value="plumbing">Plumbing</option>
        <option value="hvac">HVAC</option>
        <option value="electrical">Electrical</option>
        <option value="pest">Pest Control</option>
        <option value="landscaping">Landscaping</option>
        <option value="hot_tub">Hot Tub</option>
        <option value="pool">Pool</option>
        <option value="arcade">Arcade / Billiards</option>
        <option value="septic">Septic</option>
        <option value="water">Water Filtration</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div class="fgr full"><label>Problem Description</label><textarea id="pjt-problem" rows="3" placeholder="Describe the issue..."></textarea></div>
    <div class="fgr"><label>Vendor</label><input type="text" id="pjt-vendor" placeholder="(optional)"></div>
    <div class="fgr"><label>Scheduled Date</label><input type="date" id="pjt-date"></div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:18px">
    <button class="btn" onclick="closeModal('pj-import-modal')">Cancel</button>
    <button class="btn btn-g" onclick="pjSaveNewTask('${pid}')">Create Task</button>
  </div>`;

  document.getElementById('pj-import-body').innerHTML = body;
  modal.classList.add('open');
  // Populate property selector, pre-select project's primary property if set
  populatePropSel('pjt-property');
  if (p.property) document.getElementById('pjt-property').value = p.property;
}

function pjSaveNewTask(pid) {
  const p = projects.find(x => x.id === pid);
  if (!p) return;
  const propVal = document.getElementById('pjt-property').value;
  const prob = document.getElementById('pjt-problem').value.trim();
  if (!propVal || !prob) { showToast('Property and problem are required', 'err'); return; }
  const fDate = document.getElementById('pjt-date').value;
  let fStatus = 'open';
  if (fDate) fStatus = 'scheduled';
  const cat = document.getElementById('pjt-category').value;
  const vendor = document.getElementById('pjt-vendor').value.trim();

  const t = {
    id: 'pt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    property: propVal,
    guest: '',
    problem: prob,
    category: cat,
    status: fStatus,
    date: fDate,
    vendor: vendor,
    urgent: false,
    recurring: false,
    notes: [],
    vendorNotes: '',
    created: new Date().toISOString(),
    project_id: pid,
    project_title: p.title
  };
  if (cat === 'replacement') { t.purchaseNote = prob; t.purchaseStatus = 'needed'; t.purchaser = 'owner'; }
  tasks.unshift(t);
  saveTasks();
  closeModal('pj-import-modal');
  pjShowDetail(pid);
  renderAll();
  showToast('Task created and added to project');
}

// ── VENDORS PANEL ───────────────────────────────────────────
function pjRenderVendorsPanel(p, pid) {
  const pvList = p.vendors || [];
  let cards = '';
  pvList.forEach((v, idx) => {
    const contactBits = [];
    if (v.phone) contactBits.push(`<a href="tel:${v.phone}" style="color:inherit;text-decoration:none">${v.phone}</a>`);
    if (v.email) contactBits.push(`<a href="mailto:${v.email}" style="color:inherit;text-decoration:none">${v.email}</a>`);
    const firstName = v.name.split(' ')[0];
    const shareLabel = `&#128279; Send project to ${firstName}`;
    cards += `<div class="pj-vendor-card">
      <div class="pj-vendor-card-info">
        <div class="pj-vendor-card-name">${v.name}</div>
        ${v.role ? `<div class="pj-vendor-card-role">${v.role}</div>` : ''}
        ${contactBits.length ? `<div class="pj-vendor-card-contact">${contactBits.join(' · ')}</div>` : ''}
      </div>
      <div class="pj-vendor-card-actions">
        <button class="btn btn-g pj-share-btn" id="pj-share-${pid}-${idx}" onclick="pjShareVendor('${pid}',${idx},this)">${shareLabel}</button>
        <button class="pj-task-unlink" onclick="pjRemoveVendor('${pid}',${idx})" title="Remove vendor">✕</button>
      </div>
    </div>`;
  });

  return `<div class="pj-items-panel" style="margin-bottom:18px">
    <div class="pj-items-hdr">
      <span>Vendors (${pvList.length})</span>
      <button class="btn" style="font-size:.72rem;padding:4px 10px" onclick="pjOpenVendorPicker('${pid}')">+ Add Vendor</button>
    </div>
    ${cards || '<div style="padding:14px 16px;font-size:.8rem;color:var(--text3)">No vendors assigned yet.</div>'}
  </div>`;
}

let pjVendorPid = null; // tracks which project the picker is open for

function pjOpenVendorPicker(pid) {
  pjVendorPid = pid;
  const searchEl = document.getElementById('pj-vendor-search');
  if (searchEl) searchEl.value = '';
  pjFilterVendorPicker('');
  document.getElementById('pj-vendor-picker-modal').classList.add('open');
}

function pjFilterVendorPicker(query) {
  const pid = pjVendorPid;
  const existing = (projects.find(x => x.id === pid) || {}).vendors || [];
  const existingNames = existing.map(v => v.name.toLowerCase());
  const q = (query || '').toLowerCase();
  const filtered = vendors
    .filter(v => !existingNames.includes(v.name.toLowerCase()))
    .filter(v => !q || v.name.toLowerCase().includes(q) || (v.role || '').toLowerCase().includes(q));
  const el = document.getElementById('pj-vendor-picker-list');
  if (!el) return;
  el.innerHTML = filtered.map(v => `<div class="pj-picker-row" style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--green-light);font-size:.82rem" onclick="pjAddVendor('${pid}','${v.id}')">
    <strong>${v.name}</strong> <span style="color:var(--text3);font-size:.74rem">— ${v.role || ''}</span>
  </div>`).join('') || '<div style="padding:14px;font-size:.8rem;color:var(--text3)">No matching vendors.</div>';
}

function pjAddVendor(pid, vendorId) {
  const p = projects.find(x => x.id === pid);
  const v = vendors.find(x => x.id === vendorId);
  if (!p || !v) return;
  if (!p.vendors) p.vendors = [];
  if (p.vendors.find(pv => pv.name.toLowerCase() === v.name.toLowerCase())) {
    showToast('Vendor already added');
    return;
  }
  p.vendors.push({ name: v.name, role: v.role || '', phone: v.phone || '', email: v.email || '' });
  savePJ();
  closeModal('pj-vendor-picker-modal');
  pjShowDetail(pid);
  showToast(`${v.name} added to project`);
}

function pjRemoveVendor(pid, idx) {
  const p = projects.find(x => x.id === pid);
  if (!p || !p.vendors) return;
  const name = p.vendors[idx] ? p.vendors[idx].name : 'Vendor';
  p.vendors.splice(idx, 1);
  savePJ();
  pjShowDetail(pid);
  showToast(`${name} removed`);
}

// ── VENDOR SHARE LINKS ──────────────────────────────────────
function pjProjectShareUrl(token) {
  return 'https://storybook-webhook.vercel.app/api/vendor-page?token=' + token;
}

async function pjShareVendor(pid, idx, btnEl) {
  const p = projects.find(x => x.id === pid);
  if (!p || !p.vendors || !p.vendors[idx]) return;
  const v = p.vendors[idx];

  const orig = btnEl.textContent;
  btnEl.textContent = 'Generating...';
  btnEl.disabled = true;

  try {
    // Reuse existing token or generate a new one
    let token = v.token;
    if (!token) {
      token = 'pj' + generateVendorToken();
      const kvPayload = {
        type: 'project',
        project_id: pid,
        project_title: p.title,
        vendor_name: v.name,
        created: new Date().toISOString()
      };
      await S.set('se_vs_' + token, JSON.stringify(kvPayload));
      p.vendors[idx].token = token;
      savePJ();
    }

    const url = pjProjectShareUrl(token);
    const body = `${v.name}: ${p.title}\n${url}`;

    if (v.phone) {
      // Open Messages app with pre-composed text
      const tel = v.phone.replace(/\D/g, '');
      window.location.href = `sms:${tel}?body=${encodeURIComponent(body)}`;
      btnEl.innerHTML = `&#128279; Send project to ${v.name.split(' ')[0]}`;
      btnEl.disabled = false;
    } else {
      // No phone on file — fall back to clipboard
      await navigator.clipboard.writeText(url);
      btnEl.textContent = '✓ Link Copied!';
      btnEl.disabled = false;
      setTimeout(() => { btnEl.innerHTML = `&#128279; Send project to ${v.name.split(' ')[0]}`; btnEl.disabled = false; }, 2500);
      showToast(`${v.name} has no phone — link copied to clipboard instead`);
    }
  } catch (e) {
    console.error('[pj-share] Error:', e);
    btnEl.textContent = orig;
    btnEl.disabled = false;
    showToast('Failed to generate link');
  }
}

// ── PDF VIEWER ──────────────────────────────────────────────
function pjOpenPdf(url, page, title) {
  const modal = document.getElementById('pj-pdf-modal');
  const titleEl = document.getElementById('pj-pdf-title');
  const pageEl = document.getElementById('pj-pdf-page');
  titleEl.textContent = title || 'Source Document';
  pageEl.textContent = page ? 'Page ' + page : 'Full Report';

  // Destroy and recreate the iframe entirely — reusing the same iframe
  // with different #page= hashes is unreliable across browsers
  const container = modal.querySelector('div[style*="flex:1"]') || modal.querySelector('.pj-pdf-frame-wrap');
  if (container) {
    const oldFrame = document.getElementById('pj-pdf-frame');
    if (oldFrame) oldFrame.remove();
    const newFrame = document.createElement('iframe');
    newFrame.id = 'pj-pdf-frame';
    newFrame.style.cssText = 'width:100%;height:100%;border:none';
    newFrame.src = url + (page ? '#page=' + page : '');
    container.appendChild(newFrame);
  }
  modal.classList.add('open');
}

// ── IMPORT WIZARD ───────────────────────────────────────────
// Step 1: Title, Property (optional), Type (required — manual)
// Step 2: Paste report text (auto-detects inspector, dates, items)
// Step 3: Review everything — auto-detected fields editable, items table
let pjImportData = { step: 1, title: '', property: '', type: 'inspection', due: '', inspector: '', inspPhone: '', inspEmail: '', inspDate: '', reinspDate: '', nextAnnual: '', address: '', pdfUrl: '', items: [], _rawText: '' };

function pjOpenImport() {
  pjImportData = { step: 1, title: '', property: '', type: 'inspection', due: '', inspector: '', inspPhone: '', inspEmail: '', inspDate: '', reinspDate: '', nextAnnual: '', address: '', pdfUrl: '', items: [], _rawText: '' };
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
        <div class="fgr"><label>Property <span style="font-weight:400;color:var(--text3);font-size:.68rem">(optional for multi-property projects)</span></label><select id="pji-property"></select></div>
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

  // ── STEP 2: Upload PDF or paste text ──
  if (step === 2) {
    const hasFile = pjImportData._pdfFileName || '';
    body.innerHTML = `<div class="pj-step-indicator">${dots}</div>
      <div style="font-size:.72rem;color:var(--text2);margin-bottom:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Step 2 — Import Report</div>

      <!-- Upload zone -->
      <div id="pji-upload-zone" style="border:2px dashed var(--border);border-radius:var(--radius);padding:24px;text-align:center;margin-bottom:14px;cursor:pointer;transition:all .15s;background:var(--surface2)" onclick="document.getElementById('pji-file-input').click()" ondragover="event.preventDefault();this.style.borderColor='var(--green)';this.style.background='var(--green-light)'" ondragleave="this.style.borderColor='var(--border)';this.style.background='var(--surface2)'" ondrop="event.preventDefault();this.style.borderColor='var(--border)';this.style.background='var(--surface2)';pjHandleFileDrop(event)">
        <input type="file" id="pji-file-input" accept=".pdf" style="display:none" onchange="pjHandleFileSelect(this)">
        <div style="font-size:1.6rem;margin-bottom:6px">📄</div>
        <div id="pji-upload-label" style="font-size:.84rem;color:var(--text);font-weight:500">${hasFile ? '✓ ' + hasFile : 'Drop a PDF here or click to upload'}</div>
        <div style="font-size:.72rem;color:var(--text3);margin-top:4px">${hasFile ? 'Text extracted — click to replace' : 'Text will be extracted automatically'}</div>
      </div>
      <div id="pji-extract-status" style="display:none;font-size:.76rem;color:var(--green);margin-bottom:10px;font-weight:500"></div>

      ${hasFile ? `<textarea id="pji-paste" style="display:none">${pjImportData._rawText || ''}</textarea>` : `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="flex:1;height:1px;background:var(--border)"></div>
        <span style="font-size:.68rem;color:var(--text3);text-transform:uppercase;letter-spacing:1px">or paste text</span>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>
      <div class="fgr full" style="margin-bottom:14px">
        <textarea id="pji-paste" rows="8" placeholder="Paste the inspection report text here..." style="font-size:.78rem;font-family:monospace">${pjImportData._rawText || ''}</textarea>
      </div>`}
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
        <div class="fgr"><label>Phone</label><input type="text" id="pji-inspphone" value="${d.inspPhone || ''}" placeholder="Not detected"></div>
        <div class="fgr"><label>Email</label><input type="text" id="pji-inspemail" value="${d.inspEmail || ''}" placeholder="Not detected"></div>
        <div class="fgr"><label>Inspection Date</label><input type="date" id="pji-inspdate" value="${d.inspDate}"></div>
        <div class="fgr"><label>Re-inspection / Due Date</label><input type="date" id="pji-due" value="${d.due}"></div>
        <div class="fgr"><label>Next Annual</label><input type="date" id="pji-nextannual" value="${d.nextAnnual || ''}"></div>
        <div class="fgr full"><label>Address</label><input type="text" id="pji-address" value="${d.address || ''}" placeholder="Not detected"></div>
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
    if (parsed.inspPhone) pjImportData.inspPhone = parsed.inspPhone;
    if (parsed.inspEmail) pjImportData.inspEmail = parsed.inspEmail;
    if (parsed.inspDate && !pjImportData.inspDate) pjImportData.inspDate = parsed.inspDate;
    if (parsed.reinspDate && !pjImportData.due) pjImportData.due = parsed.reinspDate;
    if (parsed.nextAnnual) pjImportData.nextAnnual = parsed.nextAnnual;
    if (parsed.address) pjImportData.address = parsed.address;
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
  const inspPhone = document.getElementById('pji-inspphone');
  const inspEmail = document.getElementById('pji-inspemail');
  const inspDate = document.getElementById('pji-inspdate');
  const due = document.getElementById('pji-due');
  const nextAnnual = document.getElementById('pji-nextannual');
  const address = document.getElementById('pji-address');
  if (insp) pjImportData.inspector = insp.value.trim();
  if (inspPhone) pjImportData.inspPhone = inspPhone.value.trim();
  if (inspEmail) pjImportData.inspEmail = inspEmail.value.trim();
  if (inspDate) pjImportData.inspDate = inspDate.value;
  if (due) pjImportData.due = due.value;
  if (nextAnnual) pjImportData.nextAnnual = nextAnnual.value;
  if (address) pjImportData.address = address.value.trim();
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

// ── PDF UPLOAD & TEXT EXTRACTION ─────────────────────────────
function pjHandleFileDrop(event) {
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') pjExtractPdf(file);
  else showToast('Please drop a PDF file');
}

function pjHandleFileSelect(input) {
  const file = input.files && input.files[0];
  if (file) pjExtractPdf(file);
}

async function pjExtractPdf(file) {
  if (!window.pdfjsLib) { showToast('PDF library not loaded — please paste text instead'); return; }

  const statusEl = document.getElementById('pji-extract-status');
  const labelEl = document.getElementById('pji-upload-label');
  const textarea = document.getElementById('pji-paste');
  if (statusEl) { statusEl.style.display = ''; statusEl.textContent = 'Extracting text from PDF...'; }
  if (labelEl) labelEl.textContent = '⏳ Processing ' + file.name + '...';

  try {
    // Store the PDF as a persistent blob URL for the inline viewer
    // (We keep a session-level blob URL for the viewer and also stash
    //  the base64 so it survives KV round-trips.)
    const blobUrl = URL.createObjectURL(file);
    pjImportData._pdfBlobUrl = blobUrl;
    pjImportData.pdfUrl = blobUrl;
    pjImportData._pdfFileName = file.name;

    // Also read as base64 for KV persistence
    const reader = new FileReader();
    reader.onload = () => { pjImportData._pdfDataUrl = reader.result; };
    reader.readAsDataURL(file);

    // Extract text page by page with PDF.js
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    let fullText = '';

    for (let pg = 1; pg <= totalPages; pg++) {
      const page = await pdf.getPage(pg);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += `\n--- Page ${pg} ---\n${pageText}\n`;
    }

    pjImportData._rawText = fullText;
    if (textarea) textarea.value = fullText;
    if (labelEl) labelEl.textContent = '✓ ' + file.name;
    if (statusEl) statusEl.textContent = `✓ Extracted ${totalPages} page${totalPages !== 1 ? 's' : ''} — review the text below or click Parse & Review`;

  } catch (e) {
    console.error('[pj] PDF extract error', e);
    if (labelEl) labelEl.textContent = '✗ Could not read PDF';
    if (statusEl) { statusEl.style.display = ''; statusEl.textContent = 'Error extracting text — try pasting manually'; statusEl.style.color = 'var(--red)'; }
  }
}

// ── REPORT PARSER ───────────────────────────────────────────
// Handles TCPDF fire inspection format (flat text from PDF.js extraction)
// Also handles structured line-by-line text if pasted manually.
// Returns { items:[], inspector:'', inspPhone:'', inspEmail:'', inspDate:'', reinspDate:'', nextAnnual:'', address:'' }
function pjParseReport(text) {
  let inspector = '';
  let inspPhone = '';
  let inspEmail = '';
  let inspDate = '';
  let reinspDate = '';
  let nextAnnual = '';
  let address = '';
  const items = [];
  let idCounter = 1;

  // Helper: MM/DD/YYYY → YYYY-MM-DD
  function toISO(str) {
    const m = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return m ? `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}` : '';
  }

  // ── Join all pages into one blob, but track page boundaries ──
  const fullText = text.replace(/\n/g, ' ');

  // ── Extract metadata ──
  // Inspector + date: "Completed with fail  NAME  MM/DD/YYYY HH:MM:SS"
  const metaMatch = fullText.match(/Completed\s+with\s+(?:fail|pass)\s+([\w\s().]+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+\d{1,2}:\d{2}:\d{2}/i);
  if (metaMatch) {
    inspector = metaMatch[1].trim();
    inspDate = toISO(metaMatch[2]);
  }

  // Inspector contact from signature block: "NAME -- Inspector PHONE EMAIL"
  // Bearadise: "DONALD SHROPSHIRE II -- Inspector 865-263-1983 dshropshire@gatlinburgtn.gov"
  // Wizard's: "Matthew Rich(FMO2) -- Fire Inspector -- 865-441-4547 mrich@seviercountytn.gov"
  const sigMatch = fullText.match(/(\w[\w\s().]+?)\s+--\s+(?:Fire\s+)?Inspector\s*(?:--\s*)?([\d()-]{10,})\s+([\w.@+-]+@[\w.-]+)/i);
  if (sigMatch) {
    if (!inspector) inspector = sigMatch[1].trim();
    inspPhone = sigMatch[2].trim();
    inspEmail = sigMatch[3].trim();
  }

  // Address: "Address  Suite  City  State  Zip  734 HEIDEN DR  --  GATLINBURG  TN  37738"
  const addrMatch = fullText.match(/Address\s+(?:Suite\s+)?(?:City\s+)?(?:State\s+)?(?:Zip\s+)?([\d]+\s+[\w\s]+?)\s+--\s+([\w\s]+?)\s{2,}(\w{2})\s+(\d{5})/i);
  if (addrMatch) {
    const street = addrMatch[1].trim().replace(/\s+/g, ' ');
    const city = addrMatch[2].trim().replace(/\s+/g, ' ');
    // Title case the street and city
    const titleCase = s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    address = `${titleCase(street)}, ${titleCase(city)}, ${addrMatch[3].toUpperCase()} ${addrMatch[4]}`;
  }

  // Re-inspection date
  const reinspMatch = fullText.match(/Re-?Inspection\s+scheduled\s+to\s+be\s+conducted\s+on\s+or\s+after\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (reinspMatch) {
    reinspDate = toISO(reinspMatch[1]);
  }

  // Next annual inspection
  const nextMatch = fullText.match(/Next\s+inspection\s+scheduled\s+to\s+be\s+conducted\s+on\s+or\s+after\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (nextMatch) {
    nextAnnual = toISO(nextMatch[1]);
    // If no re-inspection date, use next annual as fallback due date
    if (!reinspDate) reinspDate = nextAnnual;
  }

  // ── Build page-aware item list ──
  // Strategy: walk through fullText finding page markers and item boundaries
  // so each item gets the correct page number.
  // Page markers from our extractor: "--- Page N ---"
  // Also handle PDF-native markers: "N / M" at end of page text

  // First, split the full text on item boundaries but KEEP page markers inline
  // so we can track which page each item falls on.
  const itemSplitRegex = /(?=(?:Fail|Pass)\s+ITEM:)/gi;
  const rawChunks = fullText.split(itemSplitRegex);

  // Track current page by scanning for page markers in the text before/within each chunk
  let currentPage = 1;

  for (const chunk of rawChunks) {
    // Capture page at the START of this chunk (before any mid-chunk page breaks)
    // This is the page where the item heading (Fail ITEM: ...) appears
    const itemPage = currentPage;

    // Then update currentPage from any "--- Page N ---" markers in this chunk
    // (these affect the NEXT chunk, or items that start after the marker)
    const pageMarkers = [...chunk.matchAll(/---\s*Page\s+(\d+)\s*---/gi)];
    if (pageMarkers.length) {
      currentPage = parseInt(pageMarkers[pageMarkers.length - 1][1]) || currentPage;
    }
    // Also check for "N / M" PDF page footers (e.g., "  2 / 9")
    const footerMatch = chunk.match(/\s+(\d+)\s*\/\s*\d+\s*$/);
    if (!pageMarkers.length && footerMatch) {
      const pgNum = parseInt(footerMatch[1]);
      if (pgNum >= currentPage && pgNum <= currentPage + 1) currentPage = pgNum;
    }

    // Strip page markers from within the chunk for matching (they can split REMARK from CODE)
    const cleanChunk = chunk.replace(/---\s*Page\s+\d+\s*---/gi, '  ');
    // Try to parse an item from this chunk
    const headMatch = cleanChunk.match(/(Fail|Pass)\s+ITEM:\s+(.*?)(?:\s{2,}REMARK:\s+(.*?))?(?:\s{2,}RESULT:\s+(.*?))?\s{2,}CODE:\s/i);
    if (headMatch) {
      const status = headMatch[1].toLowerCase();
      const name = headMatch[2].trim();
      const remark = (headMatch[3] || headMatch[4] || '').trim().replace(/\s*\d+\s*\/\s*\d+\s*$/, '');
      items.push({
        item_id: 'i_' + (idCounter++),
        name, status, remark,
        page: itemPage,
        room: '',
        _create: true
      });
      continue;
    }

    // Try alternate format: RESULT without CODE (Wizard's Edge Life Safety items)
    const altMatch = cleanChunk.match(/(?:.*?:)?\s*ITEM:\s+(.*?)\s{2,}RESULT:\s+(.*?)(?:\s{2,}|$)/i);
    if (altMatch) {
      items.push({
        item_id: 'i_' + (idCounter++),
        name: altMatch[1].trim(),
        status: 'pass',
        remark: altMatch[2].trim().substring(0, 200),
        page: itemPage,
        room: '',
        _create: true
      });
    }
  }

  // ── Fallback: line-by-line parser for manually pasted text ──
  if (!items.length) {
    const lines = text.split('\n');
    let pg = 1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const pgM = line.match(/page\s+(\d+)/i) || line.match(/^(\d+)\s*of\s*\d+$/i);
      if (pgM) { pg = parseInt(pgM[1]); continue; }
      const failM = line.match(/^(?:FAIL|Failed|✗|✘|X)\s*[-–:]\s*(.+)/i) || line.match(/^(.+?)\s*[-–:]\s*(?:FAIL|Failed)$/i);
      const passM = line.match(/^(?:PASS|Passed|✓|✔)\s*[-–:]\s*(.+)/i) || line.match(/^(.+?)\s*[-–:]\s*(?:PASS|Passed)$/i);
      if (failM || passM) {
        const st = failM ? 'fail' : 'pass';
        const nm = (failM || passM)[1].trim();
        let rem = '';
        for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
          const nx = lines[j].trim();
          if (!nx) continue;
          const rm = nx.match(/^(?:REMARK|Remark|Note|Comment)\s*[-–:]\s*(.+)/i);
          if (rm) { rem = rm[1].trim(); break; }
          if (!nx.match(/^(?:FAIL|PASS|Failed|Passed|✗|✘|✓|✔|X)\s*[-–:]/i)) { rem = nx; break; }
        }
        items.push({ item_id: 'i_' + (idCounter++), name: nm, status: st, remark: rem, page: pg, room: '', _create: true });
      }
    }
  }

  return { items, inspector, inspPhone, inspEmail, inspDate, reinspDate, nextAnnual, address };
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
      inspector_phone: d.inspPhone || null,
      inspector_email: d.inspEmail || null,
      inspection_date: d.inspDate || null,
      reinspection_date: d.due || null,
      next_annual: d.nextAnnual || null,
      address: d.address || null,
      pdf_url: d.pdfUrl || null,
      pdf_filename: d._pdfFileName || null
    },
    // If uploaded PDF, store base64 for persistence (viewer reconstructs blob)
    _pdf_data: d._pdfDataUrl || null,
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

// ── PROJECT VENDOR VIEW ──────────────────────────────────────
// Runs when the page is opened via a #pv/{token} link.
// No admin auth — access controlled by the token.
(function () {
  if (!window._projectVendorMode) return;

  const API = 'https://storybook-webhook.vercel.app/api/project-vendor';
  const token = window._projectVendorToken;
  const root = document.getElementById('pvs-root');
  let pvData = null;
  let pvsPdfUrl = null; // blob URL for the project PDF (if available)

  function pvsRender() {
    if (!pvData) {
      root.innerHTML = '<div class="pvs-loading">Loading project...</div>';
      return;
    }

    const { title, vendor_name, items, done, total, source } = pvData;
    const failCount = items.filter(i => i.status === 'fail').length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const circumference = 2 * Math.PI * 26;
    const offset = circumference - (pct / 100) * circumference;

    // ── Source document bar ──
    let sourceHtml = '';
    if (source) {
      const contactParts = [];
      if (source.inspector_phone) contactParts.push(source.inspector_phone);
      if (source.inspector_email) contactParts.push(`<a href="mailto:${source.inspector_email}" style="color:inherit">${source.inspector_email}</a>`);

      let dateBxs = '';
      if (source.inspection_date) dateBxs += `<div class="pvs-date-box"><div class="pvs-date-lbl">Inspection</div><div class="pvs-date-val">${source.inspection_date}</div></div>`;
      if (source.reinspection_date) dateBxs += `<div class="pvs-date-box pvs-date-urgent"><div class="pvs-date-lbl">Re-Inspection</div><div class="pvs-date-val">${source.reinspection_date}</div></div>`;
      if (source.next_annual) dateBxs += `<div class="pvs-date-box"><div class="pvs-date-lbl">Next Annual</div><div class="pvs-date-val">${source.next_annual}</div></div>`;

      sourceHtml = `<div class="pvs-source-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="pvs-source-label" style="margin-bottom:0">Source Document</div>
          ${pvsPdfUrl ? `<button class="pvs-report-btn" onclick="pvsOpenPdf(null,'Full Report')">&#128196; View Full Report</button>` : ''}
        </div>
        <div class="pvs-source-body">
          <div class="pvs-source-person">
            ${source.inspector ? `<div class="pvs-source-name">${source.inspector}</div>` : ''}
            ${contactParts.length ? `<div class="pvs-source-contact">${contactParts.join(' · ')}</div>` : ''}
            ${source.address ? `<div class="pvs-source-address">&#128205; ${source.address}</div>` : ''}
          </div>
          ${dateBxs ? `<div class="pvs-date-row">${dateBxs}</div>` : ''}
        </div>
      </div>`;
    }

    // ── Inspection items ──
    const sorted = [...items].sort((a, b) => {
      if (a.status === 'fail' && b.status !== 'fail') return -1;
      if (a.status !== 'fail' && b.status === 'fail') return 1;
      return 0;
    });

    let rows = '';
    sorted.forEach(item => {
      const isComplete = item.task_status === 'complete' || item.task_status === 'resolved_by_guest';
      const hasTask = !!item.task_id;
      const completedBy = item.task_completed_by || null;

      // Remark is the primary text (the actual task); item.name is the category label
      const remarkText = item.remark || item.name;
      const remarkClickable = pvsPdfUrl && item.page
        ? `<span class="pvs-remark-link" onclick="pvsOpenPdf(${item.page},'${item.name.replace(/'/g, "\\'")}')">${remarkText}</span>`
        : remarkText;

      let taskCell = '';
      if (item.status === 'fail') {
        if (hasTask) {
          taskCell = isComplete
            ? `<div class="pvs-task-done">&#10003; ${completedBy ? 'Done by ' + completedBy : 'Complete'}<br><button class="pvs-undo-btn" onclick="pvsToggle('${item.item_id}',true)">Undo</button></div>`
            : `<button class="pvs-done-btn" onclick="pvsToggle('${item.item_id}',false)">Mark Complete</button>`;
        } else {
          taskCell = `<span style="font-size:.72rem;color:#aaa">No task linked</span>`;
        }
      }

      const roomLabel = item.room && item.room.trim()
        ? `<span class="pvs-room-tag">${item.room}</span>`
        : '';

      rows += `<div class="pvs-row ${item.status === 'fail' ? 'pvs-row-fail' : 'pvs-row-pass'} ${isComplete ? 'pvs-row-done' : ''}" id="pvs-item-${item.item_id}">
        <div class="pvs-row-top">
          <span class="pvs-pill ${item.status}">${item.status.toUpperCase()}</span>
          <span class="pvs-row-cat">${item.name}</span>
          ${roomLabel}
        </div>
        <div class="pvs-row-remark ${isComplete ? 'pvs-strikethrough' : ''}">${remarkClickable}</div>
        ${taskCell ? `<div class="pvs-row-action">${taskCell}</div>` : ''}
      </div>`;
    });

    root.innerHTML = `
      <div class="pvs-header">
        <div class="pvs-header-brand">Storybook Escapes</div>
        <div class="pvs-header-rule"></div>
        <div class="pvs-header-title">${title}</div>
        <div class="pvs-header-vendor">${vendor_name}</div>
      </div>

      <div class="pvs-body">
        ${sourceHtml}

        <div class="pvs-ring-wrap">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#c8e6c9" stroke-width="5"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke="#2d6a3f" stroke-width="5"
              stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 32 32)" style="transition:stroke-dashoffset .5s"/>
            <text x="32" y="36" text-anchor="middle" fill="#2d6a3f" font-size="14" font-weight="700">${pct}%</text>
          </svg>
          <div>
            <div class="pvs-ring-label">${done} of ${total} tasks complete</div>
            <div class="pvs-ring-sub">${failCount} fail items · ${items.length} total items</div>
            ${pct === 100 ? '<div class="pvs-all-done">🎉 All items complete!</div>' : ''}
          </div>
        </div>

        <div class="pvs-items-panel">
          <div class="pvs-items-hdr">
            <span>Inspection Items (${items.length})</span>
            <span>${failCount} fail · ${items.length - failCount} pass</span>
          </div>
          ${rows || '<div style="padding:14px 16px;font-size:.82rem;color:#999">No items.</div>'}
        </div>
      </div>

      <div class="pvs-footer">Storybook Escapes Maintenance</div>
    `;
  }

  async function pvsToggle(item_id, undo) {
    const action = undo ? 'undoDone' : 'markDone';
    // Optimistic update
    const item = pvData.items.find(i => i.item_id === item_id);
    if (!item) return;

    const btn = document.querySelector(`#pvs-item-${item_id} ${undo ? '.pvs-undo-btn' : '.pvs-done-btn'}`);
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action, item_id })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');

      item.task_status = j.task_status;
      if (action === 'markDone') item.task_completed_by = pvData.vendor_name;
      else item.task_completed_by = null;

      // Recount — only items with linked tasks
      const taskItems = pvData.items.filter(i => !!i.task_id);
      pvData.total = taskItems.length;
      pvData.done = taskItems.filter(i =>
        i.task_status === 'complete' || i.task_status === 'resolved_by_guest'
      ).length;
      pvsRender();
    } catch (e) {
      if (btn) { btn.disabled = false; btn.textContent = undo ? '↩ Undo' : 'Mark Complete'; }
      alert('Could not save. Please check your connection and try again.');
    }
  }
  window.pvsToggle = pvsToggle;

  // ── PDF viewer for vendor view ──
  function pvsOpenPdf(page, title) {
    if (!pvsPdfUrl) return;
    // Create modal if it doesn't exist
    let modal = document.getElementById('pvs-pdf-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pvs-pdf-modal';
      modal.className = 'pvs-pdf-modal';
      modal.innerHTML = `
        <div class="pvs-pdf-inner">
          <div class="pvs-pdf-header">
            <span id="pvs-pdf-title" class="pvs-pdf-title">Document</span>
            <span id="pvs-pdf-page" class="pvs-pdf-page-badge"></span>
            <button class="pvs-pdf-close" onclick="document.getElementById('pvs-pdf-modal').classList.remove('open')">&#10005;</button>
          </div>
          <div class="pvs-pdf-frame-wrap"><iframe id="pvs-pdf-frame" src="" style="width:100%;height:100%;border:none"></iframe></div>
        </div>`;
      document.body.appendChild(modal);
    }
    document.getElementById('pvs-pdf-title').textContent = title || 'Source Document';
    document.getElementById('pvs-pdf-page').textContent = page ? 'Page ' + page : 'Full Report';
    const frame = document.getElementById('pvs-pdf-frame');
    frame.src = 'about:blank';
    setTimeout(() => { frame.src = pvsPdfUrl + (page ? '#page=' + page : ''); }, 50);
    modal.classList.add('open');
  }
  window.pvsOpenPdf = pvsOpenPdf;

  // ── Initial load ──
  root.innerHTML = '<div class="pvs-loading">Loading project...</div>';
  fetch(`${API}?token=${token}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) { root.innerHTML = `<div class="pvs-error">${data.error}</div>`; return; }
      pvData = data;

      // Reconstruct PDF blob URL from base64 data
      if (data.pdf_data) {
        try {
          const byteStr = atob(data.pdf_data.split(',')[1]);
          const bytes = new Uint8Array(byteStr.length);
          for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
          pvsPdfUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        } catch (e) { console.warn('[pvs] Could not reconstruct PDF:', e); }
      }

      pvsRender();
    })
    .catch(() => { root.innerHTML = '<div class="pvs-error">Could not load project. Check your connection.</div>'; });
})();

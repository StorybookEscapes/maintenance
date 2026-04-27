// ── User Name Mapping (for note attribution) ─────────────────
const USER_NAME_MAP={'cb@chipburns.com':'Chip','properties@chipburns.com':'Chip'};
function getCurrentUserName(){
  try{const t=localStorage.getItem('se_auth_token');if(t){const p=JSON.parse(atob(t.split('.')[1]));return USER_NAME_MAP[(p.email||'').toLowerCase()]||p.name||'Admin';}}catch(e){}
  return 'Chip'; // fallback for dev
}

// ── Hospitable REST API v2 (replaces iCal) ──────────────────
// Property shortnames → Hospitable UUID property IDs
// ⚠ PROPS, NBS, HOSPITABLE_IDS also appear in vendor.js — keep in sync
const HOSPITABLE_IDS = {
  "bearadise":"02c1caaf-5a7c-4a72-bd6e-b3be2fc56202",
  "hero":"f98bdb26-4ed6-4633-83ef-96e5e567ef77",
  "hibernation":"1f6c5121-d938-49a8-9a6d-b705b13287e0",
  "hillside_big":"3ab44a3c-4a48-4783-b3d5-aa1c58d1ad97",
  "hillside_cottage":"f11403bb-2281-4aab-8e5b-f13078ca4dee",
  "magic":"255cae9a-e83c-4c03-bef6-81241309894e",
  "prc1":"c3555d02-6b66-4ef2-a0c0-f08db7eb365f",
  "prc2":"e0599c7e-a9d8-4a4c-b5af-69beb2528d66",
  "prc3":"9cf9010d-421c-4cb8-aa09-22c71258069d",
  "prc4":"0f62c8b2-365e-4109-82b8-8e680fbbe27d",
  "prc5":"725570ac-6f11-41b8-a84c-93c68277eac9",
  "prc6":"195a44a4-2cf4-410a-bddd-462f2d12acf2",
  "wizards":"74601c4e-fe9d-4668-80a9-a2b8f74c7df0",
  "umc10":"919a81dc-2a41-40e3-a23c-9491c7729999",
  "umc20":"f8b224bf-5b72-4da3-ae2a-80766d820810",
  "umc30":"088097dc-0770-4adf-8ae8-88db05cffbdc",
  "umc40":"0d57c1ac-957e-43b6-a3fd-b31e590e39a0",
  "umc50":"8fc601cc-d75c-4c3b-aa37-fda349af10da",
  "umc60":"7a7ae454-b0ff-435a-819e-623f618264b6"
};
const NBS = [
  {id:'prc',name:'Paradise Ridge',sub:'Pigeon Forge, TN',cls:'prc',props:['prc1','prc2','prc3','prc4','prc5','prc6']},
  {id:'umc',name:'Upper Middle Creek',sub:'Sevierville, TN',cls:'umc',props:['umc10','umc20','umc30','umc40','umc50','umc60']},
  {id:'gatlinburg',name:'Gatlinburg',sub:'Gatlinburg, TN',cls:'gatlinburg',props:['bearadise','wizards']},
  {id:'alpine',name:'Alpine Mountain Village',sub:'Pigeon Forge, TN',cls:'alpine',props:['hero','hibernation']},
  {id:'sevierville',name:'Sevierville',sub:'Sevierville, TN',cls:'sevierville',props:['magic']},
  {id:'hillside',name:'Hillside Haven',sub:'Lake Martin, AL',cls:'hillside',props:['hillside_big','hillside_cottage']},
];
const PROPS = [
  {id:'prc1',name:'PRC - 1 - Forge in the Forest',address:'1627 Paradise Ridge Dr. Unit 1',door:'1471'},
  {id:'prc2',name:'PRC - 2 - Bluebird Bungalow',address:'1627 Paradise Ridge Dr. Unit 2',door:'1472'},
  {id:'prc3',name:'PRC - 3 - The Rustic Rose',address:'1627 Paradise Ridge Dr. Unit 3',door:'1473'},
  {id:'prc4',name:'PRC - 4 - Snuggle Shack',address:'1627 Paradise Ridge Dr. Unit 4',door:'1474'},
  {id:'prc5',name:'PRC - 5 - Pink Paradise',address:'1627 Paradise Ridge Dr. Unit 5',door:'1475'},
  {id:'prc6',name:"PRC - 6 - Ringbearer's Roost",address:'1627 Paradise Ridge Dr. Unit 6',door:'1476'},
  {id:'umc10',name:'UMC - 10: The Whispering Wand',address:'1181 Upper Middle Creek Rd., Cabin 10',door:'5582'},
  {id:'umc20',name:'UMC - 20 - Honey Haven',address:'1181 Upper Middle Creek Rd., Cabin 20',door:'5583'},
  {id:'umc30',name:'UMC - 30 - Rebel Refuge',address:'1181 Upper Middle Creek Rd., Cabin 30',door:'5584'},
  {id:'umc40',name:'UMC - 40 - Lookout on the Roadside',address:'1181 Upper Middle Creek Rd., Cabin 40',door:'5581'},
  {id:'umc50',name:'UMC - 50 - Rosy Ridge',address:'1619 Rebel Hill Dr. Cabin 50',door:'5585'},
  {id:'umc60',name:'UMC - 60 - Hero Hangout',address:'1619 Rebel Hill Dr. Cabin 60',door:'5586'},
  {id:'bearadise',name:'Bearadise Lodge',address:'734 Heiden Dr. Gatlinburg, TN',door:'1967'},
  {id:'wizards',name:"The Wizard's Edge",address:'658 Pinecrest Dr., Gatlinburg, TN',door:'4558'},
  {id:'hibernation',name:'Hibernation Station',address:'335 Alpine Mountain Way, Pigeon Forge, TN',door:'4558'},
  {id:'hero',name:'Hero Hideout',address:'2382 Alpine Village Way, Pigeon Forge, TN',door:'4558'},
  {id:'magic',name:'Magic Mountain',address:'1775 Bluff Ridge Rd. Sevierville, TN',door:'4558'},
  {id:'hillside_big',name:'Hillside Haven - The Big House',address:'226 Oak Hill, Jacksons Gap, AL',door:'4425'},
  {id:'hillside_cottage',name:'Hillside Haven - The Cottage',address:'218 Oak Hill, Jacksons Gap, AL',door:'O812'},
];
const DEF_VENDORS = [
  {id:'v1',name:'Lisa Hawthorne',phone:'(936) 648-3940',email:'',role:'Head Cleaner',categories:['cleaning'],note:'Primary cleaner for all Smokies properties. Provides linens, soaps, paper products.'},
  {id:'v2',name:'James Hawthorne',phone:'(936) 714-7249',email:'',role:'Light Handyman / Hot Tub',categories:['cleaning','handyman','hot_tub'],note:"Lisa's husband. First call for hot tub Vapor Lock / Flo code issues. Can respond same night."},
  {id:'v3',name:'Alisha Brown',phone:'(517) 320-6670',email:'',role:'Cleaning Coordinator',categories:['cleaning'],note:"Lisa's daughter and inspector. Contact when Lisa is unavailable."},
  {id:'v4',name:'Michael Gilchrist',phone:'(423) 608-4516',email:'',role:'Handyman',categories:['handyman','electrical'],note:'$65 service fee plus hourly. Light carpentry, electrical, and plumbing repairs.'},
  {id:'v5',name:'Justin Nelson',phone:'(865) 801-1338',email:'',role:'Handyman / Landscaping',categories:['handyman','landscaping'],note:'Maintains several properties. Available for light handyman work.'},
  {id:'v6',name:'Gary Moyers Plumbing',phone:'(865) 850-5254',email:'',role:'Plumber — Primary',categories:['plumbing'],note:'First call for plumbing. Often same-day. Venmo payment — Chip handles.'},
  {id:'v7',name:'Javier Soto',phone:'(865) 315-5445',email:'',role:'Plumber — Emergency',categories:['plumbing'],note:'Fast response for emergencies.'},
  {id:'v8',name:'Whaley Mechanical (Brandon)',phone:'(865) 243-4083',email:'',role:'HVAC / Electrical — Primary',categories:['hvac','electrical'],note:'First call for HVAC and electrical. Very reasonably priced. Does not work after hours.'},
  {id:'v9',name:'Ambient Services',phone:'(865) 366-1789',email:'',role:'HVAC / Electrical — Backup',categories:['hvac','electrical'],note:'Solid work but often overpriced. Always available same day.'},
  {id:'v10',name:'All About Bugs',phone:'(865) 453-5574',email:'',role:'Pest Control — Monthly',categories:['pest','bed_bugs'],note:'Monthly service started Jan 2026. Ask for Justice (GM).'},
  {id:'v11',name:'Rocky Top Pest Control',phone:'(423) 613-9955',email:'',role:'Pest Control — Reactive',categories:['pest'],note:'Reactionary only. Ask for Tami.'},
  {id:'v12',name:'Sevier Lawn and Scapes (Jeff)',phone:'(865) 410-3778',email:'',role:'Landscaping — Projects',categories:['landscaping'],note:'For larger landscaping projects.'},
  {id:'v13',name:'Valley Pools and Spas (Jamie)',phone:'(865) 908-0025',email:'',role:'Hot Tub Specialist',categories:['hot_tub'],note:'Services Bearadise Lodge swimspa, Rebel Refuge, Hero Hangout.'},
  {id:'v14',name:'Aqua Flow Spas (Michael Luciano)',phone:'(865) 304-4907',email:'',role:'Hot Tub Specialist',categories:['hot_tub'],note:"Services Magic Mountain, Hero Hideout, The Wizard's Edge."},
  {id:'v15',name:'Hot Tubs Etc.',phone:'(865) 453-1136',email:'',role:'Hot Tub Specialist',categories:['hot_tub'],note:'Services Hibernation Station.'},
  {id:'v16',name:'Bill Parton',phone:'(865) 603-9590',email:'partondj48@gmail.com',role:'Pool Vendor',categories:['pool'],note:'Pool vendor for Magic Mountain and Bearadise Lodge.'},
  {id:'v17',name:'D&J Enterprises',phone:'(865) 453-6434',email:'',role:'Arcade / Billiards',categories:['arcade'],note:'Text or call. Also handles felt and pocket replacement.'},
  {id:'v18',name:'Top Septic',phone:'(865) 599-1690',email:'',role:'Septic',categories:['septic'],note:'Text for timely response.'},
  {id:'v19',name:'Aqua Clear Water Systems',phone:'(865) 986-4234',email:'',role:'Water Filtration',categories:['water'],note:'Services Magic Mountain and Paradise Ridge. Follow up to confirm visits.'},
  {id:'v20',name:'Dog Inspectors (Chuck Nelson)',phone:'(615) 491-6119',email:'',role:'Bed Bug Inspection',categories:['bed_bugs'],note:'Canine inspection for bed bug detection.'},
  {id:'v21',name:'Tennessee Fumigation (Terry Hazelwood)',phone:'(865) 755-7105',email:'',role:'Bed Bug Treatment',categories:['bed_bugs'],note:'Same or next day fumigation. Property ready in approximately 24 hours.'},
];
const DEF_RECURRING = [
  {id:'rc1',name:'HVAC Filter Replacement',properties:['all'],category:'hvac',frequency:'monthly',vendor:'Whaley Mechanical (Brandon)',notes:'Replace all HVAC filters monthly.',nextDue:'2026-05-01'},
  {id:'rc2',name:'Pre-Summer HVAC Check + Drain Line Flush',properties:['all'],category:'hvac',frequency:'biannual',vendor:'Whaley Mechanical (Brandon)',notes:'Flush drain lines to prevent summer shutdowns.',nextDue:'2026-04-15'},
  {id:'rc3',name:'Pre-Winter HVAC Check',properties:['all'],category:'hvac',frequency:'biannual',vendor:'Whaley Mechanical (Brandon)',notes:'Pre-winter heating system check.',nextDue:'2026-10-01'},
  {id:'rc4',name:'Aqua Clear — Magic Mountain',properties:['magic'],category:'water',frequency:'quarterly',vendor:'Aqua Clear Water Systems',notes:'Magic Mountain water is highly sulfuric. Regular visits required.',nextDue:'2026-04-01'},
  {id:'rc5',name:'Aqua Clear — PRC Well',properties:['prc1','prc2','prc3','prc4','prc5','prc6'],category:'water',frequency:'quarterly',vendor:'Aqua Clear Water Systems',notes:'6 PRC cabins share a single well. Equipment in shed next to Cabin 6. Notify guests.',nextDue:'2026-04-01'},
  {id:'rc6',name:'Septic System Service',properties:['wizards','magic','prc1','prc2','prc3','prc4','prc5','prc6','umc10','umc20','umc30','umc40','umc50','umc60'],category:'septic',frequency:'biennial',vendor:'Top Septic',notes:'Every 2 years for all properties with septic systems.',nextDue:'2027-01-01'},
  {id:'rc7',name:'Smoke & CO Detector Battery Replacement',properties:['all'],category:'electrical',frequency:'annual',vendor:'',notes:'Replace batteries in all smoke and CO detectors.',nextDue:'2026-10-01'},
  {id:'rc8',name:'Bed Bug Prevention — Bearadise Lodge',properties:['bearadise'],category:'bed_bugs',frequency:'monthly',vendor:'All About Bugs',notes:'Bearadise Lodge had bed bugs twice (2023, 2025). Monthly prevention treatment.',nextDue:'2026-05-01'},
];
const DEFAULT_VCAT = [
  {id:'cleaning',label:'Cleaning'},{id:'handyman',label:'Handyman'},
  {id:'plumbing',label:'Plumbing'},{id:'hvac',label:'HVAC / Electrical'},
  {id:'pest',label:'Pest Control'},{id:'landscaping',label:'Landscaping'},
  {id:'hot_tub',label:'Hot Tub'},{id:'pool',label:'Pool'},
  {id:'arcade',label:'Arcade / Billiards'},{id:'septic',label:'Septic'},
  {id:'water',label:'Water Filtration'},{id:'bed_bugs',label:'Bed Bugs'},
  {id:'other',label:'Other'},
];
let VCAT = [...DEFAULT_VCAT];

const DEFAULT_PROJECT_TYPES = [
  {id:'inspection',label:'Inspection',hasReport:true},
  {id:'renovation',label:'Renovation',hasReport:false},
  {id:'compliance',label:'Compliance',hasReport:false},
  {id:'other',label:'Other',hasReport:false},
];
let PROJECT_TYPES = [...DEFAULT_PROJECT_TYPES];

// ── App Settings (persisted to KV as se_settings) ──────────────
let appSettings = {
  vendorCategories: null,      // null = use DEFAULT_VCAT
  projectTypes: null,          // null = use DEFAULT_PROJECT_TYPES
  vendorSheetFields: ['address','doorCode'],  // which fields to show on vendor task sheets
  vendorSheetFieldOptions: [
    {id:'address',label:'Address',default:true},
    {id:'doorCode',label:'Door Code',default:true},
    {id:'wifi_name',label:'WiFi Network',default:false},
    {id:'wifi_password',label:'WiFi Password',default:false},
    {id:'checkout_time',label:'Checkout Time',default:false},
    {id:'checkin_time',label:'Check-in Time',default:false},
    {id:'parking',label:'Parking Info',default:false},
    {id:'lockbox',label:'Lockbox Location',default:false},
    {id:'trash_day',label:'Trash Day',default:false},
    {id:'special_notes',label:'Special Notes',default:false},
  ],
};

async function loadSettings() {
  try {
    const raw = await S.get('se_settings');
    if (raw && raw.value) {
      const parsed = typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value;
      // Merge with defaults (so new fields don't break old saved settings)
      if (parsed.vendorCategories) appSettings.vendorCategories = parsed.vendorCategories;
      if (parsed.projectTypes) appSettings.projectTypes = parsed.projectTypes;
      if (parsed.vendorSheetFields) appSettings.vendorSheetFields = parsed.vendorSheetFields;
    }
  } catch (e) { console.warn('Failed to load settings:', e.message); }

  // Apply dynamic categories
  if (appSettings.vendorCategories && appSettings.vendorCategories.length) {
    VCAT = appSettings.vendorCategories;
  }
  // Apply dynamic project types
  if (appSettings.projectTypes && appSettings.projectTypes.length) {
    PROJECT_TYPES = appSettings.projectTypes;
  }
  // Rebuild CAT_LABELS from VCAT
  rebuildCatLabels();
  // Populate dynamic dropdowns
  populateCategoryDropdowns();
  // Render settings panels if they exist in the DOM (handles page refresh while on Settings tab)
  if (document.getElementById('set-vs-fields')) renderSettingsOnSwitch();
}

function rebuildCatLabels() {
  // Clear and rebuild from VCAT (keep replacement and uncategorized as system entries)
  const keys = Object.keys(CAT_LABELS);
  keys.forEach(k => { if (k !== 'replacement' && k !== '') delete CAT_LABELS[k]; });
  VCAT.forEach(c => { CAT_LABELS[c.id] = c.label; });
  if (!CAT_LABELS['']) CAT_LABELS[''] = 'Uncategorized';
  if (!CAT_LABELS['replacement']) CAT_LABELS['replacement'] = 'Replacement';
}

function populateCategoryDropdowns() {
  // Populate all category <select> elements with current VCAT
  ['f-category', 'd-category'].forEach(selId => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const currentVal = sel.value;
    const firstOpt = selId === 'f-category' ? '<option value="">Select category</option>' : '<option value="">No category</option>';
    sel.innerHTML = firstOpt + '<option value="replacement">Replacement</option>' +
      VCAT.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    sel.value = currentVal; // restore selection
  });
}

async function saveSettings() {
  try {
    const ok = await S.set('se_settings', JSON.stringify(appSettings));
    if (ok) {
      showToast('Settings saved');
    } else {
      showToast('⚠️ Settings may not have saved — try again');
    }
  } catch (e) {
    console.error('Failed to save settings:', e.message);
    showToast('Failed to save settings');
  }
}

// ── Settings Panel Renderers ──────────────────────────────────

function renderSettingsOnSwitch() {
  renderVendorSheetFieldSettings();
  renderCategorySettings();
  renderProjectTypeSettings();
}

// -- Vendor Task Sheet Field Settings --
function renderVendorSheetFieldSettings() {
  const wrap = document.getElementById('set-vs-fields');
  if (!wrap) return;
  const active = appSettings.vendorSheetFields || ['address', 'doorCode'];
  const options = appSettings.vendorSheetFieldOptions || [];
  wrap.innerHTML = options.map(opt =>
    `<label style="font-size:.78rem;color:var(--text);display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;cursor:pointer">
      <input type="checkbox" data-field="${opt.id}" ${active.includes(opt.id) ? 'checked' : ''}> ${opt.label}
    </label>`
  ).join('');
}

function saveVendorSheetFieldSettings() {
  const fields = [];
  document.querySelectorAll('#set-vs-fields input[type=checkbox]:checked').forEach(cb => {
    fields.push(cb.dataset.field);
  });
  appSettings.vendorSheetFields = fields;
  saveSettings();
}

// -- Vendor Category Settings --
function renderCategorySettings() {
  const wrap = document.getElementById('set-vcat-list');
  if (!wrap) return;
  wrap.innerHTML = VCAT.map((c, i) =>
    `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px">
      <span style="font-size:.72rem;color:var(--text3);width:100px;font-family:monospace">${c.id}</span>
      <input type="text" value="${c.label}" data-cat-idx="${i}" style="flex:1;padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:.78rem;font-family:inherit" onchange="settingsUpdateCatLabel(${i},this.value)">
      <button class="btn btn-red" onclick="settingsRemoveCategory(${i})" style="padding:2px 8px;font-size:.68rem">Remove</button>
    </div>`
  ).join('');
}

function settingsUpdateCatLabel(idx, label) {
  if (VCAT[idx]) { VCAT[idx].label = label; saveCategorySettings(); }
}

function settingsRemoveCategory(idx) {
  if (VCAT.length <= 1) { showToast('Must keep at least one category'); return; }
  const cat = VCAT[idx];
  if (!confirm(`Remove category "${cat.label}"? Existing tasks with this category will keep it but it won't appear in dropdowns.`)) return;
  VCAT.splice(idx, 1);
  renderCategorySettings();
  saveCategorySettings(); // auto-save on remove
}

function settingsAddCategory() {
  const idEl = document.getElementById('set-vcat-new-id');
  const labelEl = document.getElementById('set-vcat-new-label');
  const id = idEl.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const label = labelEl.value.trim();
  if (!id || !label) { showToast('Both ID and label are required'); return; }
  if (VCAT.some(c => c.id === id)) { showToast('Category ID already exists'); return; }
  VCAT.push({ id, label });
  idEl.value = ''; labelEl.value = '';
  renderCategorySettings();
  saveCategorySettings(); // auto-save on add
}

function saveCategorySettings() {
  appSettings.vendorCategories = [...VCAT];
  rebuildCatLabels();
  populateCategoryDropdowns();
  saveSettings();
  renderVendors();
}

// -- Project Type Settings --
function renderProjectTypeSettings() {
  const wrap = document.getElementById('set-ptype-list');
  if (!wrap) return;
  wrap.innerHTML = PROJECT_TYPES.map((pt, i) =>
    `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px">
      <span style="font-size:.72rem;color:var(--text3);width:100px;font-family:monospace">${pt.id}</span>
      <input type="text" value="${pt.label}" data-ptype-idx="${i}" style="flex:1;padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:.78rem;font-family:inherit" onchange="settingsUpdatePTypeLabel(${i},this.value)">
      <label style="font-size:.72rem;color:var(--text2);display:flex;align-items:center;gap:4px;white-space:nowrap"><input type="checkbox" ${pt.hasReport ? 'checked' : ''} onchange="settingsUpdatePTypeReport(${i},this.checked)"> Report</label>
      <button class="btn btn-red" onclick="settingsRemoveProjectType(${i})" style="padding:2px 8px;font-size:.68rem">Remove</button>
    </div>`
  ).join('');
}

function settingsUpdatePTypeLabel(idx, label) {
  if (PROJECT_TYPES[idx]) { PROJECT_TYPES[idx].label = label; saveProjectTypeSettings(); }
}

function settingsUpdatePTypeReport(idx, hasReport) {
  if (PROJECT_TYPES[idx]) { PROJECT_TYPES[idx].hasReport = hasReport; saveProjectTypeSettings(); }
}

function settingsRemoveProjectType(idx) {
  if (PROJECT_TYPES.length <= 1) { showToast('Must keep at least one project type'); return; }
  const pt = PROJECT_TYPES[idx];
  if (!confirm(`Remove project type "${pt.label}"?`)) return;
  PROJECT_TYPES.splice(idx, 1);
  renderProjectTypeSettings();
  saveProjectTypeSettings(); // auto-save on remove
}

function settingsAddProjectType() {
  const idEl = document.getElementById('set-ptype-new-id');
  const labelEl = document.getElementById('set-ptype-new-label');
  const reportEl = document.getElementById('set-ptype-new-report');
  const id = idEl.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const label = labelEl.value.trim();
  const hasReport = reportEl.checked;
  if (!id || !label) { showToast('Both ID and label are required'); return; }
  if (PROJECT_TYPES.some(pt => pt.id === id)) { showToast('Project type ID already exists'); return; }
  PROJECT_TYPES.push({ id, label, hasReport });
  idEl.value = ''; labelEl.value = ''; reportEl.checked = false;
  renderProjectTypeSettings();
  saveProjectTypeSettings(); // auto-save on add
}

function saveProjectTypeSettings() {
  appSettings.projectTypes = [...PROJECT_TYPES];
  saveSettings();
}

// STATE
let tasks=[], vendors=[], recurring=[], filter='all', detailId=null, selProp=null, histCat='all';
// ─── PROXY CONFIG ───────────────────────────────────────────────
// After deploying the Vercel proxy, update this URL to match your deployment.
// Example: 'https://your-project-name.vercel.app'
const PROXY_BASE = 'https://storybook-webhook.vercel.app';
// ────────────────────────────────────────────────────────────────

// Payment groups: properties sharing a bank account are grouped
const PAY_GROUPS=[
  {id:'prc',label:'Paradise Ridge',props:['prc1','prc2','prc3','prc4','prc5','prc6']},
  {id:'umc',label:'Upper Middle Creek',props:['umc10','umc20','umc30','umc40','umc50','umc60']},
  {id:'hillside',label:'Hillside Haven',props:['hillside_big','hillside_cottage']},
  {id:'bearadise',label:'Bearadise Lodge',props:['bearadise']},
  {id:'wizards',label:"The Wizard's Edge",props:['wizards']},
  {id:'hibernation',label:'Hibernation Station',props:['hibernation']},
  {id:'hero',label:'Hero Hideout',props:['hero']},
  {id:'magic',label:'Magic Mountain',props:['magic']},
];
const VENMO_USER='Chip-Burns';
const CASHAPP_TAG='chipburns';

let calDate=new Date(), calMode='month', editVendorId=null, icalCache={}, showDone=false;
function toggleShowDone(){showDone=!showDone;document.getElementById('toggle-done').classList.toggle('on',showDone);renderCalendar();}

// ── Day-state classifier ──────────────────────────────────────────────
// Given a Date and a property's bookings array (from fetchIcal), classify
// the day as turn / checkin / checkout / booked / available. Pure function,
// shared across vendor sheet and admin Group Scheduler.
function dayState(d,bookings){
  const ds=d.toDateString();
  let hasCheckout=false,hasCheckin=false,isMidStay=false;
  for(const r of (bookings||[])){
    if(!r.start||!r.end)continue;
    if(ds===r.end.toDateString())hasCheckout=true;
    if(ds===r.start.toDateString())hasCheckin=true;
    if(d>r.start&&d<r.end)isMidStay=true;
  }
  if(hasCheckout&&hasCheckin)return'turn';
  if(isMidStay)return'booked';
  if(hasCheckin)return'checkin';
  if(hasCheckout)return'checkout';
  return'available';
}

// STORAGE
const STORAGE_API = 'https://storybook-webhook.vercel.app/api/storage';
function getAuthToken(){
  try{const a=localStorage.getItem('se_auth_token');return a||null;}catch(e){return null;}
}
// ── Auth health helpers ──
function isTokenExpired(){
  const t=getAuthToken();if(!t)return true;
  try{const p=JSON.parse(atob(t.split('.')[1]));return p.exp&&p.exp*1000<Date.now();}catch(e){return true;}
}
function tokenExpiresIn(){
  const t=getAuthToken();if(!t)return 0;
  try{const p=JSON.parse(atob(t.split('.')[1]));return Math.max(0,(p.exp*1000)-Date.now());}catch(e){return 0;}
}
let _authWarnShown=false;
function showReAuthPrompt(){
  if(_authWarnShown)return;
  // Only show if the user was already signed in — don't block the login screen
  if(!isAppAuthed())return;
  _authWarnShown=true;
  // Update sync status to disconnected
  updateSyncStatus('disconnected');
  const d=document.createElement('div');d.id='reauth-overlay';
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
  d.innerHTML=`<div style="background:#1a2a1a;border:2px solid #c0392b;border-radius:16px;padding:32px 28px;max-width:420px;width:90%;text-align:center;color:#e8dcc8;font-family:DM Sans,sans-serif;">
    <div style="font-size:36px;margin-bottom:12px;">\u26a0\ufe0f</div>
    <h2 style="margin:0 0 8px;font-size:20px;color:#e74c3c;">Session Expired</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#b8a88a;">Your sign-in has expired. Any unsaved changes may be lost.<br>Please sign in again to continue.</p>
    <button onclick="localStorage.removeItem('se_auth_token');location.reload()" style="background:#2d6a3f;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;font-family:inherit;">Sign In Again</button>
  </div>`;
  document.body.appendChild(d);
}

// ── Proactive token expiry watcher ──
// Checks every 30s; warns 5 min before expiry, forces re-auth on actual expiry
let _expiryTimer=null;
function startExpiryWatcher(){
  if(_expiryTimer)clearInterval(_expiryTimer);
  _expiryTimer=setInterval(()=>{
    if(!isAppAuthed())return; // not signed in yet — nothing to watch
    const ms=tokenExpiresIn();
    if(ms<=0){showReAuthPrompt();clearInterval(_expiryTimer);}
    else if(ms<300000&&!_authWarnShown&&isAppAuthed()){
      // Under 5 min left — show a soft warning toast
      showToast('\u23f3 Session expiring soon — save your work','',null,8000);
    }
  },30000);
}

// Only show the re-auth overlay when the app was already authenticated this session
// and the token expired mid-use. Don't block the login screen itself.
function isAppAuthed(){return document.getElementById('app')?.classList.contains('authed');}

const S = {
  get: async (k) => {
    const token = getAuthToken();
    if (!token) {
      if (isAppAuthed()) showReAuthPrompt();
      return null;
    }
    if (isTokenExpired()) { showReAuthPrompt(); return null; }
    try {
      const r = await fetch(STORAGE_API + '?key=' + encodeURIComponent(k), {
        headers: { 'Authorization': 'Bearer ' + token },
        signal: AbortSignal.timeout(8000)
      });
      if (r.status === 401) { showReAuthPrompt(); return null; }
      if (r.ok) { const d = await r.json(); return d.value ? { value: d.value } : null; }
      console.warn('[storage] GET returned', r.status);
      return null;
    } catch(e) {
      console.warn('[storage] Server get failed:', e.message);
      if (isAppAuthed()) updateSyncStatus('error');
      return null;
    }
  },
  set: async (k, v) => {
    const token = getAuthToken();
    if (!token) {
      if (isAppAuthed()) showReAuthPrompt();
      return false;
    }
    if (isTokenExpired()) { showReAuthPrompt(); return false; }
    try {
      const r = await fetch(STORAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ key: k, value: v }),
        signal: AbortSignal.timeout(8000)
      });
      if (r.status === 401) { showReAuthPrompt(); return false; }
      if (!r.ok) {
        console.error('[storage] SET failed:', r.status);
        updateSyncStatus('error');
        showToast('\u274c Save failed — please try again','','',5000);
        return false;
      }
      updateSyncStatus('ok');
      return true;
    } catch(e) {
      console.warn('[storage] Server set failed:', e.message);
      updateSyncStatus('error');
      showToast('\u274c Save failed — check your connection','','',5000);
      return false;
    }
  }
};
// ── Sync status indicator ──
function updateSyncStatus(state){
  const dot=document.getElementById('sync-status');if(!dot)return;
  dot.className='sync-dot sync-'+state;
  const titles={ok:'Connected — saves are working',error:'Save failed — retrying may help',disconnected:'Session expired — please sign in again'};
  dot.title=titles[state]||'';
}

// ── Data-safety flags ──
// tasksLoadedOk is ONLY set true when se_t is successfully read from KV.
// If the initial load fails, saveTasks() is blocked to prevent background
// processes (HostBuddy auto-import, migrations) from overwriting the real
// task list with a small/empty array.  2026-04-11 post-mortem fix.
let tasksLoadedOk = false;
let _tasksLoadedCount = 0; // how many tasks were in KV at boot

async function load() {
  try {
    const r = await S.get('se_t');
    if (r) {
      tasks = JSON.parse(r.value);
      tasksLoadedOk = true;
      _tasksLoadedCount = tasks.length;
    } else {
      // Key exists but is empty/null — treat as valid empty state
      tasks = [];
      tasksLoadedOk = true;
      _tasksLoadedCount = 0;
    }
  } catch(e) {
    // Load FAILED — do NOT set tasksLoadedOk, block all writes
    console.error('[SAFETY] se_t load failed — task writes are BLOCKED until page reload with working connection:', e);
    tasks = [];
    tasksLoadedOk = false;
  }
  try{const r=await S.get('se_v');if(r)vendors=JSON.parse(r.value);else{vendors=JSON.parse(JSON.stringify(DEF_VENDORS));await save('se_v',vendors);}}catch(e){vendors=JSON.parse(JSON.stringify(DEF_VENDORS));}
  try{const r=await S.get('se_r');if(r)recurring=JSON.parse(r.value);else{recurring=JSON.parse(JSON.stringify(DEF_RECURRING));await save('se_r',recurring);}}catch(e){recurring=JSON.parse(JSON.stringify(DEF_RECURRING));}
  // Property Bible (se_pp) is normally lazy-loaded when Chip opens the
  // Properties tab, but taskEffectivePurchaseNote() reads PP to synthesize
  // shortfall-based purchase alerts for filter tasks on the dispatch/task
  // views. Load it on boot so those views show purchase tags without
  // requiring a trip through Properties first.
  try{if(typeof ppLoadIfNeeded==='function')await ppLoadIfNeeded();}catch(e){}
  // Projects
  try{if(typeof pjLoad==='function')await pjLoad();}catch(e){}
  // Task change log
  try{await loadTaskLog();}catch(e){}
}
async function save(k,v){try{await S.set(k,JSON.stringify(v));}catch(e){}}

// ── Safe task save with shrinkage guard ──
// Prevents catastrophic overwrites: if the task array shrank by more than
// 50% compared to what was loaded, require explicit confirmation.
const saveTasks = async () => {
  if (!tasksLoadedOk) {
    console.error('[SAFETY] saveTasks() BLOCKED — initial load failed. Reload the page with a working connection.');
    showToast('\u26a0\ufe0f Task save blocked — data did not load properly. Please reload.','','',8000);
    return;
  }
  // Shrinkage guard: if we loaded N tasks and now have much fewer, warn
  if (_tasksLoadedCount > 5 && tasks.length < _tasksLoadedCount * 0.5) {
    console.error(`[SAFETY] saveTasks() BLOCKED — drastic shrinkage detected (${_tasksLoadedCount} → ${tasks.length}). This looks like accidental data loss.`);
    showToast(`\u26a0\ufe0f Save blocked: task count dropped from ${_tasksLoadedCount} to ${tasks.length}. This may be a bug — reload to recover.`,'','',10000);
    return;
  }
  await save('se_t', tasks);
};
const saveVendors=()=>save('se_v',vendors);
const saveRec=()=>save('se_r',recurring);

// ── Task Change Log ──────────────────────────────────────────
// Persistent audit trail stored in se_t_log (separate from task data).
// Each entry: { ts, action, taskId, property, vendor, date, problem, by }
// Kept trimmed to last 500 entries to stay within free-tier KV limits.
let _taskLog = [];
let _taskLogLoaded = false;

async function loadTaskLog() {
  try {
    const r = await S.get('se_t_log');
    if (r) _taskLog = JSON.parse(r.value);
    else _taskLog = [];
    _taskLogLoaded = true;
  } catch(e) { _taskLog = []; _taskLogLoaded = true; }
}

async function saveTaskLog() {
  if (!_taskLogLoaded) return;
  // Trim to most recent 500 entries
  if (_taskLog.length > 500) _taskLog = _taskLog.slice(-500);
  await save('se_t_log', _taskLog);
}

function logTaskChange(action, t) {
  if (!t) return;
  const entry = {
    ts: new Date().toISOString(),
    action,               // 'created','completed','deleted','updated','bulk_complete','bulk_delete'
    taskId: t.id || '',
    property: t.property || '',
    vendor: t.vendor || '',
    date: t.date || '',
    problem: (t.problem || '').slice(0, 120),
    by: (typeof getCurrentUserName === 'function' ? getCurrentUserName() : 'admin')
  };
  _taskLog.push(entry);
  // Fire-and-forget save — don't block the UI
  saveTaskLog();
}

// HELPERS
// Lookup maps — O(1) instead of linear search on every call
const _propMap=Object.fromEntries(PROPS.map(p=>[p.id,p]));
const _nbMap={};NBS.forEach(n=>n.props.forEach(pid=>{_nbMap[pid]=n;}));
const _nbById=Object.fromEntries(NBS.map(n=>[n.id,n]));
// Virtual "neighborhood-level" properties for log entries covering an entire resort
const _nbVirtualProps={
  umc:{id:'umc',name:'UMC — Resort (All Cabins)'},
  prc:{id:'prc',name:'PRC — Resort (All Cabins)'},
  hillside:{id:'hillside',name:'Hillside Haven (Both)'},
};
const getNb=id=>_nbMap[id]||_nbById[id]||null;
const getProp=id=>_propMap[id]||_nbVirtualProps[id]||null;
const getNbCls=id=>{if(_nbById[id])return _nbById[id].cls;const n=_nbMap[id];return n?n.cls:'other';};
const DONE_STATUSES=['complete','resolved_by_guest'];
const isDone=t=>DONE_STATUSES.includes(t.status);
const fmtDate=ds=>{if(!ds)return'';const d=new Date(ds+'T12:00:00');return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});};
const fmtReported=iso=>{if(!iso)return'';const d=new Date(iso);const now=new Date();const diff=now-d;const days=Math.floor(diff/864e5);const hrs=Math.floor(diff/36e5);const mins=Math.floor(diff/6e4);const ago=days>0?days===1?'1 day ago':`${days} days ago`:hrs>0?hrs===1?'1 hr ago':`${hrs} hrs ago`:mins>1?`${mins} min ago`:'Just now';return`${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})} (${ago})`;};

// INIT
function switchView(name,btn){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const el = document.getElementById('view-'+name);
  if (el) el.classList.add('active');
  if(btn)btn.classList.add('active');
  // Reviews — load aggregated ratings (24h client-cached) + host cleaning sub-section
  if (name === 'reviews' && typeof rvInit === 'function') rvInit();
  // Refresh replacements view when switching to it
  if (name === 'replacements') renderReplacements();
  // Property Bible (Deploy 1) — lazy load on first open
  if (name === 'properties' && typeof ppLoadIfNeeded === 'function') ppLoadIfNeeded();
  // Projects — refresh list
  if (name === 'projects' && typeof pjRenderList === 'function') pjRenderList();
  // Settings — render dynamic settings panels
  if (name === 'settings' && typeof renderSettingsOnSwitch === 'function') renderSettingsOnSwitch();
}
// Navigate to Recurring view without a nav button (it's been removed from the main nav)
function goToRecurring(){switchView('recurring');window.scrollTo(0,0);}

function populatePropSel(id){
  const s=document.getElementById(id);
  s.innerHTML='<option value="">Select property...</option>';
  NBS.forEach(nb=>{
    const og=document.createElement('optgroup');
    og.label=nb.name+' — '+nb.sub;
    nb.props.forEach(pid=>{const p=getProp(pid);if(p){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;og.appendChild(o);}});
    s.appendChild(og);
  });
}

function populatePropMulti(id){
  const s=document.getElementById(id);
  s.innerHTML='<option value="all">All Properties</option>';
  NBS.forEach(nb=>{
    const og=document.createElement('optgroup');og.label=nb.name;
    nb.props.forEach(pid=>{const p=getProp(pid);if(p){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;og.appendChild(o);}});
    s.appendChild(og);
  });
}

function renderAll(){renderVR();renderVD();renderVSC();renderUB();renderTasks();renderCalendar();renderRecurring();renderHistory();renderVendors();if(typeof pjRenderList==='function')pjRenderList();}

// URGENT BANNER
function renderUB(){
  const u=tasks.filter(t=>t.urgent&&!isDone(t));
  const c=document.getElementById('ub-wrap');
  if(!u.length){c.innerHTML='';return;}
  c.innerHTML=`<div class="ub"><div class="ub-title">Urgent — Immediate Attention Required (${u.length})</div>${u.map(t=>{const p=getProp(t.property);return`<div class="ui" onclick="openDetail('${t.id}')"><div><div class="ui-prop">${p?p.name:t.property}</div><div class="ui-prob">${t.problem}</div></div><span class="upill">Urgent</span></div>`;}).join('')}</div>`;
}

// VENDOR-DONE BANNER — tasks vendors marked complete, awaiting admin confirmation
function renderVD(){
  const vd=tasks.filter(t=>t.vendorDone&&!isDone(t));
  const c=document.getElementById('vdn-wrap');
  if(!vd.length){c.innerHTML='';return;}
  // Sort by vendorDone timestamp (most recent first)
  vd.sort((a,b)=>(b.vendorDone||'').localeCompare(a.vendorDone||''));
  const items=vd.map(t=>{
    const p=getProp(t.property);const nbcls=getNbCls(t.property);
    const ago=vdTimeAgo(t.vendorDone);
    return`<div class="vdn-item" onclick="openDetail('${t.id}')">
      <div class="vdn-item-left">
        <div class="vdn-item-prop vdn-prop-${nbcls}">${p?p.name:t.property}</div>
        <div class="vdn-item-prob">${t.problem}</div>
        <div class="vdn-item-meta">${t.vendor?t.vendor+' \u2022 ':''}Marked done ${ago}</div>
      </div>
      <div class="vdn-item-actions">
        <button class="vdn-btn-done" onclick="vdQuickComplete('${t.id}',event)">Mark Complete</button>
      </div>
    </div>`;
  }).join('');
  c.innerHTML=`<div class="vdn-banner"><div class="vdn-hdr"><div class="vdn-title">Vendor Done — Ready for Review</div><span class="vdn-count">${vd.length}</span></div>${items}</div>`;
}

function vdTimeAgo(iso){
  if(!iso)return'';
  const diff=Date.now()-new Date(iso).getTime();
  const mins=Math.floor(diff/60000);
  if(mins<1)return'just now';
  if(mins<60)return mins+'m ago';
  const hrs=Math.floor(mins/60);
  if(hrs<24)return hrs+'h ago';
  const days=Math.floor(hrs/24);
  return days+'d ago';
}

// VENDOR SELF-SCHEDULED BANNER — vendors picked their own date, awaiting admin ack
function renderVSC(){
  const vs=tasks.filter(t=>t.selfScheduledAt&&!t.selfScheduleAcknowledged&&!isDone(t));
  const c=document.getElementById('vsc-wrap');
  if(!c)return;
  if(!vs.length){c.innerHTML='';return;}
  // Sort by selfScheduledAt timestamp (most recent first)
  vs.sort((a,b)=>(b.selfScheduledAt||'').localeCompare(a.selfScheduledAt||''));
  const items=vs.map(t=>{
    const p=getProp(t.property);const nbcls=getNbCls(t.property);
    const ago=vdTimeAgo(t.selfScheduledAt);
    // Human-readable date the vendor picked
    let dateFmt='';
    if(t.date){
      try{dateFmt=new Date(t.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});}catch(e){dateFmt=t.date;}
    }
    const who=t.selfScheduledBy||t.vendor||'Vendor';
    return`<div class="vsc-item" onclick="openDetail('${t.id}')">
      <div class="vsc-item-left">
        <div class="vsc-item-prop vsc-prop-${nbcls}">${p?p.name:t.property}</div>
        <div class="vsc-item-prob">${t.problem}</div>
        <div class="vsc-item-meta">${who} \u2022 picked ${dateFmt||'a date'} \u2022 ${ago}</div>
      </div>
      <div class="vsc-item-actions">
        <button class="vsc-btn-ack" onclick="vscAck('${t.id}',event)">Acknowledge</button>
      </div>
    </div>`;
  }).join('');
  c.innerHTML=`<div class="vsc-banner"><div class="vsc-hdr"><div class="vsc-title">Vendor Self-Scheduled — New Date Picked</div><span class="vsc-count">${vs.length}</span></div>${items}</div>`;
}

async function vscAck(id,e){
  if(e){e.stopPropagation();}
  const t=tasks.find(x=>x.id===id);if(!t)return;
  t.selfScheduleAcknowledged=true;
  await saveTasks();renderVSC();
  showToast('Acknowledged.');
}

// VENDOR REPORTS BANNER — field observations from vendors
let vendorReports=[];
async function loadVendorReports(){
  try{const r=await S.get('se_vendor_reports');if(r&&r.value){vendorReports=JSON.parse(r.value)||[];}else{vendorReports=[];}}catch(e){vendorReports=[];}
}
async function saveVendorReports(){
  try{await S.set('se_vendor_reports',JSON.stringify(vendorReports));}catch(e){console.error('[vr] save error',e);}
}
function renderVR(){
  const pending=vendorReports.filter(r=>r.status==='pending');
  const c=document.getElementById('vr-wrap');
  if(!pending.length){c.innerHTML='';return;}
  const items=pending.map(r=>{
    const p=getProp(r.propertyId);const nbcls=getNbCls(r.propertyId);
    const ago=vdTimeAgo(r.createdAt);
    const isNeeds=r.reportType==='needs_attention';
    const typeBadge=isNeeds?'<span class="vr-type-badge vr-type-needs">Needs Attention</span>':'<span class="vr-type-badge vr-type-fixed">Fixed While Here</span>';
    const actionBtn=isNeeds
      ?`<button class="vr-btn vr-btn-import" onclick="event.stopPropagation();vrImport('${r.id}')">Import as Task</button>`
      :`<button class="vr-btn vr-btn-ack" onclick="event.stopPropagation();vrAck('${r.id}')">Acknowledge</button>`;
    return`<div class="vr-item">
      <div class="vr-item-top">
        <div class="vr-item-left">
          <div class="vr-item-prop vr-prop-${nbcls}">${p?p.name:r.propertyId}</div>
          <div class="vr-item-prob">${r.description.replace(/</g,'&lt;')}</div>
          <div class="vr-item-meta">
            ${typeBadge}
            <span>${r.vendor}</span>
            <span>${ago}</span>
          </div>
          ${r.photoUrl?(Array.isArray(r.photoUrl)?r.photoUrl:r.photoUrl?[r.photoUrl]:[]).map(u=>`<img class="vr-photo-thumb" src="${u}" onclick="window.open('${u}','_blank')" title="Click to view full size">`).join(''):''}
        </div>
        <div class="vr-item-btns">
          ${actionBtn}
          <button class="vr-btn vr-btn-dismiss" onclick="event.stopPropagation();vrDismiss('${r.id}')">Dismiss</button>
        </div>
      </div>
    </div>`;
  }).join('');
  c.innerHTML=`<div class="vr-banner"><div class="vr-hdr"><div class="vr-title">Vendor Reports — Field Observations</div><span class="vr-count">${pending.length}</span></div>${items}</div>`;
}

async function vrImport(id){
  const r=vendorReports.find(x=>x.id===id);if(!r)return;
  const p=getProp(r.propertyId);
  const newTask={
    id:'t_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),
    property:r.propertyId,
    category:'General',
    problem:r.description,
    status:'open',
    vendor:r.vendor||'',
    date:'',
    urgent:false,
    guest:'',
    notes:[{text:'Imported from vendor field report by '+r.vendor+'.',type:'admin',time:new Date().toISOString()}],
    photos:[],
    created:new Date().toISOString()
  };
  if(r.photoUrl){if(Array.isArray(r.photoUrl))newTask.photos.push(...r.photoUrl);else newTask.photos.push(r.photoUrl);}
  tasks.push(newTask);logTaskChange('created',newTask);
  r.status='imported';
  await saveTasks();await saveVendorReports();
  renderAll();showToast('Imported as task.');
  openDetail(newTask.id);
}

async function vrAck(id){
  const r=vendorReports.find(x=>x.id===id);if(!r)return;
  r.status='acknowledged';
  await saveVendorReports();renderVR();
  showToast('Acknowledged — logged to history.');
}

async function vrDismiss(id){
  const r=vendorReports.find(x=>x.id===id);if(!r)return;
  r.status='dismissed';
  await saveVendorReports();renderVR();
  showToast('Dismissed.');
}

// STATS
function renderStats(){
  const u=tasks.filter(t=>t.urgent&&!isDone(t)).length;
  const o=tasks.filter(t=>t.status==='open').length;
  const s=tasks.filter(t=>t.status==='scheduled').length;
  const i=tasks.filter(t=>t.status==='in_progress').length;
  const d=tasks.filter(t=>t.status==='complete').length;
  document.getElementById('stats-bar').innerHTML=`
    <div class="sc"><div class="sn red">${u}</div><div class="sl">Urgent</div></div>
    <div class="sc"><div class="sn">${o}</div><div class="sl">Open</div></div>
    <div class="sc"><div class="sn">${s}</div><div class="sl">Scheduled</div></div>
    <div class="sc"><div class="sn">${i}</div><div class="sl">In Progress</div></div>
    <div class="sc"><div class="sn">${d}</div><div class="sl">Completed</div></div>`;
}

// TASKS
const CAT_LABELS={replacement:'Replacement',handyman:'Handyman',plumbing:'Plumbing',hvac:'HVAC',electrical:'Electrical',hot_tub:'Hot Tub',pool:'Pool',pest:'Pest Control',cleaning:'Cleaning',landscaping:'Landscaping',arcade:'Arcade / Billiards',septic:'Septic',water:'Water Filtration',bed_bugs:'Bed Bugs',other:'Other','':`Uncategorized`};
let catFilter='all';
let propFilter='all';
let dateSort=false;
let groupMode='status'; // 'status' | 'property'
const _collapsedProps=new Set();
const _collapsedNbs=new Set();
let _propGroupSeeded=false; // true after first auto-collapse seed on load

// ── Multi-select mode ──
let _selectMode=false;
const _selectedTasks=new Set();
function overdueBadge(t){
  if(!t.date||isDone(t))return'';
  const today=new Date();today.setHours(0,0,0,0);
  const d=new Date(t.date+'T12:00:00');d.setHours(0,0,0,0);
  const diff=Math.floor((today-d)/(86400000));
  if(diff<=0)return'';
  return`<span class="tmi" style="color:var(--red);font-weight:600">${diff}d overdue</span>`;
}
function taskCard(t){
  const p=getProp(t.property);const nb=getNb(t.property);
  const nbcls=nb?'nb-'+nb.cls:'';const plcls=nb?'pl-'+nb.cls:'';
  const dot=t.urgent?'<div class="udot"></div>':`<div class="tdot dot-${t.status}"></div>`;
  const propRow=groupMode==='property'?'':`<div class="tprop ${plcls}">${p?p.name:t.property}</div>`;
  const isSched=t.status==='scheduled'||t.status==='in_progress'||!!t.date;
  const unschedCls=groupMode==='property'&&!isSched?' tc-unsched':'';
  const selChecked=_selectedTasks.has(t.id)?'checked':'';
  const selCb=_selectMode?`<label class="bulk-cb-wrap" onclick="event.stopPropagation()"><input type="checkbox" class="bulk-cb" ${selChecked} onchange="toggleTaskSelect('${t.id}',this.checked)"></label>`:'';
  const selClass=_selectMode&&_selectedTasks.has(t.id)?' tc-selected':'';
  return`<div class="tc ${nbcls}${unschedCls}${selClass} ${t.status==='complete'?'done':''}" onclick="${_selectMode?`toggleTaskSelect('${t.id}');renderTasks()`:`openDetail('${t.id}')`}">
    <div class="tc-top">${selCb}${dot}<div class="tmain">
      ${propRow}
      <div class="tprob">${t.problem}</div>
      <div class="tmeta">
        ${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}
        ${t.recurring?'<span class="badge b-rec">Recurring</span>':''}
        <span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>
        ${t.date?`<span class="tmi">${t.date}</span>${overdueBadge(t)}`:(t.status!=='scheduled'?'<span class="tmi" style="color:var(--text3)">Not scheduled</span>':'')}
        ${t.vendor?`<span class="tmi">${t.vendor}</span>`:''}${t.vendorDone?'<span class="vd-badge">Vendor Done</span>':''}${(t.vendor&&!t.date)?'<span class="avs-badge" title="Vendor asked to pick a date">Awaiting vendor schedule</span>':''}${t.selfScheduledAt?'<span class="ss-badge" title="Vendor self-scheduled this date">Self-scheduled</span>':''}
        ${taskEffectivePurchaseNote(t)?`<span style="font-size:.62rem;color:#e65100;font-weight:600;background:#fff3e0;padding:1px 6px;border-radius:10px;border:1px solid #ffcc80">&#x1F6D2; ${t.purchaseStatus==='delivered'?'Delivered':t.purchaseStatus==='purchased'?'Purchased — deliver':'Buy'}${taskEffectivePurchaser(t)==='vendor'?' (vendor)':''}</span>`:''}
        ${t.guest?`<span class="tmi">Reported by ${t.guest}</span>`:''}
        ${t.project_title?`<span style="font-size:.62rem;color:var(--green);font-weight:600;background:var(--green-light);padding:1px 6px;border-radius:10px;border:1px solid var(--border)">📋 ${t.project_title}</span>`:''}
      </div>
    </div></div>
  </div>`;
}
function renderTasks(){
  const q=document.getElementById('search-input').value.toLowerCase();
  const active=tasks.filter(t=>!isDone(t));
  // Hide tasks from hidden projects
  const _hiddenPids=typeof projects!=='undefined'?new Set(projects.filter(p=>p.visible===false).map(p=>p.id)):new Set();
  let f=active.filter(t=>{
    if(t.project_id&&_hiddenPids.has(t.project_id))return false;
    // Property filter
    if(propFilter!=='all'&&t.property!==propFilter)return false;
    // Category/urgent filter
    if(catFilter==='urgent'&&!t.urgent)return false;
    if(catFilter!=='all'&&catFilter!=='urgent'){const cats=t.category?t.category.split(',').map(x=>x.trim()):[''];if(!cats.includes(catFilter))return false;}
    // Search filter (works alongside any category filter; also searches vendor + category)
    if(q){const p=getProp(t.property);const n=p?p.name.toLowerCase():'';const vn=(t.vendor||'').toLowerCase();const cat=(t.category||'').toLowerCase().replace('_',' ');
      if(!(n.includes(q)||t.problem.toLowerCase().includes(q)||(t.guest||'').toLowerCase().includes(q)||vn.includes(q)||cat.includes(q)))return false;}
    return true;
  });

  // Render toolbar
  const tb=document.getElementById('task-toolbar');
  if(tb) tb.innerHTML=`<div class="task-tb"><button class="tb-btn${groupMode==='property'?' active':''}" onclick="toggleGroupMode()">${groupMode==='property'?'All Tasks':'Group by Property'}</button><button class="tb-btn${_selectMode?' active':''}" onclick="toggleSelectMode()">${_selectMode?'Exit Select':'Select'}</button><button class="tb-btn tb-btn-gs" onclick="openGroupScheduler()" title="Find a day that works across multiple properties">Group Schedule</button></div>`;

  // Sort within each group: urgent first, then by status, then by date
  const sortTasks=arr=>arr.sort((a,b)=>{
    if(a.urgent&&!b.urgent)return-1;if(!a.urgent&&b.urgent)return 1;
    const o={open:0,scheduled:1,in_progress:2};
    if(o[a.status]!==o[b.status])return o[a.status]-o[b.status];
    return new Date(b.created)-new Date(a.created);
  });

  const el=document.getElementById('task-list');
  if(!f.length){el.innerHTML='<div class="empty">No tasks found.</div>';return;}

  // ── PROPERTY GROUPING MODE ──
  if(groupMode==='property'){
    // Seed all props as collapsed on first render (default closed view)
    if(!_propGroupSeeded){
      _propGroupSeeded=true;
      tasks.filter(t=>!isDone(t)).forEach(t=>_collapsedProps.add(t.property));
    }
    const propGroups={};
    f.forEach(t=>{if(!propGroups[t.property])propGroups[t.property]=[];propGroups[t.property].push(t);});
    const isSchedTask=t=>t.status==='scheduled'||t.status==='in_progress'||!!t.date;
    let html='';
    NBS.forEach(nb=>{
      // Properties in this neighborhood that have tasks
      const nbPropIds=nb.props.filter(pid=>propGroups[pid]);
      if(!nbPropIds.length)return;
      // Sort alphabetically by property name
      nbPropIds.sort((a,b)=>{const pa=getProp(a);const pb=getProp(b);return(pa?pa.name:a).localeCompare(pb?pb.name:b);});
      const nbCollapsed=_collapsedNbs.has(nb.id);
      const nbTaskCount=nbPropIds.reduce((s,pid)=>s+propGroups[pid].length,0);
      const nbHasUrgent=nbPropIds.some(pid=>propGroups[pid].some(t=>t.urgent));
      // Build property rows
      let propsHtml='';
      nbPropIds.forEach(pid=>{
        const p=getProp(pid);
        const propName=p?p.name:pid;
        const pTasks=sortTasks(propGroups[pid].slice());
        const collapsed=_collapsedProps.has(pid);
        const hasUrgent=pTasks.some(t=>t.urgent);
        const phdr='phdr-'+nb.cls;
        // Sub-section split: needs scheduling vs scheduled
        let tasksHtml='';
        if(!collapsed){
          const needsSched=pTasks.filter(t=>!isSchedTask(t));
          const schedTasks=pTasks.filter(t=>isSchedTask(t));
          if(needsSched.length&&schedTasks.length){
            tasksHtml=`<div class="pg-sub-hdr pg-sub-needs">Needs Scheduling</div><div class="task-list">${needsSched.map(taskCard).join('')}</div><div class="pg-sub-hdr pg-sub-sched">Scheduled</div><div class="task-list">${schedTasks.map(taskCard).join('')}</div>`;
          } else {
            tasksHtml=`<div class="task-list">${pTasks.map(taskCard).join('')}</div>`;
          }
        }
        propsHtml+=`<div class="prop-group">
          <div class="prop-group-hdr ${phdr}" onclick="togglePropCollapse('${pid}')">
            <div class="prop-group-left">
              <span class="prop-group-chevron">${collapsed?'▸':'▾'}</span>
              <span class="prop-group-name">${propName}</span>
              ${hasUrgent?'<div class="udot" style="margin-top:0;flex-shrink:0;background:var(--red)"></div>':''}
            </div>
            <span class="prop-group-count">${pTasks.length}</span>
          </div>
          ${collapsed?'':`<div class="prop-group-tasks">${tasksHtml}</div>`}
        </div>`;
      });
      html+=`<div class="nb-group">
        <div class="nb-group-hdr nbhdr-${nb.cls}" onclick="toggleNbCollapse('${nb.id}')">
          <div class="prop-group-left">
            <span class="nb-group-chevron">${nbCollapsed?'▸':'▾'}</span>
            <span class="nb-group-name">${nb.name}</span>
            ${nbHasUrgent?'<div class="udot" style="margin-top:0;flex-shrink:0"></div>':''}
          </div>
          <span class="nb-group-meta">${nbTaskCount} task${nbTaskCount!==1?'s':''}</span>
        </div>
        ${nbCollapsed?'':`<div class="nb-group-props">${propsHtml}</div>`}
      </div>`;
    });
    // Any tasks for properties not in a known neighborhood
    const unknownPids=Object.keys(propGroups).filter(pid=>!NBS.some(nb=>nb.props.includes(pid)));
    if(unknownPids.length){
      unknownPids.forEach(pid=>{
        const p=getProp(pid);const pTasks=sortTasks(propGroups[pid].slice());
        const collapsed=_collapsedProps.has(pid);
        html+=`<div class="prop-group">
          <div class="prop-group-hdr phdr-other" onclick="togglePropCollapse('${pid}')">
            <div class="prop-group-left"><span class="prop-group-chevron">${collapsed?'▸':'▾'}</span><span class="prop-group-name">${p?p.name:pid}</span></div>
            <span class="prop-group-count">${pTasks.length}</span>
          </div>
          ${collapsed?'':`<div class="task-list prop-group-tasks">${pTasks.map(taskCard).join('')}</div>`}
        </div>`;
      });
    }
    el.innerHTML=html;
    return;
  }

  // ── STATUS GROUPING MODE (default) ──
  // If filtered to a specific category or urgent, just show flat sorted list
  if(catFilter!=='all'){
    sortTasks(f);
    el.innerHTML='<div class="task-list">'+f.map(taskCard).join('')+'</div>';
    return;
  }

  // Group by scheduling status (date presence is the primary signal)
  const isScheduled=t=>t.status==='scheduled'||t.status==='in_progress'||!!t.date;
  const needsScheduling=sortTasks(f.filter(t=>!isScheduled(t)));
  let scheduled=f.filter(t=>isScheduled(t)).sort((a,b)=>{
    if(a.urgent&&!b.urgent)return-1;if(!a.urgent&&b.urgent)return 1;
    const da=a.date||'9999';const db=b.date||'9999';return da.localeCompare(db);
  });

  let html='';
  if(needsScheduling.length){
    // Urgent floats to top as flat list; non-urgent grouped by property A→Z
    // with a colored neighborhood banner inserted at each boundary.
    const urgentList=needsScheduling.filter(t=>t.urgent);
    const nonUrgent=needsScheduling.filter(t=>!t.urgent);
    const nsGroups={};
    nonUrgent.forEach(t=>{if(!nsGroups[t.property])nsGroups[t.property]=[];nsGroups[t.property].push(t);});
    const nsPropIds=Object.keys(nsGroups).sort((a,b)=>{const pa=getProp(a);const pb=getProp(b);return(pa?pa.name:a).localeCompare(pb?pb.name:b);});
    let nsInner='';
    if(urgentList.length)nsInner+=`<div class="task-list">${urgentList.map(taskCard).join('')}</div>`;
    let nsCurNb=null,nsBucket=[];
    const nsFlush=()=>{
      if(!nsBucket.length)return;
      const nb=nsCurNb,nbName=nb?nb.name:'Other',nbCls=nb?nb.cls:'other';
      const nbTaskCount=nsBucket.reduce((s,pid)=>s+nsGroups[pid].length,0);
      const cabinCount=nsBucket.length;
      const countLabel=cabinCount>1?`${nbTaskCount} task${nbTaskCount!==1?'s':''} · ${cabinCount} cabins`:`${nbTaskCount} task${nbTaskCount!==1?'s':''}`;
      nsInner+=`<div class="nb-banner nbb-${nbCls}"><span>${nbName}</span><span class="nb-banner-count">${countLabel}</span></div>`;
      nsInner+=`<div class="task-list">${nsBucket.map(pid=>nsGroups[pid].map(taskCard).join('')).join('')}</div>`;
      nsBucket=[];
    };
    nsPropIds.forEach(pid=>{
      const nb=getNb(pid),curId=nsCurNb?nsCurNb.id:null,newId=nb?nb.id:null;
      if(curId!==newId){nsFlush();nsCurNb=nb;}
      nsBucket.push(pid);
    });
    nsFlush();
    html+=`<div class="cat-section">
      <div class="cat-section-hdr"><span class="cat-section-title">Needs Scheduling</span><span class="cat-section-count">${needsScheduling.length}</span></div>
      ${nsInner}
    </div>`;
  }
  if(scheduled.length){
    // Same treatment as Needs Scheduling: grouped by property A→Z with a
    // colored neighborhood banner at each boundary. Within each property
    // group, tasks keep the pre-group sort order (urgent first, then date
    // ascending) so overdue items still surface near the top of their group.
    const scGroups={};
    scheduled.forEach(t=>{if(!scGroups[t.property])scGroups[t.property]=[];scGroups[t.property].push(t);});
    const scPropIds=Object.keys(scGroups).sort((a,b)=>{const pa=getProp(a);const pb=getProp(b);return(pa?pa.name:a).localeCompare(pb?pb.name:b);});
    let scInner='';
    let scCurNb=null,scBucket=[];
    const scFlush=()=>{
      if(!scBucket.length)return;
      const nb=scCurNb,nbName=nb?nb.name:'Other',nbCls=nb?nb.cls:'other';
      const nbTaskCount=scBucket.reduce((s,pid)=>s+scGroups[pid].length,0);
      const cabinCount=scBucket.length;
      const countLabel=cabinCount>1?`${nbTaskCount} task${nbTaskCount!==1?'s':''} · ${cabinCount} cabins`:`${nbTaskCount} task${nbTaskCount!==1?'s':''}`;
      scInner+=`<div class="nb-banner nbb-${nbCls}"><span>${nbName}</span><span class="nb-banner-count">${countLabel}</span></div>`;
      scInner+=`<div class="task-list">${scBucket.map(pid=>scGroups[pid].map(taskCard).join('')).join('')}</div>`;
      scBucket=[];
    };
    scPropIds.forEach(pid=>{
      const nb=getNb(pid),curId=scCurNb?scCurNb.id:null,newId=nb?nb.id:null;
      if(curId!==newId){scFlush();scCurNb=nb;}
      scBucket.push(pid);
    });
    scFlush();
    html+=`<div class="cat-section">
      <div class="cat-section-hdr"><span class="cat-section-title">Scheduled</span><span class="cat-section-count">${scheduled.length}</span></div>
      ${scInner}
    </div>`;
  }
  el.innerHTML=html;
}
function setCatFilter(c,btn){catFilter=c;document.querySelectorAll('.fb').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderTasks();}
function setPropFilter(v){propFilter=v;renderTasks();}
function toggleDateSort(){dateSort=!dateSort;document.getElementById('date-sort-btn').classList.toggle('active',dateSort);renderTasks();}
function toggleGroupMode(){
  if(groupMode==='status'){
    groupMode='property';
    _collapsedProps.clear();
    _collapsedNbs.clear();
    _propGroupSeeded=true;
    tasks.filter(t=>!isDone(t)).forEach(t=>_collapsedProps.add(t.property));
  } else {
    groupMode='status';
    _collapsedProps.clear();
    _collapsedNbs.clear();
    _propGroupSeeded=false;
  }
  renderTasks();
}
function togglePropCollapse(pid){if(_collapsedProps.has(pid))_collapsedProps.delete(pid);else _collapsedProps.add(pid);renderTasks();}
function toggleNbCollapse(nbId){if(_collapsedNbs.has(nbId))_collapsedNbs.delete(nbId);else _collapsedNbs.add(nbId);renderTasks();}
function populatePropFilter(){
  const sel=document.getElementById('prop-filter');if(!sel)return;
  const prev=sel.value;
  sel.innerHTML='<option value="all">All Properties</option>';
  NBS.forEach(nb=>{
    const group=document.createElement('optgroup');group.label=nb.name;
    PROPS.filter(p=>nb.props.includes(p.id)).forEach(p=>{
      const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name.split(' - ').pop();
      group.appendChild(opt);
    });
    sel.appendChild(group);
  });
  sel.value=prev||'all';
}
function setFilter(f,btn){} // kept for compatibility

// ── MULTI-SELECT MODE ──────────────────────────────────────
function toggleSelectMode(){_selectMode=!_selectMode;if(!_selectMode)_selectedTasks.clear();updateBulkBar();renderTasks();}
function exitSelectMode(){_selectMode=false;_selectedTasks.clear();updateBulkBar();renderTasks();}
function toggleTaskSelect(tid,checked){
  if(typeof checked==='undefined'){
    // Toggle — called from card click in select mode
    if(_selectedTasks.has(tid))_selectedTasks.delete(tid);else _selectedTasks.add(tid);
  } else {
    if(checked)_selectedTasks.add(tid);else _selectedTasks.delete(tid);
  }
  updateBulkBar();renderTasks();
}
function bulkSelectAll(){
  // Select all currently visible (filtered) tasks
  const q=document.getElementById('search-input').value.toLowerCase();
  const active=tasks.filter(t=>!isDone(t));
  const _hiddenPids=typeof projects!=='undefined'?new Set(projects.filter(p=>p.visible===false).map(p=>p.id)):new Set();
  active.forEach(t=>{
    if(t.project_id&&_hiddenPids.has(t.project_id))return;
    if(propFilter!=='all'&&t.property!==propFilter)return;
    if(catFilter==='urgent'&&!t.urgent)return;
    if(catFilter!=='all'&&catFilter!=='urgent'){const cats=t.category?t.category.split(',').map(x=>x.trim()):[''];if(!cats.includes(catFilter))return;}
    if(q){const p=getProp(t.property);const n=p?p.name.toLowerCase():'';if(!(n.includes(q)||t.problem.toLowerCase().includes(q)||(t.guest||'').toLowerCase().includes(q)||(t.vendor||'').toLowerCase().includes(q)||(t.category||'').toLowerCase().includes(q)))return;}
    _selectedTasks.add(t.id);
  });
  updateBulkBar();renderTasks();
}
function bulkDeselectAll(){_selectedTasks.clear();updateBulkBar();renderTasks();}
function updateBulkBar(){
  const bar=document.getElementById('bulk-bar');
  if(!bar)return;
  bar.style.display=_selectMode?'':'none';
  const ct=document.getElementById('bulk-count');
  if(ct)ct.textContent=_selectedTasks.size+' selected';
}

// ── Bulk actions ──
function _getSelectedTasks(){return tasks.filter(t=>_selectedTasks.has(t.id));}
let _bulkCalProp=null;  // property ID for calendar view in bulk schedule
let _bulkSelectedDate='';

function _openBulkModal(title,bodyHtml){
  document.getElementById('bulk-modal-title').textContent=title;
  document.getElementById('bulk-modal-body').innerHTML=bodyHtml;
  document.getElementById('bulk-modal').classList.add('open');
}

function bulkSchedule(){
  const sel=_getSelectedTasks();if(!sel.length){showToast('No tasks selected');return;}
  // Detect if all selected tasks share one property → show that property's calendar
  const propSet=new Set(sel.map(t=>t.property));
  _bulkCalProp=propSet.size===1?[...propSet][0]:null;
  _bulkSelectedDate='';
  const propNote=_bulkCalProp?getProp(_bulkCalProp)?.name||_bulkCalProp:'multiple properties';

  _openBulkModal('Schedule '+sel.length+' Task'+(sel.length!==1?'s':''),`
    <div style="font-size:.82rem;color:var(--text2);margin-bottom:12px">
      Set a date for <strong>${sel.length}</strong> task${sel.length!==1?'s':''} across <strong>${propNote}</strong>.
    </div>
    <div class="fgr full" style="margin-bottom:12px">
      <label>Scheduled Fix Date</label>
      <div class="dp-wrap" id="b-dp-wrap">
        <button type="button" class="dp-trigger" id="b-dp-btn" onclick="toggleDP('b')">
          <span id="b-dp-display" class="dp-ph">Select a date...</span>
          <span style="color:var(--text3);font-size:.8rem">&#x25BC;</span>
        </button>
        <input type="hidden" id="b-date" value="">
        <div class="dp-popup" id="b-dp-popup" style="display:none"></div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">
      <button class="btn" onclick="closeModal('bulk-modal')">Cancel</button>
      <button class="btn btn-g" onclick="bulkApplySchedule()">Apply Date</button>
    </div>`);
  // Auto-open the calendar if we have a property
  if(_bulkCalProp)setTimeout(()=>toggleDP('b'),100);
}

function bulkApplySchedule(){
  const date=_bulkSelectedDate||document.getElementById('b-date').value;
  if(!date){showToast('Please select a date');return;}
  const sel=_getSelectedTasks();
  sel.forEach(t=>{t.date=date;if(t.status==='open')t.status='scheduled';});
  saveTasks();renderAll();updateBulkBar();
  closeModal('bulk-modal');
  showToast(sel.length+' task'+(sel.length!==1?'s':'')+' scheduled for '+fmtDate(date));
}

function bulkAssignVendor(){
  const sel=_getSelectedTasks();if(!sel.length){showToast('No tasks selected');return;}
  // Build vendor list grouped by category
  let vHtml='';
  const cats={};
  vendors.forEach(v=>{
    (v.categories||['']).forEach(c=>{
      if(!cats[c])cats[c]=[];
      cats[c].push(v);
    });
  });
  const catLabels={handyman:'Handyman',plumbing:'Plumbing',hvac:'HVAC',electrical:'Electrical',pest:'Pest Control',landscaping:'Landscaping',hot_tub:'Hot Tub',pool:'Pool',cleaning:'Cleaning',septic:'Septic',water:'Water Filtration',arcade:'Arcade / Billiards','':'General'};
  Object.keys(cats).sort().forEach(cat=>{
    vHtml+=`<div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:var(--green);font-weight:700;padding:8px 0 4px">${catLabels[cat]||cat}</div>`;
    cats[cat].forEach(v=>{
      vHtml+=`<div class="bulk-vendor-row" onclick="bulkPickVendor('${v.name.replace(/'/g,"\\'")}')">
        <span style="font-weight:500">${v.name}</span>
        <span style="font-size:.72rem;color:var(--text3)">${v.role||''}</span>
      </div>`;
    });
  });

  _openBulkModal('Assign Vendor — '+sel.length+' Task'+(sel.length!==1?'s':''),`
    <div style="font-size:.82rem;color:var(--text2);margin-bottom:10px">
      Choose a vendor for <strong>${sel.length}</strong> selected task${sel.length!==1?'s':''}.
    </div>
    <div class="fgr full" style="margin-bottom:10px">
      <input type="text" id="bulk-vendor-search" placeholder="Search vendors..." oninput="bulkFilterVendors(this.value)" style="font-size:.82rem">
    </div>
    <div id="bulk-vendor-list" style="max-height:45vh;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius)">
      ${vHtml}
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">
      <button class="btn" onclick="closeModal('bulk-modal')">Cancel</button>
    </div>`);
}

function bulkFilterVendors(q){
  q=q.toLowerCase();
  document.querySelectorAll('#bulk-vendor-list .bulk-vendor-row').forEach(row=>{
    const txt=row.textContent.toLowerCase();
    row.style.display=txt.includes(q)?'':'none';
  });
}

function bulkPickVendor(name){
  const sel=_getSelectedTasks();
  sel.forEach(t=>{t.vendor=name;});
  saveTasks();renderAll();updateBulkBar();
  closeModal('bulk-modal');
  showToast(sel.length+' task'+(sel.length!==1?'s':'')+' assigned to '+name);
}

function bulkToggleUrgent(){
  const sel=_getSelectedTasks();if(!sel.length){showToast('No tasks selected');return;}
  const anyNotUrgent=sel.some(t=>!t.urgent);
  sel.forEach(t=>{t.urgent=anyNotUrgent;});
  saveTasks();renderAll();updateBulkBar();
  showToast(sel.length+' task'+(sel.length!==1?'s':'')+' marked '+(anyNotUrgent?'urgent':'not urgent'));
}

function bulkMarkComplete(){
  const sel=_getSelectedTasks();if(!sel.length){showToast('No tasks selected');return;}
  if(!confirm('Mark '+sel.length+' task(s) as complete?'))return;
  sel.forEach(t=>{t.status='complete';logTaskChange('bulk_complete',t);});
  _selectedTasks.clear();
  saveTasks();renderAll();updateBulkBar();
  showToast(sel.length+' task'+(sel.length!==1?'s':'')+' marked complete');
}

// ── Group Scheduler ──────────────────────────────────────────────────────
// Admin tool. Pick a category (defaults to whichever has the most undated
// tasks), see all unscheduled tasks of that category grouped by property,
// see a Good Days strip computed across the affected properties using the
// same Hospitable booking lookup the vendor side uses, click a chip to
// bulk-assign that date, then optionally bulk-assign a vendor in the
// success panel. Date is committed first; vendor is a separate confirmed
// step (admin texts vendor outside the app, comes back to assign).
let _gsState={
  category:null,            // selected category id ('handyman', etc.)
  neighborhood:'all',       // 'all' or NB id
  bookingsByProp:{},        // pid → bookings array (cached across opens via icalCache)
  loading:false,
  view:'pick',              // 'pick' (filters + tasks + chips) | 'confirm' | 'success'
  pendingDate:null,         // for confirm view
  scheduledIds:[],          // for success view — what just got dated
  scheduledDate:null,       // for success view
};

function openGroupScheduler(){
  _gsState.category=_gsDefaultCategory();
  _gsState.neighborhood='all';
  _gsState.bookingsByProp={};
  _gsState.loading=false;
  _gsState.view='pick';
  _gsState.pendingDate=null;
  _gsState.scheduledIds=[];
  _gsState.scheduledDate=null;
  const modal=_gsEnsureModal();
  modal.classList.add('open');
  document.body.style.overflow='hidden';
  _gsRender();
  _gsLoadBookings();
}
window.openGroupScheduler=openGroupScheduler;

function closeGroupScheduler(){
  const m=document.getElementById('gs-modal');
  if(m){m.innerHTML='';m.classList.remove('open');}
  document.body.style.overflow='';
}
window.closeGroupScheduler=closeGroupScheduler;

function _gsEnsureModal(){
  let modal=document.getElementById('gs-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='gs-modal';
    modal.className='vs-dp-modal';   // reuse vendor-side overlay styling
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)closeGroupScheduler();});
  }
  return modal;
}

// All open, undated, non-completed admin-side tasks
function _gsAllUndated(){
  return tasks.filter(t=>!t.date
    && !['complete','resolved_by_guest'].includes(t.status));
}

// Default category = whichever has the largest undated backlog
function _gsDefaultCategory(){
  const counts=_gsCategoryCounts();
  let best=null,bestN=0;
  for(const c in counts){if(counts[c]>bestN){best=c;bestN=counts[c];}}
  return best||(VCAT[0]&&VCAT[0].id)||'handyman';
}

function _gsCategoryCounts(){
  const counts={};
  _gsAllUndated().forEach(t=>{
    if(!t.category)return;
    t.category.split(',').map(x=>x.trim()).filter(Boolean).forEach(c=>{
      counts[c]=(counts[c]||0)+1;
    });
  });
  return counts;
}

function _gsMatchingTasks(){
  return _gsAllUndated().filter(t=>{
    if(_gsState.category&&_gsState.category!=='all'){
      const cats=(t.category||'').split(',').map(x=>x.trim());
      if(!cats.includes(_gsState.category))return false;
    }
    if(_gsState.neighborhood!=='all'){
      const nb=getNb(t.property);
      if(!nb||nb.id!==_gsState.neighborhood)return false;
    }
    return true;
  });
}

async function _gsLoadBookings(){
  const propIds=[...new Set(_gsMatchingTasks().map(t=>t.property))];
  const fresh=propIds.filter(pid=>!_gsState.bookingsByProp[pid]);
  if(!fresh.length)return;
  _gsState.loading=true;
  _gsRender();
  await Promise.all(fresh.map(async pid=>{
    const evs=await fetchIcal(pid);
    _gsState.bookingsByProp[pid]=(evs==='error'?[]:(Array.isArray(evs)?evs:[]));
  }));
  _gsState.loading=false;
  _gsRender();
}

// Per-day classification across the matching properties — chronological
// (admin scanning their own calendar). Returns 21 days starting today.
function _gsComputeDays(matchingTasks){
  const today=new Date();today.setHours(12,0,0,0);
  const propIds=[...new Set(matchingTasks.map(t=>t.property))];
  const days=[];
  for(let i=0;i<21;i++){
    const d=new Date(today.getTime()+i*86400000);d.setHours(12,0,0,0);
    const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const perProp=propIds.map(pid=>{
      const st=dayState(d,_gsState.bookingsByProp[pid]||[]);
      let tier;
      if(st==='turn'||st==='checkin'||st==='checkout')tier='locked';
      else if(st==='booked')tier='booked';
      else tier='open';
      return{pid,tier,state:st};
    });
    const lockedCount=perProp.filter(p=>p.tier==='locked').length;
    const bookedCount=perProp.filter(p=>p.tier==='booked').length;
    const openCount=perProp.filter(p=>p.tier==='open').length;
    let overall;
    if(bookedCount===perProp.length)overall='skip';
    else if(lockedCount===perProp.length)overall='locked';
    else if(lockedCount>0&&bookedCount===0)overall='partial-locked';
    else if(lockedCount>0)overall='partial-mixed';
    else if(openCount===perProp.length)overall='open';
    else overall='partial-open';
    days.push({ds,d,perProp,lockedCount,bookedCount,openCount,overall});
  }
  return days;
}

function _gsRenderBestDaysHtml(matching){
  if(!matching.length)return'';
  const propIds=[...new Set(matching.map(t=>t.property))];
  if(!propIds.length)return'';
  const days=_gsComputeDays(matching);
  // Best-first: rank by ideal-count, then open-count, then earliest date.
  // Drop "skip" days (booked everywhere). Most-ideal day surfaces at front
  // so admin sees their best option immediately; can scroll right to see
  // less-ideal options or further-out dates.
  const rank=d=>d.lockedCount*10 + d.openCount - d.bookedCount*2;
  const candidates=days
    .filter(d=>d.overall!=='skip')
    .sort((a,b)=>{
      const r=rank(b)-rank(a);
      if(r!==0)return r;
      return a.d-b.d;   // tie-break: earliest first
    });
  if(!candidates.length){
    return`<div class="vs-bd-empty">Every property in this group has a guest in house every day for the next 3 weeks. Try a wider category or different neighborhood.</div>`;
  }
  const fmt=d=>d.toLocaleDateString('en-US',{weekday:'short',month:'numeric',day:'numeric'});
  let h=`<div class="vs-best-days">
    <div class="vs-bd-hdr">Good days for ${propIds.length} ${propIds.length===1?'property':'properties'}</div>
    <div class="vs-bd-help">Best days first — turn / check-in / checkout days are ideal (property empty 10am-4pm). Scroll right for more options.</div>
    <div class="vs-bd-strip">`;
  candidates.forEach(day=>{
    let chipCls='vs-bd-chip vs-bd-clickable';
    let tierLabel='';
    if(day.overall==='locked'){chipCls+=' vs-bd-locked';tierLabel='All ideal';}
    else if(day.overall==='partial-locked'){chipCls+=' vs-bd-partial-locked';tierLabel=`${day.lockedCount} ideal • ${day.openCount} open`;}
    else if(day.overall==='partial-mixed'){chipCls+=' vs-bd-partial-mixed';tierLabel=`${day.lockedCount} ideal • ${day.bookedCount} blocked`;}
    else if(day.overall==='open'){chipCls+=' vs-bd-open';tierLabel='All open';}
    else{chipCls+=' vs-bd-partial-mixed';tierLabel=`${day.openCount} open • ${day.bookedCount} blocked`;}
    let dots='';
    day.perProp.forEach(p=>{
      const nbCls=getNbCls(p.pid);
      let dotCls='vs-bd-dot';
      if(p.tier==='locked')dotCls+=' vs-bd-dot-locked';
      else if(p.tier==='booked')dotCls+=' vs-bd-dot-booked';
      else dotCls+=' vs-bd-dot-open';
      const propName=(getProp(p.pid)||{}).name||p.pid;
      const stLabel=p.state==='turn'?'Turn':p.state==='checkin'?'Check-in':p.state==='checkout'?'Checkout':p.state==='booked'?'Guest in house':'Open';
      dots+=`<span class="${dotCls}" style="--nb:var(--${nbCls})" title="${propName.replace(/"/g,'&quot;')} — ${stLabel}"></span>`;
    });
    h+=`<div class="${chipCls}" onclick="_gsPickDate('${day.ds}')">
      <div class="vs-bd-date">${fmt(day.d)}</div>
      <div class="vs-bd-tier">${tierLabel}</div>
      <div class="vs-bd-dots">${dots}</div>
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}

// ── Render ──────────────────────────────────────────────────────────────
function _gsRender(){
  const modal=_gsEnsureModal();
  if(_gsState.view==='confirm'){_gsRenderConfirm();return;}
  if(_gsState.view==='success'){_gsRenderSuccess();return;}

  const matching=_gsMatchingTasks();
  const propIds=[...new Set(matching.map(t=>t.property))];
  const catCounts=_gsCategoryCounts();
  const catOpts=VCAT.filter(c=>catCounts[c.id]>0).map(c=>({id:c.id,label:c.label,count:catCounts[c.id]}));
  // Neighborhoods that contain any property with an undated task in current category
  const nbsWithMatch=new Set();
  _gsAllUndated().filter(t=>{
    if(_gsState.category&&_gsState.category!=='all'){
      const cats=(t.category||'').split(',').map(x=>x.trim());
      if(!cats.includes(_gsState.category))return false;
    }
    return true;
  }).forEach(t=>{const nb=getNb(t.property);if(nb)nbsWithMatch.add(nb.id);});
  const nbOpts=NBS.filter(n=>nbsWithMatch.has(n.id));
  const catLbl=(VCAT.find(c=>c.id===_gsState.category)||{}).label||_gsState.category||'All';

  let h=`<div class="vs-dp-panel gs-panel" onclick="event.stopPropagation()">
    <div class="vs-dp-header">
      <div>
        <div class="vs-dp-title">Group Schedule</div>
        <div class="vs-dp-sub">Find a day that works across multiple properties</div>
      </div>
      <button class="vs-dp-close" onclick="closeGroupScheduler()">&times;</button>
    </div>
    <div class="gs-filters">
      <label class="gs-filter">
        <span class="gs-filter-lbl">Category</span>
        <select onchange="_gsSetCat(this.value)">
          ${catOpts.map(c=>`<option value="${c.id}" ${c.id===_gsState.category?'selected':''}>${c.label} (${c.count})</option>`).join('')}
          ${catOpts.length===0?'<option>No unscheduled tasks</option>':''}
        </select>
      </label>
      <label class="gs-filter">
        <span class="gs-filter-lbl">Neighborhood</span>
        <select onchange="_gsSetNb(this.value)">
          <option value="all" ${_gsState.neighborhood==='all'?'selected':''}>All neighborhoods</option>
          ${nbOpts.map(n=>`<option value="${n.id}" ${n.id===_gsState.neighborhood?'selected':''}>${n.name}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="gs-count">${matching.length} unscheduled ${catLbl.toLowerCase()} task${matching.length!==1?'s':''} across ${propIds.length} propert${propIds.length!==1?'ies':'y'}</div>
    <div class="gs-body">`;

  if(!matching.length){
    h+=`<div class="gs-empty">Nothing unscheduled in <strong>${catLbl}</strong>${_gsState.neighborhood!=='all'?' in this neighborhood':''}. Try another category or neighborhood.</div>`;
  }else{
    // Property-grouped task list
    const propBuckets={};const propOrder=[];
    matching.forEach(t=>{
      if(!propBuckets[t.property]){propBuckets[t.property]={first:t,items:[]};propOrder.push(t.property);}
      propBuckets[t.property].items.push(t);
    });
    h+=`<div class="gs-task-list">`;
    propOrder.forEach(pid=>{
      const b=propBuckets[pid];
      const p=getProp(pid);
      const propName=p?p.name:'Unknown';
      const shortName=propName.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
      const nbCls=getNbCls(pid);
      const addr=p&&p.address?p.address:'';
      const door=p&&p.door?p.door:'';
      const metaParts=[];
      if(addr)metaParts.push(`<a href="https://maps.google.com/?q=${encodeURIComponent(addr)}" target="_blank">${addr}</a>`);
      if(door)metaParts.push('Code: '+door);
      h+=`<div class="gs-prop-block">
        <div class="vs-prop-header" style="border-left-color:var(--${nbCls})">
          <div class="vs-prop-name">${shortName}</div>
          ${metaParts.length?`<div class="vs-prop-meta">${metaParts.join(' &middot; ')}</div>`:''}
        </div>
        <div class="gs-task-rows">`;
      b.items.forEach(t=>{
        const vendorTag=t.vendor
          ?`<span class="gs-task-vendor">${t.vendor.replace(/</g,'&lt;')}</span>`
          :`<span class="gs-task-novendor">No vendor</span>`;
        h+=`<div class="gs-task-row">
          ${t.urgent?'<span class="vs-urgent">Urgent</span>':''}
          <span class="gs-task-prob">${t.problem.replace(/</g,'&lt;')}</span>
          ${vendorTag}
        </div>`;
      });
      h+=`</div></div>`;
    });
    h+=`</div>`;
    // Good Days strip
    h+=`<div class="gs-strip-wrap">`;
    if(_gsState.loading){
      h+=`<div class="gs-loading">Looking up bookings…</div>`;
    }else{
      h+=_gsRenderBestDaysHtml(matching);
    }
    h+=`</div>`;
  }
  h+=`</div>
    <div class="vs-dp-footer">
      <div class="vs-dp-footer-btns" style="width:100%;justify-content:flex-end">
        <button class="btn" onclick="closeGroupScheduler()">Close</button>
      </div>
    </div>
  </div>`;
  modal.innerHTML=h;
}

window._gsSetCat=function(c){
  _gsState.category=c;
  _gsState.neighborhood='all';   // reset narrow filter when category changes
  _gsRender();
  _gsLoadBookings();
};
window._gsSetNb=function(n){
  _gsState.neighborhood=n;
  _gsRender();
  _gsLoadBookings();
};

// ── Confirm view ────────────────────────────────────────────────────────
window._gsPickDate=function(ds){
  _gsState.pendingDate=ds;
  _gsState.view='confirm';
  _gsRender();
};

function _gsRenderConfirm(){
  const modal=_gsEnsureModal();
  const ds=_gsState.pendingDate;
  const matching=_gsMatchingTasks();
  const days=_gsComputeDays(matching);
  const day=days.find(d=>d.ds===ds);
  if(!day){_gsState.view='pick';_gsRender();return;}
  const dateLabel=new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  // Tasks at properties that are blocked (guest in house) on this date — admin can still assign but should know
  const blockedProps=new Set(day.perProp.filter(p=>p.tier==='booked').map(p=>p.pid));
  const idealProps=new Set(day.perProp.filter(p=>p.tier==='locked').map(p=>p.pid));
  // Group tasks by property for display
  const propBuckets={};const propOrder=[];
  matching.forEach(t=>{
    if(!propBuckets[t.property]){propBuckets[t.property]={first:t,items:[]};propOrder.push(t.property);}
    propBuckets[t.property].items.push(t);
  });
  let rows='';
  propOrder.forEach(pid=>{
    const b=propBuckets[pid];
    const p=getProp(pid);
    const shortName=(p?p.name:pid).replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
    const nbCls=getNbCls(pid);
    let stLabel='';
    if(idealProps.has(pid))stLabel='<span class="gs-conf-ideal">Ideal</span>';
    else if(blockedProps.has(pid))stLabel='<span class="gs-conf-blocked">Guest in house</span>';
    else stLabel='<span class="gs-conf-open">Open</span>';
    rows+=`<div class="gs-conf-row">
      <div class="gs-conf-prop" style="color:var(--${nbCls})">${shortName} ${stLabel}</div>
      <div class="gs-conf-tasks">${b.items.map(t=>(t.problem||'').replace(/</g,'&lt;')).join(' • ')}</div>
    </div>`;
  });
  const taskCount=matching.length;
  const blockedCount=propOrder.filter(pid=>blockedProps.has(pid)).length;
  const taskIds=JSON.stringify(matching.map(t=>t.id)).replace(/"/g,'&quot;');
  const h=`<div class="vs-dp-panel gs-panel" onclick="event.stopPropagation()">
    <div class="vs-dp-header">
      <div>
        <div class="vs-dp-title">Confirm schedule</div>
        <div class="vs-dp-sub">${dateLabel}</div>
      </div>
      <button class="vs-dp-close" onclick="closeGroupScheduler()">&times;</button>
    </div>
    <div class="vs-bulk-confirm">
      <div class="vs-bulk-lead">Schedule ${taskCount} task${taskCount!==1?'s':''} on <strong>${dateLabel}</strong>?</div>
      ${blockedCount>0?`<div class="gs-warn">Heads up: ${blockedCount} ${blockedCount===1?'property has a guest':'properties have guests'} in house that day. You can still assign, but the work isn't easy without coordinating with the guest.</div>`:''}
      <div class="gs-conf-list">${rows}</div>
    </div>
    <div class="vs-dp-footer">
      <div class="vs-dp-footer-btns" style="width:100%;justify-content:space-between">
        <button class="btn" onclick="_gsCancelConfirm()">Back</button>
        <button class="btn btn-g" onclick='_gsConfirmDate(&quot;${ds}&quot;,${taskIds})'>Schedule ${taskCount}</button>
      </div>
    </div>
  </div>`;
  modal.innerHTML=h;
}

window._gsCancelConfirm=function(){_gsState.view='pick';_gsState.pendingDate=null;_gsRender();};

window._gsConfirmDate=function(ds,taskIds){
  // Lock the buttons to prevent double-submit
  const btns=document.querySelectorAll('.vs-dp-footer-btns button');
  btns.forEach(b=>{b.disabled=true;b.style.opacity='.5';});
  // Mutate tasks: assign date, bump open→scheduled, log change
  const idSet=new Set(taskIds);
  const updated=[];
  tasks.forEach(t=>{
    if(!idSet.has(t.id))return;
    if(t.date)return;          // already dated — skip silently
    if(['complete','resolved_by_guest'].includes(t.status))return;
    t.date=ds;
    if(t.status==='open')t.status='scheduled';
    if(typeof logTaskChange==='function')logTaskChange('group_schedule',t);
    updated.push(t.id);
  });
  if(!updated.length){
    alert('No eligible tasks to schedule.');
    btns.forEach(b=>{b.disabled=false;b.style.opacity='';});
    return;
  }
  saveTasks();
  if(typeof renderAll==='function')renderAll();
  // Flip to success view
  _gsState.scheduledIds=updated;
  _gsState.scheduledDate=ds;
  _gsState.view='success';
  _gsRender();
};

// ── Success view: lists what just got dated, offers text-vendor + assign-all ──
function _gsRenderSuccess(){
  const modal=_gsEnsureModal();
  const ds=_gsState.scheduledDate;
  const idSet=new Set(_gsState.scheduledIds);
  const dated=tasks.filter(t=>idSet.has(t.id));
  const dateLabel=new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  // Group by property
  const propBuckets={};const propOrder=[];
  dated.forEach(t=>{
    if(!propBuckets[t.property]){propBuckets[t.property]={first:t,items:[]};propOrder.push(t.property);}
    propBuckets[t.property].items.push(t);
  });
  // Vendor dropdown options — all vendors, but bubble up vendors matching
  // any of the categories of the scheduled tasks
  const taskCats=new Set();
  dated.forEach(t=>{(t.category||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(c=>taskCats.add(c));});
  const matchVendors=[];const otherVendors=[];
  (vendors||[]).forEach(v=>{
    if(!v.name)return;
    const vCats=Array.isArray(v.categories)?v.categories:[];
    if(vCats.some(c=>taskCats.has(c)))matchVendors.push(v);
    else otherVendors.push(v);
  });
  matchVendors.sort((a,b)=>a.name.localeCompare(b.name));
  otherVendors.sort((a,b)=>a.name.localeCompare(b.name));
  let vendorOpts=`<option value="">— Pick a vendor —</option>`;
  if(matchVendors.length){
    vendorOpts+=`<optgroup label="Matches this category">`;
    matchVendors.forEach(v=>{vendorOpts+=`<option value="${v.name.replace(/"/g,'&quot;')}">${v.name}</option>`;});
    vendorOpts+=`</optgroup>`;
  }
  if(otherVendors.length){
    vendorOpts+=`<optgroup label="Other vendors">`;
    otherVendors.forEach(v=>{vendorOpts+=`<option value="${v.name.replace(/"/g,'&quot;')}">${v.name}</option>`;});
    vendorOpts+=`</optgroup>`;
  }
  let body='';
  propOrder.forEach(pid=>{
    const b=propBuckets[pid];
    const p=getProp(pid);
    const shortName=(p?p.name:pid).replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
    const nbCls=getNbCls(pid);
    const addr=p&&p.address?p.address:'';
    const door=p&&p.door?p.door:'';
    const metaParts=[];
    if(addr)metaParts.push(`<a href="https://maps.google.com/?q=${encodeURIComponent(addr)}" target="_blank">${addr}</a>`);
    if(door)metaParts.push('Code: '+door);
    body+=`<div class="vs-prop-header" style="border-left-color:var(--${nbCls})">
      <div class="vs-prop-name">${shortName}</div>
      ${metaParts.length?`<div class="vs-prop-meta">${metaParts.join(' &middot; ')}</div>`:''}
    </div>
    <div class="vs-success-tasks">`;
    b.items.forEach(t=>{body+=`<div class="vs-success-task">${t.urgent?'<span class="vs-urgent" style="margin-right:6px">Urgent</span>':''}${(t.problem||'').replace(/</g,'&lt;')}${t.vendor?` <span class="gs-task-vendor" style="margin-left:8px">(${t.vendor.replace(/</g,'&lt;')})</span>`:''}</div>`;});
    body+=`</div>`;
  });
  const idsParam=JSON.stringify(_gsState.scheduledIds).replace(/"/g,'&quot;');
  const h=`<div class="vs-dp-panel gs-panel" onclick="event.stopPropagation()">
    <div class="vs-dp-header">
      <div>
        <div class="vs-dp-title"><span style="color:var(--green)">&#x2713;</span> Scheduled</div>
        <div class="vs-dp-sub">${dateLabel}</div>
      </div>
      <button class="vs-dp-close" onclick="closeGroupScheduler()">&times;</button>
    </div>
    <div class="vs-success-body">
      <div class="vs-success-lead">Locked in <strong>${dated.length} task${dated.length!==1?'s':''}</strong> for <strong>${dateLabel}</strong>.</div>
      ${body}
      <div class="gs-vendor-step">
        <div class="gs-vendor-lead">Next: ask a vendor</div>
        <div class="gs-vendor-row">
          <select id="gs-vendor-select" onchange="_gsVendorChanged()">${vendorOpts}</select>
          <button id="gs-text-btn" class="btn" disabled onclick='_gsTextVendor(&quot;${ds}&quot;,${idsParam})'>Text</button>
          <button id="gs-assign-btn" class="btn btn-g" disabled onclick='_gsAssignVendor(${idsParam})'>Assign all</button>
        </div>
        <div class="gs-vendor-hint">Pick a vendor to text the day's plan, or assign once they confirm.</div>
      </div>
    </div>
    <div class="vs-dp-footer">
      <div class="vs-dp-footer-btns" style="width:100%;justify-content:flex-end">
        <button class="btn" onclick="closeGroupScheduler()">Done</button>
      </div>
    </div>
  </div>`;
  modal.innerHTML=h;
}

window._gsVendorChanged=function(){
  const sel=document.getElementById('gs-vendor-select');
  const v=sel?sel.value:'';
  const txt=document.getElementById('gs-text-btn');
  const asg=document.getElementById('gs-assign-btn');
  if(txt){txt.disabled=!v;txt.textContent=v?('Text '+v.split(' ')[0]):'Text';}
  if(asg){asg.disabled=!v;asg.textContent=v?('Assign all to '+v.split(' ')[0]):'Assign all';}
};

window._gsTextVendor=function(ds,taskIds){
  const sel=document.getElementById('gs-vendor-select');
  const vName=sel?sel.value:'';
  if(!vName){alert('Pick a vendor first.');return;}
  const v=(vendors||[]).find(x=>x.name===vName);
  if(!v||!v.phone){alert('No phone number on file for '+vName+'.');return;}
  const tel=String(v.phone).replace(/[^\d+]/g,'');
  const idSet=new Set(taskIds);
  const dated=tasks.filter(t=>idSet.has(t.id));
  // Group by property for the message
  const propGroups={};const propOrder=[];
  dated.forEach(t=>{
    if(!propGroups[t.property]){propGroups[t.property]=[];propOrder.push(t.property);}
    propGroups[t.property].push(t);
  });
  const dateLabel=new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const firstName=vName.split(' ')[0];
  const propLines=propOrder.map(pid=>{
    const p=getProp(pid);
    const propName=p?p.name.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,''):pid;
    const probs=propGroups[pid].map(t=>'  - '+(t.problem||'')).join('\n');
    return propName+':\n'+probs;
  }).join('\n\n');
  const body=`Hi ${firstName} — wanted to bundle these for ${dateLabel}. Can you handle that day?\n\n${propLines}\n\n— Chip`;
  window.location.href='sms:'+tel+'?body='+encodeURIComponent(body);
};

window._gsAssignVendor=function(taskIds){
  const sel=document.getElementById('gs-vendor-select');
  const vName=sel?sel.value:'';
  if(!vName){alert('Pick a vendor first.');return;}
  if(!confirm('Assign '+taskIds.length+' task'+(taskIds.length!==1?'s':'')+' to '+vName+'?'))return;
  const idSet=new Set(taskIds);
  let n=0;
  tasks.forEach(t=>{
    if(!idSet.has(t.id))return;
    t.vendor=vName;
    if(typeof logTaskChange==='function')logTaskChange('group_assign',t);
    n++;
  });
  saveTasks();
  if(typeof renderAll==='function')renderAll();
  if(typeof showToast==='function')showToast(n+' task'+(n!==1?'s':'')+' assigned to '+vName);
  closeGroupScheduler();
};

function bulkDelete(){
  const sel=_getSelectedTasks();if(!sel.length){showToast('No tasks selected');return;}
  if(!confirm('Permanently delete '+sel.length+' task(s)? This cannot be undone.'))return;
  sel.forEach(t=>{logTaskChange('bulk_delete',t);const idx=tasks.indexOf(t);if(idx!==-1)tasks.splice(idx,1);});
  _selectedTasks.clear();
  saveTasks();renderAll();updateBulkBar();
  showToast(sel.length+' task'+(sel.length!==1?'s':'')+' deleted');
}

// ── HOSPITABLE API INTEGRATION ──────────────────────────────
// Replaces the old iCal fetch + parse pipeline.
// Uses the Calendar endpoint which returns day-by-day availability.
// Output shape {start: Date, end: Date, summary: string} is unchanged
// so all downstream consumers (renderDP, getAvail, miniCal, SMS) work as before.

// Convert calendar day-by-day data into reservation blocks {start, end, summary}
function adaptCalendar(data){
  if(!data||!data.data||!data.data.days){
    console.warn('adaptCalendar: unexpected format',data?Object.keys(data):'null');
    return[];
  }
  const days=data.data.days;
  const evs=[];
  let blockStart=null;
  const pd=s=>{const m=s.match(/(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3],12,0,0):null;};
  // Walk through days, group consecutive RESERVED days into blocks
  for(let i=0;i<days.length;i++){
    const d=days[i];
    const isReserved=d.status&&d.status.reason==='RESERVED';
    if(isReserved&&!blockStart){
      blockStart=d.date; // start a new block
    } else if(!isReserved&&blockStart){
      // End the block — checkout is this day
      const ci=pd(blockStart),co=pd(d.date);
      // If this block started on the very first day of calendar data,
      // the guest likely checked in before today — push start back 1 day
      // so dayState sees this as mid-stay, not a false check-in
      if(ci&&co){
        const isFirstDay=blockStart===days[0].date;
        const adjStart=isFirstDay?new Date(ci.getTime()-86400000):ci;
        evs.push({start:adjStart,end:co,summary:'Guest'});
      }
      blockStart=null;
    }
  }
  // If still in a block at the end, close it at the last day + 1
  if(blockStart){
    const ci=pd(blockStart);
    const lastDay=pd(days[days.length-1].date);
    if(ci&&lastDay){
      const co=new Date(lastDay);co.setDate(co.getDate()+1);
      const isFirstDay=blockStart===days[0].date;
      const adjStart=isFirstDay?new Date(ci.getTime()-86400000):ci;
      evs.push({start:adjStart,end:co,summary:'Guest'});
    }
  }
  console.log(`adaptCalendar: ${evs.length} reservation blocks from ${days.length} days`);
  return evs;
}

async function fetchIcal(pid){
  if(icalCache[pid]&&icalCache[pid]!=='error')return icalCache[pid];
  const hospId=HOSPITABLE_IDS[pid];
  if(!hospId){console.warn(`No Hospitable ID for property "${pid}"`);return[];}
  // Try reservations endpoint first (gives individual bookings with separate check-in/out dates)
  // Fall back to calendar endpoint if reservations fails
  const pd=s=>{const m=(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3],12,0,0):null;};
  try{
    const resUrl=`${PROXY_BASE}/api/hospitable?action=reservations&pid=${hospId}`;
    console.log(`Fetching reservations for ${pid} (hospitable id: ${hospId.slice(0,8)}...)`);
    const r=await fetch(resUrl,{signal:AbortSignal.timeout(15000)});
    if(r.ok){
      const json=await r.json();
      if(json.data&&Array.isArray(json.data)&&json.data.length>0){
        // Build a lookup map from included guest data (Hospitable uses JSON:API includes)
        const guestMap={};
        if(json.included&&Array.isArray(json.included)){
          json.included.filter(inc=>inc.type==='guests'||inc.type==='guest').forEach(g=>{
            guestMap[g.id]={phone:g.attributes?.phone||g.attributes?.phone_number||null,email:g.attributes?.email||null,name:g.attributes?.name||[g.attributes?.first_name,g.attributes?.last_name].filter(Boolean).join(' ')||null};
          });
        }
        const evs=json.data
          .filter(rv=>rv.arrival_date&&rv.departure_date&&rv.status!=='cancelled')
          .map(rv=>{
            // Try multiple paths for guest phone: inline guest object, included data, or top-level fields
            const guestRel=rv.relationships?.guest?.data;
            const inclGuest=guestRel?guestMap[guestRel.id]:null;
            // phone_numbers is an array in Hospitable API v2
            const phoneArr=rv.guest?.phone_numbers||[];
            const gPhone=phoneArr[0]||rv.guest?.phone||rv.guest_phone||inclGuest?.phone||null;
            const gEmail=rv.guest?.email||rv.guest_email||inclGuest?.email||null;
            const gName=rv.guest_name||rv.guest?.name||(rv.guest?.first_name?rv.guest.first_name+' '+rv.guest.last_name:null)||inclGuest?.name||'Guest';
            return{
            start:pd(rv.arrival_date),
            end:pd(rv.departure_date),
            summary:gName,
            reservationId:rv.id||null,
            guestPhone:gPhone,
            guestEmail:gEmail,
            platform:rv.platform||rv.source||null
          };})
          .filter(ev=>ev.start&&ev.end)
          .filter(ev=>ev.start&&ev.end);
        console.log(`Loaded ${pid}: ${evs.length} individual reservations via API`);
        icalCache[pid]=evs;return evs;
      }
    }
  }catch(e){console.warn(`Reservations endpoint failed for ${pid}, trying calendar:`,e.message);}
  // Fallback to calendar endpoint
  try{
    const url=`${PROXY_BASE}/api/hospitable?action=calendar&pid=${hospId}`;
    console.log(`Fetching calendar for ${pid} (fallback)`);
    const r=await fetch(url,{signal:AbortSignal.timeout(15000)});
    if(!r.ok){
      const detail=await r.text().catch(()=>'');
      console.error(`Hospitable API ${r.status} for ${pid}: ${detail.slice(0,200)}`);
      icalCache[pid]='error';return'error';
    }
    const json=await r.json();
    const evs=adaptCalendar(json);
    console.log(`Loaded ${pid}: ${evs.length} reservation blocks via calendar fallback`);
    icalCache[pid]=evs;return evs;
  }catch(e){
    console.error(`Hospitable API failed for ${pid}: ${e.message}`);
    icalCache[pid]='error';return'error';
  }
}
function getAvail(evs,start,days){
  const res=[];
  for(let i=0;i<days;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const dStr=d.toDateString();
    let st='available';
    for(const ev of evs){
      const co=new Date(ev.end);const ci=new Date(ev.start);
      if(dStr===co.toDateString()){st='checkout';break;}
      if(d>=ci&&d<co){st='booked';break;}
    }
    res.push({date:d,status:st});
  }
  return res;
}

// DATE PICKER
async function toggleDP(px){
  const popup=document.getElementById(px+'-dp-popup');
  if(popup.style.display!=='none'){popup.style.display='none';return;}
  document.querySelectorAll('.dp-popup').forEach(p=>p.style.display='none');
  const pid=px==='f'?document.getElementById('f-property').value:px==='b'?_bulkCalProp:(tasks.find(t=>t.id===detailId)||{}).property;
  if(!pid){popup.innerHTML='<div class="dp-noprop">Please select a property first.</div>';popup.style.display='block';return;}
  // Only clear cache if it previously errored, so we retry on failure but reuse good data
  if(icalCache[pid]==='error')delete icalCache[pid];
  const prop=getProp(pid);
  popup.innerHTML=`<div class="dp-load">Loading ${prop?prop.name:pid}...</div>`;popup.style.display='block';
  const evs=await fetchIcal(pid);
  const cur=document.getElementById(px+'-date').value;
  if(evs==='error'||!Array.isArray(evs)){
    renderDP(px,[],cur,null,true);return;
  }
  renderDP(px,evs,cur);
}
function renderDP(px,evs,selVal,vd,fetchFailed){
  const popup=document.getElementById(px+'-dp-popup');
  if(!vd)vd=selVal?new Date(selVal+'T12:00:00'):new Date();
  const y=vd.getFullYear(),mo=vd.getMonth();
  const first=new Date(y,mo,1),last=new Date(y,mo+1,0);
  const today=new Date();today.setHours(12,0,0,0);
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Build reservation list with local-noon dates
  const res=[];
  if(Array.isArray(evs)){
    evs.forEach(ev=>{
      const ci=new Date(ev.start);ci.setHours(12,0,0,0);
      const co=new Date(ev.end);co.setHours(12,0,0,0);
      res.push({ci,co,name:ev.summary||''});
    });
  }

  // Helper: given a date, return its booking state
  // Scan ALL reservations first to collect flags, then decide
  function dayState(d){
    const ds=d.toDateString();
    let hasCheckout=false, hasCheckin=false, isMidStay=false;
    for(const r of res){
      if(ds===r.co.toDateString()) hasCheckout=true;
      if(ds===r.ci.toDateString()) hasCheckin=true;
      if(d>r.ci&&d<r.co) isMidStay=true;
    }
    if(hasCheckout&&hasCheckin) return'turn';
    if(isMidStay) return'booked';
    if(hasCheckin) return'checkin';
    if(hasCheckout) return'checkout';
    return'available';
  }

  // Build weeks grid
  const sc=first.getDay();
  const tot=Math.ceil((sc+last.getDate())/7)*7;
  const weeks=[];let wk=[];
  for(let i=0;i<tot;i++){
    const dn=i-sc+1;
    const d=new Date(y,mo,dn,12,0,0);
    wk.push({dn,d,isOther:dn<1||dn>last.getDate()});
    if(wk.length===7){weeks.push(wk);wk=[];}
  }

  let h=`<div class="dp-phdr"><div class="dp-ptitle">${MONTHS[mo]} ${y}</div><div class="dp-pnav"><button onclick="dpNav('${px}',-1,${y},${mo})">&#x2190;</button><button onclick="dpNav('${px}',1,${y},${mo})">&#x2192;</button></div></div>`;
  h+=`<div class="dp-cal-wrap"><div class="dp-dow-row">`;
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=>h+=`<div class="dp-dow">${d}</div>`);
  h+=`</div>`;

  const COL_PCT=100/7; // ~14.285% per column

  weeks.forEach(wk=>{
    const wkStart=wk[0].d;
    const wkEnd=new Date(wk[6].d.getFullYear(),wk[6].d.getMonth(),wk[6].d.getDate()+1,12,0,0);

    h+=`<div class="dp-week-row">`;

    // Render day cells (no booking background classes — bars handle that)
    wk.forEach(({dn,d,isOther})=>{
      if(isOther){h+=`<div class="dp-cell dp-other"></div>`;return;}
      const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const isSel=selVal===ds;
      const isPast=d<today&&d.toDateString()!==today.toDateString();
      const isToday=d.toDateString()===today.toDateString();
      const st=dayState(d);
      const isGuestInHouse=st==='booked';
      // Allow past dates when editing a completed task (retroactive fix dates)
      const allowPast=px==='d'&&detailId&&tasks.find(x=>x.id===detailId&&isDone(x));
      let cls='dp-cell';
      if(isToday)cls+=' dp-today-cell';
      if(isSel)cls+=' dp-selected';
      const dnCls='dp-dn'+(isToday?' dp-today-num':'');
      const warn=isGuestInHouse?',true':'';
      const click=(!isPast||allowPast)?`onclick="selDate('${px}','${ds}'${warn})"`:'' ;
      h+=`<div class="${cls}" ${click}><div class="${dnCls}">${dn}</div></div>`;
    });

    // Render reservation bars overlaying this week row
    // Each bar runs from MIDPOINT of check-in cell to MIDPOINT of checkout cell.
    // On turn days both bars meet exactly at the cell midpoint — diagonal clips create a clean V-gap.
    res.forEach(r=>{
      if(r.ci>=wkEnd||r.co<=wkStart) return;

      const barStart=r.ci<wkStart?wkStart:r.ci;
      const barEnd=r.co>wkEnd?wkEnd:r.co;

      const msPerDay=86400000;
      const startCol=Math.round((barStart.getTime()-wkStart.getTime())/msPerDay);
      const endCol=Math.round((barEnd.getTime()-wkStart.getTime())/msPerDay);
      if(endCol<=startCol) return;

      const isFirst=r.ci>=wkStart; // actual check-in in this week
      const isLast=r.co<=wkEnd;    // actual checkout in this week

      // Midpoint positioning: start at midpoint of check-in cell, end at midpoint of checkout cell
      let left=isFirst?(startCol+0.5)*COL_PCT:0;
      let right=isLast?Math.min((endCol+0.5)*COL_PCT,100):100;
      let width=right-left;
      if(width<=0) return;

      let cls='dp-res-bar';
      if(isFirst) cls+=' dp-bar-start';
      if(isLast) cls+=' dp-bar-end';

      h+=`<div class="${cls}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%"><span class="dp-res-name">${r.name}</span></div>`;
    });

    h+=`</div>`;
  });

  h+=`</div>`;
  if(fetchFailed){
    h+=`<div style="background:#fdf0ee;border:1px solid #e8c0bb;border-radius:8px;padding:9px 12px;margin-top:8px;font-size:.76rem;color:#7a2019">
      <strong>Booking data unavailable.</strong> You can still pick a date, but booking info won't be shown.
      <span style="display:block;margin-top:4px;font-size:.68rem;color:var(--text3)">Check the browser console (F12) for details.</span>
    </div>`;
  }
  h+=`<div class="dp-warn" id="${px}-dp-warn"><strong>⚠ Guests are in house on this day.</strong> Service is not recommended while guests are present. Consider a checkout day (after 10am) or check-in day (before 4pm) instead.<div class="dp-warn-btns"><button class="btn btn-gold" onclick="confirmBookedDate('${px}')">Schedule Anyway</button><button class="btn" onclick="cancelBookedDate('${px}')">Pick Another Day</button></div></div>`;
  // Clear-date footer — only on detail modal picker when a date is currently set.
  // Clearing reverts the task to the undated 'open' state so it flows back into
  // the vendor's "Needs Your Schedule" bucket (or admin can pick a new date).
  if(px==='d'&&selVal){
    h+=`<div class="dp-clear-row"><button type="button" class="dp-clear-btn" onclick="clearDate('d')">&#x2715; Clear date</button></div>`;
  }
  popup.innerHTML=h;
}
async function dpNav(px,dir,y,m){
  const nd=new Date(y,m+dir,1);
  const pid=px==='f'?document.getElementById('f-property').value:px==='b'?_bulkCalProp:(tasks.find(t=>t.id===detailId)||{}).property;
  // If cache is missing or errored, try to fetch rather than showing empty calendar
  let evs=icalCache[pid];
  if(!evs||evs==='error'){
    const popup=document.getElementById(px+'-dp-popup');
    const cur=document.getElementById(px+'-date').value;
    popup.innerHTML='<div class="dp-load">Loading...</div>';
    evs=await fetchIcal(pid);
    if(evs==='error')evs=[];
  }
  renderDP(px,Array.isArray(evs)?evs:[],document.getElementById(px+'-date').value,nd);
}
let pendingBookedDate={px:null,ds:null};
function selDate(px,ds,isBooked=false){
  if(isBooked){
    // Store pending date and show warning — don't close popup yet
    pendingBookedDate={px,ds};
    const warn=document.getElementById(px+'-dp-warn');
    if(warn){warn.classList.add('show');warn.scrollIntoView({behavior:'smooth',block:'nearest'});}
    return;
  }
  applyDate(px,ds);
}
function applyDate(px,ds){
  document.getElementById(px+'-date').value=ds;
  const disp=document.getElementById(px+'-dp-display');
  disp.textContent=fmtDate(ds);disp.className='';
  document.getElementById(px+'-dp-btn').classList.add('has-val');
  document.getElementById(px+'-dp-popup').style.display='none';
  if(px==='d'){updateField('date',ds);checkCombine();}
  if(px==='b'){_bulkSelectedDate=ds;}
}
function confirmBookedDate(px){
  if(pendingBookedDate.px===px)applyDate(px,pendingBookedDate.ds);
  pendingBookedDate={px:null,ds:null};
}
function cancelBookedDate(px){
  pendingBookedDate={px:null,ds:null};
  const warn=document.getElementById(px+'-dp-warn');
  if(warn)warn.classList.remove('show');
}
// Clear the currently-set date on the detail-modal task. Reverts status from
// 'scheduled' back to 'open' so the task returns to the undated bucket;
// leaves in_progress/complete/resolved_by_guest alone. Vendor stays assigned.
async function clearDate(px){
  if(px!=='d')return;
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.date='';
  if(t.status==='scheduled')t.status='open';
  // Sync the hidden input + picker display so the modal matches immediately
  document.getElementById('d-date').value='';
  const disp=document.getElementById('d-dp-display');
  disp.textContent='Select a date...';disp.className='dp-ph';
  document.getElementById('d-dp-btn').classList.remove('has-val');
  document.getElementById('d-dp-popup').style.display='none';
  document.getElementById('d-status').value=t.status;
  await saveTasks();
  renderDetailBadges(t);
  checkCombine();
  renderAll();
  showToast('Date cleared — back to unscheduled.');
}
document.addEventListener('click',e=>{
  // If the clicked element was removed from the DOM (e.g. by dpNav re-rendering), don't close the popup
  if(!e.target.isConnected)return;
  if(!e.target.closest('.dp-wrap'))document.querySelectorAll('.dp-popup').forEach(p=>p.style.display='none');
});

// CALENDAR
/* Sort tasks by neighborhood name then property id — matches SMS/vendor-day order */
function sortByNbProp(taskList){
  return[...taskList].sort((a,b)=>{
    const nbA=getNb(a.property),nbB=getNb(b.property);
    const nA=nbA?nbA.name:'zzz',nB=nbB?nbB.name:'zzz';
    if(nA!==nB)return nA.localeCompare(nB);
    return(a.property||'').localeCompare(b.property||'');
  });
}
/* Render a vendor group pill for the weekly view — sorted by neighborhood with color-coded sections */
function buildVgWeek(vg,ds){
  const hasUrg=vg.tasks.some(t=>t.urgent);const firstName=vg.name.split(' ')[0];
  const sorted=sortByNbProp(vg.tasks);
  // Property label + neighborhood color (used by both desktop and mobile layouts)
  const propIds=[...new Set(vg.tasks.map(t=>t.property))];
  const propLabel=propIds.length===1?(()=>{const p=getProp(propIds[0]);return p?p.name.split(' - ').pop():propIds[0];})():`${propIds.length} prop.`;
  const nbCls=[...new Set(vg.tasks.map(t=>getNbCls(t.property)).filter(Boolean))];
  const hdrNc=nbCls.length===1?nbCls[0]:null;
  const _nbColorMap={prc:'var(--prc)',umc:'var(--umc)',gatlinburg:'var(--gatlinburg)',alpine:'var(--alpine)',sevierville:'var(--sevierville)',hillside:'var(--hillside)'};
  const hdrBg=hdrNc&&_nbColorMap[hdrNc]?_nbColorMap[hdrNc]:'var(--green)';
  let h=`<div class="vg-week-wrap ${hasUrg?'urg':''}" style="background:${hdrBg}" onclick="openVendorDay('${vg.name.replace(/'/g,"\\'")}','${ds}')">`;
  // Desktop layout: header bar + task rows
  h+=`<div class="vg-week-desktop">`;
  h+=`<div class="vg-week-hdr"><span class="vg-week-name">${firstName}</span><span class="vg-week-count">${vg.tasks.length} job${vg.tasks.length!==1?'s':''}</span></div>`;
  let lastNbName='';
  sorted.forEach(t=>{
    const nc=getNbCls(t.property);const nb=getNb(t.property);const nbName=nb?nb.name:'Other';
    const p=getProp(t.property);const sh=p?p.name.split(' - ').pop():t.property;
    if(nbName!==lastNbName){lastNbName=nbName;h+=`<div class="vg-week-nb-hdr vg-t-${nc}">${nbName}</div>`;}
    h+=`<div class="vg-week-task vg-t-${nc}"><div class="vg-week-task-prop">${sh}</div><div class="vg-week-task-desc">${t.problem}</div></div>`;
  });
  h+=`</div>`; // close vg-week-desktop
  // Mobile layout: 3 compact lines — name / property / job count
  h+=`<div class="vg-week-mobile"><div class="vgm-name">${firstName}</div><div class="vgm-prop">${propLabel}</div><div class="vgm-count">${vg.tasks.length} job${vg.tasks.length!==1?'s':''}</div></div>`;
  return h+'</div>';
}
/* Render a vendor group pill for the monthly view — sorted by neighborhood with color-coded sections */
function buildVgMonth(vg,ds){
  const hasUrg=vg.tasks.some(t=>t.urgent);const firstName=vg.name.split(' ')[0];
  const sorted=sortByNbProp(vg.tasks);
  let h=`<div class="vg-month-wrap ${hasUrg?'urg':''}" onclick="openVendorDay('${vg.name.replace(/'/g,"\\'")}','${ds}')">`;
  h+=`<div class="vg-month-hdr"><span class="vg-month-name">${firstName}</span><span class="vg-month-count">${vg.tasks.length}</span></div>`;
  let lastNbName='';
  sorted.forEach(t=>{
    const nc=getNbCls(t.property);const nb=getNb(t.property);const nbName=nb?nb.name:'Other';
    const p=getProp(t.property);const sh=p?p.name.split(' - ').pop():t.property;
    if(nbName!==lastNbName){lastNbName=nbName;h+=`<div class="vg-month-nb-hdr vg-t-${nc}">${nbName}</div>`;}
    h+=`<div class="vg-month-task vg-t-${nc}"><span class="vg-mt-prop">${sh}:</span> ${t.problem}</div>`;
  });
  return h+'</div>';
}
let selectedDay=null; // currently selected day in the 3-week calendar (YYYY-MM-DD string)
function renderCalendar(){
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MNS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today=new Date();
  const ws=wkStart(today); // Start from THIS week's Sunday

  let h='';
  for(let wk=0;wk<3;wk++){
    const weekStart=new Date(ws);weekStart.setDate(ws.getDate()+wk*7);
    const weekEnd=new Date(weekStart);weekEnd.setDate(weekStart.getDate()+6);
    const wLabel=wk===0?'This Week':wk===1?'Next Week':'Week After';
    const wRange=weekStart.getMonth()===weekEnd.getMonth()
      ?`${MN[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}`
      :`${MNS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MNS[weekEnd.getMonth()]} ${weekEnd.getDate()}`;

    h+=`<div class="tw-week ${wk===0?'tw-current':''}" style="margin-bottom:${wk<2?'12px':'0'}">`;
    h+=`<div class="tw-week-hdr"><span class="tw-week-label">${wLabel}</span><span class="tw-week-range">${wRange}</span></div>`;
    h+=`<div class="wk-grid"><div class="wk-hrow">`;
    for(let i=0;i<7;i++){
      const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);
      const isT=d.toDateString()===today.toDateString();
      h+=`<div class="wk-hcell ${isT?'tdc':''}"><div class="wd">${DOW[d.getDay()]}</div><div class="wdt">${MNS[d.getMonth()]} ${d.getDate()}</div></div>`;
    }
    h+=`</div><div class="wk-brow">`;
    for(let i=0;i<7;i++){
      const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);
      const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const isT=d.toDateString()===today.toDateString();
      const isSel=ds===selectedDay;
      const isPast=d<today&&!isT;
      h+=`<div class="wk-day ${isT?'tw-today':''} ${isSel?'tw-sel':''} ${isPast?'tw-past':''}" onclick="selectDay('${ds}')" style="cursor:pointer">`;
      const wkDayTasks=tasks.filter(t=>t.date===ds&&!isDone(t));
      const wkVendorGroups={};const wkUngrouped=[];
      wkDayTasks.forEach(t=>{
        if(t.vendor){const vk=t.vendor.toLowerCase();if(!wkVendorGroups[vk])wkVendorGroups[vk]={name:t.vendor,tasks:[]};wkVendorGroups[vk].tasks.push(t);}
        else wkUngrouped.push(t);
      });
      Object.values(wkVendorGroups).forEach(vg=>{
        if(vg.tasks.length>=2){ h+=buildVgWeek(vg,ds); }
        else { vg.tasks.forEach(t=>{const nc=getNbCls(t.property);const p=getProp(t.property);h+=`<div class="de de-${nc} ${t.urgent?'urg':''} ${t.recurring?'rec':''}" onclick="event.stopPropagation();openDetail('${t.id}')"><div class="de-prop">${p?p.name.split(' - ').pop():''}</div><div class="de-title">${t.problem}</div>${t.vendor?`<div class="de-cat">${t.vendor}</div>`:''}</div>`;}); }
      });
      wkUngrouped.forEach(t=>{const nc=getNbCls(t.property);const p=getProp(t.property);
        h+=`<div class="de de-${nc} ${t.urgent?'urg':''} ${t.recurring?'rec':''}" onclick="event.stopPropagation();openDetail('${t.id}')"><div class="de-prop">${p?p.name.split(' - ').pop():''}</div><div class="de-title">${t.problem}</div>${t.vendor?`<div class="de-cat">${t.vendor}</div>`:''}</div>`;
      });
      if(showDone){
        tasks.filter(t=>t.date===ds&&isDone(t)).forEach(t=>{
          const nc=getNbCls(t.property);const p=getProp(t.property);
          h+=`<div class="de de-${nc} done" onclick="event.stopPropagation();openDetail('${t.id}')"><div class="de-prop">${p?p.name.split(' - ').pop():''}</div><div class="de-title" style="text-decoration:line-through;opacity:.6"><span style="color:var(--green);margin-right:3px">&#x2713;</span>${t.problem}</div></div>`;
        });
      }
      recurring.filter(r=>r.nextDue===ds).forEach(r=>{
        const pids=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;
        const alreadyScheduled=tasks.some(x=>x.recurring&&x.problem===r.name&&x.date===ds&&pids.some(pid=>x.property===pid));
        if(alreadyScheduled)return;
        const nc=pids.length===1?getNbCls(pids[0]):'other';
        h+=`<div class="de de-${nc} rec sug"><div class="de-prop">Recurring</div><div class="de-title">${r.name}</div></div>`;
      });
      h+=`</div>`;
    }
    h+=`</div></div></div>`;
  }
  document.getElementById('cal-container').innerHTML=h;

  const leg=NBS.map(nb=>`<div class="cli"><div class="cld" style="background:var(--${nb.cls})"></div>${nb.name}</div>`).join('');
  document.getElementById('cal-legend').innerHTML=leg
    +'<div class="cli"><div class="cld" style="background:var(--border);border:1px dashed var(--border-dark)"></div>Suggested</div>'
    +'<div class="cli"><div class="cld" style="background:var(--red);outline:2px solid var(--red)"></div>Urgent</div>';

  // Refresh day detail panel if a day is selected
  if(selectedDay)renderDayDetail(selectedDay);
}

function selectDay(ds){
  selectedDay=selectedDay===ds?null:ds;
  renderCalendar();
  if(selectedDay)renderDayDetail(ds);
  else closeDayDetail();
}

function renderDayDetail(ds){
  const panel=document.getElementById('day-detail-panel');
  const d=new Date(ds+'T12:00:00');
  const DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('day-detail-title').textContent=`${DOW[d.getDay()]}, ${MN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const dayTasks=tasks.filter(t=>t.date===ds&&(showDone||!isDone(t)));
  if(!dayTasks.length){
    document.getElementById('day-detail-tasks').innerHTML='<div style="font-size:.84rem;color:var(--text2);padding:8px 0">No tasks scheduled for this day.</div>';
  } else {
    let h='<div style="display:flex;flex-direction:column;gap:8px">';
    dayTasks.forEach(t=>{
      const p=getProp(t.property);const nb=getNb(t.property);
      const plcls=nb?'pl-'+nb.cls:'';const nbcls=nb?'nb-'+nb.cls:'';
      const tDone=isDone(t);
      h+=`<div class="tc ${nbcls} ${tDone?'done':''}" onclick="openDetail('${t.id}')" style="cursor:pointer">
        <div class="tc-top"><div class="${t.urgent?'udot':'tdot dot-'+t.status}"></div><div class="tmain">
          <div class="tprop ${plcls}">${p?p.name:t.property}</div>
          <div class="tprob">${t.problem}</div>
          <div class="tmeta">
            ${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}
            <span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>
            ${t.vendor?`<span class="tmi">${t.vendor}</span>`:''}
            ${taskEffectivePurchaseNote(t)?`<span style="font-size:.62rem;color:#e65100;font-weight:600;background:#fff3e0;padding:1px 6px;border-radius:10px;border:1px solid #ffcc80">&#x1F6D2; ${t.purchaseStatus==='delivered'?'Delivered':t.purchaseStatus==='purchased'?'Purchased — deliver':'Buy'}${taskEffectivePurchaser(t)==='vendor'?' (vendor)':''}</span>`:''}
          </div>
        </div></div></div>`;
    });
    h+='</div>';
    document.getElementById('day-detail-tasks').innerHTML=h;
  }
  panel.style.display='';
}

function closeDayDetail(){
  selectedDay=null;
  document.getElementById('day-detail-panel').style.display='none';
  // Remove selection highlight from calendar
  document.querySelectorAll('.tw-sel').forEach(el=>el.classList.remove('tw-sel'));
}
function buildMonth(){
  const y=calDate.getFullYear(),m=calDate.getMonth();
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  const today=new Date();let h='<div class="cal-grid">';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>h+=`<div class="cal-head-cell"><span class="dow-full">${d}</span><span class="dow-short">${d[0]}</span></div>`);
  const tot=Math.ceil((first.getDay()+last.getDate())/7)*7;
  for(let i=0;i<tot;i++){
    const dn=i-first.getDay()+1;const d=new Date(y,m,dn);
    const isT=d.toDateString()===today.toDateString();const isO=dn<1||dn>last.getDate();
    h+=`<div class="cal-cell ${isO?'om':''} ${isT?'td':''}">`;
    if(!isO){
      h+=`<div class="cdn ${isT?'today':''}">${dn}</div>`;
      const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(dn).padStart(2,'0')}`;
      const dayTasks=tasks.filter(t=>t.date===ds&&!isDone(t));
      // Group tasks by vendor for same-day dispatch indicators
      const vendorGroups={};const ungrouped=[];
      dayTasks.forEach(t=>{
        if(t.vendor){const vk=t.vendor.toLowerCase();if(!vendorGroups[vk])vendorGroups[vk]={name:t.vendor,tasks:[]};vendorGroups[vk].tasks.push(t);}
        else ungrouped.push(t);
      });
      // Render vendor groups (2+ tasks = expanded pill, 1 task = normal)
      Object.values(vendorGroups).forEach(vg=>{
        if(vg.tasks.length>=2){
          h+=buildVgMonth(vg,ds);
        } else {
          vg.tasks.forEach(t=>{const nc=getNbCls(t.property);const p=getProp(t.property);const sh=p?p.name.split(' - ').pop():t.property;h+=`<div class="ce ce-${nc} ${t.urgent?'urg':''} ${t.recurring?'rec':''}" onclick="openDetail('${t.id}')" title="${t.problem}">${sh}: ${t.problem}</div>`;});
        }
      });
      // Render unassigned tasks normally
      ungrouped.forEach(t=>{
        const nc=getNbCls(t.property);const p=getProp(t.property);const sh=p?p.name.split(' - ').pop():t.property;
        h+=`<div class="ce ce-${nc} ${t.urgent?'urg':''} ${t.recurring?'rec':''}" onclick="openDetail('${t.id}')" title="${t.problem}">${sh}: ${t.problem}</div>`;
      });
      // Completed tasks (only when showDone toggle is on)
      if(showDone){
        tasks.filter(t=>t.date===ds&&isDone(t)).forEach(t=>{
          const nc=getNbCls(t.property);const p=getProp(t.property);const sh=p?p.name.split(' - ').pop():t.property;
          h+=`<div class="ce ce-${nc} done" onclick="openDetail('${t.id}')" title="${t.problem} (completed)"><span class="ce-check">&#x2713;</span>${sh}: ${t.problem}</div>`;
        });
      }
      recurring.filter(r=>r.nextDue===ds).forEach(r=>{
        const pids=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;
        // Skip if a real task already exists for this recurring item on this date
        const alreadyScheduled=tasks.some(x=>x.recurring&&x.problem===r.name&&x.date===ds&&pids.some(pid=>x.property===pid));
        if(alreadyScheduled)return;
        const nc=pids.length===1?getNbCls(pids[0]):'other';
        h+=`<div class="ce ce-${nc} rec sug" title="${r.name} (recurring — go to Recurring tab to generate)" style="cursor:default">${r.name}</div>`;
      });
    }
    h+='</div>';
  }
  return h+'</div>';
}
const wkStart=d=>{const s=new Date(d);s.setDate(d.getDate()-d.getDay());return s;};
function buildWeek(ws){
  const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];const MNS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today=new Date();
  let h='<div class="wk-grid"><div class="wk-hrow">';
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const isT=d.toDateString()===today.toDateString();h+=`<div class="wk-hcell ${isT?'tdc':''}"><div class="wd">${DOW[d.getDay()]}</div><div class="wdt">${MNS[d.getMonth()]} ${d.getDate()}</div></div>`;}
  h+='</div><div class="wk-brow">';
  for(let i=0;i<7;i++){
    const d=new Date(ws);d.setDate(ws.getDate()+i);
    const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    h+='<div class="wk-day">';
    const wkDayTasks=tasks.filter(t=>t.date===ds&&!isDone(t));
    const wkVendorGroups={};const wkUngrouped=[];
    wkDayTasks.forEach(t=>{
      if(t.vendor){const vk=t.vendor.toLowerCase();if(!wkVendorGroups[vk])wkVendorGroups[vk]={name:t.vendor,tasks:[]};wkVendorGroups[vk].tasks.push(t);}
      else wkUngrouped.push(t);
    });
    Object.values(wkVendorGroups).forEach(vg=>{
      if(vg.tasks.length>=2){
        h+=buildVgWeek(vg,ds);
      } else {
        vg.tasks.forEach(t=>{const nc=getNbCls(t.property);const p=getProp(t.property);h+=`<div class="de de-${nc} ${t.urgent?'urg':''} ${t.recurring?'rec':''}" onclick="openDetail('${t.id}')"><div class="de-prop">${p?p.name.split(' - ').pop():''}</div><div class="de-title">${t.problem}</div>${t.vendor?`<div class="de-cat">${t.vendor}</div>`:''}</div>`;});
      }
    });
    wkUngrouped.forEach(t=>{const nc=getNbCls(t.property);const p=getProp(t.property);
      h+=`<div class="de de-${nc} ${t.urgent?'urg':''} ${t.recurring?'rec':''}" onclick="openDetail('${t.id}')"><div class="de-prop">${p?p.name.split(' - ').pop():''}</div><div class="de-title">${t.problem}</div>${t.vendor?`<div class="de-cat">${t.vendor}</div>`:''}</div>`;
    });
    // Completed tasks (only when showDone toggle is on)
    if(showDone){
      tasks.filter(t=>t.date===ds&&isDone(t)).forEach(t=>{
        const nc=getNbCls(t.property);const p=getProp(t.property);
        h+=`<div class="de de-${nc} done" onclick="openDetail('${t.id}')"><div class="de-prop">${p?p.name.split(' - ').pop():''}</div><div class="de-title" style="text-decoration:line-through;opacity:.6"><span style="color:var(--green);margin-right:3px">&#x2713;</span>${t.problem}</div></div>`;
      });
    }
    recurring.filter(r=>r.nextDue===ds).forEach(r=>{
      const pids=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;
      // Skip if a real task already exists for this recurring item on this date
      const alreadyScheduled=tasks.some(x=>x.recurring&&x.problem===r.name&&x.date===ds&&pids.some(pid=>x.property===pid));
      if(alreadyScheduled)return;
      const nc=pids.length===1?getNbCls(pids[0]):'other';
      h+=`<div class="de de-${nc} rec sug"><div class="de-prop">Recurring</div><div class="de-title">${r.name}</div></div>`;
    });
    h+='</div>';
  }
  h+='</div>';
  const uns=tasks.filter(t=>!t.date&&t.status==='open');
  if(uns.length){
    h+=`<div class="wk-sug"><div class="wk-sug-t">Awaiting Scheduling (${uns.length})</div><div class="wk-sug-items">`;
    uns.forEach(t=>{const p=getProp(t.property);const nc=getNbCls(t.property);h+=`<div class="ce ce-${nc} sug" style="max-width:190px;white-space:normal" onclick="openDetail('${t.id}')">${p?p.name.split(' - ').pop():''}: ${t.problem.substring(0,26)}${t.problem.length>26?'...':''}</div>`;});
    h+='</div></div>';
  }
  return h+'</div>';
}
// Legacy calendar nav — kept for compatibility (month/week views removed, now 3-week rolling)
function calPrev(){renderCalendar();}
function calNext(){renderCalendar();}
function calToday(){renderCalendar();}
function setCalMode(){renderCalendar();}

// RECURRING
function renderRecurring(){
  const c=document.getElementById('rec-container');
  if(!recurring.length){c.innerHTML='<div class="empty">No recurring tasks.</div>';return;}
  const FL={monthly:'Monthly',quarterly:'Quarterly',biannual:'Twice a Year',annual:'Annual',biennial:'Every 2 Years'};
  const grps={monthly:[],quarterly:[],biannual:[],annual:[],biennial:[]};
  recurring.forEach(r=>{if(grps[r.frequency])grps[r.frequency].push(r);});
  let h='';
  Object.entries(grps).forEach(([freq,items])=>{
    if(!items.length)return;
    h+=`<div class="rec-sec"><h3>${FL[freq]||freq}</h3><div class="rec-list">`;
    items.forEach(r=>{
      const pn=r.properties.includes('all')?'All Properties':r.properties.map(id=>{const p=getProp(id);return p?p.name.split(' - ').pop():id;}).join(', ');
      h+=`<div class="rc"><div class="rc-left">
        <div class="rc-name">${r.name}</div>
        <div class="rc-meta">${pn}</div>
        ${r.vendor?`<div class="rc-meta" style="margin-top:2px">${r.vendor}</div>`:''}
        ${r.notes?`<div style="font-size:.7rem;color:var(--text3);margin-top:3px">${r.notes.substring(0,85)}${r.notes.length>85?'...':''}</div>`:''}
        ${r.nextDue?`<div class="rc-next">Next due: <strong>${r.nextDue}</strong></div>`:''}
      </div><div class="rc-actions">
        <span class="freq-b">${FL[r.frequency]||r.frequency}</span>
        <button class="btn btn-g" onclick="openLogTask('${r.id}')">Log Task</button>
        <button class="btn" style="font-size:.7rem" onclick="genFromRec('${r.id}')">Generate Task</button>
        <button class="btn" style="font-size:.7rem" onclick="editRec('${r.id}')">Edit</button>
        <button class="btn btn-red" style="font-size:.7rem" onclick="delRec('${r.id}')">Remove</button>
      </div></div>`;
    });
    h+='</div></div>';
  });
  c.innerHTML=h;
}
let editRecId=null;
// ── SHARED VENDOR DROPDOWN BUILDER ──────────────────────────────────────────
// Used by recurring task edit modal, log task modal, and any future modal that
// needs a vendor select with optional category-based "Recommended" grouping.
// selId       — id of the <select> element to populate
// selectedVendor — vendor name to pre-select (pass '' for none)
// catFilter   — category string for Recommended / Other grouping (pass null to skip grouping)
// customWrapId / customInputId — ids of the custom-vendor row + input
function populateVendorSelect(selId,selectedVendor,catFilter,customWrapId,customInputId){
  const sel=document.getElementById(selId);
  const prev=selectedVendor!==undefined?selectedVendor:sel.value;
  sel.innerHTML='<option value="">— None —</option>';
  if(catFilter){
    const matched=vendors.filter(v=>v.categories.includes(catFilter));
    const others=vendors.filter(v=>!v.categories.includes(catFilter));
    if(matched.length){const og=document.createElement('optgroup');og.label='Recommended';matched.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name+' — '+v.role;og.appendChild(o);});sel.appendChild(og);}
    if(others.length){const og=document.createElement('optgroup');og.label='Other Vendors';others.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name+' — '+v.role;og.appendChild(o);});sel.appendChild(og);}
  }else{
    vendors.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name+' — '+v.role;sel.appendChild(o);});
  }
  sel.appendChild(Object.assign(document.createElement('option'),{value:'__custom__',textContent:'✎ Custom...'}));
  if(prev&&prev!=='__custom__'){
    const exists=Array.from(sel.options).some(o=>o.value===prev);
    sel.value=exists?prev:'__custom__';
    if(!exists&&prev){document.getElementById(customInputId).value=prev;document.getElementById(customWrapId).style.display='';}
    else{document.getElementById(customWrapId).style.display='none';}
  }else if(prev==='__custom__'){sel.value='__custom__';document.getElementById(customWrapId).style.display='';}
  else{document.getElementById(customWrapId).style.display='none';}
}
// Thin wrappers kept for backward-compat with existing onclick="populateRecVendor()" calls
function populateRecVendor(selectedVendor){
  populateVendorSelect('r-vendor',selectedVendor,document.getElementById('r-cat').value,'r-vendor-custom-wrap','r-vendor-custom');
}
function onRecVendorChange(){
  document.getElementById('r-vendor-custom-wrap').style.display=document.getElementById('r-vendor').value==='__custom__'?'':'none';
}
function getRecVendorValue(){
  const v=document.getElementById('r-vendor').value;
  return v==='__custom__'?document.getElementById('r-vendor-custom').value.trim():v;
}
function openAddRecurring(){
  editRecId=null;
  document.getElementById('rec-modal-title').textContent='New Recurring Task';
  ['r-name','r-next','r-vendor-custom','r-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('r-cat').value='hvac';document.getElementById('r-freq').value='monthly';
  // Clear property selection
  const sel=document.getElementById('r-props');Array.from(sel.options).forEach(o=>o.selected=false);
  populateRecVendor('');
  document.getElementById('rec-modal').classList.add('open');
}
function editRec(id){
  const r=recurring.find(x=>x.id===id);if(!r)return;
  editRecId=id;
  document.getElementById('rec-modal-title').textContent='Edit Recurring Task';
  document.getElementById('r-name').value=r.name||'';
  document.getElementById('r-cat').value=r.category||'hvac';
  document.getElementById('r-freq').value=r.frequency||'monthly';
  document.getElementById('r-next').value=r.nextDue||'';
  populateRecVendor(r.vendor||'');
  document.getElementById('r-notes').value=r.notes||'';
  // Set property selection
  const sel=document.getElementById('r-props');
  Array.from(sel.options).forEach(o=>{o.selected=r.properties.includes(o.value)||r.properties.includes('all');});
  document.getElementById('rec-modal').classList.add('open');
}
async function saveRecurring(){
  const name=document.getElementById('r-name').value.trim();if(!name){showToast('Task name required.','err');return;}
  const sel=document.getElementById('r-props');const props=Array.from(sel.selectedOptions).map(o=>o.value);
  const data={name,properties:props.length?props:['all'],category:document.getElementById('r-cat').value,frequency:document.getElementById('r-freq').value,vendor:getRecVendorValue(),notes:document.getElementById('r-notes').value.trim(),nextDue:document.getElementById('r-next').value};
  if(editRecId){
    const r=recurring.find(x=>x.id===editRecId);if(r)Object.assign(r,data);
    editRecId=null;
  } else {
    recurring.push({id:'rc'+Date.now(),...data});
  }
  await saveRec();closeModal('rec-modal');renderRecurring();showToast('Recurring task saved.');
}
async function delRec(id){
  const deleted=recurring.find(r=>r.id===id);if(!deleted)return;
  const idx=recurring.indexOf(deleted);
  recurring=recurring.filter(r=>r.id!==id);await saveRec();renderRecurring();
  showToast('Recurring task removed.','',async()=>{recurring.splice(idx,0,deleted);await saveRec();renderRecurring();showToast('Recurring task restored.');});
}
// ── LOG TASK (record a completed service from a recurring template) ──────────
let _logTaskRecId=null;

// Property dropdown for log modal: neighborhood shortcuts (where applicable) +
// per-neighborhood grouped individual cabins — mirrors populatePropSel structure.
const NB_LOG_SHORTCUTS=[
  {value:'umc',label:'UMC — Resort (All 6 Cabins)',nb:'umc'},
  {value:'prc',label:'PRC — Resort (All 6 Cabins)',nb:'prc'},
  {value:'hillside',label:'Hillside Haven (Both)',nb:'hillside'},
];
function populateLogTaskProp(selId,taskProps){
  const sel=document.getElementById(selId);sel.innerHTML='';
  // Neighborhood shortcuts — only shown when task covers at least one cabin in that neighborhood
  const nbGrp=document.createElement('optgroup');nbGrp.label='Neighborhoods / Resorts';
  NB_LOG_SHORTCUTS.forEach(s=>{
    const nb=NBS.find(n=>n.id===s.nb);if(!nb)return;
    if(!nb.props.some(pid=>taskProps.includes(pid)))return;
    const o=document.createElement('option');o.value=s.value;o.textContent=s.label;nbGrp.appendChild(o);
  });
  if(nbGrp.children.length)sel.appendChild(nbGrp);
  // Individual cabins grouped by neighborhood — same structure as populatePropSel
  NBS.forEach(nb=>{
    const nbProps=nb.props.filter(pid=>taskProps.includes(pid));if(!nbProps.length)return;
    const og=document.createElement('optgroup');og.label=nb.name+' — '+nb.sub;
    nbProps.forEach(pid=>{
      const p=getProp(pid);if(!p)return;
      const o=document.createElement('option');o.value=p.id;
      o.textContent=p.name.replace(/^(PRC|UMC)\s*-\s*\d+\s*[-:]\s*/,'');
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
}

function openLogTask(id){
  const r=recurring.find(x=>x.id===id);if(!r)return;
  _logTaskRecId=id;
  document.getElementById('lt-service-name').textContent=r.name;
  document.getElementById('log-task-title').textContent='Log: '+r.name;
  const taskProps=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;
  populateLogTaskProp('lt-prop',taskProps);
  document.getElementById('lt-date').value=new Date().toISOString().slice(0,10);
  // Vendor uses shared builder with category filter so "Recommended" group matches the service type
  populateVendorSelect('lt-vendor',r.vendor||'',r.category,'lt-vendor-custom-wrap','lt-vendor-custom');
  document.getElementById('lt-notes').value='';
  document.getElementById('log-task-modal').classList.add('open');
}
function onLogTaskVendorChange(){
  document.getElementById('lt-vendor-custom-wrap').style.display=document.getElementById('lt-vendor').value==='__custom__'?'':'none';
}
function getLogTaskVendorValue(){
  const v=document.getElementById('lt-vendor').value;
  return v==='__custom__'?document.getElementById('lt-vendor-custom').value.trim():v;
}

async function saveLogTask(){
  const r=recurring.find(x=>x.id===_logTaskRecId);if(!r){showToast('Recurring task not found.','err');return;}
  const prop=document.getElementById('lt-prop').value;
  if(!prop){showToast('Please select a property.','err');return;}
  const date=document.getElementById('lt-date').value;
  if(!date){showToast('Please select a date.','err');return;}
  const vendor=getLogTaskVendorValue();
  const notes=document.getElementById('lt-notes').value.trim();
  const isFilterTask=r.category==='hvac'&&/filter/i.test(r.name);

  const task={
    id:Date.now().toString()+Math.random().toString(36).slice(2,6),
    property:prop,guest:'',problem:r.name,category:r.category,
    status:'complete',date,vendor,urgent:false,recurring:true,
    notes:notes?[{text:notes,type:'admin',time:new Date().toISOString()}]:[],
    vendorNotes:'',created:new Date().toISOString(),_loggedService:true,
  };
  if(isFilterTask)task.filter_service_bundled=true;

  tasks.unshift(task);
  await saveTasks();
  if(typeof logTaskChange==='function')logTaskChange('log_service',task);

  // For filter tasks logged against a specific cabin: reset filter clock to logged date (supports backdating)
  if(isFilterTask&&typeof PP!=='undefined'&&PP&&PP[prop]){
    const p=PP[prop];
    if(!p.hvac)p.hvac={};if(!p.hvac.filter_service)p.hvac.filter_service={};
    const prev=p.hvac.filter_service.last_service_date||null;
    p.hvac.filter_service.last_service_date=date;
    p.last_updated=date;
    p.last_updated_by=typeof getCurrentUserName==='function'?(getCurrentUserName()||'user'):'user';
    try{
      if(!Array.isArray(PP_LOG))PP_LOG=[];
      PP_LOG.push({id:'chg_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),ts:new Date().toISOString(),
        user:p.last_updated_by,property_id:prop,path:'hvac.filter_service.last_service_date',
        old_value:prev,new_value:date,source:'log_service',task_id:task.id});
      await ppSave('se_pp_log',PP_LOG);
    }catch(e){console.warn('[log-task] log save failed',e);}
    try{await ppSave('se_pp',PP);}catch(e){console.warn('[log-task] profile save failed',e);}
  }

  renderAll();
  closeModal('log-task-modal');
  showToast('Service logged.');
}

async function genFromRec(id){
  const r=recurring.find(x=>x.id===id);if(!r)return;
  const ps=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;let n=0;let skipped=0;
  ps.forEach(pid=>{
    // Prevent duplicates: skip if a task for this recurring item already exists on this date for this property
    const dup=tasks.some(x=>x.property===pid&&x.date===(r.nextDue||'')&&x.recurring&&x.problem===r.name&&!isDone(x));
    if(dup){skipped++;return;}
    tasks.unshift({id:Date.now().toString()+Math.random().toString(36).slice(2,6)+pid,property:pid,guest:'',problem:r.name,category:r.category,status:'scheduled',date:r.nextDue||'',vendor:r.vendor,urgent:false,recurring:true,notes:[],vendorNotes:'',created:new Date().toISOString()});n++;
  });
  await saveTasks();renderAll();
  if(n&&!skipped)showToast(`${n} task${n>1?'s':''} generated.`);
  else if(n&&skipped)showToast(`${n} task${n>1?'s':''} generated, ${skipped} skipped (already exist).`);
  else showToast('All tasks already exist for this date.','err');
}

// COMBINE
function checkCombine(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  const area=document.getElementById('d-combine');area.innerHTML='';
  if(!t.date||isDone(t)||t.assignedToGuest)return;
  const td=new Date(t.date+'T12:00:00');
  const nearby=recurring.filter(r=>{
    if(!r.nextDue)return false;
    const diff=Math.abs(td-new Date(r.nextDue+'T12:00:00'))/(864e5);if(diff>10)return false;
    const ps=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;if(!ps.includes(t.property))return false;
    // Fuzzy match: recurring task names may be longer than the task problem (e.g. "HVAC Filter Replacement" vs "HVAC Filter Replacement – Write date...")
    const rLow=(r.name||'').toLowerCase();
    const matchesRecurring=(prob)=>{const p=(prob||'').toLowerCase();return p===rLow||rLow.startsWith(p)||p.startsWith(rLow);};
    // Skip if the current task IS this recurring item (don't suggest combining with itself)
    if(t.recurring&&matchesRecurring(t.problem))return false;
    // Hide if already scheduled: a recurring task matching this name already exists as an active task for this property (any date)
    const alreadyScheduled=tasks.some(x=>x.property===t.property&&x.recurring&&matchesRecurring(x.problem)&&!isDone(x));
    return !alreadyScheduled;
  });
  if(!nearby.length)return;
  nearby.forEach(r=>{
    const diff=Math.round((new Date(r.nextDue+'T12:00:00')-td)/864e5);
    const dt=diff===0?'same day':diff>0?`in ${diff} day${diff>1?'s':''}`:`${Math.abs(diff)} day${Math.abs(diff)>1?'s':''} ago`;
    area.innerHTML+=`<div class="combine"><div class="combine-txt"><strong>${r.name}</strong> is due ${dt} at this property. Combine into one visit?</div><div class="combine-btns"><button class="btn btn-gold" onclick="combineTask('${r.id}','${t.date}')">Combine</button><button class="btn" onclick="this.closest('.combine').remove()">Dismiss</button></div></div>`;
  });
}
async function combineTask(rid,date){
  const r=recurring.find(x=>x.id===rid);if(!r)return;
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  // Prevent duplicate: check if a task for this recurring item already exists on this date for this property
  const exists=tasks.some(x=>x.property===t.property&&x.date===date&&x.recurring&&x.problem===r.name);
  if(exists){showToast('Already combined — task exists for this date.','err');checkCombine();return;}
  r.nextDue=date;await saveRec();
  const vendor=t.vendor||r.vendor;
  tasks.unshift({id:Date.now().toString(),property:t.property,guest:"",problem:r.name,category:r.category,status:"scheduled",date,vendor,urgent:false,recurring:true,notes:[{text:`Combined with existing task on ${date}.`,type:"admin",time:new Date().toISOString()}],vendorNotes:"",created:new Date().toISOString()});
  await saveTasks();renderAll();document.getElementById('d-combine').innerHTML='';showToast('Tasks combined into one visit.');
}

// ADD TASK
function toggleUrgent(){const cb=document.getElementById('f-urgent');cb.checked=!cb.checked;}
function onPropChange(){
  document.getElementById('f-date').value='';
  document.getElementById('f-dp-display').textContent='Select a date...';
  document.getElementById('f-dp-display').className='dp-ph';
  document.getElementById('f-dp-btn').classList.remove('has-val');
  if (typeof fsRenderBundlerInline === 'function') fsRenderBundlerInline();
}
function onCatChange(){
  const cat=document.getElementById('f-category').value;
  const area=document.getElementById('f-vendor-suggest');
  if(!cat){area.innerHTML='';return;}
  const m=vendors.filter(v=>v.categories.includes(cat));
  if(!m.length){area.innerHTML='';return;}
  if(!document.getElementById('f-vendor').value&&m.length)document.getElementById('f-vendor').value=m[0].name;
  area.innerHTML='<label style="margin-bottom:6px">Suggested Vendors</label>'+m.slice(0,3).map(v=>`
    <div class="vsc">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div class="vsn">${v.name}</div><div class="vsr">${v.role}</div><div class="vsp">${v.phone}</div></div>
        <button class="btn btn-g" style="flex-shrink:0" onclick="document.getElementById('f-vendor').value='${v.name.replace(/'/g,"\\'")}';this.style.outline='2px solid var(--green)'">Use</button>
      </div>
      ${v.note?`<div style="font-size:.73rem;color:var(--text2);margin-top:4px">${v.note}</div>`:''}
    </div>`).join('');
}
function openAddTask(propId){
  document.getElementById('task-modal-title').textContent='New Task';
  ['f-guest','f-problem','f-category','f-vendor','f-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-status').value='open';document.getElementById('f-urgent').checked=false;
  document.getElementById('f-date').value='';
  document.getElementById('f-dp-display').textContent='Select a date...';
  document.getElementById('f-dp-display').className='dp-ph';
  document.getElementById('f-dp-btn').classList.remove('has-val');
  document.getElementById('f-vendor-suggest').innerHTML='';
  const fsb=document.getElementById('f-fs-bundler');if(fsb)fsb.innerHTML='';
  document.getElementById('task-modal').classList.add('open');
  if(propId){setTimeout(()=>{document.getElementById('f-property').value=propId;if(typeof fsRenderBundlerInline==='function')fsRenderBundlerInline();},50);}
  else document.getElementById('f-property').value='';
}
async function saveTask(){
  const pid=document.getElementById('f-property').value;const prob=document.getElementById('f-problem').value.trim();
  if(!pid||!prob){showToast('Property and problem are required.','err');return;}
  const nt=document.getElementById('f-notes').value.trim();
  const fDate=document.getElementById('f-date').value;
  let fStatus=document.getElementById('f-status').value;
  // Auto-advance: if a date is set and status is still open, mark as scheduled
  if(fDate&&fStatus==='open')fStatus='scheduled';
  const fCat=document.getElementById('f-category').value;
  const t={id:Date.now().toString(),property:pid,guest:document.getElementById('f-guest').value.trim(),problem:prob,category:fCat,status:fStatus,date:fDate,vendor:document.getElementById('f-vendor').value.trim(),urgent:document.getElementById('f-urgent').checked,recurring:false,notes:nt?[{text:nt,type:'admin',time:new Date().toISOString()}]:[],vendorNotes:'',created:new Date().toISOString()};
  // Auto-init purchase tracking for replacement tasks
  if(fCat==='replacement'){t.purchaseNote=prob;t.purchaseStatus='needed';t.purchaser='owner';}
  // Deploy 2: bundle filter service into this task if the user checked the bundler
  if(typeof fsMaybeStampTask==='function')fsMaybeStampTask(t);
  tasks.unshift(t);logTaskChange('created',t);await saveTasks();closeModal('task-modal');renderAll();renderReplacements();showToast('Task created.');
}

// DETAIL
async function openDetail(id){
  detailId=id;const t=tasks.find(x=>x.id===id);if(!t)return;
  const p=getProp(t.property);const nb=getNb(t.property);
  document.getElementById('d-prop').textContent=p?p.name:t.property;
  document.getElementById('d-prop').style.color=nb?`var(--${nb.cls})`:'var(--gold)';
  document.getElementById('d-prop').style.display='';
  // Populate property dropdown
  const propSel=document.getElementById('d-prop-select');
  propSel.innerHTML=PROPS.map(pr=>`<option value="${pr.id}"${pr.id===t.property?' selected':''}>${pr.name}</option>`).join('');
  propSel.style.display='none';
  document.getElementById('d-title').textContent=t.problem;
  document.getElementById('d-status').value=t.status;
  document.getElementById('d-category').value=t.category||'';
  document.getElementById('d-vendor').value=t.vendor||'';
  document.getElementById('d-vnotes').value=t.vendorNotes||'';
  const dv=t.date||'';
  document.getElementById('d-date').value=dv;
  if(dv){document.getElementById('d-dp-display').textContent=fmtDate(dv);document.getElementById('d-dp-display').className='';document.getElementById('d-dp-btn').classList.add('has-val');}
  else{document.getElementById('d-dp-display').textContent='Select a date...';document.getElementById('d-dp-display').className='dp-ph';document.getElementById('d-dp-btn').classList.remove('has-val');}
  // Interactive badge row (category + status + urgent)
  renderDetailBadges(t);
  // Vendor contact row
  const contactRow=document.getElementById('d-contact-row');
  if(contactRow){
    const assignedV=t.vendor?vendors.find(v=>v.name===t.vendor):null;
    if(assignedV&&assignedV.phone){
      const tel=assignedV.phone.replace(/\D/g,'');
      contactRow.style.display='flex';
      contactRow.innerHTML=`
        <a href="sms:+1${tel}" class="cg-btn-text"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Text</a>
        <a href="tel:+1${tel}" class="cg-btn-call"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call</a>`;
    } else {
      contactRow.style.display='none';
      contactRow.innerHTML='';
    }
  }
  // Foldout states: open if has content, closed otherwise
  const notesCount=(t.notes||[]).length;
  const notesFold=document.getElementById('dm-fold-notes');
  if(notesFold){notesFold.classList.toggle('open',notesCount>0);}
  const notesCountEl=document.getElementById('dm-notes-count');
  if(notesCountEl){notesCountEl.textContent=notesCount>0?notesCount:'';notesCountEl.style.display=notesCount>0?'':'none';}
  const hasPurchase=!!(t.purchaseNote);
  const purchaseFold=document.getElementById('dm-fold-purchase');
  if(purchaseFold){purchaseFold.classList.toggle('open',hasPurchase);}
  const purchasePreview=document.getElementById('dm-purchase-preview');
  if(purchasePreview){purchasePreview.textContent=hasPurchase?t.purchaseNote.substring(0,40)+(t.purchaseNote.length>40?'...':''):'';}
  const photosFold=document.getElementById('dm-fold-photos');
  const hasPhotos=!!(t.photos&&t.photos.length)||(document.getElementById('d-task-photos')&&document.getElementById('d-task-photos').children.length>0);
  if(photosFold){photosFold.classList.toggle('open',false);} // photos start collapsed
  const photoCount=t.photos?t.photos.length:0;
  const photoCountEl=document.getElementById('dm-photo-count');
  if(photoCountEl){photoCountEl.textContent=photoCount>0?photoCount:'';photoCountEl.style.display=photoCount>0?'':'none';}
  document.getElementById('d-purchase').value=t.purchaseNote||'';
  const pSaved=document.getElementById('d-purchase-saved');
  if(pSaved)pSaved.style.display=t.purchaseNote?'':'none';
  renderPurchaseWorkflow(t);
  showTaskPhoto(t);
  showVendorPhotos(t);
  renderDetailVendors(t,p);renderNotes(t);checkCombine();
  closeVendorDD(); // reset dropdown state when opening a new task
  renderMiniCal(t.property).then(()=>renderDetailVendors(t,p));
  // Guest context section removed — not useful for admin workflow
  document.getElementById('d-guest-context').innerHTML='';
  // Guest communication tools — only during active guest stay
  renderGuestComm(t);
  const tDone=isDone(t);
  document.getElementById('complete-btn').style.display=tDone?'none':'';
  // Vendor-done approval notice
  const vdNotice=document.getElementById('d-vendor-done-notice');
  if(vdNotice){
    if(t.vendorDone&&!isDone(t)){
      vdNotice.style.display='';
      vdNotice.querySelector('.vd-time').textContent=new Date(t.vendorDone).toLocaleString();
    }else{vdNotice.style.display='none';}
  }
  document.getElementById('detail-modal').classList.add('open');
}
function taskStartEditTitle() {
  const titleEl = document.getElementById('d-title');
  const inputEl = document.getElementById('d-title-input');
  inputEl.value = titleEl.textContent;
  titleEl.style.display = 'none';
  inputEl.style.display = '';
  inputEl.style.height = 'auto';
  inputEl.style.height = inputEl.scrollHeight + 'px';
  inputEl.focus();
  inputEl.select();
}
function taskCancelEditTitle() {
  document.getElementById('d-title').style.display = '';
  document.getElementById('d-title-input').style.display = 'none';
}
async function taskSaveTitle() {
  const inputEl = document.getElementById('d-title-input');
  const titleEl = document.getElementById('d-title');
  const newText = inputEl.value.trim();
  inputEl.style.display = 'none';
  titleEl.style.display = '';
  if (!newText || !detailId) return;
  const t = tasks.find(x => x.id === detailId);
  if (!t || t.problem === newText) return;
  t.problem = newText;
  titleEl.textContent = newText;
  await saveTasks();
  renderAll();
  showToast('Description updated.');
}
async function savePurchaseNote(){
  if(!detailId)return;
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  const val=(document.getElementById('d-purchase').value||'').trim();
  if(t.purchaseNote===val)return;
  t.purchaseNote=val;
  // Auto-set purchase tracking defaults when a purchase note is first entered
  if(val&&!t.purchaseStatus){t.purchaseStatus='needed';t.purchaser=t.purchaser||'owner';}
  if(!val){t.purchaseStatus='';t.purchaser='';}
  await saveTasks();
  const pSaved=document.getElementById('d-purchase-saved');
  if(pSaved){pSaved.style.display=val?'':'none';}
  // Update purchase foldout preview
  const purchaseFold=document.getElementById('dm-fold-purchase');
  if(purchaseFold){purchaseFold.classList.toggle('open',!!val);}
  const purchasePreview=document.getElementById('dm-purchase-preview');
  if(purchasePreview){purchasePreview.textContent=val?val.substring(0,40)+(val.length>40?'...':''):'';}
  renderPurchaseWorkflow(t);
  renderAll();
  showToast(val?'Purchase note saved.':'Purchase note cleared.');
}
// ── Purchase workflow helpers ──
function renderPurchaseWorkflow(t){
  const wrap=document.getElementById('d-purchase-workflow');if(!wrap)return;
  const show=t.category==='replacement'||!!t.purchaseNote;
  wrap.style.display=show?'':'none';
  if(!show)return;
  // Status buttons
  const st=t.purchaseStatus||'needed';
  ['needed','purchased','delivered'].forEach(s=>{
    const btn=document.getElementById('d-purch-status-'+s);if(!btn)return;
    if(s===st){btn.style.background='#e65100';btn.style.color='#fff';btn.style.borderColor='#e65100';}
    else{btn.style.background='';btn.style.color='';btn.style.borderColor='';}
  });
  // Purchaser buttons
  const who=t.purchaser||'owner';
  ['owner','vendor'].forEach(s=>{
    const btn=document.getElementById('d-purchaser-'+s);if(!btn)return;
    if(s===who){btn.style.background='var(--green)';btn.style.color='#fff';btn.style.borderColor='var(--green)';}
    else{btn.style.background='';btn.style.color='';btn.style.borderColor='';}
  });
}
async function setPurchaseStatus(status){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.purchaseStatus=status;
  if(status==='purchased')t.purchasedAt=new Date().toISOString();
  if(status==='delivered'&&!t.purchasedAt)t.purchasedAt=new Date().toISOString();
  await saveTasks();renderPurchaseWorkflow(t);renderAll();
  const labels={needed:'Needs buying',purchased:'Marked as purchased',delivered:'Marked as delivered'};
  showToast(labels[status]||'Updated.');
}
async function setPurchaser(who){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.purchaser=who;
  await saveTasks();renderPurchaseWorkflow(t);renderAll();
  showToast(who==='owner'?'You\'ll buy this.':'Vendor will buy this.');
}
function onDetailCatChange(val){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  // When switching to replacement category, auto-show purchase workflow
  if(val==='replacement'&&!t.purchaseStatus){t.purchaseStatus='needed';t.purchaser='owner';}
  renderPurchaseWorkflow(t);
}
async function confirmPropertyChange(newPropId){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  if(newPropId===t.property){/* no change — just hide dropdown */
    document.getElementById('d-prop-select').style.display='none';
    document.getElementById('d-prop').style.display='';return;
  }
  const newP=PROPS.find(p=>p.id===newPropId);
  const oldP=getProp(t.property);
  const oldName=oldP?oldP.name.split(' - ').pop():t.property;
  const newName=newP?newP.name.split(' - ').pop():newPropId;
  if(!confirm(`Move this task from "${oldName}" to "${newName}"?`)){
    // Revert dropdown to original value
    document.getElementById('d-prop-select').value=t.property;
    document.getElementById('d-prop-select').style.display='none';
    document.getElementById('d-prop').style.display='';return;
  }
  t.property=newPropId;
  await saveTasks();
  // Update the label and color
  const nb=getNb(newPropId);
  document.getElementById('d-prop').textContent=newP?newP.name:newPropId;
  document.getElementById('d-prop').style.color=nb?`var(--${nb.cls})`:'var(--gold)';
  document.getElementById('d-prop-select').style.display='none';
  document.getElementById('d-prop').style.display='';
  // Re-render mini calendar for the new property
  renderMiniCal(newPropId).then(()=>renderDetailVendors(t,getProp(newPropId)));
  renderAll();
  showToast(`Task moved to ${newName}.`);
}
/* ── Task Photo Upload/Remove (multi-photo) ── */
// Get all admin photos for a task (merges old photoUrl with new photos array)
function getTaskPhotos(t){
  const arr=Array.isArray(t.photos)?[...t.photos]:[];
  // Backward compat: include legacy photoUrl if it's not already in the array
  if(t.photoUrl&&!arr.includes(t.photoUrl))arr.unshift(t.photoUrl);
  return arr;
}
function showTaskPhoto(t){
  const gallery=document.getElementById('d-photo-gallery');
  const photos=getTaskPhotos(t);
  if(!photos.length){gallery.innerHTML='';} else {
    gallery.innerHTML=photos.map((url,i)=>`<div style="position:relative;display:inline-block">
      <img src="${url}" style="width:72px;height:72px;border-radius:6px;border:1px solid var(--border);cursor:pointer;object-fit:cover" onclick="window.open('${url}','_blank')" title="Click to view full size">
      <button onclick="removeTaskPhoto('${url}')" style="position:absolute;top:-4px;right:-4px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;font-size:.6rem;display:flex;align-items:center;justify-content:center;line-height:1" title="Remove photo">&#x2715;</button>
    </div>`).join('');
  }
  document.getElementById('d-photo-status').textContent='';
  document.getElementById('d-photo-input').value='';
}
function showVendorPhotos(t){
  let el=document.getElementById('d-vendor-photos');
  if(!el){
    // Create the vendor photos section after the main photo section
    const photoSection=document.getElementById('d-photo-section');
    if(!photoSection)return;
    el=document.createElement('div');el.id='d-vendor-photos';el.className='vp-section';
    photoSection.after(el);
  }
  const vp=t.vendorPhotos||[];
  if(!vp.length){el.innerHTML='';return;}
  el.innerHTML='<div class="stitle" style="margin-top:10px">Vendor Photos ('+vp.length+')</div><div class="vp-grid">'+
    vp.map(p=>`<div><img src="${p.url}" onclick="window.open('${p.url}','_blank')" title="Click to view full size"><div class="vp-meta">${p.uploadedBy||'Vendor'} — ${new Date(p.uploadedAt).toLocaleDateString()}</div></div>`).join('')+
    '</div>';
}
/* Drag-and-drop + paste support for photo upload */
(function(){
  // Drag and drop on the dropzone
  function dzVisible(){
    const modal=document.getElementById('detail-modal');
    if(!modal||!modal.classList.contains('open'))return null;
    return document.getElementById('d-photo-dropzone');
  }
  document.addEventListener('dragover',function(e){
    const dz=dzVisible();if(!dz)return;
    e.preventDefault();
    dz.style.borderColor='var(--green)';dz.style.background='var(--green-light)';
  });
  document.addEventListener('dragleave',function(e){
    const dz=document.getElementById('d-photo-dropzone');if(!dz)return;
    if(e.target===dz||dz.contains(e.target)){dz.style.borderColor='var(--border)';dz.style.background='var(--surface2)';}
  });
  document.addEventListener('drop',function(e){
    const dz=dzVisible();if(!dz)return;
    e.preventDefault();
    dz.style.borderColor='var(--border)';dz.style.background='var(--surface2)';
    const files=e.dataTransfer.files;
    if(files&&files.length){for(let i=0;i<files.length;i++){if(files[i].type.startsWith('image/'))uploadTaskPhoto(files[i]);}}
  });
  // Paste from clipboard — only when detail modal is open
  document.addEventListener('paste',function(e){
    const modal=document.getElementById('detail-modal');
    if(!modal||!modal.classList.contains('open'))return;
    const items=e.clipboardData&&e.clipboardData.items;if(!items)return;
    for(let i=0;i<items.length;i++){
      if(items[i].type.startsWith('image/')){
        e.preventDefault();
        const file=items[i].getAsFile();
        if(file)uploadTaskPhoto(file);
        return;
      }
    }
  });
})();
// Upload multiple photos at once
async function uploadTaskPhotos(files){
  if(!files||!files.length)return;
  for(let i=0;i<files.length;i++){await uploadTaskPhoto(files[i]);}
}
// Client-side image compression for admin uploads
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();const url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      let w=img.width,h=img.height;
      if(w>1600||h>1600){const r=Math.min(1600/w,1600/h);w=Math.round(w*r);h=Math.round(h*r);}
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      c.toBlob(blob=>{if(!blob){reject(new Error('Compression failed'));return;}resolve(blob);},'image/jpeg',0.82);
    };
    img.onerror=()=>reject(new Error('Could not load image'));
    img.src=url;
  });
}
async function uploadTaskPhoto(file){
  if(!file||!detailId)return;
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  const status=document.getElementById('d-photo-status');
  status.textContent='Compressing...';
  try{
    const compressed=await compressImage(file);
    status.textContent='Uploading...';
    const token=localStorage.getItem('se_auth_token')||'';
    const fname=`task-${t.id}-${Date.now()}-${Math.random().toString(36).slice(2,5)}.jpg`;
    const r=await fetch(`${PROXY_BASE}/api/photo?taskId=${t.id}&filename=${fname}`,{
      method:'POST',
      headers:{'Authorization':'Bearer '+token,'Content-Type':'image/jpeg'},
      body:compressed
    });
    if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Upload failed');}
    const data=await r.json();
    // Append to photos array (multi-photo support)
    if(!Array.isArray(t.photos))t.photos=[];
    // Migrate legacy photoUrl into array if needed
    if(t.photoUrl&&!t.photos.includes(t.photoUrl)){t.photos.unshift(t.photoUrl);t.photoUrl='';}
    t.photos.push(data.url);
    await saveTasks();
    showTaskPhoto(t);
    status.textContent='';
    showToast('Photo attached.');
  }catch(e){
    console.error('[photo] Upload error:',e);
    status.textContent='Upload failed — try again';
    showToast('Photo upload failed.','err');
  }
}
async function removeTaskPhoto(url){
  const t=tasks.find(x=>x.id===detailId);if(!t||!url)return;
  if(!confirm('Remove this photo?'))return;
  try{
    const token=localStorage.getItem('se_auth_token')||'';
    fetch(`${PROXY_BASE}/api/photo?url=${encodeURIComponent(url)}`,{
      method:'DELETE',headers:{'Authorization':'Bearer '+token}
    }).catch(()=>{});
  }catch(e){}
  // Remove from photos array
  if(Array.isArray(t.photos))t.photos=t.photos.filter(u=>u!==url);
  // Also clear legacy photoUrl if it matches
  if(t.photoUrl===url)t.photoUrl=null;
  await saveTasks();
  showTaskPhoto(t);
  showToast('Photo removed.');
}
/* Auto-cleanup: delete photos from tasks resolved more than 30 days ago */
async function cleanupOldPhotos(){
  const cutoff=Date.now()-30*24*60*60*1000;
  const token=localStorage.getItem('se_auth_token')||'';
  let changed=false;
  for(const t of tasks){
    if(!isDone(t))continue;
    const resolved=t.date||t.created;
    if(!resolved)continue;
    if(new Date(resolved+'T12:00:00').getTime()>cutoff)continue;
    // This task was resolved 30+ days ago — delete admin photo
    if(t.photoUrl){
      try{
        await fetch(`${PROXY_BASE}/api/photo?url=${encodeURIComponent(t.photoUrl)}`,{
          method:'DELETE',headers:{'Authorization':'Bearer '+token}
        });
      }catch(e){}
      t.photoUrl=null;
      changed=true;
      console.log(`[photo] Cleaned up admin photo for task ${t.id}`);
    }
    // Delete vendor photos too
    if(t.vendorPhotos&&t.vendorPhotos.length){
      for(const vp of t.vendorPhotos){
        try{
          await fetch(`${PROXY_BASE}/api/photo?url=${encodeURIComponent(vp.url)}`,{
            method:'DELETE',headers:{'Authorization':'Bearer '+token}
          });
        }catch(e){}
        console.log(`[photo] Cleaned up vendor photo for task ${t.id}`);
      }
      t.vendorPhotos=[];
      changed=true;
    }
  }
  if(changed)await saveTasks();
}
/* Open the vendor-day modal showing all tasks for a vendor on a specific date */
async function openVendorDay(vendorName,date){
  const vdTasks=getVendorDayTasks(vendorName,date);
  if(!vdTasks.length)return;
  const v=vendors.find(x=>x.name.toLowerCase()===vendorName.toLowerCase());
  // Header — vendor name + date
  const dateFmtHdr=date?new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'';
  document.getElementById('vd-title').textContent=vendorName+(dateFmtHdr?' — '+dateFmtHdr:'');
  // Contact row
  const contactEl=document.getElementById('vd-contact-row');
  if(v){
    const tel=v.phone.replace(/\D/g,'');
    const phoneFmt=v.phone;
    contactEl.innerHTML=`<div class="cg-contact-row">
      <a href="sms:${tel}" class="cg-contact-btn cg-primary">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
        Text ${phoneFmt}
      </a>
      <a href="tel:${tel}" class="cg-contact-btn cg-secondary">
        <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        Call
      </a>
    </div>`;
  } else {
    contactEl.innerHTML='';
  }
  // Pre-generate vendor sheet token
  let sheetUrl='';
  if(v&&date){
    try{
      const ids=vdTasks.map(x=>x.id);
      if(ids.length){
        const token=await createVendorSheet(vendorName,date,ids);
        sheetUrl=vendorSheetUrl(token);
      }
    }catch(e){console.error('[vendor-sheet] Token gen error:',e);}
  }
  // Render combined task card (property-grouped + send job sheet)
  if(v){
    document.getElementById('vd-combined-sms').innerHTML=combinedVendorCard(v,vdTasks,sheetUrl);
  } else {
    document.getElementById('vd-combined-sms').innerHTML=`<div style="font-size:.82rem;color:var(--text2);padding:6px 0;margin-bottom:8px"><strong>${vendorName}</strong> is not in the vendor list — add them to send a combined message.</div>`;
  }
  document.getElementById('vendor-day-modal').classList.add('open');
}
async function renderMiniCal(pid){
  const nco=document.getElementById('d-next-co');
  nco.innerHTML='';
  const evs=await fetchIcal(pid);if(evs==='error')return;
  const today=new Date();today.setHours(12,0,0,0);
  const av=getAvail(evs,today,60);
  const fco=av.find(a=>a.status==='checkout');
  nco.innerHTML=fco?`Next checkout: <strong style="color:var(--gold)">${fco.date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</strong> — earliest recommended window`:'';
}
// ── Guest Communication in Task Detail ──────────────────────
async function renderGuestComm(t){
  const el=document.getElementById('d-guest-comm-section');
  if(!el){return;}
  el.innerHTML='';
  if(!t.property)return;
  const pid=t.property;
  const hospId=HOSPITABLE_IDS[pid];
  if(!hospId)return;
  let evs=icalCache[pid];
  if(!evs||evs==='error'){evs=await fetchIcal(pid);if(evs==='error')return;}
  // Find reservation whose stay overlaps with today (guest currently there)
  const now=new Date();now.setHours(12,0,0,0);
  let activeRes=null;
  evs.forEach(ev=>{
    if(!ev.start||!ev.end)return;
    if(now>=ev.start&&now<=ev.end)activeRes=ev;
  });
  if(!activeRes||!activeRes.reservationId)return;
  const guestName=activeRes.summary||'Guest';
  const guestFirst=guestName.split(' ')[0];
  const checkin=activeRes.start.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const checkout=activeRes.end.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const rawPhone=activeRes.guestPhone||'';
  // Strip country code: +1, 1, or leading 1 for US numbers (11 digits)
  const phone=rawPhone.replace(/\D/g,'').replace(/^1(\d{10})$/,'$1');
  const phoneFmt=phone?phone.replace(/^(\d{3})(\d{3})(\d{4})$/,'($1) $2-$3'):rawPhone;
  const phoneLinks=phone?`<div style="display:flex;gap:5px;flex-shrink:0">
    <a href="sms:${phone}" class="vc-action-btn vc-text" style="font-size:.7rem;padding:5px 10px"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg> Text ${phoneFmt}</a>
    <a href="tel:${phone}" class="vc-action-btn vc-call" style="font-size:.7rem;padding:5px 10px"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Call</a>
  </div>`:`<span style="font-size:.68rem;color:var(--text3)">No phone on file</span>`;
  // Determine if guest action buttons should show
  const tRef=tasks.find(x=>x.id===detailId);
  const gcIsDone=tRef&&isDone(tRef);
  const showAssignGuest=tRef&&!gcIsDone&&!tRef.assignedToGuest;
  const showResolved=tRef&&!gcIsDone;
  const gcActionBtns=(showAssignGuest||showResolved)?`<div style="display:flex;gap:5px;margin-bottom:8px">
    ${showAssignGuest?`<button class="btn" onclick="assignToGuest()" style="border-color:var(--gold);color:var(--gold);font-size:.68rem;padding:3px 10px;box-shadow:none">Assign to Guest</button>`:''}
    ${showResolved?`<button class="btn" onclick="markResolvedByGuest()" style="border-color:var(--green);color:var(--green);font-size:.68rem;padding:3px 10px;box-shadow:none">Resolved by Guest</button>`:''}
  </div>`:'';
  el.innerHTML=`<div class="gc-foldout">
    <button class="gc-fold-trigger" onclick="this.closest('.gc-foldout').classList.toggle('open')">
      <span><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="vertical-align:-1px;margin-right:5px"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>Contact ${guestFirst} — current guest</span>
      <span class="gc-fold-arrow">&#x25BA;</span>
    </button>
    <div class="gc-fold-body"><div class="gc-fold-inner">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:4px 0 8px">
        <div>
          <div style="font-size:.84rem;font-weight:600;color:var(--text)">${guestName}</div>
          <div style="font-size:.68rem;color:var(--text2)">${checkin} – ${checkout}${activeRes.platform?' · '+activeRes.platform:''}</div>
        </div>
        ${phoneLinks}
      </div>
      ${gcActionBtns}
      <div class="gc-msg-box">
        <textarea id="gc-msg-input" placeholder="Send a message to ${guestFirst} via Hospitable..."></textarea>
        <button class="gc-send-btn" onclick="sendGuestCommMsg('${activeRes.reservationId}','${guestFirst}')">Send</button>
      </div>
    </div></div>
  </div>`;
}
async function sendGuestCommMsg(rid,guestFirst){
  const inp=document.getElementById('gc-msg-input');
  const msg=inp.value.trim();if(!msg)return;
  const btn=inp.nextElementSibling;btn.textContent='Sending...';btn.disabled=true;
  try{
    const r=await fetch(`${PROXY_BASE}/api/hospitable?action=send_message&rid=${rid}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})});
    if(!r.ok)throw new Error('API '+r.status);
    inp.value='';btn.textContent='Sent ✓';btn.style.background='#2e7d52';btn.style.borderColor='#2e7d52';
    // Add note to task
    const t=tasks.find(x=>x.id===detailId);
    if(t){if(!t.notes)t.notes=[];t.notes.push({text:`Message sent to ${guestFirst}: "${msg.slice(0,80)}${msg.length>80?'...':''}"`,type:'admin',time:new Date().toISOString(),by:getCurrentUserName()});await saveTasks();renderNotes(t);}
    showToast(`Message sent to ${guestFirst}!`);
    setTimeout(()=>{btn.textContent='Send';btn.style.background='';btn.style.borderColor='';btn.disabled=false;},2000);
  }catch(e){showToast('Failed to send: '+e.message);btn.textContent='Send';btn.disabled=false;}
}
async function renderDetailVendors(t,p){
  const area=document.getElementById('d-vendors');
  const titleEl=document.getElementById('d-vendors-title');

  // Completed tasks: just show who did it, no SMS or suggestions
  if(isDone(t)){
    titleEl.textContent='';
    if(t.vendor){
      area.innerHTML=`<div style="font-size:.82rem;color:var(--text2);padding:6px 0">Completed by <strong>${t.vendor}</strong></div>`;
    } else {
      area.innerHTML=`<div style="font-size:.82rem;color:var(--text3);padding:6px 0">No vendor assigned.</div>`;
    }
    return;
  }

  const m=vendors.filter(v=>v.categories.includes(t.category));
  const assignedVendor=t.vendor?vendors.find(v=>v.name.toLowerCase()===t.vendor.toLowerCase()):null;

  // Pre-generate vendor sheet URL if we have an assigned vendor + date
  let sheetUrl='';
  if(assignedVendor&&t.date){
    try{
      const sameDayIds=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===assignedVendor.name.toLowerCase()&&x.date===t.date&&!isDone(x)).map(x=>x.id);
      if(sameDayIds.length){
        const token=await createVendorSheet(assignedVendor.name,t.date,sameDayIds);
        sheetUrl=vendorSheetUrl(token);
      }
    }catch(e){console.error('[vendor-sheet] Token gen error:',e);}
  }

  function vendorCard(v,showAssign){
    let sms=buildSMS(t,p,v);
    if(sheetUrl&&!sms.includes('link for all the details'))sms+='\n\nClick this link for all the details!\n'+sheetUrl;
    const tel=v.phone.replace(/\D/g,'');
    const smsId='sms-'+v.id+'-'+t.id;
    const phoneFmt=v.phone;
    const isAssigned=!showAssign;
    const contactBtns=tel?`<div class="vc-action-row" style="flex-shrink:0">
      <a href="sms:${tel}" class="vc-action-btn vc-text"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg> Text ${isAssigned?phoneFmt:''}</a>
      <a href="tel:${tel}" class="vc-action-btn vc-call"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Call</a>
    </div>`:'';
    return`<div class="vsc">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div style="flex:1;min-width:0"><div class="vsn">${v.name}</div><div class="vsr">${v.role}</div>${isAssigned?'':`<div class="vsp">${v.phone}${v.email?' | '+v.email:''}</div>`}</div>
        ${isAssigned?contactBtns:''}
        ${showAssign?`<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0"><button class="btn btn-g" onclick="assignVendor('${v.name.replace(/'/g,"\\'")}')">Assign</button><button class="btn" style="font-size:.7rem;padding:4px 8px;background:var(--gold);color:#fff;border-color:var(--gold)" onclick="letVendorSchedule('${v.name.replace(/'/g,"\\'")}')" title="Assign and let vendor pick their own date">Let vendor schedule</button></div>`:''}
      </div>
      <div style="font-size:.72rem;color:var(--text2);margin:4px 0 6px">${v.note}</div>
      <button class="sms-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
        <span class="sms-toggle-label">Ready-to-Send Text Message</span>
        <span class="sms-toggle-arrow">&#x25BC;</span>
      </button>
      <div class="sms-collapsible">
        <div class="sms-box">
          <textarea class="sms-edit" id="${smsId}">${sms.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
          <div class="sms-acts">
            <a id="${smsId}-link" href="sms:${tel}?body=${encodeURIComponent(sms)}" class="sms-btn sms-send" onclick="updateSmsLink('${smsId}','${tel}')">Open in Messages</a>
            <button class="sms-btn sms-copy" onclick="copySms('${smsId}')">Copy Text</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function combinedCard(v,taskList){
    // Reuse the global combinedVendorCard with the same redesigned layout
    return combinedVendorCard(v,taskList,sheetUrl,false); // task detail: hide list
  }

  // If a vendor is assigned and they're in our list
  if(assignedVendor){
    titleEl.textContent='';
    let h='';
    // Always use the combined card layout — fall back to [t] if no date is set
    const sameDayTasks=getVendorDayTasks(assignedVendor.name,t.date);
    const taskListForCard=sameDayTasks.length?sameDayTasks:[t];
    h+=combinedCard(assignedVendor,taskListForCard);
    area.innerHTML=h;
    return;
  }

  // If vendor is assigned but not in our list
  if(t.vendor){
    titleEl.textContent='';
    let h=`<div style="font-size:.82rem;color:var(--text2);padding:6px 0;margin-bottom:8px">Assigned to <strong>${t.vendor}</strong> (not in vendor list)</div>`;
    if(m.length){
      h+=`<details><summary style="font-size:.78rem;color:var(--text2);cursor:pointer;padding:6px 0">Suggested vendors for this category (${m.length})</summary>`;
      h+=m.slice(0,3).map(v=>vendorCard(v,true)).join('');
      h+=`</details>`;
    }
    area.innerHTML=h;
    return;
  }

  // No vendor assigned — show suggestions in collapsible section
  titleEl.textContent='Vendors';
  if(!m.length){area.innerHTML='<div style="color:var(--text3);font-size:.82rem">Set a category to see vendor suggestions.</div>';return;}
  let h=`<details><summary style="font-size:.82rem;color:var(--text2);cursor:pointer;padding:6px 0">Suggested vendors for this category (${m.slice(0,3).length})</summary>`;
  h+=m.slice(0,3).map(v=>vendorCard(v,true)).join('');
  h+=`</details>`;
  area.innerHTML=h;
}
function copySms(id){
  const el=document.getElementById(id);if(!el)return;
  navigator.clipboard.writeText(el.value).then(()=>showToast('Copied.')).catch(()=>{el.select();document.execCommand('copy');showToast('Copied.');});
}
function updateSmsLink(id,tel){
  const el=document.getElementById(id+'-link');const ta=document.getElementById(id);
  if(el&&ta)el.href='sms:'+tel+'?body='+encodeURIComponent(ta.value);
}
function getNextCheckout(pid){
  const evs=icalCache[pid];
  if(!evs||evs==='error')return null;
  const today=new Date();today.setHours(12,0,0,0);
  const upcoming=evs.filter(e=>e.end>today).sort((a,b)=>a.end-b.end);
  return upcoming.length?upcoming[0].end:null;
}
// SMS TEMPLATE
const DEFAULT_SMS_TEMPLATE=`Hi {vendor_first_name}, we have a maintenance issue at one of our properties.{urgent_notice}

Property: {property_name}
Issue: {issue}{guest_name}
{date_info}

Thank you — Chip Burns, Storybook Escapes`;

let smsTemplate=DEFAULT_SMS_TEMPLATE;

async function loadSmsTemplate(){
  try{const r=await S.get('se_sms');if(r&&r.value)smsTemplate=r.value;}catch(e){}
  const el=document.getElementById('sms-template');
  if(el)el.value=smsTemplate;
}
async function saveSmsTemplate(){
  const el=document.getElementById('sms-template');if(!el)return;
  smsTemplate=el.value;
  await save('se_sms',smsTemplate);
  showToast('SMS template saved.');
}
function resetSmsTemplate(){
  smsTemplate=DEFAULT_SMS_TEMPLATE;
  const el=document.getElementById('sms-template');if(el)el.value=smsTemplate;
  showToast('Template reset to default. Click Save to apply.');
}
const DEFAULT_COMBINED_SMS_TEMPLATE=`Hey {vendor_first_name}! I've got {task_count} tasks for you on {date}.

{purchase_items}

{link_text}

{signoff}`;

let combinedSmsTemplate=DEFAULT_COMBINED_SMS_TEMPLATE;

async function loadCombinedSmsTemplate(){
  try{const r=await S.get('se_sms_combined');if(r&&r.value)combinedSmsTemplate=r.value;}catch(e){}
  const el=document.getElementById('sms-combined-template');
  if(el)el.value=combinedSmsTemplate;
}
async function saveCombinedSmsTemplate(){
  const el=document.getElementById('sms-combined-template');if(!el)return;
  combinedSmsTemplate=el.value;
  await save('se_sms_combined',combinedSmsTemplate);
  showToast('Combined SMS template saved.');
}
function resetCombinedSmsTemplate(){
  combinedSmsTemplate=DEFAULT_COMBINED_SMS_TEMPLATE;
  const el=document.getElementById('sms-combined-template');if(el)el.value=combinedSmsTemplate;
  showToast('Template reset to default. Click Save to apply.');
}
function insertPlaceholder(textareaId,placeholder){
  const ta=document.getElementById(textareaId);if(!ta)return;
  const start=ta.selectionStart,end=ta.selectionEnd;
  ta.value=ta.value.substring(0,start)+placeholder+ta.value.substring(end);
  ta.selectionStart=ta.selectionEnd=start+placeholder.length;
  ta.focus();
}
// LOGO
const DEFAULT_LOGO="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAQFUlEQVR4nO1ba3RUVZb+9rlVlfdDMLx8jA8abKK97BZblMakgAZEZ+xe3VWtJqlKoiQSfLSiPTO9ZtbNnbWc1lFRIFWheAYEnalqxx4dAUlVbiIRUdHWRrK6ZRBGRh7hEZKQVFJ179l7fxxSpYYQwjMof+pb61b9c+t839n7u/v7DoD/R/cCM8ChI1d/9gsnTHrRlXKq9uL8DwnAIVUFMCP+0rGCufSOuaFo4t7J8Z0SIB/1goiYpcl8AqKJe/1z/M4Ioqt5Nqf2YNRWFc7IGpI2EyQaE9/U99vvOyFAMOhSnFqDUVt7r7HbbatO2PSMBGIkTmsalpaM6WmKtSMV9VwzNWrqnuf2BaY+tem39kgeHzJi17PBJ+/es//nIl3RCbLjQOFMLIFZVqs9pSo2aSc4rcjLePNTSqU6es/KfrAZ6VUW6VKLXS1OOVATSGBwnokOGoeyc9ujyPVY7qy54sYQ4IwHUOne33p73wMTszJSNMcOodj68ck59oPhWELnZ5Lsk43qABTN3E6EDTAyCgwgAqFkQRSBpeX7F8j8CiaCKkFvAFZIX0h1OWwArldWrvCPsyconzPgi2mXMS02x/b1h8M2S5edM9B+m5LBdpn3ufMR/tG//Bl/xVQZhkiLwcyHE7WBuYpgv5JWv2mC1sTZZLldQJlaaAYyrZ5d4uuKdlgDMIFSqVI9dDh7BepLDPqG72/hMUeh7DPrQNI21gsQR0+QcUjCcmbLBYBLUyiz3SMlb0xX67I7Zq762iI5oSZ8LQpEQ1GaYWGMIen3qrGX7j/9dVdRX1otvvPkRAlzB4y1m7fxHk1J+MMR0OgeWRZ6OAKSriY1LxOd5LT016b62zu7ujFRHUkc0FmdGqxCUwRImCPvBfIiBViReh8kAkA3GMCGEA4zDIGwm0Jr82SveAIDGpaVO05SzhBBjTEN+yeDauJSN9uavtp8qM9SrXOmGSB9mSDMlZtgP/s3jVx4gGlhMGbAAVj2v1lf0THZ6ym+7YgZSkuxo7+g+xMQ6kahDXL4PdP6X85HQ0W97xjurCtMcR3Etk3IbQNOJeCKB7AAiRFiYV16zCQAaAp5pUoppknk0wEwk9kHy/zCjGQq3ksndUBSY0kwGC5sQFCPwlwejnU3uuaHoQDkNWICeXN7YsLCwJCMteXl3zOgGsMWU8A+/vOP3N7pDsdP50b6o95f+ECTvh6ApLAFA1oMRclas3Gy12bCwdJRDiQ+XJFJJSDIlxRwKH+lsdxycMbd3uV07vyDT4VAyUodGD9/hHpgQpxTACnrvLPDclZKsvC2EoO7u+EbJFCCmZggkEyFZgiUxTGbJColjJmsyTAAQxFISS5aCFWGyNBVpU9AlJbdHY0bUrtgvsztovABmMOFWZs5k4M+Q/KEgfMqsbGc2D0o7t7NiN+xx0yEhsqQpR5LCKWxSVBE4EIvadk5/clnLQINhvwL0kOc6n3emzS6WS0ayYZgAEYiRJgQpkhkASwb1vPoCgNgESBIgmTnxFzCRuAyATIANEJkEmGA2mChKQAtLbiMiIsJQACmSQSCOAdRJ4BYp0SYUdDBTTBCxhDSJqcmEsT0mk/ZCdLWl7f+6faA7ygG5QG2g6Oohit3Y1RIzsrKTCAkW8bR49JjK7XE6VuhIUbIkcAAZ9svkHgBdR1s4py2Vo0My+eqR+7hpG3DdqMu4fcxIPnCgiV0XeO3vi8FVXu4BA1SpqlQJINTURHAl7rv6/AOEVYzJ2dZM+ciXqNQYBJyX3aR13sfMdPyFM7vQe+H464LjfwGt4mD6pZ1APgAAAABJRU5ErkJggg==";
let appLogo=null;
function applyLogo(dataUrl){
  if(!dataUrl)return;
  const hdr=document.querySelector('.hlogo');
  if(hdr)hdr.src=dataUrl;
  let fav=document.querySelector('link[rel="icon"]');
  if(!fav){fav=document.createElement('link');fav.rel='icon';document.head.appendChild(fav);}
  fav.href=dataUrl;
  const preview=document.getElementById('logo-preview');
  if(preview){preview.src=dataUrl;preview.style.display='block';}
  const rmBtn=document.getElementById('logo-remove-btn');
  if(rmBtn)rmBtn.style.display='inline-block';
}
async function loadLogo(){
  try{const r=await S.get('se_logo');if(r&&r.value){appLogo=r.value;applyLogo(appLogo);}}catch(e){}
}
function handleLogoUpload(input){
  const file=input.files[0];if(!file)return;
  if(file.size>512000){showToast('Image too large. Please use an image under 500KB.');return;}
  const reader=new FileReader();
  reader.onload=async function(e){
    const dataUrl=e.target.result;
    appLogo=dataUrl;
    applyLogo(dataUrl);
    await S.set('se_logo',dataUrl);
    showToast('Logo saved.');
  };
  reader.readAsDataURL(file);
  input.value='';
}
async function removeLogo(){
  appLogo=null;
  await S.set('se_logo','');
  const hdr=document.querySelector('.hlogo');
  if(hdr)hdr.src=DEFAULT_LOGO;
  let fav=document.querySelector('link[rel="icon"]');
  if(fav)fav.href=DEFAULT_LOGO;
  const preview=document.getElementById('logo-preview');
  if(preview){preview.src='';preview.style.display='none';}
  const rmBtn=document.getElementById('logo-remove-btn');
  if(rmBtn)rmBtn.style.display='none';
  showToast('Logo removed.');
}
// ROADMAP
let rmItems=[];
let rmTab='active';

// Default sections for new installs
const RM_DEFAULT_SECTIONS=['Guest Communication','Data Sync & Mobile','Smart Routing','UI & Polish','New Features','Infrastructure'];
let rmSections=[]; // array of {id, name, order}

async function loadRoadmap(){
  try{
    const r=await S.get('se_roadmap');
    if(r&&r.value){
      try{
        const parsed=JSON.parse(r.value);
        // New format: {sections:[], items:[]}
        if(parsed&&parsed.sections){
          rmSections=parsed.sections;
          rmItems=parsed.items||[];
        } else if(Array.isArray(parsed)){
          // Old format: flat array of items — auto-migrate
          rmItems=parsed;
          rmSections=[];
        }
      }catch(e){rmItems=[];rmSections=[];}
    }
    // Auto-migrate from old se_notes text format
    if(rmItems.length===0&&rmSections.length===0){
      try{
        const old=await S.get('se_notes');
        if(old&&old.value&&old.value.trim()){
          const lines=old.value.split('\n').map(l=>l.replace(/^[\s\-–—•*]+/,'').trim()).filter(Boolean);
          lines.forEach(line=>{
            rmItems.push({id:rmUid(),text:line,status:'active',section:null,created:new Date().toISOString()});
          });
          if(rmItems.length>0){
            await saveRoadmap();
            showToast(rmItems.length+' roadmap items migrated from notes.');
          }
        }
      }catch(e){}
    }
    // Migrate old flat items that have no section field
    if(rmItems.length>0&&rmSections.length===0){
      const unsectioned=rmItems.filter(i=>!i.section&&i.status==='active');
      if(unsectioned.length>0){
        // Create a default "Unsorted" section for existing items
        const sec={id:rmUid(),name:'Unsorted',order:0};
        rmSections.push(sec);
        unsectioned.forEach(i=>i.section=sec.id);
        await saveRoadmap();
      }
    }
  }catch(e){}
  renderRoadmap();
}

function rmUid(){return 'rm_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);}

async function saveRoadmap(){
  try{await S.set('se_roadmap',JSON.stringify({sections:rmSections,items:rmItems}));}catch(e){}
}

function rmSwitchTab(tab){
  rmTab=tab;
  document.querySelectorAll('.rm-tab').forEach(t=>t.classList.toggle('active',t.dataset.rm===tab));
  const addWrap=document.getElementById('rm-add-wrap');
  if(addWrap)addWrap.style.display=tab==='active'?'flex':'none';
  const secWrap=document.getElementById('rm-add-section-wrap');
  if(secWrap)secWrap.style.display=tab==='active'?'flex':'none';
  renderRoadmap();
}

function rmAddSection(){
  const inp=document.getElementById('rm-section-input');if(!inp)return;
  const name=inp.value.trim();if(!name)return;
  const maxOrder=rmSections.reduce((m,s)=>Math.max(m,s.order||0),0);
  rmSections.push({id:rmUid(),name,order:maxOrder+1});
  inp.value='';
  saveRoadmap();renderRoadmap();
}

function rmDeleteSection(secId){
  // Move items to unsorted (null section) then delete section
  rmItems.forEach(i=>{if(i.section===secId)i.section=null;});
  rmSections=rmSections.filter(s=>s.id!==secId);
  saveRoadmap();renderRoadmap();
}

function rmRenameSectionSave(secId,el){
  const sec=rmSections.find(s=>s.id===secId);
  if(!sec)return;
  const newName=el.textContent.trim();
  if(newName&&newName!==sec.name){sec.name=newName;saveRoadmap();}
  else{el.textContent=sec.name;}
}

function rmAdd(){
  const inp=document.getElementById('rm-input');if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  // Add to first section if one exists, otherwise unsectioned
  const firstSec=rmSections.sort((a,b)=>(a.order||0)-(b.order||0))[0];
  rmItems.push({id:rmUid(),text,status:'active',section:firstSec?firstSec.id:null,created:new Date().toISOString()});
  inp.value='';
  saveRoadmap();renderRoadmap();
}

function rmAddToSection(secId){
  const inp=document.getElementById('rm-sec-input-'+secId);if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  rmItems.push({id:rmUid(),text,status:'active',section:secId,created:new Date().toISOString()});
  inp.value='';
  saveRoadmap();renderRoadmap();
}

function rmComplete(id){
  const item=rmItems.find(i=>i.id===id);if(!item)return;
  item.status='completed';item.completedAt=new Date().toISOString();
  saveRoadmap();renderRoadmap();showToast('Marked complete!');
}

function rmDismiss(id){
  const item=rmItems.find(i=>i.id===id);if(!item)return;
  item.status='dismissed';item.dismissedAt=new Date().toISOString();
  saveRoadmap();renderRoadmap();showToast('Idea dismissed.');
}

function rmRestore(id){
  const item=rmItems.find(i=>i.id===id);if(!item)return;
  item.status='active';delete item.completedAt;delete item.dismissedAt;
  saveRoadmap();renderRoadmap();showToast('Restored to active.');
}

function rmDelete(id){
  rmItems=rmItems.filter(i=>i.id!==id);
  saveRoadmap();renderRoadmap();
}

function rmEditSave(id,el){
  const item=rmItems.find(i=>i.id===id);
  if(!item)return;
  const newText=el.textContent.trim();
  if(newText&&newText!==item.text){item.text=newText;saveRoadmap();}
  else{el.textContent=item.text;}
}

function rmFmtDate(iso){
  if(!iso)return '';
  const d=new Date(iso);
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

// ── Drag and Drop ──
let _rmDragId=null;

function rmDragStart(e,id){
  _rmDragId=id;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',id);
  setTimeout(()=>{const el=document.getElementById('rmi-'+id);if(el)el.classList.add('dragging');},0);
}

function rmDragEnd(e){
  document.querySelectorAll('.rm-item.dragging').forEach(el=>el.classList.remove('dragging'));
  document.querySelectorAll('.rm-section-body.drag-over').forEach(el=>el.classList.remove('drag-over'));
  _rmDragId=null;
}

function rmDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect='move';
  const body=e.target.closest('.rm-section-body');
  if(body){
    document.querySelectorAll('.rm-section-body.drag-over').forEach(el=>{if(el!==body)el.classList.remove('drag-over');});
    body.classList.add('drag-over');
  }
}

function rmDragLeave(e){
  const body=e.target.closest('.rm-section-body');
  if(body&&!body.contains(e.relatedTarget))body.classList.remove('drag-over');
}

function rmDrop(e,secId){
  e.preventDefault();
  document.querySelectorAll('.rm-section-body.drag-over').forEach(el=>el.classList.remove('drag-over'));
  if(!_rmDragId)return;
  const item=rmItems.find(i=>i.id===_rmDragId);
  if(!item)return;

  // Determine drop position within section
  const body=e.target.closest('.rm-section-body');
  if(body){
    const cards=[...body.querySelectorAll('.rm-item')];
    const mouseY=e.clientY;
    let insertIdx=-1;
    for(let i=0;i<cards.length;i++){
      const rect=cards[i].getBoundingClientRect();
      if(mouseY<rect.top+rect.height/2){insertIdx=i;break;}
    }
    // Move item to this section
    item.section=secId;
    // Reorder items within section
    const secItems=rmItems.filter(i=>i.section===secId&&i.status==='active'&&i.id!==item.id);
    // Remove from global array and re-insert
    rmItems=rmItems.filter(i=>i.id!==item.id);
    if(insertIdx===-1){
      // Drop at end — find last item in this section
      const lastIdx=rmItems.reduce((acc,it,idx)=>it.section===secId&&it.status==='active'?idx:acc,-1);
      rmItems.splice(lastIdx+1,0,item);
    }else{
      // Find the global index of the item currently at insertIdx
      const targetItemId=cards[insertIdx]?.dataset?.id;
      if(targetItemId){
        const globalIdx=rmItems.findIndex(i=>i.id===targetItemId);
        rmItems.splice(globalIdx,0,item);
      }else{
        rmItems.push(item);
      }
    }
  }else{
    item.section=secId;
  }
  _rmDragId=null;
  saveRoadmap();renderRoadmap();
}

function renderRoadmap(){
  const list=document.getElementById('rm-list');if(!list)return;
  const active=rmItems.filter(i=>i.status==='active');
  const completed=rmItems.filter(i=>i.status==='completed').sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''));
  const dismissed=rmItems.filter(i=>i.status==='dismissed').sort((a,b)=>(b.dismissedAt||'').localeCompare(a.dismissedAt||''));

  const ca=document.getElementById('rm-cnt-active');if(ca)ca.textContent=active.length;
  const cc=document.getElementById('rm-cnt-completed');if(cc)cc.textContent=completed.length;
  const cd=document.getElementById('rm-cnt-dismissed');if(cd)cd.textContent=dismissed.length;

  // Active tab: render as sections with drag-and-drop
  if(rmTab==='active'){
    const sortedSections=[...rmSections].sort((a,b)=>(a.order||0)-(b.order||0));
    const unsectioned=active.filter(i=>!i.section||!rmSections.find(s=>s.id===i.section));
    let html='';

    sortedSections.forEach(sec=>{
      const secItems=active.filter(i=>i.section===sec.id);
      html+=`<div class="rm-section" id="rm-sec-${sec.id}">
        <div class="rm-section-hdr">
          <span class="rm-section-name" contenteditable="true" spellcheck="false"
            onblur="rmRenameSectionSave('${sec.id}',this)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}">${escHtml(sec.name)}</span>
          <span class="rm-section-count">${secItems.length}</span>
          <div class="rm-section-actions">
            <button class="rm-section-btn del" onclick="rmDeleteSection('${sec.id}')" title="Delete section">✕</button>
          </div>
        </div>
        <div class="rm-section-body" ondragover="rmDragOver(event)" ondragleave="rmDragLeave(event)" ondrop="rmDrop(event,'${sec.id}')">`;
      if(secItems.length===0){
        html+='<div class="rm-empty">Drag items here</div>';
      }else{
        secItems.forEach(item=>{html+=rmItemHtml(item,'active');});
      }
      html+=`<div style="display:flex;gap:6px;padding:4px 2px;margin-top:2px">
          <input type="text" id="rm-sec-input-${sec.id}" placeholder="Add item…" style="flex:1;padding:5px 9px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:.76rem;background:var(--white)" onkeydown="if(event.key==='Enter')rmAddToSection('${sec.id}')">
          <button class="btn" style="padding:4px 10px;font-size:.72rem" onclick="rmAddToSection('${sec.id}')">+</button>
        </div>`;
      html+='</div></div>';
    });

    // Unsectioned items
    if(unsectioned.length>0){
      html+=`<div class="rm-section" id="rm-sec-unsorted">
        <div class="rm-section-hdr">
          <span class="rm-section-name" style="cursor:default">Unsorted</span>
          <span class="rm-section-count">${unsectioned.length}</span>
        </div>
        <div class="rm-section-body" ondragover="rmDragOver(event)" ondragleave="rmDragLeave(event)" ondrop="rmDrop(event,null)">`;
      unsectioned.forEach(item=>{html+=rmItemHtml(item,'active');});
      html+='</div></div>';
    }

    if(sortedSections.length===0&&unsectioned.length===0){
      html='<div class="rm-empty">No active ideas yet. Add a section and start adding items!</div>';
    }
    list.innerHTML=html;
    return;
  }

  // Completed / Dismissed tabs: flat list (no sections)
  const items=rmTab==='completed'?completed:dismissed;
  if(items.length===0){
    const msg=rmTab==='completed'?'No completed items yet.':'No dismissed items.';
    list.innerHTML='<div class="rm-empty">'+msg+'</div>';
    return;
  }
  let html='';
  items.forEach(item=>{html+=rmItemHtml(item,rmTab);});
  list.innerHTML=html;
}

function rmItemHtml(item,tab){
  const cls=item.status==='completed'?'completed':item.status==='dismissed'?'dismissed':'';
  const dateLabel=item.status==='completed'?'Completed '+rmFmtDate(item.completedAt):item.status==='dismissed'?'Dismissed '+rmFmtDate(item.dismissedAt):'Added '+rmFmtDate(item.created);
  let actions='';
  if(tab==='active'){
    actions='<button class="rm-btn rm-btn-check" onclick="event.stopPropagation();rmComplete(\''+item.id+'\')" title="Mark complete">✓</button>'
      +'<button class="rm-btn rm-btn-dismiss" onclick="event.stopPropagation();rmDismiss(\''+item.id+'\')" title="Dismiss">✕</button>';
  }else{
    actions='<button class="rm-btn rm-btn-restore" onclick="rmRestore(\''+item.id+'\')" title="Restore to active">↩</button>'
      +'<button class="rm-btn rm-btn-dismiss" onclick="rmDelete(\''+item.id+'\')" title="Delete permanently">🗑</button>';
  }
  const draggable=tab==='active'?' draggable="true" ondragstart="rmDragStart(event,\''+item.id+'\')" ondragend="rmDragEnd(event)"':'';
  return '<div class="rm-item '+cls+'" id="rmi-'+item.id+'" data-id="'+item.id+'"'+draggable+'>'
    +'<span class="rm-drag-handle" title="Drag to reorder"'+(tab==='active'?'':'style="display:none"')+'>⠿</span>'
    +'<div style="flex:1"><div class="rm-item-text" contenteditable="'+(tab==='active'?'true':'false')+'" spellcheck="false"'
    +' onblur="rmEditSave(\''+item.id+'\',this)"'
    +' onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();this.blur();}"'
    +'>'+escHtml(item.text)+'</div>'
    +'<div class="rm-item-date">'+dateLabel+'</div></div>'
    +'<div class="rm-item-actions">'+actions+'</div></div>';
}

// ── Vendor Share Token ──
function generateVendorToken(){
  const chars='abcdefghijklmnopqrstuvwxyz0123456789';
  let t='';for(let i=0;i<12;i++)t+=chars[Math.floor(Math.random()*chars.length)];
  return t;
}
async function createVendorSheet(vendorName,date,taskIds){
  // Deterministic token based on vendor+date so the same link is reused
  // (adding/removing tasks from their day is reflected automatically)
  const raw=vendorName.toLowerCase().replace(/\s+/g,'')+':'+date;
  let hash=0;for(let i=0;i<raw.length;i++){hash=((hash<<5)-hash)+raw.charCodeAt(i);hash|=0;}
  const token='vd'+Math.abs(hash).toString(36)+date.replace(/-/g,'');
  const key='se_vs_'+token;
  // Only write if token doesn't already exist
  const existing=await S.get(key);
  if(!existing||!existing.value){
    const sheet={vendor:vendorName,date:date,created:new Date().toISOString()};
    await S.set(key,JSON.stringify(sheet));
  }
  return token;
}
function vendorSheetUrl(token){
  return'https://storybook-webhook.vercel.app/api/vendor-page?token='+token;
}

async function generateAndInsertSheet(smsId,vendorName,taskId,btnEl){
  // Collect all task IDs for this vendor+date
  const t=tasks.find(x=>x.id===taskId);
  if(!t||!t.date){alert('Task needs a scheduled date before generating a job sheet link.');return;}
  const sameDayIds=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===vendorName.toLowerCase()&&x.date===t.date&&!isDone(x)).map(x=>x.id);
  if(!sameDayIds.length)return;
  if(btnEl){btnEl.textContent='Generating...';btnEl.disabled=true;}
  try{
    const token=await createVendorSheet(vendorName,t.date,sameDayIds);
    const url=vendorSheetUrl(token);
    const ta=document.getElementById(smsId);
    if(ta){
      ta.value+='\n\nClick this link for all the details!\n'+url;
      // Update the sms: link too
      const link=(ta.closest('.sms-box')||ta.parentElement).querySelector('.sms-send');
      if(link)link.href='sms:'+link.href.split('sms:')[1].split('?')[0]+'?body='+encodeURIComponent(ta.value);
    }
    // Visual feedback
    if(btnEl){btnEl.textContent='✓ Link Added';setTimeout(()=>{btnEl.textContent='📋 Job Sheet Link';btnEl.disabled=false;},2000);}
  }catch(e){
    console.error('[vendor-sheet] Token gen error:',e);
    if(btnEl){btnEl.textContent='📋 Job Sheet Link';btnEl.disabled=false;}
    alert('Failed to generate link. Check console for details.');
  }
}

// Auto-inject job sheet link into all SMS textareas for a vendor after render
async function autoInjectSheetLink(vendorName,task){
  if(!task.date||!vendorName)return;
  const sameDayIds=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===vendorName.toLowerCase()&&x.date===task.date&&!isDone(x)).map(x=>x.id);
  if(!sameDayIds.length)return;
  try{
    const token=await createVendorSheet(vendorName,task.date,sameDayIds);
    const url=vendorSheetUrl(token);
    const sheetLine='\n\nClick this link for all the details!\n'+url;
    // Update all SMS textareas in the vendor detail area
    document.querySelectorAll('#d-vendors .sms-edit').forEach(ta=>{
      if(!ta.value.includes('link for all the details'))ta.value+=sheetLine;
      // Update matching sms: link
      const link=ta.closest('.sms-box')?.querySelector('.sms-send');
      if(link)link.href='sms:'+link.href.split('sms:')[1].split('?')[0]+'?body='+encodeURIComponent(ta.value);
    });
  }catch(e){console.error('[vendor-sheet] Auto-inject error:',e);}
}

// ── Vendor Multi-Day Schedule Link ─────────────────────────────
// Creates a persistent, bookmarkable link showing ALL upcoming tasks for a vendor
async function createVendorAgenda(vendorName){
  const raw=vendorName.toLowerCase().replace(/\s+/g,'');
  let hash=0;for(let i=0;i<raw.length;i++){hash=((hash<<5)-hash)+raw.charCodeAt(i);hash|=0;}
  const token='va'+Math.abs(hash).toString(36);
  const key='se_vs_'+token;
  const existing=await S.get(key);
  if(!existing||!existing.value){
    const sheet={vendor:vendorName,type:'agenda',created:new Date().toISOString()};
    await S.set(key,JSON.stringify(sheet));
  }
  return token;
}

function vendorAgendaUrl(token){
  return'https://storybook-webhook.vercel.app/api/vendor-page?token='+token;
}

async function generateVendorAgendaLink(vendorName){
  try{
    const token=await createVendorAgenda(vendorName);
    const url=vendorAgendaUrl(token);
    // Copy to clipboard
    await navigator.clipboard.writeText(url);
    showToast(`Schedule link for ${vendorName} copied to clipboard!`);
    return url;
  }catch(e){
    console.error('[vendor-agenda] Error:',e);
    showToast('Failed to generate schedule link');
    return null;
  }
}

// Opens SMS with the one-and-only vendor agenda link. The agenda view shows
// BOTH scheduled tasks and tasks the vendor still needs to pick a date for,
// so this single link covers every case. The body text adapts based on what
// the vendor currently has on their plate.
async function sendAllTasksLink(vendorName,tel){
  try{
    const token=await createVendorAgenda(vendorName);
    const url=vendorAgendaUrl(token);
    const firstName=vendorName.split(' ')[0];
    // Count dated vs. undated tasks assigned to this vendor so we can phrase
    // the SMS correctly — tasks awaiting vendor-picked dates get a specific
    // call-out so Cody knows to pick dates, not just review the schedule.
    const open=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===vendorName.toLowerCase()&&!isDone(x));
    const undated=open.filter(x=>!x.date).length;
    const dated=open.filter(x=>!!x.date).length;
    let body;
    if(undated>0&&dated>0){
      body=`Hi ${firstName}, here's your Storybook Escapes link — it shows your upcoming schedule plus ${undated} task${undated!==1?'s':''} that still need${undated!==1?'':'s'} a date picked by you:\n\n${url}\n\n— Chip Burns, Storybook Escapes`;
    }else if(undated>0){
      body=`Hi ${firstName}, you've got ${undated} task${undated!==1?'s':''} waiting on your schedule. When you have a moment, take a look and pick dates that work for you:\n\n${url}\n\n— Chip Burns, Storybook Escapes`;
    }else{
      body=`Hi ${firstName}, here's your Storybook Escapes link — all your upcoming tasks and projects in one place:\n\n${url}`;
    }
    window.location.href='sms:'+tel+'?body='+encodeURIComponent(body);
  }catch(e){
    console.error('[send-all-tasks] Error:',e);
    showToast('Failed to generate link','err');
  }
}

function buildSMS(t,p,v){
  const pn=p?p.name:t.property,addr=p?p.address:'',door=p?p.door:'';
  const urg=t.urgent?'\n\nThis is URGENT — same-day response needed if possible.':'';
  let ds;
  if(t.date){ds=`Scheduled for: ${t.date}`;}
  else{
    const nco=getNextCheckout(t.property);
    if(nco){const fmt=nco.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});ds=`Next available date: ${fmt} (next checkout). Let me know if that day works for you.`;}
    else{ds='Scheduling TBD — please let us know your availability.';}
  }
  let msg=smsTemplate
    .replace(/\{vendor_first_name\}/g, v.name.split(' ')[0])
    .replace(/\{property_name\}/g, pn)
    .replace(/\{address\}/g, addr)
    .replace(/\{door_code\}/g, door)
    .replace(/\{issue\}/g, t.problem||'')
    .replace(/\{guest_name\}/g, t.guest?`\nReported by guest: ${t.guest}`:'')
    .replace(/\{date_info\}/g, ds)
    .replace(/\{urgent_notice\}/g, urg);
  // Photo link removed — job sheet handles this now
  if(/hvac\s*filter/i.test(t.problem)||t.category==='hvac'&&/filter/i.test(t.problem))msg+=`\n\nPlease write today's date on the new filter and send us a photo when it's installed.`;
  const _effPurchase=taskEffectivePurchaseNote(t);
  const _effPurchaser=taskEffectivePurchaser(t);
  if(_effPurchase){
    if(_effPurchaser==='vendor')msg+=`\n\n🛒 You'll need to pick up: ${_effPurchase}`;
    else if(t.purchaseStatus==='purchased')msg+=`\n\n📦 We've purchased: ${_effPurchase} — please deliver/install it at the property.`;
    else msg+=`\n\n🛒 Item needed: ${_effPurchase} (we'll handle purchasing — just deliver when ready)`;
  }
  if(t._vendorSheetUrl)msg+='\n\nClick this link for all the details!\n'+t._vendorSheetUrl;
  return msg;
}
/* Get all active tasks for a vendor on a specific date */
function getVendorDayTasks(vendorName,date){
  if(!vendorName||!date)return[];
  return tasks.filter(t=>t.vendor&&t.vendor.toLowerCase()===vendorName.toLowerCase()&&t.date===date&&!isDone(t));
}
/* Build a consolidated SMS for multiple tasks going to the same vendor on the same day */
function buildMultiSMS(taskList,v,sheetUrlParam){
  const firstName=v.name.split(' ')[0];
  const date=taskList[0]&&taskList[0].date||'';
  const dateFmt=date?new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}):'today';
  const resolvedUrl=sheetUrlParam||(taskList[0]&&taskList[0]._vendorSheetUrl)||'';
  const linkText=resolvedUrl?'Click this link for all the details!\n'+resolvedUrl:'';
  // Build purchase items text if any tasks need materials bought.
  // Annotate each with its effective purchase note (stored OR synthesized
  // filter shortfall) so Deploy 2 bootstrap filter tasks get picked up.
  const purchaseTasks=taskList
    .map(t=>({t,note:taskEffectivePurchaseNote(t)}))
    .filter(x=>x.note);
  let purchaseText='';
  if(purchaseTasks.length){
    const vendorBuys=purchaseTasks.filter(x=>taskEffectivePurchaser(x.t)==='vendor');
    const ownerBuys=purchaseTasks.filter(x=>taskEffectivePurchaser(x.t)!=='vendor');
    const lines=[];
    if(vendorBuys.length){
      lines.push(`🛒 You'll need to pick up before heading out:`);
      vendorBuys.forEach(({t,note})=>{const p=getProp(t.property);const pName=p?p.name.split(' - ').pop().trim():t.property;lines.push(`• ${pName}: ${note}`);});
    }
    if(ownerBuys.length){
      const delivered=ownerBuys.filter(x=>x.t.purchaseStatus==='purchased');
      const pending=ownerBuys.filter(x=>x.t.purchaseStatus!=='purchased');
      if(delivered.length){lines.push(`📦 We've purchased — please deliver/install:`);delivered.forEach(({t,note})=>{const p=getProp(t.property);const pName=p?p.name.split(' - ').pop().trim():t.property;lines.push(`• ${pName}: ${note}`);});}
      if(pending.length){lines.push(`🛒 Items needed (we'll purchase — deliver when ready):`);pending.forEach(({t,note})=>{const p=getProp(t.property);const pName=p?p.name.split(' - ').pop().trim():t.property;lines.push(`• ${pName}: ${note}`);});}
    }
    purchaseText=lines.join('\n');
  }
  let sms = combinedSmsTemplate
    .replace(/\{vendor_first_name\}/g, firstName)
    .replace(/\{task_count\}/g, String(taskList.length))
    .replace(/\{date\}/g, dateFmt)
    .replace(/\{purchase_items\}/g, purchaseText)
    .replace(/\{link_text\}/g, linkText)
    .replace(/\{signoff\}/g, '— Chip Burns, Storybook Escapes')
    .replace(/\n{3,}/g, '\n\n'); // clean up extra blank lines when no purchase items
  // If user has a custom template without {purchase_items}, append purchase info after first line
  if (purchaseText && !combinedSmsTemplate.includes('{purchase_items}')) {
    sms = sms.replace(/\n/, '\n\n' + purchaseText + '\n');
  }
  return sms;
}
/* Render combined SMS card for a vendor with multiple same-day tasks (redesigned) */
function combinedVendorCard(v,taskList,sheetUrl,showTaskList=true){
  // Sort tasks by neighborhood then property for grouped display
  const sorted=[...taskList].sort((a,b)=>{
    const nbA=getNb(a.property),nbB=getNb(b.property);
    const nA=nbA?nbA.name:'zzz',nB=nbB?nbB.name:'zzz';
    if(nA!==nB)return nA.localeCompare(nB);
    return(a.property||'').localeCompare(b.property||'');
  });
  const sms=buildMultiSMS(sorted,v,sheetUrl||'');const tel=v.phone.replace(/\D/g,'');
  const smsId='sms-combined-'+v.id;

  // Build property-grouped task cards (only shown in vendor-day modal, not task detail)
  let taskHtml='';
  if(showTaskList){
    const propGroups={};const propOrder=[];
    sorted.forEach(t=>{
      if(!propGroups[t.property]){propGroups[t.property]=[];propOrder.push(t.property);}
      propGroups[t.property].push(t);
    });
    propOrder.forEach(pid=>{
      const p=getProp(pid);const nc=getNbCls(pid);
      const shortName=p?p.name.split(' - ').pop():pid;
      taskHtml+=`<div class="cg-prop-group">`;
      taskHtml+=`<div class="cg-prop-hdr" style="color:var(--${nc})">${shortName}</div>`;
      propGroups[pid].forEach(t=>{
        const isRoutine=!!t.recurring;
        taskHtml+=`<div class="cg-task${isRoutine?' routine':''}" onclick="closeModal('vendor-day-modal');openDetail('${t.id}')">`;
        taskHtml+=`<div class="cg-task-desc">${t.problem}${t.urgent?' <span style="color:var(--red);font-weight:700;font-size:.7rem">URGENT</span>':''}</div>`;
        {const _ep=taskEffectivePurchaseNote(t);if(_ep)taskHtml+=`<span class="cg-task-purchase">Buy: ${_ep}</span>`;}
        taskHtml+=`</div>`;
      });
      taskHtml+=`</div>`;
    });
  }

  // Build send row + collapsible message preview
  const escapedSms=sms.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // ONE link covers both scheduled tasks AND tasks the vendor still needs to
  // pick a date for — the agenda view on the vendor side shows both buckets.
  const sendHtml=`
    <div class="cg-send-row" style="flex-direction:column;align-items:stretch;gap:8px">
      <button class="cg-send-btn" style="justify-content:center;width:100%;font-size:.82rem;padding:9px 14px" onclick="sendAllTasksLink('${v.name.replace(/'/g,"\\'")}','${tel}')">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
        Send All Tasks
      </button>
    </div>`;

  return`<div class="combined-sms-banner">
    ${showTaskList?`<div class="cg-section-label">Tasks</div>${taskHtml}`:''}
    ${sendHtml}
  </div>`;
}
function renderNotes(t){
  const el=document.getElementById('d-notes');const ns=t.notes||[];
  // Update notes foldout count badge
  const notesCountEl=document.getElementById('dm-notes-count');
  if(notesCountEl){notesCountEl.textContent=ns.length>0?ns.length:'';notesCountEl.style.display=ns.length>0?'':'none';}
  if(!ns.length){el.innerHTML='<div style="color:var(--text3);font-size:.79rem">No notes yet.</div>';return;}
  el.innerHTML=ns.map((n,i)=>{
    const isAdmin=n.type!=='vendor';
    const name=isAdmin?(n.by||getCurrentUserName()):'Vendor';
    const time=new Date(n.time).toLocaleString();
    const actions=isAdmin?`<span class="note-actions"><button class="note-action-btn" onclick="event.stopPropagation();editNoteInline(${i})" title="Edit">Edit</button><button class="note-action-btn del" onclick="event.stopPropagation();deleteNoteInline(${i})" title="Delete">Delete</button></span>`:'';
    return`<div class="note ${n.type}" id="detail-note-${i}" style="position:relative"><div class="note-meta" style="display:flex;align-items:center;gap:6px"><span>${name} — ${time}</span>${actions}</div><div class="note-text" id="nt-${i}">${n.text}</div><div class="note-edit-area" id="ne-${i}" style="display:none"><textarea id="nei-${i}">${n.text}</textarea><div class="note-edit-btns"><button class="btn btn-g" onclick="saveNoteEdit(${i})">Save</button><button class="btn" onclick="cancelNoteEdit(${i})">Cancel</button></div></div></div>`;
  }).join('');
}
function editNoteInline(i){document.getElementById('nt-'+i).style.display='none';document.getElementById('ne-'+i).style.display='';const ta=document.getElementById('nei-'+i);ta.focus();ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';}
function cancelNoteEdit(i){document.getElementById('nt-'+i).style.display='';document.getElementById('ne-'+i).style.display='none';}
async function saveNoteEdit(i){const t=tasks.find(x=>x.id===detailId);if(!t||!t.notes||!t.notes[i])return;const txt=document.getElementById('nei-'+i).value.trim();if(!txt)return;t.notes[i].text=txt;await saveTasks();renderNotes(t);showToast('Note updated');}
async function deleteNoteInline(i){
  const el=document.getElementById('detail-note-'+i);
  if(el.querySelector('.note-del-confirm')){el.querySelector('.note-del-confirm').remove();return;}
  const c=document.createElement('div');c.className='note-del-confirm';
  c.innerHTML=`<p>Delete this note?</p><div style="display:flex;gap:6px"><button class="btn btn-red" onclick="confirmDeleteNote(${i})">Delete</button><button class="btn" onclick="this.closest('.note-del-confirm').remove()">Cancel</button></div>`;
  el.appendChild(c);
}
async function confirmDeleteNote(i){const t=tasks.find(x=>x.id===detailId);if(!t||!t.notes)return;t.notes.splice(i,1);await saveTasks();renderNotes(t);showToast('Note deleted');}
async function addNote(type){
  const inp=document.getElementById('d-note-input');const txt=inp.value.trim();if(!txt)return;
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  if(!t.notes)t.notes=[];t.notes.push({text:txt,type,time:new Date().toISOString(),by:getCurrentUserName()});
  await saveTasks();renderNotes(t);inp.value='';
}
async function updateField(f,v){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t[f]=v;
  // Auto-advance status: setting a date on an open task → scheduled
  if(f==='date'&&v&&t.status==='open'){t.status='scheduled';document.getElementById('d-status').value='scheduled';}
  await saveTasks();renderAll();
  // Refresh badges to reflect any status/category change
  renderDetailBadges(t);
  // Re-render vendor section when vendor or category changes
  if(f==='vendor'||f==='category'){
    const p=getProp(t.property);
    renderDetailVendors(t,p);
  }
}
async function assignVendor(name){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.vendor=name;
  // Auto-advance status from open → scheduled only if a date is already set
  if(t.status==='open'&&t.date)t.status='scheduled';
  // Also assign vendor to any other tasks on the same date & property (combined tasks)
  if(t.date){
    tasks.filter(x=>x.id!==t.id&&x.property===t.property&&x.date===t.date&&!isDone(x))
      .forEach(x=>{x.vendor=name;if(x.status==='open'&&x.date)x.status='scheduled';});
  }
  await saveTasks();
  // Refresh the modal fields to reflect the change immediately
  document.getElementById('d-vendor').value=name;
  document.getElementById('d-status').value=t.status;
  renderDetailBadges(t);
  // Hide suggested vendors — assignment is done
  document.getElementById('d-vendors').innerHTML=`<div style="font-size:.8rem;color:var(--text2);padding:6px 0">Assigned to <strong>${name}</strong>.</div>`;
  renderAll();
  closeModal('detail-modal');
  showToast(`${name} assigned to all tasks on this date.`);
}

// Assign a vendor to a task AND let them pick the date themselves.
// Unlike assignVendor (which expects admin to set date+vendor), this flow
// deliberately leaves t.date blank and texts the vendor their agenda link —
// the same link they already use for Send All Tasks, but now with scheduling
// power on the vendor side.
async function letVendorSchedule(name){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  const vendor=vendors.find(v=>v.name.toLowerCase()===name.toLowerCase());
  if(!vendor||!vendor.phone){
    alert('Vendor not found or has no phone number on file.');
    return;
  }
  t.vendor=name;
  // Deliberately do NOT set a date. Status stays 'open' until vendor picks a date.
  // (Matches assignVendor's existing behavior of leaving status=open when no date.)
  if(!t.date&&t.status!=='open')t.status='open';
  await saveTasks();
  // Build the scheduling-focused SMS
  try{
    const token=await createVendorAgenda(name);
    const url=vendorAgendaUrl(token);
    const p=getProp(t.property);
    const propName=p?p.name:t.property;
    const firstName=name.split(' ')[0];
    const urg=t.urgent?'\n\nThis one\'s marked URGENT — please let us know if same-day is possible.':'';
    const body=`Hi ${firstName}, we've got a new task for you at ${propName}:\n\n${t.problem}${urg}\n\nWhen you have a moment, take a look and pick a date that works:\n${url}\n\n— Chip Burns, Storybook Escapes`;
    const tel=vendor.phone.replace(/\D/g,'');
    renderAll();
    closeModal('detail-modal');
    showToast(`${name} assigned — open your SMS to send the scheduling link.`);
    // Launch SMS composer on the admin's device
    window.location.href='sms:'+tel+'?body='+encodeURIComponent(body);
  }catch(e){
    console.error('[let-vendor-schedule] Error:',e);
    showToast('Failed to generate scheduling link','err');
  }
}

// ─── DETAIL MODAL: BADGE + FOLDOUT SYSTEM ───────────────────────
function toggleDMFold(id){
  const el=document.getElementById(id);
  if(el)el.classList.toggle('open');
}

function renderDetailBadges(t){
  const row=document.getElementById('d-badge-row');
  if(!row||!t)return;
  const catLabel=t.category?(CAT_LABELS[t.category]||t.category.replace(/_/g,' ')):'No category';
  const catItems=[{id:'',label:'No category'},{id:'replacement',label:'Replacement'},...VCAT]
    .map(c=>`<button class="db-picker-item${t.category===c.id?' active':''}" onclick="detailBadgeClick('category','${c.id}')">${c.label}</button>`).join('');
  const STATUS_OPTS=[
    {id:'open',label:'Open',cls:'db-open'},
    {id:'scheduled',label:'Scheduled',cls:'db-scheduled'},
    {id:'in_progress',label:'In Progress',cls:'db-inprogress'},
    {id:'complete',label:'Complete',cls:'db-complete'}
  ];
  const statusOpt=STATUS_OPTS.find(s=>s.id===t.status)||STATUS_OPTS[0];
  const statusItems=STATUS_OPTS.map(s=>`<button class="db-picker-item${t.status===s.id?' active':''}" onclick="detailBadgeClick('status','${s.id}')">${s.label}</button>`).join('');
  const urgentHtml=t.urgent
    ?`<button class="db-badge db-urgent" onclick="toggleDetailUrgent()">&#x26A0; Urgent</button>`
    :`<button class="db-badge db-urgent-off" onclick="toggleDetailUrgent()">Mark as Urgent</button>`;
  row.innerHTML=`
    <div class="db-wrap">
      <button class="db-badge db-cat" onclick="toggleDBPicker('db-picker-cat',event,this)">${catLabel} <span class="db-arrow">&#x25BC;</span></button>
      <div class="db-picker" id="db-picker-cat">${catItems}</div>
    </div>
    <div class="db-wrap">
      <button class="db-badge ${statusOpt.cls}" onclick="toggleDBPicker('db-picker-status',event,this)">${statusOpt.label} <span class="db-arrow">&#x25BC;</span></button>
      <div class="db-picker" id="db-picker-status">${statusItems}</div>
    </div>
    ${urgentHtml}`;
}

function toggleDBPicker(id,event,btn){
  event.stopPropagation();
  const picker=document.getElementById(id);
  const isOpen=picker.classList.contains('open');
  document.querySelectorAll('.db-picker').forEach(p=>p.classList.remove('open'));
  if(!isOpen){
    const rect=btn.getBoundingClientRect();
    picker.style.top=(rect.bottom+4)+'px';
    picker.style.left=rect.left+'px';
    picker.classList.add('open');
  }
}

async function detailBadgeClick(field,value){
  const selId=field==='category'?'d-category':'d-status';
  const sel=document.getElementById(selId);if(sel)sel.value=value;
  await updateField(field,value);
  const t=tasks.find(x=>x.id===detailId);if(t)renderDetailBadges(t);
  document.querySelectorAll('.db-picker').forEach(p=>p.classList.remove('open'));
}

// Legacy stub — now handled by renderDetailBadges
function renderUrgentToggle(task){ renderDetailBadges(task); }

async function toggleDetailUrgent(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.urgent=!t.urgent;
  renderDetailBadges(t);
  await saveTasks();renderAll();
  showToast(t.urgent?'Marked as urgent.':'Urgent removed.');
}

// ─── VENDOR SEARCHABLE DROPDOWN ─────────────────────────────────
// Validate vendor input on blur: must match an existing vendor name (case-insensitive).
// If partial/invalid text, revert to the last saved vendor for this task.
async function validateVendorInput(){
  const inp=document.getElementById('d-vendor');
  const val=inp.value.trim();
  const t=tasks.find(x=>x.id===detailId);
  if(!t)return;
  // Empty is valid — means unassigning vendor
  if(!val){
    if(t.vendor){
      await updateField('vendor','');
      showToast('Vendor removed.');
    }
    return;
  }
  // Check for exact match (case-insensitive) in vendor list
  const match=vendors.find(v=>v.name.toLowerCase()===val.toLowerCase());
  if(match){
    // Normalize to proper casing and save
    inp.value=match.name;
    if(t.vendor!==match.name) await updateField('vendor',match.name);
  } else {
    // Invalid — revert to last saved vendor
    inp.value=t.vendor||'';
    showToast('Please select a vendor from the list.');
  }
  closeVendorDD();
}
let vdOpen=false;
function buildVendorDD(filter=''){
  const dd=document.getElementById('vd-dropdown');
  const q=filter.toLowerCase().trim();
  // Group vendors by category
  let html='';
  let anyMatch=false;
  for(const cat of VCAT){
    const catVendors=vendors.filter(v=>v.categories.includes(cat.id));
    const matched=catVendors.filter(v=>{
      if(!q)return true;
      return v.name.toLowerCase().includes(q)||v.role.toLowerCase().includes(q)||cat.label.toLowerCase().includes(q);
    });
    if(!matched.length)continue;
    anyMatch=true;
    html+=`<div class="vd-cat-label">${cat.label}</div>`;
    const currentVendor=document.getElementById('d-vendor').value;
    for(const v of matched){
      const sel=v.name===currentVendor?'sel':'';
      html+=`<div class="vd-item ${sel}" onclick="selectVendorDD('${v.name.replace(/'/g,"\\'")}')">
        <span>${v.name}</span><span class="vd-role">${v.role}</span>
      </div>`;
    }
  }
  if(!anyMatch)html='<div class="vd-none">No matching vendors</div>';
  dd.innerHTML=html;
}
function openVendorDD(){
  const dd=document.getElementById('vd-dropdown');
  buildVendorDD(document.getElementById('d-vendor').value);
  dd.style.display='block';vdOpen=true;
}
function closeVendorDD(){
  document.getElementById('vd-dropdown').style.display='none';vdOpen=false;
}
function toggleVendorDD(){
  if(vdOpen)closeVendorDD(); else openVendorDD();
}
function filterVendorDD(val){
  buildVendorDD(val);
  document.getElementById('vd-dropdown').style.display='block';vdOpen=true;
}
async function selectVendorDD(name){
  document.getElementById('d-vendor').value=name;
  closeVendorDD();
  await updateField('vendor',name);
}
// Close dropdown on outside click
document.addEventListener('click',e=>{
  if(vdOpen && !document.getElementById('vd-wrap')?.contains(e.target))closeVendorDD();
  // Close badge pickers when clicking outside
  if(!e.target.closest('.db-wrap'))document.querySelectorAll('.db-picker').forEach(p=>p.classList.remove('open'));
});

async function markComplete(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  // Deploy 3: gate filter tasks on a recount close-out before marking complete.
  // Vendor must enter how many filters of each size are left at the cabin.
  if(typeof fsPromptRecount==='function' && (t.filter_service_bundled || t.filter_auto_generated) && !t.filter_recount_submitted_by_vendor){
    const ok=await fsPromptRecount(t);
    if(!ok)return; // cancelled — stay open
  }
  t.status='complete';document.getElementById('d-status').value='complete';
  document.getElementById('complete-btn').style.display='none';
  logTaskChange('completed',t);await saveTasks();closeModal('detail-modal');renderAll();showToast('Task marked complete.');
  // Deploy 2: if this task carried filter service, writeback profile last_service_date
  if(typeof fsOnTaskComplete==='function')fsOnTaskComplete(t);
  // Check if this completes a payment group where vendor requested payment
  checkAdminPaymentPrompt(t);
}

// Quick-complete from vendor-done banner (no modal needed)
async function vdQuickComplete(id,e){
  e.stopPropagation();
  const t=tasks.find(x=>x.id===id);if(!t)return;
  // Deploy 3: filter tasks get the recount modal even on quick-complete path
  if(typeof fsPromptRecount==='function' && (t.filter_service_bundled || t.filter_auto_generated) && !t.filter_recount_submitted_by_vendor){
    const ok=await fsPromptRecount(t);
    if(!ok)return;
  }
  t.status='complete';logTaskChange('completed',t);
  await saveTasks();renderAll();showToast('Task marked complete.');
  if(typeof fsOnTaskComplete==='function')fsOnTaskComplete(t);
  checkAdminPaymentPrompt(t);
}

function checkAdminPaymentPrompt(justCompleted){
  if(!justCompleted.vendorPaymentRequested)return;
  if(!justCompleted.vendor||!justCompleted.date)return;
  const group=PAY_GROUPS.find(g=>g.props.includes(justCompleted.property));
  if(!group)return;
  // Find all tasks from this vendor on this date in this payment group that had a payment request
  const groupTasks=tasks.filter(x=>
    x.vendor&&x.vendor.toLowerCase()===justCompleted.vendor.toLowerCase()
    &&x.date===justCompleted.date
    &&group.props.includes(x.property)
    &&x.vendorPaymentRequested
  );
  if(groupTasks.length===0)return;
  // Check if ALL are now complete
  const allConfirmed=groupTasks.every(x=>isDone(x));
  if(!allConfirmed)return;
  // Show admin payment prompt
  const vendorName=justCompleted.vendor;
  const firstName=vendorName.split(' ')[0];
  const method=justCompleted.vendorPaymentRequested.method||'venmo';
  const taskCount=groupTasks.length;
  const propNames=[...new Set(groupTasks.map(x=>{
    const p=PROPS.find(pp=>pp.id===x.property);
    return p?(p.name.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'')):x.property;
  }))];
  const dateStr=justCompleted.date?new Date(justCompleted.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}):'';
  const methodLabel=method==='venmo'?'Venmo':'Cash App';
  const venmoUrl=`https://venmo.com/${VENMO_USER}?txn=pay&note=${encodeURIComponent('Maintenance '+dateStr+' - '+group.label)}`;
  const cashappUrl=`https://cash.app/$${CASHAPP_TAG}`;

  const overlay=document.createElement('div');
  overlay.className='vp-overlay';
  overlay.innerHTML=`<div class="vp-prompt">
    <div class="vp-prompt-hdr" style="background:var(--gold);background:linear-gradient(135deg,#b8960f 0%,#c9a84c 100%)">
      <div class="vp-prompt-check" style="background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.5);color:#fff">💰</div>
      <div class="vp-prompt-title" style="color:#fff">${firstName} sent a ${methodLabel} request</div>
      <div class="vp-prompt-sub" style="color:rgba(255,255,255,.8)">${taskCount} task${taskCount!==1?'s':''} confirmed at ${group.label}</div>
    </div>
    <div class="vp-prompt-body">
      <div class="vp-prompt-note">
        <strong>${vendorName}</strong> completed work at <strong>${propNames.join(', ')}</strong> on ${dateStr} and sent a <strong>${methodLabel}</strong> payment request.
      </div>
      <div class="vp-pay-btns">
        ${method==='venmo'?`<a href="${venmoUrl}" class="vp-pay-btn venmo" target="_blank"><span style="font-size:1.1rem">💸</span> Open Venmo to Pay</a>`
        :`<a href="${cashappUrl}" class="vp-pay-btn cashapp" target="_blank"><span style="font-size:1.1rem">💵</span> Open Cash App to Pay</a>`}
      </div>
      <button class="btn" style="width:100%;margin-bottom:10px;padding:10px;font-size:.78rem" onclick="generateInvoice('${vendorName}','${method}','${dateStr}',${JSON.stringify(groupTasks.map(x=>x.id)).replace(/"/g,'&quot;')})">View Invoice</button>
      <button class="vp-prompt-skip" onclick="this.closest('.vp-overlay').remove()">I'll handle this later</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
}
async function generateInvoice(vendorName,method,dateStr,taskIds){
  const invTasks=taskIds.map(id=>tasks.find(t=>t.id===id)).filter(Boolean);
  if(!invTasks.length)return;
  const firstName=vendorName.split(' ')[0];
  const initials=vendorName.split(' ').map(w=>w[0]).join('').toUpperCase();
  const invNum='SE-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+initials;
  const methodLabel=method==='venmo'?`Venmo (@${VENMO_USER})`:`Cash App ($${CASHAPP_TAG})`;
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  // Build task rows
  let taskRows='';
  invTasks.forEach(t=>{
    const p=getProp(t.property);const nb=getNb(t.property);
    const pn=p?p.name.split(' - ').pop():t.property;
    const nbn=nb?nb.name:'';
    taskRows+=`<div class="vp-invoice-row"><div class="vp-invoice-label">${t.problem}<small>${pn} &middot; ${nbn}</small></div></div>`;
  });
  // Receipts (from vendor photos tagged as receipts, if any)
  let receiptRows='';let receiptTotal=0;
  invTasks.forEach(t=>{
    if(t.vendorReceipts&&t.vendorReceipts.length){
      t.vendorReceipts.forEach(r=>{
        receiptRows+=`<div class="vp-invoice-row" style="border-top:1px dashed var(--border)"><div class="vp-invoice-label" style="color:var(--text2)">Receipt: ${r.description||'Vendor receipt'}<small>${r.store||'Uploaded by vendor'}</small></div><div class="vp-invoice-val">$${(r.amount||0).toFixed(2)}</div></div>`;
        receiptTotal+=(r.amount||0);
      });
    }
  });
  // Payment amount (from vendorPaymentRequested.amount if Cash App)
  const payReq=invTasks[0]?.vendorPaymentRequested;
  const laborAmt=payReq?.amount||0;
  const total=receiptTotal+laborAmt;
  let totalRows='';
  if(receiptTotal>0)totalRows+=`<div class="vp-invoice-row" style="border-top:1px dashed var(--border);margin-top:4px;padding-top:8px"><div class="vp-invoice-label" style="color:var(--text2)">Receipt reimbursement subtotal</div><div class="vp-invoice-val">$${receiptTotal.toFixed(2)}</div></div>`;
  if(laborAmt>0)totalRows+=`<div class="vp-invoice-row"><div class="vp-invoice-label" style="color:var(--text2)">${method==='venmo'?'Venmo':'Cash App'} request amount (labor)</div><div class="vp-invoice-val">$${laborAmt.toFixed(2)}</div></div>`;
  if(total>0)totalRows+=`<div class="vp-invoice-row total"><div class="vp-invoice-label">Total</div><div class="vp-invoice-val" style="color:var(--green);font-size:.95rem">$${total.toFixed(2)}</div></div>`;
  // Load logo from KV if available
  const logoHtml=appLogo?`<img src="${appLogo}" style="height:36px" alt="Storybook Escapes">`:`<span style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--gold-light);font-weight:600;letter-spacing:2.5px;text-transform:uppercase">Storybook Escapes</span>`;
  const overlay=document.createElement('div');
  overlay.className='vp-overlay';
  overlay.style.alignItems='flex-start';overlay.style.paddingTop='40px';overlay.style.overflowY='auto';
  overlay.innerHTML=`<div class="vp-prompt" style="max-width:460px">
    <div class="vp-invoice">
      <div class="vp-invoice-hdr">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="height:36px;display:flex;align-items:center">${logoHtml}</div>
            <span style="color:rgba(255,255,255,.25);font-size:1rem;margin:0 4px">|</span>
            <span style="font-family:'Cormorant Garamond',serif;font-size:1rem;color:rgba(255,255,255,.6);font-weight:400">Invoice</span>
          </div>
          <div class="vp-invoice-date">${today}</div>
        </div>
      </div>
      <div class="vp-invoice-body">
        <div class="vp-invoice-meta">
          <div class="vp-invoice-meta-item" style="flex:1"><strong>Vendor</strong>${vendorName}</div>
          <div class="vp-invoice-meta-item" style="flex:1"><strong>Payment Method</strong>${methodLabel}</div>
          <div class="vp-invoice-meta-item"><strong>Invoice #</strong>${invNum}</div>
        </div>
        ${taskRows}
        ${receiptRows}
        ${totalRows}
      </div>
      <div class="vp-invoice-actions">
        <button class="save" onclick="downloadInvoiceHtml('${invNum}')">Download Invoice</button>
        <button class="share" onclick="showToast('Share link copied (coming soon)')">Share</button>
      </div>
    </div>
    <button class="vp-prompt-skip" style="margin-top:8px" onclick="this.closest('.vp-overlay').remove()">Close</button>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});

  // ── Store invoice on tasks and vendor record ──
  const invoiceRecord={id:invNum,vendor:vendorName,method,date:dateStr,total,receiptTotal,laborAmt,taskIds,createdAt:new Date().toISOString()};
  // Attach to each task
  invTasks.forEach(t=>{t.invoice=invoiceRecord;});
  await saveTasks();
  // Attach to vendor record
  const vMatch=vendors.find(v=>v.name.toLowerCase()===vendorName.toLowerCase());
  if(vMatch){
    if(!vMatch.invoices)vMatch.invoices=[];
    vMatch.invoices.push(invoiceRecord);
    await saveVendors();
  }
}

function downloadInvoiceHtml(invNum){
  // Find the invoice overlay currently showing and grab its HTML
  const invoiceEl=document.querySelector('.vp-invoice');
  if(!invoiceEl){showToast('No invoice to download.','err');return;}
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${invNum}</title>
<style>body{font-family:'DM Sans',Helvetica,Arial,sans-serif;margin:40px auto;max-width:560px;color:#1a2e22}
.vp-invoice{border:1px solid #dce5de;border-radius:10px;overflow:hidden}
.vp-invoice-hdr{background:linear-gradient(135deg,#0d3528,#1a5240);padding:18px 20px;color:#fff}
.vp-invoice-body{padding:18px 20px}
.vp-invoice-meta{display:flex;gap:14px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #dce5de}
.vp-invoice-meta-item{font-size:.78rem;color:#4a6355;line-height:1.4}
.vp-invoice-meta-item strong{color:#1a2e22;display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.5px;margin-bottom:1px}
.vp-invoice-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;font-size:.82rem}
.vp-invoice-row.total{font-weight:700;border-top:2px solid #0d3528;margin-top:8px;padding-top:10px}
.vp-invoice-label small{display:block;font-size:.7rem;color:#8aaa95;margin-top:2px}
.vp-invoice-actions{display:none}
@media print{body{margin:20px}}
</style></head><body>${invoiceEl.outerHTML}</body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`invoice-${invNum}.html`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  showToast('Invoice downloaded.');
}
async function markResolvedByGuest(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.status='resolved_by_guest';
  t.notes=t.notes||[];t.notes.push({text:'Marked as resolved by guest.',type:'admin',time:new Date().toISOString()});
  await saveTasks();closeModal('detail-modal');renderAll();showToast('Task marked as resolved by guest.');
}
async function assignToGuest(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.vendor='Guest (Ask Next Guest)';
  t.assignedToGuest=true;
  t.notes=t.notes||[];t.notes.push({text:'Assigned to guest — will ask next guest to verify/address.',type:'admin',time:new Date().toISOString()});
  await saveTasks();
  document.getElementById('d-vendor').value='Guest (Ask Next Guest)';
  const p=getProp(t.property);
  renderDetailVendors(t,p);renderAll();
  showToast('Task assigned to guest.');
}
// ── ADD TO PROJECT (from task detail modal) ─────────────────────────────────
function toggleAddToProject(btn){
  const dd=document.getElementById('atp-dropdown');
  if(dd.style.display==='block'){dd.style.display='none';return;}
  // Populate with active projects (status !== 'complete')
  if(typeof projects==='undefined'||!projects.length){
    dd.innerHTML='<div style="padding:10px 14px;font-size:.79rem;color:var(--text3)">No active projects.</div>';
    dd.style.display='block';return;
  }
  const active=projects.filter(p=>p.status!=='complete');
  if(!active.length){
    dd.innerHTML='<div style="padding:10px 14px;font-size:.79rem;color:var(--text3)">No active projects.</div>';
    dd.style.display='block';return;
  }
  dd.innerHTML=active.map(p=>`
    <div style="padding:9px 14px;cursor:pointer;font-size:.81rem;color:var(--text);border-bottom:1px solid var(--border);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
      onmouseover="this.style.background='var(--green-light)'" onmouseout="this.style.background=''"
      onclick="addTaskToProject('${p.id}',${JSON.stringify(p.title).replace(/</g,'&lt;')})">
      ${p.title}
    </div>`).join('');
  dd.style.display='block';
  // Close on outside click
  setTimeout(()=>document.addEventListener('click',function handler(e){
    if(!document.getElementById('atp-dropdown')?.contains(e.target)&&!btn.contains(e.target)){
      document.getElementById('atp-dropdown').style.display='none';
      document.removeEventListener('click',handler);
    }
  }),0);
}

async function addTaskToProject(projectId, projectTitle){
  document.getElementById('atp-dropdown').style.display='none';
  const t=tasks.find(x=>x.id===detailId);if(!t){showToast('Task not found','err');return;}
  const p=projects.find(x=>x.id===projectId);if(!p){showToast('Project not found','err');return;}
  // Check if already linked
  const already=(p.items||[]).some(i=>i.task_id===t.id);
  if(already){showToast('Task is already in this project','err');return;}
  // Create a new project item linked to this task
  if(!p.items)p.items=[];
  p.items.push({
    item_id:'pi_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    name: t.category||'task',
    remark: t.problem,
    room: '',
    status: 'fail',
    page: null,
    task_id: t.id,
  });
  await savePJ();
  showToast(`Added to "${projectTitle}"`);
  // Refresh the button to confirm state
  const btn=document.getElementById('add-to-project-btn');
  if(btn){btn.textContent='✓ In Project';btn.disabled=true;btn.style.color='var(--green)';}
}

async function deleteTask(){
  const deleted=tasks.find(x=>x.id===detailId);if(!deleted)return;
  const idx=tasks.indexOf(deleted);
  logTaskChange('deleted',deleted);
  tasks=tasks.filter(x=>x.id!==detailId);await saveTasks();
  closeModal('detail-modal');renderAll();
  showToast('Task deleted.','',async()=>{tasks.splice(idx,0,deleted);await saveTasks();renderAll();showToast('Task restored.');});
}

// PROPERTY HISTORY
/* Quick-add historical task form */
let histFormOpen=false;
function toggleHistForm(){histFormOpen=!histFormOpen;renderHistory();}
async function saveHistTask(){
  const date=document.getElementById('h-date').value;
  const pid=document.getElementById('h-prop').value;
  const cat=document.getElementById('h-cat').value;
  const desc=document.getElementById('h-desc').value.trim();
  const vendor=document.getElementById('h-vendor').value.trim();
  if(!date||!pid||!desc){showToast('Date, property, and description are required.','err');return;}
  const t={id:Date.now().toString(),property:pid,guest:'',problem:desc,category:cat,status:'complete',date,vendor,urgent:false,recurring:false,notes:[{text:'Added as historical record.',type:'admin',time:new Date().toISOString()}],vendorNotes:'',created:new Date().toISOString()};
  tasks.unshift(t);logTaskChange('created',t);await saveTasks();
  histFormOpen=false;renderAll();showToast('Historical task added.');
}
function buildHistForm(){
  const propOpts=NBS.map(nb=>{
    const opts=nb.props.map(pid=>{const p=getProp(pid);return p?`<option value="${pid}">${p.name.split(' - ').pop()}</option>`:''}).join('');
    return`<optgroup label="${nb.name}">${opts}</optgroup>`;
  }).join('');
  const vendorOpts=vendors.map(v=>`<option value="${v.name}">${v.name} — ${v.role}</option>`).join('');
  return`<div style="background:var(--gold-pale);border:1px solid var(--gold-light);border-radius:var(--radius);padding:16px;margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--green)">Add Historical Record</div>
      <button class="btn" onclick="toggleHistForm()" style="font-size:.7rem">Cancel</button>
    </div>
    <div style="display:grid;grid-template-columns:140px 1fr 140px;gap:10px;margin-bottom:10px">
      <div><label style="font-size:.68rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px">Date</label><input type="date" id="h-date" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:.8rem"></div>
      <div><label style="font-size:.68rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px">Property</label><select id="h-prop" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:.8rem"><option value="">Select...</option>${propOpts}</select></div>
      <div><label style="font-size:.68rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px">Category</label><select id="h-cat" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:.8rem"><option value="handyman">Handyman</option><option value="plumbing">Plumbing</option><option value="hvac">HVAC</option><option value="electrical">Electrical</option><option value="pest">Pest Control</option><option value="hot_tub">Hot Tub</option><option value="pool">Pool</option><option value="landscaping">Landscaping</option><option value="arcade">Arcade</option><option value="septic">Septic</option><option value="water">Water Filtration</option><option value="cleaning">Cleaning</option><option value="other">Other</option></select></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 200px;gap:10px;margin-bottom:12px">
      <div><label style="font-size:.68rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px">Description</label><input type="text" id="h-desc" placeholder="What was done?" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:.8rem"></div>
      <div><label style="font-size:.68rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px">Vendor</label><input type="text" id="h-vendor" list="h-vendor-list" placeholder="Who did the work?" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:.8rem"><datalist id="h-vendor-list">${vendorOpts}</datalist></div>
    </div>
    <button class="btn btn-g" onclick="saveHistTask()">Add Record</button>
  </div>`;
}
/* Repeat issue detection — analyzes completed tasks for patterns */
function buildTrendInsights(doneTasks){
  if(doneTasks.length<3)return''; // not enough data
  const now=new Date();const sixMonthsAgo=new Date(now);sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);
  // Group by property+category
  const combos={};
  doneTasks.forEach(t=>{
    const d=t.date||t.created;if(!d)return;
    const key=t.property+'||'+t.category;
    if(!combos[key])combos[key]={property:t.property,category:t.category,total:0,recent:0,tasks:[]};
    combos[key].total++;
    combos[key].tasks.push(d);
    if(new Date(d+'T12:00:00')>=sixMonthsAgo)combos[key].recent++;
  });
  // Find repeat offenders: 3+ same category at same property
  const repeats=Object.values(combos).filter(c=>c.total>=3).sort((a,b)=>b.recent-a.recent||b.total-a.total);
  if(!repeats.length)return'';
  // Also find properties with the highest total issue count
  const propTotals={};doneTasks.forEach(t=>{propTotals[t.property]=(propTotals[t.property]||0)+1;});
  const topProps=Object.entries(propTotals).sort((a,b)=>b[1]-a[1]).slice(0,3);
  let h=`<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px;box-shadow:var(--shadow)">`;
  h+=`<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--green);margin-bottom:10px">Repeat Issue Alerts</div>`;
  h+=`<div style="display:flex;flex-direction:column;gap:6px">`;
  repeats.slice(0,6).forEach(c=>{
    const p=getProp(c.property);const pn=p?p.name.split(' - ').pop():c.property;
    const nb=getNb(c.property);const nc=nb?nb.cls:'other';
    const cat=(c.category||'other').replace('_',' ');
    const dates=c.tasks.sort();const first=dates[0];const last=dates[dates.length-1];
    const span=Math.round((new Date(last+'T12:00:00')-new Date(first+'T12:00:00'))/(864e5*30));
    const spanLabel=span<=1?'in the last month':span<=6?`over ${span} months`:`over ${span} months`;
    const severity=c.recent>=3?'var(--red)':c.recent>=2?'var(--gold)':'var(--text3)';
    h+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface2);border-radius:8px;border-left:3px solid ${severity};cursor:pointer" onclick="selProp='${c.property}';histCat='${c.category}';renderHistory()">
      <div style="flex:1">
        <span style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--${nc})">${pn}</span>
        <span style="font-size:.75rem;color:var(--text);margin-left:6px"><strong>${c.total}</strong> ${cat} issue${c.total>1?'s':''} ${spanLabel}</span>
        ${c.recent>=2?`<span style="font-size:.65rem;color:var(--red);margin-left:6px;font-weight:600">(${c.recent} in last 6 mo)</span>`:''}
      </div>
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}
function renderHistory(){
  const container=document.getElementById('hist-container');
  // Property grid grouped by neighborhood — with detail slots
  let gridHtml='';
  NBS.forEach(nb=>{
    const cards=nb.props.map(pid=>{
      const p=getProp(pid);if(!p)return'';
      const done=tasks.filter(t=>t.property===pid&&isDone(t)).length;
      return`<div class="pc nb-${nb.cls} ${selProp===pid?'sel':''}" id="pc-${pid}" onclick="selPropFn('${pid}')" style="cursor:pointer">
        <div class="pc-name">${p.name.split(' - ').pop()}</div>
        <div class="pcs"><strong>${done}</strong> completed</div>
      </div>`;
    }).join('');
    gridHtml+=`<div class="nb-section" id="nb-${nb.cls}"><div class="nb-hdr nb-${nb.cls}-h"><h3>${nb.name}</h3><span class="nb-sub">${nb.sub}</span></div><div class="prop-grid nb-${nb.cls}">${cards}</div><div id="detail-slot-${nb.cls}"></div></div>`;
  });
  // Completed tasks list (shown when NO property is selected)
  const allDone=tasks.filter(t=>isDone(t));
  let bottomHtml='';
  if(!selProp){
    let done=allDone;
    const scoped=done;
    if(histCat!=='all')done=done.filter(t=>t.category===histCat);
    done.sort((a,b)=>{const da=a.date||a.created;const db=b.date||b.created;return db.localeCompare(da);});
    const cc={};scoped.forEach(t=>{if(t.category)cc[t.category]=(cc[t.category]||0)+1;});
    const uc=Object.entries(cc).sort((a,b)=>b[1]-a[1]);
    const chips=[`<button class="chip ${histCat==='all'?'active':''}" onclick="setHistCat('all')">All (${scoped.length})</button>`,...uc.map(([c,n])=>`<button class="chip ${histCat===c?'active':''}" onclick="setHistCat('${c}')">${c.replace('_',' ')} (${n})</button>`)].join('');
    const list=done.length?done.map(t=>{
      const p=getProp(t.property);const nb=getNb(t.property);const nbc=nb?'nb-'+nb.cls:'';
      const d=t.date?new Date(t.date+'T12:00:00').toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'2-digit'}):'';
      const short=t.problem.length>100?t.problem.substring(0,100)+'…':t.problem;
      const cat=(t.category||'').replace('_',' ');
      const vendorLabel=t.status==='resolved_by_guest'?'Resolved by Guest':(t.vendor||'—');
      const propName=p?p.name.split(' - ').pop():'';
      return`<div class="hi ${nbc}" onclick="openDetail('${t.id}')" style="border-left-width:3px">
        <div class="hi-block hi-date">${d}</div>
        <div class="hi-block hi-cat">${cat}</div>
        <div class="hi-block hi-desc">${short}</div>
        <div class="hi-block hi-prop-col">${propName}</div>
        <div class="hi-block hi-vendor">${vendorLabel}</div>
      </div>`;
    }).join(''):'<div style="color:var(--text3);font-size:.82rem;padding:16px 0;font-style:italic">No completed tasks found.</div>';
    const trendHtml=buildTrendInsights(allDone);
    bottomHtml=`<div style="margin-top:20px;padding-top:18px;border-top:2px solid var(--border)">
      ${trendHtml}
      <div style="display:flex;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:6px">
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--green);font-weight:600;margin:0">Completed Work</h2>
        <button class="btn" onclick="toggleHistForm()" style="margin-left:auto;font-size:.72rem">${histFormOpen?'Cancel':'+ Add Historical Record'}</button>
      </div>
      ${histFormOpen?buildHistForm():''}
      <div class="cat-chips" style="margin-bottom:14px">${chips}</div>
      ${done.length?`<div class="hi-header" style="display:flex;gap:0;padding:0 0 6px;border-bottom:1px solid var(--border);margin-bottom:8px">
        <span style="width:82px;padding-left:17px;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3)">Date</span>
        <span style="width:100px;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);text-align:center">Category</span>
        <span style="flex:1;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);padding-left:14px">Description</span>
        <span style="width:130px;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);text-align:center">Property</span>
        <span style="width:130px;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);text-align:center">Vendor</span>
      </div>`:''}
      <div class="hist-list">${list}</div>
    </div>`;
  } else {
    bottomHtml=`<div style="margin-top:12px;text-align:center"><button class="btn" onclick="toggleHistForm()" style="font-size:.72rem">${histFormOpen?'Cancel':'+ Add Historical Record'}</button>${histFormOpen?buildHistForm():''}</div>`;
  }
  container.innerHTML=gridHtml+bottomHtml;
  // If a property is selected, render detail in the right slot
  if(selProp) renderPropDetail(selProp);
}
function renderPropDetail(pid){
  const nb=getNb(pid);if(!nb)return;
  const slot=document.getElementById('detail-slot-'+nb.cls);if(!slot)return;
  const p=getProp(pid);
  const done=tasks.filter(t=>t.property===pid&&isDone(t));
  let filtered=histCat==='all'?done:done.filter(t=>t.category===histCat);
  filtered.sort((a,b)=>(b.date||b.created||'').localeCompare(a.date||a.created||''));
  // Category chips
  const cc={};done.forEach(t=>{if(t.category)cc[t.category]=(cc[t.category]||0)+1;});
  const chips=[`<button class="chip ${histCat==='all'?'active':''}" onclick="setHistCat('all')">All (${done.length})</button>`,
    ...Object.entries(cc).sort((a,b)=>b[1]-a[1]).map(([c,n])=>
      `<button class="chip ${histCat===c?'active':''}" onclick="setHistCat('${c}')">${c.replace('_',' ')} (${n})</button>`)
  ].join('');
  // Task list
  const nbc='nb-'+nb.cls;
  const list=filtered.length?filtered.map(t=>{
    const d=t.date?new Date(t.date+'T12:00:00').toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'2-digit'}):'';
    const cat=(t.category||'').replace('_',' ');
    const vendorLabel=t.status==='resolved_by_guest'?'Resolved by Guest':(t.vendor||'—');
    return`<div class="hi ${nbc}" onclick="openDetail('${t.id}')" style="cursor:pointer">
      <div class="hi-block hi-date">${d}</div>
      <div class="hi-block hi-cat">${cat}</div>
      <div class="hi-block hi-desc">${t.problem}</div>
      <div class="hi-block hi-vendor">${vendorLabel}</div>
    </div>`;
  }).join(''):'<div style="color:var(--text3);font-size:.82rem;padding:8px 0;font-style:italic">No completed tasks.</div>';
  // Arrow position based on clicked card
  const card=document.getElementById('pc-'+pid);
  const grid=card?.parentElement;
  let arrowLeft=30;
  if(card&&grid){const cr=card.getBoundingClientRect();const gr=grid.getBoundingClientRect();arrowLeft=(cr.left-gr.left)+(cr.width/2)-6;}
  slot.innerHTML=`<div class="prop-detail">
    <div class="prop-detail-arrow" style="left:${arrowLeft}px"></div>
    <button class="prop-detail-close" onclick="selPropFn(null)">&#x2715;</button>
    <h4 style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--green);font-weight:600;margin-bottom:8px">${p?p.name.split(' - ').pop():pid}</h4>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${chips}</div>
    ${list}
  </div>`;
  slot.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function selPropFn(id){if(selProp===id){selProp=null;histCat='all';}else{selProp=id||null;histCat='all';}renderHistory();}
window.setHistCat=cat=>{histCat=cat;if(selProp)renderPropDetail(selProp);else renderHistory();};

// VENDORS
// ── VENDOR DIRECTORY — collapse state, drag-to-rank ─────────────────────────
let _vCatCollapsed=null;
function _getVCatCollapsed(){
  if(_vCatCollapsed)return _vCatCollapsed;
  const stored=sessionStorage.getItem('vcat_collapsed');
  if(stored!==null){
    _vCatCollapsed=new Set(JSON.parse(stored));
  }else{
    // First visit: start all collapsed
    _vCatCollapsed=new Set(VCAT.map(c=>c.id));
    sessionStorage.setItem('vcat_collapsed',JSON.stringify([..._vCatCollapsed]));
  }
  return _vCatCollapsed;
}
function toggleVCat(catId){
  const s=_getVCatCollapsed();
  if(s.has(catId))s.delete(catId);else s.add(catId);
  sessionStorage.setItem('vcat_collapsed',JSON.stringify([...s]));
  renderVendors();
}

let _dragVid=null;
function vendorDragStart(e,vid){
  // Don't drag when clicking action buttons
  if(e.target.closest('button')||e.target.closest('a')){e.preventDefault();return;}
  _dragVid=vid;
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',vid);
  requestAnimationFrame(()=>e.currentTarget.classList.add('vc-dragging'));
}
function vendorDragEnd(e){
  e.currentTarget.classList.remove('vc-dragging');
  document.querySelectorAll('.vc-drag-over').forEach(el=>el.classList.remove('vc-drag-over'));
}
function vendorDragOver(e,vid){
  if(vid===_dragVid)return;
  e.preventDefault();e.dataTransfer.dropEffect='move';
  document.querySelectorAll('.vc-drag-over').forEach(el=>el.classList.remove('vc-drag-over'));
  e.currentTarget.classList.add('vc-drag-over');
}
async function vendorDrop(e,targetVid){
  e.preventDefault();
  document.querySelectorAll('.vc-drag-over').forEach(el=>el.classList.remove('vc-drag-over'));
  if(!_dragVid||_dragVid===targetVid){_dragVid=null;return;}
  const from=vendors.findIndex(v=>v.id===_dragVid);
  if(from<0){_dragVid=null;return;}
  const [moved]=vendors.splice(from,1);
  const to=vendors.findIndex(v=>v.id===targetVid); // re-find after splice
  if(to<0){vendors.splice(from,0,moved);_dragVid=null;return;}
  vendors.splice(to,0,moved);
  _dragVid=null;
  await saveVendors();
  renderVendors();
  showToast('Vendor order saved.');
}

function renderVendors(){
  const c=document.getElementById('vendor-dir');let h='';
  const collapsed=_getVCatCollapsed();
  // Display copy only — alphabetized for directory; does not affect VCAT source or other dropdowns
  const sortedCats=[...VCAT].sort((a,b)=>a.label.localeCompare(b.label));
  sortedCats.forEach(cat=>{
    const cv=vendors.filter(v=>v.categories.includes(cat.id));if(!cv.length)return;
    const isCollapsed=collapsed.has(cat.id);
    h+=`<div class="vs${isCollapsed?' vs-collapsed':''}">`;
    h+=`<div class="vs-hdr" onclick="toggleVCat('${cat.id}')">`;
    h+=`<h3>${cat.label}<span class="vs-cat-count">${cv.length}</span></h3>`;
    h+=`<span class="vs-cat-chevron">&#x25BE;</span></div>`;
    h+=`<div class="vc-list">`;
    cv.forEach(v=>{
      const phone=v.phone.replace(/\D/g,'');
      const safeName=v.name.replace(/'/g,"\\'");
      h+=`<div class="vc" draggable="true" data-vid="${v.id}"
        ondragstart="vendorDragStart(event,'${v.id}')"
        ondragend="vendorDragEnd(event)"
        ondragover="vendorDragOver(event,'${v.id}')"
        ondrop="vendorDrop(event,'${v.id}')">`;
      h+=`<div class="vc-top">`;
      h+=`<div class="vc-drag-handle" title="Drag to reorder">&#x2807;</div>`;
      h+=`<div class="vc-info">`;
      h+=`<div class="vc-name">${v.name}</div><div class="vc-role">${v.role}</div>`;
      h+=`<div class="vc-contact"><span class="vc-phone">${v.phone}</span>${v.email?`<span class="vc-email">${v.email}</span>`:''}</div>`;
      h+=!v.email?`<span class="add-email" onclick="showEmailForm('${v.id}')">+ Add email</span>`:'';
      h+=`<div id="ef-${v.id}" style="display:none" class="email-form">
        <input type="email" placeholder="vendor@email.com" id="ei-${v.id}">
        <button class="btn btn-g" onclick="saveEmail('${v.id}')">Save</button>
        <button class="btn" onclick="document.getElementById('ef-${v.id}').style.display='none'">Cancel</button>
      </div>`;
      h+=v.note?`<div class="vc-note">${v.note}</div>`:'';
      h+=v.invoices&&v.invoices.length?`<div class="vc-inv-toggle" onclick="toggleVendorInvoices('${v.id}')">Invoices (${v.invoices.length})</div><div class="vc-inv-list" id="vinv-${v.id}" style="display:none">${v.invoices.slice().reverse().map(inv=>{const d=inv.createdAt?new Date(inv.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';return`<div class="vc-inv-row"><span class="vc-inv-id">${inv.id}</span><span class="vc-inv-date">${d}</span><span class="vc-inv-total">${inv.total>0?'$'+inv.total.toFixed(2):'—'}</span><button class="btn" style="padding:2px 8px;font-size:.68rem" onclick="regenInvoice('${inv.vendor.replace(/'/g,"\\'")}','${inv.method}','${inv.date}',${JSON.stringify(inv.taskIds).replace(/"/g,'&quot;')})">View</button></div>`;}).join('')}</div>`:'';
      h+=`</div></div>`; // close vc-info, vc-top
      // Action button row: Text | Call | Schedule Link | Edit
      h+=`<div class="vc-btn-row">`;
      if(phone){
        h+=`<a href="sms:${phone}" class="btn btn-g" onclick="event.stopPropagation()">Text</a>`;
        h+=`<a href="tel:${phone}" class="btn btn-call" onclick="event.stopPropagation()">Call</a>`;
      }else{
        h+=`<span class="btn" style="opacity:.4;cursor:default">Text</span>`;
        h+=`<span class="btn btn-call" style="opacity:.4;cursor:default">Call</span>`;
      }
      h+=`<button class="btn" onclick="generateVendorAgendaLink('${safeName}')">Schedule Link</button>`;
      if(v.id==='v10'){
        h+=`<button class="btn" onclick="openAabImport()" title="Drag and drop completed-service PDFs to log them automatically">Import PDFs</button>`;
      }
      h+=`<button class="btn" onclick="openEditVendor('${v.id}')">Edit</button>`;
      h+=`</div></div>`; // close vc-btn-row, vc
    });
    h+=`</div></div>`; // close vc-list, vs
  });
  document.getElementById('vendor-dir').innerHTML=h||'<div class="empty">No vendors yet.</div>';
}
function toggleVendorInvoices(vid){
  const el=document.getElementById('vinv-'+vid);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}
function regenInvoice(vendor,method,date,taskIds){
  generateInvoice(vendor,method,date,taskIds);
}
function showEmailForm(id){document.getElementById('ef-'+id).style.display='flex';}
async function saveEmail(id){
  const inp=document.getElementById('ei-'+id);const email=inp.value.trim();if(!email)return;
  const v=vendors.find(x=>x.id===id);if(!v)return;v.email=email;await saveVendors();renderVendors();showToast('Email saved.');
}
function openAddVendor(){
  editVendorId=null;document.getElementById('vendor-modal-title').textContent='Add Vendor';
  ['v-name','v-role','v-phone','v-email','v-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('v-cat').value='handyman';document.getElementById('v-del-btn').style.display='none';
  document.getElementById('v-pay-venmo').checked=false;document.getElementById('v-pay-cashapp').checked=false;
  document.getElementById('vendor-modal').classList.add('open');
}
function openEditVendor(id){
  editVendorId=id;const v=vendors.find(x=>x.id===id);if(!v)return;
  document.getElementById('vendor-modal-title').textContent='Edit Vendor';
  document.getElementById('v-name').value=v.name;document.getElementById('v-role').value=v.role;
  document.getElementById('v-phone').value=v.phone;document.getElementById('v-email').value=v.email||'';
  document.getElementById('v-notes').value=v.note||'';document.getElementById('v-cat').value=v.categories[0]||'other';
  // Payment methods — default none for vendors without the field (opt-in)
  const pm=v.paymentMethods||[];
  document.getElementById('v-pay-venmo').checked=pm.includes('venmo');
  document.getElementById('v-pay-cashapp').checked=pm.includes('cashapp');
  document.getElementById('v-del-btn').style.display='';document.getElementById('vendor-modal').classList.add('open');
}
async function saveVendor(){
  const name=document.getElementById('v-name').value.trim();if(!name){showToast('Name required.','err');return;}
  const pm=[];if(document.getElementById('v-pay-venmo').checked)pm.push('venmo');if(document.getElementById('v-pay-cashapp').checked)pm.push('cashapp');
  const v={id:editVendorId||'v'+Date.now(),name,role:document.getElementById('v-role').value.trim(),phone:document.getElementById('v-phone').value.trim(),email:document.getElementById('v-email').value.trim(),categories:[document.getElementById('v-cat').value],note:document.getElementById('v-notes').value.trim(),paymentMethods:pm};
  if(editVendorId){const i=vendors.findIndex(x=>x.id===editVendorId);if(i>=0){v.invoices=vendors[i].invoices;vendors[i]=v;}}else vendors.push(v);
  await saveVendors();closeModal('vendor-modal');renderVendors();showToast(editVendorId?'Vendor updated.':'Vendor added.');
}
async function deleteVendor(){
  const deleted=vendors.find(v=>v.id===editVendorId);if(!deleted)return;
  const idx=vendors.indexOf(deleted);
  vendors=vendors.filter(v=>v.id!==editVendorId);await saveVendors();closeModal('vendor-modal');renderVendors();
  showToast('Vendor deleted.','',async()=>{vendors.splice(idx,0,deleted);await saveVendors();renderVendors();showToast('Vendor restored.');});
}

function closeModal(id){document.getElementById(id).classList.remove('open');}
// Disabled backdrop-click-to-close — modals only close via X button or Close button
// This prevents accidental closure when selecting text and dragging outside the modal
let _toastTimer=null;
function showToast(msg,cls='',undoFn=null,duration=0){
  clearTimeout(_toastTimer);
  const t=document.getElementById('toast');
  t.innerHTML='';t.className=`toast show ${cls}`;
  const span=document.createElement('span');span.textContent=msg;t.appendChild(span);
  if(undoFn){const btn=document.createElement('button');btn.className='toast-undo';btn.textContent='Undo';btn.onclick=()=>{clearTimeout(_toastTimer);undoFn();t.classList.remove('show');};t.appendChild(btn);
    _toastTimer=setTimeout(()=>t.classList.remove('show'),duration||6000);
  } else {_toastTimer=setTimeout(()=>t.classList.remove('show'),duration||3000);}
}

// SEED removed — tasks are loaded from server storage

// ────────────────────────────────────────────────────────────────────────────
// ALL ABOUT BUGS — IMPORT SERVICE LOGS
// Drag-and-drop pest control PDFs onto the All About Bugs vendor card.
// Parser splits each Gmail-export PDF on Account Number boundaries and emits
// one logged-service record per service block. Mirrors the saveLogTask
// record shape so logged services thread into the existing tasks list.
// ────────────────────────────────────────────────────────────────────────────

// Account # → cabin ID. Verified from PROPS addresses; account # 11163 carries
// the legacy "Wilderness Escape" label in All About Bugs' system but the
// address (1775 Bluff Ridge Rd) is Magic Mountain in current PROPS.
const AAB_ACCT_TO_CABIN = {
  '3000':'bearadise',
  '11147':'prc1','11148':'prc2','11151':'prc5',
  '11154':'umc10','11155':'umc20','11156':'umc30','11157':'umc40','11159':'umc50','11160':'umc60',
  '11161':'hillside_big','11162':'hillside_cottage',
  '11163':'magic',  // 1775 Bluff Ridge Rd
  '11164':'wizards' // 658 Pinecrest Dr
};

let _aabPdfLib=null;
function _aabLoadPdfLib(){
  if(_aabPdfLib)return Promise.resolve(_aabPdfLib);
  if(window.pdfjsLib){_aabPdfLib=window.pdfjsLib;return Promise.resolve(_aabPdfLib);}
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload=()=>{const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';_aabPdfLib=lib;resolve(lib);};
    s.onerror=()=>reject(new Error('Failed to load pdf.js'));
    document.head.appendChild(s);
  });
}

// In-memory rows for the open import session. Cleared when modal closes.
let _aabRows=[];

// Pull plain text from a PDF, joined as one string with whitespace between items.
async function _aabExtractText(file){
  const lib=await _aabLoadPdfLib();
  const buf=await file.arrayBuffer();
  const doc=await lib.getDocument({data:buf}).promise;
  let out='';
  for(let i=1;i<=doc.numPages;i++){
    const pg=await doc.getPage(i);
    const tc=await pg.getTextContent();
    out+=tc.items.map(it=>it.str).join(' ')+'\n';
  }
  return out;
}

// Address → cabin id fallback. Normalizes both sides for fuzzy match.
function _aabAddressToCabin(addr){
  if(!addr)return null;
  const n=addr.toLowerCase().replace(/[.,]/g,'').replace(/\s+/g,' ').trim();
  // Direct address numbers + street stems are unique enough across PROPS
  if(/1627 paradise ridge/.test(n)){
    const m=n.match(/(?:unit|#)\s*(\d)/);if(m)return 'prc'+m[1];
  }
  if(/1181 upper middle creek/.test(n)){
    const m=n.match(/(?:cabin|unit|#)\s*(\d{2})/);if(m)return 'umc'+m[1];
  }
  if(/1619 rebel hill/.test(n)){
    const m=n.match(/(?:cabin|unit|#)\s*(\d{2})/);if(m)return 'umc'+m[1];
  }
  if(/734 heiden/.test(n))return 'bearadise';
  if(/658 pinecrest/.test(n))return 'wizards';
  if(/1775 bluff ridge/.test(n))return 'magic';
  if(/335 alpine mountain/.test(n))return 'hibernation';
  if(/2382 alpine village/.test(n))return 'hero';
  if(/226 oak hill/.test(n))return 'hillside_big';
  if(/218 oak hill/.test(n))return 'hillside_cottage';
  return null;
}

// Resolve the year for a "(M/D)" service date given the email-header date.
// If service month is far ahead of email month, treat as previous year (Dec service in Jan email).
function _aabResolveDate(svcMonth,svcDay,emailDate){
  if(!emailDate||isNaN(emailDate.getTime())){
    // Fallback: assume current year
    const now=new Date();
    return `${now.getFullYear()}-${String(svcMonth).padStart(2,'0')}-${String(svcDay).padStart(2,'0')}`;
  }
  let year=emailDate.getFullYear();
  const emailMonth=emailDate.getMonth()+1;
  if(svcMonth>emailMonth+1)year-=1;
  return `${year}-${String(svcMonth).padStart(2,'0')}-${String(svcDay).padStart(2,'0')}`;
}

// Parse one PDF text dump → array of service records.
function _aabParseText(text){
  const records=[];
  // Split on Account Number boundaries; keep each chunk that follows.
  // The capture preserves the account number so we can attach it to the chunk.
  const parts=text.split(/Account\s*Number:\s*(\d+)/i);
  // parts[0] is preamble before first account number; parts[1]=acct, parts[2]=chunk, parts[3]=acct, parts[4]=chunk...
  // We also need email date that PRECEDES each Account Number — extract from preamble or prior chunk.
  let priorText=parts[0]||'';
  for(let i=1;i<parts.length;i+=2){
    const acct=parts[i];
    const chunk=parts[i+1]||'';
    // Email date is the most recent "DOW, Mon DD, YYYY" found in priorText (or chunk if priorText missed it)
    const dateRx=/([A-Z][a-z]{2}),\s*([A-Z][a-z]{2})\s*(\d{1,2}),\s*(\d{4})/g;
    let lastEmail=null,m;const searchSrc=priorText+' '+chunk.slice(0,400);
    while((m=dateRx.exec(searchSrc))!==null){lastEmail=m[0];}
    const emailDateObj=lastEmail?new Date(lastEmail):null;

    // Address + service date. "located at <ADDRESS> on <Day> (<M/D>)"
    let addr=null,svcMonth=null,svcDay=null;
    const locRx=/located\s+at\s+(.+?)\s+on\s+([A-Z][a-z]+)\s*\((\d{1,2})\/(\d{1,2})\)/i;
    const locM=chunk.match(locRx);
    if(locM){
      addr=locM[1].trim().replace(/\s+/g,' ');
      svcMonth=parseInt(locM[3],10);
      svcDay=parseInt(locM[4],10);
    }
    // Tech name
    let tech=null;
    const techM=chunk.match(/My\s+name\s+is\s+([A-Z][A-Za-z'.\-]+(?:\s+[A-Z][A-Za-z'.\-]+){0,3})/);
    if(techM)tech=techM[1].trim();

    // Issues Targeted — between heading and Locations Treated
    let issues=[];
    const issM=chunk.match(/Issues\s+Targeted([\s\S]*?)Locations\s+Treated/i);
    if(issM){
      const block=issM[1];
      // Items appear like "1. Ants 2. Cockroaches" — split on numbers
      const items=block.split(/\d+\.\s+/).map(s=>s.trim()).filter(Boolean);
      issues=items.map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s.length>0&&s.length<60);
    }
    // Locations Treated — between heading and Technician Notes
    let locations=[];
    const locM2=chunk.match(/Locations\s+Treated([\s\S]*?)Technician\s+Notes/i);
    if(locM2){
      const block=locM2[1];
      // Lines mix numbered "1. ..." with unnumbered tags like "Bait Station"; capture both
      const lines=block.split(/(?:\d+\.\s+|\n)/).map(s=>s.trim()).filter(Boolean);
      locations=lines.map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s.length>0&&s.length<200);
    }
    // Technician Notes — between heading and Caution
    let notes='';
    let truncated=false;
    const tnM=chunk.match(/Technician\s+Notes([\s\S]*?)Caution/i);
    if(tnM){
      notes=tnM[1].replace(/\s+/g,' ').trim();
      // Gmail-export PDFs often truncate the Technician Notes mid-sentence.
      // Heuristic: a complete note ends in . ! ? or a closing quote/paren.
      // Anything else is treated as truncated and surfaced in the preview.
      if(notes&&!/[.!?"')\]]\s*$/.test(notes))truncated=true;
    }

    // Cabin lookup: account # first, address fallback
    const cabinFromAcct=AAB_ACCT_TO_CABIN[acct]||null;
    const cabinFromAddr=_aabAddressToCabin(addr);
    const cabin=cabinFromAcct||cabinFromAddr||null;

    const date=svcMonth&&svcDay?_aabResolveDate(svcMonth,svcDay,emailDateObj):'';

    records.push({
      acct,address:addr||'',date,tech:tech||'',issues,locations,notes,truncated,
      cabin,cabinSource:cabinFromAcct?'account':(cabinFromAddr?'address':null),
      emailDate:emailDateObj?emailDateObj.toISOString().slice(0,10):null,
      skip:false,
    });
    priorText=chunk;
  }
  return records;
}

function _aabBuildNoteText(r){
  const lines=[];
  if(r.tech)lines.push('Tech: '+r.tech);
  if(r.issues&&r.issues.length)lines.push('Issues: '+r.issues.join(', '));
  if(r.locations&&r.locations.length)lines.push('Locations: '+r.locations.join('; '));
  lines.push('');
  if(r.notes){
    lines.push(r.notes+(r.truncated?' [truncated by Gmail PDF export]':''));
  }
  if(r.acct)lines.push('');
  if(r.acct)lines.push('AAB account: '+r.acct);
  return lines.join('\n').trim();
}

// Duplicate detection: same property + same date + vendor v10 + _source aab_pdf
function _aabIsDuplicate(cabin,date){
  if(!cabin||!date)return false;
  return tasks.some(t=>t.property===cabin&&t.date===date&&t.vendor==='v10'&&(t._source==='aab_pdf'||(t.problem&&/pest control/i.test(t.problem))));
}

// Cabin <option> list for the per-row dropdown: NB-grouped, mirrors populatePropSel.
function _aabCabinOptionsHtml(selectedId){
  let h='<option value="">— pick cabin —</option>';
  NBS.forEach(nb=>{
    h+=`<optgroup label="${nb.name} — ${nb.sub}">`;
    nb.props.forEach(pid=>{
      const p=PROPS.find(x=>x.id===pid);if(!p)return;
      const display=p.name.replace(/^(PRC|UMC)\s*-\s*\d+\s*[-:]\s*/,'');
      h+=`<option value="${p.id}"${p.id===selectedId?' selected':''}>${display}</option>`;
    });
    h+='</optgroup>';
  });
  return h;
}

function aabRenderRows(){
  const wrap=document.getElementById('aab-rows');
  const rowsWrap=document.getElementById('aab-rows-wrap');
  const actions=document.getElementById('aab-actions');
  if(!_aabRows.length){
    rowsWrap.style.display='none';
    if(actions)actions.style.display='none';
    return;
  }
  rowsWrap.style.display='';
  if(actions)actions.style.display='';
  document.getElementById('aab-count').textContent=_aabRows.length;
  let h='';
  _aabRows.forEach((r,idx)=>{
    const dup=_aabIsDuplicate(r.cabin,r.date);
    if(dup&&r._dupSet!==true){r.skip=true;r._dupSet=true;}
    const needsCabin=!r.cabin;
    const needsDate=!r.date;
    let cls='aab-row';
    if(r.skip)cls+=' aab-skip';
    if(needsCabin||needsDate)cls+=' aab-warn';
    else if(dup)cls+=' aab-dup';
    const escNotes=_aabBuildNoteText(r).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    h+=`<div class="${cls}" data-idx="${idx}">`;
    h+=`<div class="aab-row-top">`;
    h+=`<label>Cabin <select onchange="aabSetCabin(${idx},this.value)">${_aabCabinOptionsHtml(r.cabin)}</select></label>`;
    h+=`<label>Service date <input type="date" value="${r.date||''}" onchange="aabSetDate(${idx},this.value)"></label>`;
    h+=`<span class="aab-row-acct">acct ${r.acct||'?'}${r.cabinSource==='address'?' · matched by address':''}</span>`;
    h+=`<label style="margin-left:auto"><input type="checkbox" class="aab-skip-cb" ${r.skip?'checked':''} onchange="aabToggleSkip(${idx},this.checked)"> Skip</label>`;
    h+=`</div>`;
    if(r.tech||r.address){
      h+=`<div class="aab-row-meta">`;
      if(r.tech)h+=`<span><b>Tech:</b> ${r.tech}</span>`;
      if(r.address)h+=`<span><b>Address:</b> ${r.address}</span>`;
      if(r.issues&&r.issues.length)h+=`<span><b>Issues:</b> ${r.issues.join(', ')}</span>`;
      h+=`</div>`;
    }
    if(needsCabin)h+=`<div class="aab-row-warn">Account # ${r.acct||'(none)'} not recognized — pick a cabin manually.</div>`;
    else if(needsDate)h+=`<div class="aab-row-warn">Service date couldn't be parsed — set it manually.</div>`;
    else if(dup)h+=`<div class="aab-row-warn dup">Already logged for this cabin on this date. Pre-skipped — un-check Skip to log anyway.</div>`;
    if(r.truncated)h+=`<div class="aab-row-warn">Technician note truncated by Gmail's PDF export — captured what's visible.</div>`;
    h+=`<textarea class="aab-row-notes" rows="4" oninput="aabSetNotes(${idx},this.value)">${escNotes}</textarea>`;
    h+=`</div>`;
  });
  wrap.innerHTML=h;
}

function aabSetCabin(idx,val){_aabRows[idx].cabin=val;_aabRows[idx].cabinSource=val?'manual':null;_aabRows[idx]._dupSet=false;_aabRows[idx].skip=false;aabRenderRows();}
function aabSetDate(idx,val){_aabRows[idx].date=val;_aabRows[idx]._dupSet=false;_aabRows[idx].skip=false;aabRenderRows();}
function aabSetNotes(idx,val){_aabRows[idx]._noteOverride=val;}
function aabToggleSkip(idx,checked){_aabRows[idx].skip=!!checked;aabRenderRows();}
function aabClearRows(){_aabRows=[];aabSetStatus('');aabRenderRows();}

function aabSetStatus(msg,isErr){
  const el=document.getElementById('aab-status');
  if(!msg){el.style.display='none';el.textContent='';return;}
  el.style.display='';el.className='aab-status'+(isErr?' err':'');el.textContent=msg;
}

async function aabHandleFiles(fileList){
  const files=Array.from(fileList).filter(f=>/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name));
  if(!files.length){aabSetStatus('No PDF files detected.',true);return;}
  aabSetStatus(`Parsing ${files.length} PDF${files.length>1?'s':''}…`);
  let added=0,skipped=0,errors=0;
  for(const f of files){
    try{
      const text=await _aabExtractText(f);
      const recs=_aabParseText(text);
      if(!recs.length){skipped++;continue;}
      // De-dupe within session: skip rows already present (same acct + date)
      recs.forEach(r=>{
        const exists=_aabRows.some(x=>x.acct===r.acct&&x.date===r.date&&x.cabin===r.cabin);
        if(!exists){_aabRows.push(r);added++;}
      });
    }catch(e){console.error('[aab] parse failed',f.name,e);errors++;}
  }
  const parts=[];
  parts.push(`${added} service${added===1?'':'s'} added`);
  if(skipped)parts.push(`${skipped} PDF${skipped>1?'s':''} had no service blocks`);
  if(errors)parts.push(`${errors} parse error${errors>1?'s':''}`);
  aabSetStatus(parts.join(' · '),errors>0&&added===0);
  aabRenderRows();
}

function openAabImport(){
  _aabRows=[];aabSetStatus('');aabRenderRows();
  document.getElementById('aab-import-modal').classList.add('open');
  // Bind once
  if(!document.getElementById('aab-drop')._bound){
    const drop=document.getElementById('aab-drop');
    const fileInp=document.getElementById('aab-file');
    drop.addEventListener('click',e=>{if(e.target.tagName!=='SPAN')fileInp.click();});
    drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('aab-drag');});
    drop.addEventListener('dragleave',()=>drop.classList.remove('aab-drag'));
    drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('aab-drag');aabHandleFiles(e.dataTransfer.files);});
    fileInp.addEventListener('change',e=>{aabHandleFiles(e.target.files);e.target.value='';});
    drop._bound=true;
  }
  // Pre-load pdf.js so the first drop is responsive
  _aabLoadPdfLib().catch(e=>console.warn('[aab] pdf.js preload failed',e));
}

async function aabLogAll(){
  const rows=_aabRows.filter(r=>!r.skip);
  if(!rows.length){showToast('Nothing to log — all rows skipped.','err');return;}
  // Validate
  const bad=rows.find(r=>!r.cabin||!r.date);
  if(bad){showToast('Some rows still need a cabin or date.','err');return;}
  let logged=0;
  const nowIso=new Date().toISOString();
  rows.forEach(r=>{
    const noteText=(r._noteOverride!=null?r._noteOverride:_aabBuildNoteText(r)).trim();
    const task={
      id:Date.now().toString()+Math.random().toString(36).slice(2,6),
      property:r.cabin,guest:'',problem:'Pest Control — Monthly',category:'pest',
      status:'complete',date:r.date,vendor:'v10',urgent:false,recurring:false,
      notes:noteText?[{text:noteText,type:'admin',time:nowIso}]:[],
      vendorNotes:'',created:nowIso,_loggedService:true,_source:'aab_pdf',_aabAcct:r.acct||null,
    };
    tasks.unshift(task);
    if(typeof logTaskChange==='function'){try{logTaskChange('log_service',task);}catch(e){}}
    logged++;
  });
  await saveTasks();
  renderAll();
  closeModal('aab-import-modal');
  _aabRows=[];
  showToast(`${logged} pest control service${logged>1?'s':''} logged.`);
}
// ── Configure this after deploying the webhook API ──
const HB_CONFIG = {
  // Set this to your deployed Vercel URL (e.g. 'https://storybook-webhook.vercel.app')
  apiUrl: 'https://storybook-webhook.vercel.app',
  // Set this to match your API_SECRET env var (leave empty if none)
  apiToken: '',
  // Poll interval in ms (default: 2 minutes)
  pollInterval: 120000,
};
let hbItems = [];
let hbDismissed = []; // dismissed items (persisted to KV)
let hbPollTimer = null;

// ── Cleaning Alerts helpers (filter HostBuddy items for cleaning page) ──
function clGetActiveAlerts() {
  return hbItems.filter(item => hbMatchCategory(item.category) === 'cleaning');
}
function clGetActiveAlertsForProp(pid) {
  return clGetActiveAlerts().filter(item => {
    let matchedPid = hbMatchProperty(item.property);
    if (!matchedPid && item._raw) matchedPid = hbDeepMatchProperty(item._raw);
    return matchedPid === pid;
  });
}
function clGetReportedDuringStay(pid) {
  return tasks.filter(t => t.property === pid && t.category === 'cleaning' && t.notes && t.notes.some(n => n.text && n.text.includes('Imported from HostBuddy AI')));
}
async function clDismissAlert(id) {
  await hbDismiss(id);
  renderCleaningLog();
}
async function clImportAlert(id) {
  await hbImport(id);
  renderCleaningLog();
}
async function clDismissAllAlerts() {
  const cleaningIds = clGetActiveAlerts().map(a => a.id);
  for (const cid of cleaningIds) {
    await hbDismiss(cid);
  }
  renderCleaningLog();
}
async function clImportAllAlerts() {
  const cleaningItems = clGetActiveAlerts();
  for (const item of cleaningItems) {
    await hbImport(item.id);
  }
  renderCleaningLog();
}
function clOpenTaskFromCleaning(taskId) {
  switchView('main', document.querySelector('.nav-btn'));
  setTimeout(() => openDetail(taskId), 100);
}

async function hbFetch() {
  if (!HB_CONFIG.apiUrl) return;
  try {
    const headers = {};
    if (HB_CONFIG.apiToken) headers['Authorization'] = 'Bearer ' + HB_CONFIG.apiToken;
    const r = await fetch(HB_CONFIG.apiUrl + '/api/tasks', { headers, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return;
    const data = await r.json();
    hbItems = data.items || [];
    renderHB();
  } catch (e) { console.warn('HostBuddy fetch failed:', e.message); }
}

async function hbStartPolling() {
  if (!HB_CONFIG.apiUrl) return;
  // Load dismissed items from KV
  try {
    const raw = await S.get('se_hb_dismissed');
    if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) hbDismissed = arr; }
  } catch (e) {}
  hbFetch(); // initial fetch
  hbPollTimer = setInterval(hbFetch, HB_CONFIG.pollInterval);
}

// Match HostBuddy / Hospitable property name to our internal property ID
// Exact match only (case-insensitive) — PROPS names must match HostBuddy exactly.
// If no match, returns '' so the user can assign manually (better than a wrong match).
function hbMatchProperty(name) {
  if (!name || typeof name !== 'string') return '';
  const n = name.toLowerCase().trim();
  if (!n) return '';
  const exact = PROPS.find(p => p.name.toLowerCase() === n);
  if (exact) return exact.id;
  // Also try matching by property ID directly (e.g. 'prc5', 'umc40')
  const byId = PROPS.find(p => p.id === n);
  if (byId) return byId.id;
  console.warn(`hbMatchProperty: no exact match for "${name}"`);
  return '';
}

// Deep-scan disabled — was causing false matches (e.g. "Pigeon Forge" → "Forge in the Forest")
function hbDeepMatchProperty(raw) { return ''; }

// Deep-scan raw payload for the longest meaningful string (likely the problem description)
function hbDeepFindProblem(raw) {
  if (!raw || typeof raw !== 'object') return '';
  const candidates = [];
  function collect(obj) {
    if (!obj) return;
    if (typeof obj === 'string' && obj.length > 20) candidates.push(obj);
    else if (Array.isArray(obj)) obj.forEach(collect);
    else if (typeof obj === 'object') Object.values(obj).forEach(collect);
  }
  collect(raw);
  // Return the longest candidate that looks like a problem description
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] || '';
}

// Map HostBuddy category to our category
function hbMatchCategory(cat) {
  if (!cat) return '';
  const c = cat.toLowerCase().trim().replace(/[^a-z_]/g, '');
  const valid = Object.keys(CAT_LABELS);
  if (valid.includes(c)) return c;
  // Common mappings
  const map = { 'maintenance': 'handyman', 'repair': 'handyman', 'bug': 'pest', 'bugs': 'pest', 'insect': 'pest', 'insects': 'pest',
    'roach': 'pest', 'roaches': 'pest', 'ac': 'hvac', 'heating': 'hvac', 'heat': 'hvac', 'air_conditioning': 'hvac',
    'electric': 'electrical', 'plumber': 'plumbing', 'pipe': 'plumbing', 'leak': 'plumbing', 'spa': 'hot_tub',
    'jacuzzi': 'hot_tub', 'tub': 'hot_tub', 'yard': 'landscaping', 'lawn': 'landscaping', 'clean': 'cleaning' };
  return map[c] || '';
}

function renderHB() {
  const el = document.getElementById('hb-wrap');
  if (!hbItems.length && !hbDismissed.length) { el.innerHTML = ''; return; }
  if (!hbItems.length) {
    // No active items but dismissed items exist — show just the dismissed viewer
    let dh = `<div style="padding:0 2px">
      <button class="hb-dismissed-toggle" id="hb-dismissed-toggle" onclick="toggleHbDismissed()">
        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        ${hbDismissed.length} dismissed HostBuddy item${hbDismissed.length !== 1 ? 's' : ''}
      </button>
      <div class="hb-dismissed-list" id="hb-dismissed-list">`;
    hbDismissed.forEach(item => {
      const prob = escHtml((item.problem || item.conversationSnippet || 'No description').slice(0, 80));
      const ago = getTimeAgo(item.dismissedAt || item.receivedAt);
      dh += `<div class="hb-dismissed-item">
        <div class="hb-dismissed-item-info">
          <div class="hb-dismissed-item-prop">${escHtml(item.property || 'Unknown')}</div>
          <div class="hb-dismissed-item-prob">${prob}</div>
          <div class="hb-dismissed-item-meta">Dismissed ${ago}</div>
        </div>
        <button class="hb-btn hb-btn-restore" onclick="hbRestore('${item.id}')">Import</button>
      </div>`;
    });
    dh += `<button class="hb-dismissed-toggle" onclick="hbClearDismissed()" style="color:#6a4040;margin-top:4px">Clear history</button>`;
    dh += '</div></div>';
    el.innerHTML = dh;
    return;
  }
  let h = `<div class="hb-banner">
    <div class="hb-hdr">
      <div class="hb-title">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        HostBuddy — Incoming Action Items <span class="hb-pulse"></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="hb-count">${hbItems.length} new</span>
        <button class="hb-btn hb-btn-dismiss" onclick="hbDismissAll()">Dismiss All</button>
        <button class="hb-btn hb-btn-import" onclick="hbImportAll()">Import All</button>
      </div>
    </div>`;
  hbItems.forEach(item => {
    let matchedPid = hbMatchProperty(item.property);
    // Fallback: deep-scan raw payload if standard field match fails
    if (!matchedPid && item._raw) matchedPid = hbDeepMatchProperty(item._raw);
    const matchedProp = matchedPid ? getProp(matchedPid) : null;
    const matchedCat = hbMatchCategory(item.category);
    // Fallback for problem too
    const skipProblems = ['action_items','action_item','maintenance','issue','task','alert','notification'];
    const rawProblem = (item.problem||'').trim();
    const displayProblem = (rawProblem && !skipProblems.includes(rawProblem.toLowerCase())) ? rawProblem : (item.conversationSnippet || (item._raw ? hbDeepFindProblem(item._raw) : '') || 'No description');
    const timeAgo = getTimeAgo(item.receivedAt);
    h += `<div class="hb-item" id="hb-${item.id}">
      <div class="hb-item-top">
        <div style="flex:1">
          <div class="hb-item-prop">${item.property || 'Unknown Property'}${matchedProp ? ` <span style="opacity:.5">→ ${matchedProp.name}</span>` : ' <span style="color:#cc8844;opacity:.8">⚠ No match</span>'}</div>
          <div class="hb-item-prob">${escHtml(displayProblem)}</div>
          <div class="hb-item-meta">
            ${item.guest ? `<span>Guest: ${escHtml(item.guest)}</span>` : ''}
            ${item.category ? `<span>Category: ${escHtml(item.category)}${matchedCat ? '' : ' ⚠'}</span>` : ''}
            ${item.urgent ? '<span style="color:#e06050;font-weight:700">URGENT</span>' : ''}
            <span>${timeAgo}</span>
          </div>
          ${item.conversationSnippet ? `<div class="hb-item-snippet">${escHtml(item.conversationSnippet)}</div>` : ''}
        </div>
        <div class="hb-item-btns">
          <button class="hb-btn hb-btn-dismiss" onclick="hbDismiss('${item.id}')">Dismiss</button>
          <button class="hb-btn hb-btn-import" onclick="hbImport('${item.id}')">Import</button>
        </div>
      </div>
    </div>`;
  });
  h += '</div>';
  // Dismissed items viewer (shown below banner, or standalone if no active items)
  if (hbDismissed.length) {
    h += `<div style="padding:0 2px">
      <button class="hb-dismissed-toggle" id="hb-dismissed-toggle" onclick="toggleHbDismissed()">
        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        ${hbDismissed.length} dismissed item${hbDismissed.length !== 1 ? 's' : ''}
      </button>
      <div class="hb-dismissed-list" id="hb-dismissed-list">`;
    hbDismissed.forEach(item => {
      const prob = escHtml((item.problem || item.conversationSnippet || 'No description').slice(0, 80));
      const ago = getTimeAgo(item.dismissedAt || item.receivedAt);
      h += `<div class="hb-dismissed-item">
        <div class="hb-dismissed-item-info">
          <div class="hb-dismissed-item-prop">${escHtml(item.property || 'Unknown')}</div>
          <div class="hb-dismissed-item-prob">${prob}</div>
          <div class="hb-dismissed-item-meta">Dismissed ${ago}</div>
        </div>
        <button class="hb-btn hb-btn-restore" onclick="hbRestore('${item.id}')">Import</button>
      </div>`;
    });
    h += `<button class="hb-dismissed-toggle" onclick="hbClearDismissed()" style="color:#6a4040;margin-top:4px">Clear history</button>`;
    h += '</div></div>';
  }
  el.innerHTML = h;
}

function escHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function toggleHbRaw(id) { document.getElementById('hb-raw-' + id)?.classList.toggle('show'); }

function getTimeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

async function hbImport(id) {
  const item = hbItems.find(x => x.id === id);
  if (!item) return;
  // Try standard field match first, then deep-scan raw payload as fallback
  let pid = hbMatchProperty(item.property);
  if (!pid && item._raw) pid = hbDeepMatchProperty(item._raw);
  const cat = hbMatchCategory(item.category);
  // Use problem field, or deep-scan raw for a description-like string
  const skipProblems = ['action_items','action_item','maintenance','issue','task','alert','notification'];
  let problem = (item.problem||'').trim();
  if (!problem || skipProblems.includes(problem.toLowerCase())) {
    problem = item.conversationSnippet || (item._raw ? hbDeepFindProblem(item._raw) : '') || '';
  }
  // Also try to find guest name from raw if missing
  let guest = item.guest;
  if (!guest && item._raw) {
    const rawStr = JSON.stringify(item._raw);
    console.log('HostBuddy raw payload:', JSON.stringify(item._raw, null, 2));
  }
  const t = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    property: pid || '',
    guest: guest || '',
    problem: problem || 'HostBuddy action item',
    category: cat || '',
    status: 'open',
    date: '',
    vendor: '',
    urgent: !!(item.urgent),
    recurring: false,
    notes: [
      { text: `Imported from HostBuddy AI.${item.conversationSnippet ? ' Guest said: "' + item.conversationSnippet.slice(0, 200) + '"' : ''}`, type: 'admin', time: new Date().toISOString() }
    ],
    vendorNotes: '',
    created: item.receivedAt || new Date().toISOString(),
  };
  tasks.unshift(t);logTaskChange('created',t);
  await saveTasks();
  // Remove from incoming queue on server
  await hbRemoveFromServer(id);
  hbItems = hbItems.filter(x => x.id !== id);
  renderHB(); renderAll();
  showToast('Task imported from HostBuddy.');
  // If no property matched, open detail so user can set it
  if (!pid) { detailId = t.id; openDetail(t.id); }
}

async function hbImportAll() {
  let n = 0;
  const ids = [];
  for (const item of [...hbItems]) {
    let pid = hbMatchProperty(item.property);
    if (!pid && item._raw) pid = hbDeepMatchProperty(item._raw);
    const cat = hbMatchCategory(item.category);
    const _skip = ['action_items','action_item','maintenance','issue','task','alert','notification'];
    let problem = (item.problem||'').trim();
    if (!problem || _skip.includes(problem.toLowerCase())) {
      problem = item.conversationSnippet || (item._raw ? hbDeepFindProblem(item._raw) : '') || '';
    }
    tasks.unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6) + n,
      property: pid || '', guest: item.guest || '',
      problem: problem || 'HostBuddy action item',
      category: cat || '', status: 'open', date: '', vendor: '',
      urgent: !!(item.urgent), recurring: false,
      notes: [{ text: `Imported from HostBuddy AI.${item.conversationSnippet ? ' Guest said: "' + item.conversationSnippet.slice(0, 200) + '"' : ''}`, type: 'admin', time: new Date().toISOString() }],
      vendorNotes: '', created: item.receivedAt || new Date().toISOString(),
    });
    ids.push(item.id);
    n++;
  }
  await saveTasks();
  await hbRemoveFromServer(ids.join(','));
  hbItems = [];
  renderHB(); renderAll();
  showToast(`${n} task${n > 1 ? 's' : ''} imported from HostBuddy.`);
}

async function hbDismiss(id) {
  const item = hbItems.find(x => x.id === id);
  if (item) {
    hbDismissed.unshift({ ...item, dismissedAt: new Date().toISOString() });
    // Cap at 50 dismissed items
    if (hbDismissed.length > 50) hbDismissed = hbDismissed.slice(0, 50);
    try { await S.set('se_hb_dismissed', JSON.stringify(hbDismissed)); } catch (e) {}
  }
  await hbRemoveFromServer(id);
  hbItems = hbItems.filter(x => x.id !== id);
  renderHB();
  showToast('Item dismissed.');
}

async function hbDismissAll() {
  const now = new Date().toISOString();
  hbItems.forEach(item => hbDismissed.unshift({ ...item, dismissedAt: now }));
  if (hbDismissed.length > 50) hbDismissed = hbDismissed.slice(0, 50);
  try { await S.set('se_hb_dismissed', JSON.stringify(hbDismissed)); } catch (e) {}
  await hbRemoveFromServer('all');
  hbItems = [];
  renderHB();
  showToast('All incoming items dismissed.');
}

async function hbRestore(id) {
  const item = hbDismissed.find(x => x.id === id);
  if (!item) return;
  // Import as task (same as hbImport but from dismissed list)
  let pid = hbMatchProperty(item.property);
  if (!pid && item._raw) pid = hbDeepMatchProperty(item._raw);
  const cat = hbMatchCategory(item.category);
  const _skip = ['action_items','action_item','maintenance','issue','task','alert','notification'];
  let problem = (item.problem||'').trim();
  if (!problem || _skip.includes(problem.toLowerCase())) {
    problem = item.conversationSnippet || (item._raw ? hbDeepFindProblem(item._raw) : '') || '';
  }
  const t = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    property: pid || '', guest: item.guest || '',
    problem: problem || 'HostBuddy action item',
    category: cat || '', status: 'open', date: '', vendor: '',
    urgent: !!(item.urgent), recurring: false,
    notes: [{ text: `Imported from HostBuddy AI (restored from dismissed).${item.conversationSnippet ? ' Guest said: "' + item.conversationSnippet.slice(0, 200) + '"' : ''}`, type: 'admin', time: new Date().toISOString() }],
    vendorNotes: '', created: item.receivedAt || new Date().toISOString(),
  };
  tasks.unshift(t);
  await saveTasks();
  // Remove from dismissed
  hbDismissed = hbDismissed.filter(x => x.id !== id);
  try { await S.set('se_hb_dismissed', JSON.stringify(hbDismissed)); } catch (e) {}
  renderHB(); renderAll();
  showToast('Task restored from dismissed.');
  if (!pid) { detailId = t.id; openDetail(t.id); }
}

async function hbClearDismissed() {
  hbDismissed = [];
  try { await S.set('se_hb_dismissed', JSON.stringify(hbDismissed)); } catch (e) {}
  renderHB();
  showToast('Dismissed history cleared.');
}

function toggleHbDismissed() {
  const btn = document.getElementById('hb-dismissed-toggle');
  const list = document.getElementById('hb-dismissed-list');
  if (!btn || !list) return;
  btn.classList.toggle('open');
  list.classList.toggle('show');
}

async function hbRemoveFromServer(id) {
  if (!HB_CONFIG.apiUrl) return;
  try {
    const headers = {};
    if (HB_CONFIG.apiToken) headers['Authorization'] = 'Bearer ' + HB_CONFIG.apiToken;
    await fetch(HB_CONFIG.apiUrl + '/api/tasks?id=' + encodeURIComponent(id), { method: 'DELETE', headers, signal: AbortSignal.timeout(8000) });
  } catch (e) { console.warn('Failed to remove item from server:', e.message); }
}

// Test: simulate a HostBuddy notification (call from console: hbTest())
async function hbTest() {
  if (!HB_CONFIG.apiUrl) { console.log('Set HB_CONFIG.apiUrl first.'); return; }
  try {
    const r = await fetch(HB_CONFIG.apiUrl + '/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const data = await r.json();
    console.log('Test notification sent:', data);
    await hbFetch();
    showToast('Test notification received!');
  } catch (e) { console.error('Test failed:', e); }
}

// One-time import: historical HostBuddy cleaning alerts (call from console: clImportHistorical())
// Cleans out any previous historical imports first, then imports fresh.
async function clImportHistorical() {
  // Remove any previously imported historical cleaning alerts
  const before = tasks.length;
  tasks = tasks.filter(t => !(
    t.category === 'cleaning' &&
    t.notes && t.notes.some(n => n.text && n.text.includes('Imported from HostBuddy AI')) &&
    (t._historicalImport || t.status === 'complete')
  ));
  const removed = before - tasks.length;
  if (removed > 0) console.log(`Removed ${removed} previous historical import(s).`);

  const historical = [
    { date: '2026-04-03T08:57:00', property: 'prc5', guest: 'Jessie Jirles', problem: 'The guest reported that the dishes on the shelf were found dirty and gross upon arrival.' },
    { date: '2026-04-01T23:43:00', property: 'umc40', guest: 'Victoria Groll', problem: 'The guest reported a strong smell of urine in the living room and the host team needs to investigate the cleanliness with their team.' },
    { date: '2026-03-22T22:53:00', property: 'umc60', guest: 'Hope Layton', problem: 'The host needs to address the severe cleanliness failures (dog hair, pee stains, dirty floors, and rags) with the cleaning team.' },
    { date: '2026-03-20T21:43:00', property: 'hero', guest: 'Tristin Miller', problem: 'The guest reported that the floors were extremely dirty and sticky, suggesting a failure in the cleaning service\'s floor maintenance.' },
  ];

  let imported = 0;
  for (const item of historical) {
    // Check for duplicates (same property + guest + similar date)
    const isDuplicate = tasks.some(t =>
      t.property === item.property &&
      t.guest === item.guest &&
      t.category === 'cleaning' &&
      t.notes && t.notes.some(n => n.text && n.text.includes('Imported from HostBuddy AI'))
    );
    if (isDuplicate) {
      console.log(`Skipping duplicate: ${item.guest} at ${item.property}`);
      continue;
    }

    const t = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6) + imported,
      property: item.property,
      guest: item.guest,
      problem: item.problem,
      category: 'cleaning',
      status: 'complete',
      date: '',
      vendor: '',
      urgent: false,
      recurring: false,
      _historicalImport: true,
      notes: [
        { text: `Imported from HostBuddy AI. Guest said: "${item.problem}"`, type: 'admin', time: item.date }
      ],
      vendorNotes: '',
      created: item.date,
    };
    tasks.unshift(t);logTaskChange('created',t);
    imported++;
  }

  if (imported > 0) {
    await saveTasks();
    renderAll();
    if (typeof renderCleaningLog === 'function') renderCleaningLog();
    showToast(`${imported} historical cleaning alert(s) imported.`);
  } else {
    showToast('No new items to import (all duplicates).');
  }
  console.log(`Historical import complete: ${imported} items imported, ${historical.length - imported} skipped.`);
}


// ── Cleaning Log ───────────────────────────────────────────────
let clData = []; // all cleaning-relevant review entries (flagged issues)
let clAllRatings = {}; // ALL cleanliness ratings per property (for winners/trends): { pid: [{rating, reviewedAt}] }
let clLoaded = false;
let clFetching = false;
let clSelectedProps = null; // null = all properties; Set of pids when picker is filtering

// Keywords that indicate cleaning issues specifically
const CL_KEYWORDS = /\b(dirty|filthy|grime|grimy|stain|stained|smell|odor|smelly|mold|mildew|cobweb|cobwebs|dust|dusty|hair|hairs|trash|garbage|gross|disgusting|unsanitary|unclean|not clean|wasn.t clean|wasn.t cleaned|mouse feces|droppings|feces|poop|urine|sewage)\b/i;

function clIsCleaningRelevant(review) {
  const feedback = review.private?.feedback || '';
  const ratingComments = (review.private?.detailed_ratings || []).filter(r => r.comment).map(r => r.comment).join(' ');
  const publicReview = review.public?.review || '';
  const allText = (feedback + ' ' + ratingComments + ' ' + publicReview).trim();

  // 1. Cleanliness rating ≤ 3 (anything below 4 is a flag)
  const cleanRating = (review.private?.detailed_ratings || []).find(r => r.type === 'cleanliness');
  if (cleanRating && cleanRating.rating > 0 && cleanRating.rating <= 3) return true;

  // 2. Cleaning keywords in private feedback or rating comments
  if (feedback && CL_KEYWORDS.test(feedback)) return true;
  if (ratingComments && CL_KEYWORDS.test(ratingComments)) return true;

  // 3. Cleaning keywords in public review (guests sometimes only leave public feedback)
  if (publicReview && CL_KEYWORDS.test(publicReview)) return true;

  return false;
}

function clBuildEntry(review) {
  const cleanRating = (review.private?.detailed_ratings || []).find(r => r.type === 'cleanliness');
  const feedback = review.private?.feedback || '';
  const ratingComments = (review.private?.detailed_ratings || []).filter(r => r.comment);
  const publicReview = review.public?.review || '';

  // Build the relevant text
  let text = '';
  // Private feedback with cleaning keywords gets priority
  if (feedback && CL_KEYWORDS.test(feedback)) {
    text = feedback;
  } else if (ratingComments.some(r => CL_KEYWORDS.test(r.comment))) {
    text = ratingComments.filter(r => CL_KEYWORDS.test(r.comment)).map(r => r.type + ': ' + r.comment).join('; ');
  } else if (feedback) {
    text = feedback;
  } else if (publicReview && CL_KEYWORDS.test(publicReview)) {
    text = publicReview;
  } else {
    text = 'Low cleanliness rating (no specific feedback provided)';
  }

  return {
    id: review.id,
    pid: review._pid,
    guest: [review.guest?.first_name, review.guest?.last_name].filter(Boolean).join(' ') || 'Anonymous',
    reviewedAt: review.reviewed_at,
    checkIn: review.reservation?.check_in || '',
    checkOut: review.reservation?.check_out || '',
    cleanlinessRating: cleanRating?.rating ?? null,
    overallRating: review.public?.rating || 0,
    text: text,
    source: feedback ? 'private feedback' : 'public review',
  };
}

async function clFetch() {
  if (clFetching) return;
  clFetching = true;
  const el = document.getElementById('cl-status');
  if (el) el.textContent = 'Loading reviews...';
  const allEntries = [];
  const entries = Object.entries(HOSPITABLE_IDS);
  const batchSize = 4;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    if (el) el.textContent = `Loading reviews... (${Math.min(i + batchSize, entries.length)}/${entries.length} properties)`;
    const results = await Promise.allSettled(
      batch.map(async ([pid, uuid]) => {
        try {
          // Fetch all reviews (no date filter — full history). Paginate if needed.
          let page = 1;
          let allReviews = [];
          while (page <= 10) { // safety cap at 10 pages (~500 reviews per property)
            const r = await fetch(`${PROXY_BASE}/api/hospitable?action=reviews&pid=${uuid}&start=2020-01-01&end=${new Date().toISOString().slice(0,10)}&page=${page}`, { signal: AbortSignal.timeout(15000) });
            if (!r.ok) break;
            const data = await r.json();
            const reviews = data.data || [];
            allReviews.push(...reviews.map(rv => ({ ...rv, _pid: pid })));
            // Check if there are more pages
            if (!data.meta || page >= data.meta.last_page) break;
            page++;
          }
          return allReviews;
        } catch (e) { return []; }
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.length) {
        for (const rv of r.value) {
          // Collect ALL cleanliness ratings for trend/winner analysis AND property detail view
          const cleanR = (rv.private?.detailed_ratings || []).find(d => d.type === 'cleanliness');
          if (cleanR && cleanR.rating > 0) {
            if (!clAllRatings[rv._pid]) clAllRatings[rv._pid] = [];
            const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || 'Anonymous';
            const feedback = rv.private?.feedback || '';
            const publicReview = rv.public?.review || '';
            const ratingComments = (rv.private?.detailed_ratings || []).filter(r => r.comment).map(r => r.type + ': ' + r.comment).join('; ');
            clAllRatings[rv._pid].push({
              rating: cleanR.rating,
              reviewedAt: rv.reviewed_at,
              guest,
              checkIn: rv.reservation?.check_in || '',
              checkOut: rv.reservation?.check_out || '',
              overallRating: rv.public?.rating || 0,
              text: feedback || ratingComments || publicReview || '',
              source: feedback ? 'private feedback' : (publicReview ? 'public review' : 'rating only'),
              isFlagged: clIsCleaningRelevant(rv),
            });
          }
          // Only add flagged items to the issue log (for all-properties view)
          if (clIsCleaningRelevant(rv)) allEntries.push(clBuildEntry(rv));
        }
      }
    }
  }

  // Sort by review date, newest first
  allEntries.sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
  clData = allEntries;
  clLoaded = true;
  const totalReviews = Object.values(clAllRatings).reduce((s, a) => s + a.length, 0);
  if (el) el.textContent = `${totalReviews} reviews scanned · ${clData.length} cleaning flag${clData.length !== 1 ? 's' : ''} found`;
  populateClPropFilter();
  renderCleaningLog();
}

function populateClPropFilter() {
  const sel = document.getElementById('cl-prop-filter');
  if (!sel) return;
  sel.innerHTML = '<option value="all">All Properties</option>';
  NBS.forEach(nb => {
    const og = document.createElement('optgroup');
    og.label = nb.name;
    nb.props.forEach(pid => {
      const p = getProp(pid);
      if (!p) return;
      const count = clData.filter(e => e.pid === pid).length;
      const o = document.createElement('option');
      o.value = pid;
      o.textContent = p.name + (count ? ` (${count})` : '');
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
}

// Track whether we're in property detail view (null = overview, string = pid)
let clDetailPid = null;

function renderCleaningLog() {
  const heroEl = document.getElementById('cl-hero');
  const summaryEl = document.getElementById('cl-summary');
  const logEl = document.getElementById('cl-log');
  const toolbarEl = document.getElementById('cl-toolbar');
  const pickerEl = document.getElementById('cl-picker');

  if (!clLoaded) {
    if (heroEl) heroEl.innerHTML = '';
    logEl.innerHTML = '<div class="cl-empty">Loading cleaning data from Hospitable...</div>';
    summaryEl.innerHTML = '';
    return;
  }

  // ── Build per-property stats (used by both overview and detail) ──
  const now = Date.now();
  const sixtyDaysAgo = now - 60 * 86400000;
  const allPropStats = {};
  for (const [pid, ratings] of Object.entries(clAllRatings)) {
    const recent = ratings.filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo);
    const sixMo = ratings.filter(r => new Date(r.reviewedAt).getTime() <= sixtyDaysAgo);
    const recentAvg = recent.length ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : null;
    const sixMoAvg = sixMo.length ? sixMo.reduce((s, r) => s + r.rating, 0) / sixMo.length : null;
    const perfect = recent.filter(r => r.rating === 5).length;
    const flags = clData.filter(e => e.pid === pid);
    const recentFlags = flags.filter(e => new Date(e.reviewedAt).getTime() > sixtyDaysAgo);
    allPropStats[pid] = { totalReviews: ratings.length, recentReviews: recent.length, recentAvg, sixMoAvg, perfect, totalFlags: flags.length, recentFlags: recentFlags.length };
  }
  for (const [pid] of Object.entries(HOSPITABLE_IDS)) {
    if (!allPropStats[pid]) allPropStats[pid] = { totalReviews: 0, recentReviews: 0, recentAvg: null, sixMoAvg: null, perfect: 0, totalFlags: 0, recentFlags: 0 };
  }

  // ── Property detail drill-down ──
  if (clDetailPid) {
    if (heroEl) heroEl.innerHTML = '';
    if (pickerEl) pickerEl.style.display = 'none';
    if (toolbarEl) toolbarEl.style.display = 'none';
    clShowPropDetail(clDetailPid, allPropStats);
    return;
  }

  // ── Overview mode ──
  if (pickerEl) { pickerEl.style.display = ''; renderClPicker(); }
  if (toolbarEl) toolbarEl.style.display = '';

  // Count properties relevant to current picker filter
  const filteredPids = Object.keys(allPropStats).filter(pid => !clSelectedProps || clSelectedProps.has(pid));
  const totalReviews = filteredPids.reduce((s, pid) => s + (allPropStats[pid]?.recentReviews || 0), 0);
  const allRecentRatings = filteredPids.flatMap(pid => (clAllRatings[pid] || []).filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo));
  const overallAvg = allRecentRatings.length ? (allRecentRatings.reduce((s, r) => s + r.rating, 0) / allRecentRatings.length).toFixed(1) : '—';

  // Categorize properties into 3 tiers (matching cleaner view)
  const winnerPids = filteredPids.filter(pid => {
    const s = allPropStats[pid];
    return s.recentReviews >= 3 && s.recentAvg !== null && Math.round(s.recentAvg * 10) / 10 >= 4.8;
  }).sort((a, b) => (allPropStats[b].recentAvg || 0) - (allPropStats[a].recentAvg || 0));

  const nearlyPids = filteredPids.filter(pid => {
    const s = allPropStats[pid];
    const avg = s.recentAvg !== null ? Math.round(s.recentAvg * 100) / 100 : null;
    return s.recentReviews >= 3 && avg !== null && avg >= 4.7 && Math.round(s.recentAvg * 10) / 10 < 4.8;
  }).sort((a, b) => (allPropStats[b].recentAvg || 0) - (allPropStats[a].recentAvg || 0));

  const attentionPids = filteredPids.filter(pid => {
    const s = allPropStats[pid];
    const avg = s.recentAvg !== null ? Math.round(s.recentAvg * 100) / 100 : null;
    return s.recentReviews >= 3 && avg !== null && avg < 4.7;
  }).sort((a, b) => (allPropStats[a].recentAvg || 5) - (allPropStats[b].recentAvg || 5));

  const noDataPids = filteredPids.filter(pid => { const s = allPropStats[pid]; return !s || s.recentReviews < 3; });

  const eliteCount = winnerPids.length;

  // ── Hero bar (matching cleaner view cv-hero) ──
  if (heroEl) {
    heroEl.innerHTML = `<div class="cv-hero">
      <div>
        <div class="cv-hero-name">Cleaning Performance</div>
        <div class="cv-hero-meta">${filteredPids.length} properties · ${totalReviews} reviews in last 60 days · ${overallAvg}/5 avg cleanliness</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div class="cv-hero-badge"><span class="star">★</span> ${eliteCount} of ${filteredPids.length} properties at elite level this period</div>
        <button class="btn" onclick="openCleanerLinkModal()" style="font-size:.72rem;padding:5px 12px;white-space:nowrap">Share Cleaner Link</button>
      </div>
    </div>`;
  }

  // ── Cleaning Alerts Banner ──
  const clAlerts = clGetActiveAlerts();
  if (clAlerts.length > 0) {
    let bannerH = `<div class="cl-alerts-banner"><div class="cl-alerts-hdr"><span class="cl-alerts-pulse"></span><span class="cl-alerts-title">Guest Cleaning Alerts</span><span class="cl-alerts-count">${clAlerts.length}</span><div class="cl-alerts-actions"><button class="btn cl-alerts-btn" onclick="clDismissAllAlerts()">Dismiss All</button><button class="btn cl-alerts-btn cl-alerts-btn-primary" onclick="clImportAllAlerts()">Create Tasks for All</button></div></div>`;
    clAlerts.forEach(item => {
      let matchedPid = hbMatchProperty(item.property);
      if (!matchedPid && item._raw) matchedPid = hbDeepMatchProperty(item._raw);
      const matchedProp = matchedPid ? getProp(matchedPid) : null;
      const propName = matchedProp ? matchedProp.name : (item.property || 'Unknown property');
      const skipProblems = ['action_items','action_item','maintenance','issue','task','alert','notification','cleaning','clean'];
      let problem = (item.problem || '').trim();
      if (!problem || skipProblems.includes(problem.toLowerCase())) {
        problem = item.conversationSnippet || '';
      }
      const guest = item.guest || '';
      const timeAgo = item.receivedAt ? (() => { const m = Math.floor((Date.now() - new Date(item.receivedAt).getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; if (m < 1440) return Math.floor(m / 60) + 'h ago'; return Math.floor(m / 1440) + 'd ago'; })() : '';
      bannerH += `<div class="cl-alert-item" id="cl-alert-${item.id}"><div class="cl-alert-body"><div class="cl-alert-prop">${escHtml(propName)}</div>`;
      if (problem) bannerH += `<div class="cl-alert-text">"${escHtml(problem.substring(0, 150))}"</div>`;
      bannerH += `<div class="cl-alert-meta">${guest ? '<span>' + escHtml(guest) + '</span> · ' : ''}<span>${timeAgo}</span>${item.urgent ? ' <span class="cl-alert-tag" style="background:rgba(192,57,43,.1);color:var(--red)">URGENT</span>' : ''} <span class="cl-alert-tag">cleaning</span></div></div><div class="cl-alert-actions"><button class="cl-alert-dismiss" onclick="clDismissAlert('${item.id}')">Dismiss</button><button class="cl-alert-task" onclick="clImportAlert('${item.id}')">Create Task</button></div></div>`;
    });
    bannerH += '</div>';
    sumH += bannerH;
  }

  // ── Card builder (matches cleaner view exactly) ──
  function clCard(pid, cardClass) {
    const p = getProp(pid);
    if (!p) return '';
    const s = allPropStats[pid];
    const recentAvg = s.recentAvg !== null ? s.recentAvg.toFixed(1) : '—';
    const sixMoAvg = s.sixMoAvg !== null ? s.sixMoAvg.toFixed(1) : '—';
    const perfect = s.perfect || 0;

    // Trend pill (suppress downtrend for top performers — show "elite" instead)
    let trendH = '';
    if (s.recentAvg !== null && s.sixMoAvg !== null) {
      const diff = s.recentAvg - s.sixMoAvg;
      if (diff > 0.05) trendH = `<div class="cv-trend up">↑ up from ${sixMoAvg} · 6-month avg</div>`;
      else if (diff < -0.05) {
        if (cardClass === 'cv-winner-card') {
          trendH = `<div class="cv-trend elite">✓ Holding at elite level</div>`;
        } else {
          trendH = `<div class="cv-trend down">↓ down from ${sixMoAvg} · 6-month avg</div>`;
        }
      } else trendH = `<div class="cv-trend flat">→ holding at ${recentAvg}</div>`;
    } else if (s.sixMoAvg === null) {
      trendH = `<div class="cv-trend flat">— not enough 6-month data</div>`;
    }

    // Flag snippets for nearly/attention cards
    let flagsH = '';
    if ((cardClass === 'cv-nearly-card' || cardClass === 'cv-attention-card') && clData.length > 0) {
      const propFlags = clData.filter(f => f.pid === pid && new Date(f.reviewedAt).getTime() > sixtyDaysAgo);
      if (propFlags.length > 0) {
        flagsH = propFlags.slice(0, 2).map(f => `<div class="cv-flag-item"><span class="cv-flag-guest">${escHtml(f.guest)}</span><span class="cv-flag-text">${escHtml((f.text || '').substring(0, 60))}</span></div>`).join('');
        if (propFlags.length > 2) flagsH += `<div class="cv-flag-more">+${propFlags.length - 2} more flag${propFlags.length > 3 ? 's' : ''}</div>`;
        flagsH = `<div class="cv-flags">${flagsH}</div>`;
      }
    }

    // HostBuddy cleaning alert badge
    const propAlerts = clGetActiveAlertsForProp(pid);
    let alertBadgeH = '';
    if (propAlerts.length > 0) {
      alertBadgeH = `<div class="cl-card-alert-badge"><span class="cl-alerts-pulse"></span> ${propAlerts.length} guest alert${propAlerts.length !== 1 ? 's' : ''}</div>`;
    }

    return `<div class="${cardClass}" onclick="clDrillDown('${pid}')">
      <div class="cv-card-name">${escHtml(p.name)}</div>
      <div class="cv-card-rating-row"><span class="cv-card-rating-label">60-day cleaning avg</span><span class="cv-card-rating-value">${recentAvg} / 5</span></div>
      <div class="cv-card-sub">${perfect}/${s.recentReviews} Excellent Cleaning Reviews</div>
      ${trendH}${flagsH}${alertBadgeH}
      <div class="cv-comp-row"><div class="cv-comp-col"><span class="cv-comp-val">${recentAvg}</span><span class="cv-comp-lbl">Last 60 days</span></div><div class="cv-comp-divider"></div><div class="cv-comp-col"><span class="cv-comp-val muted">${sixMoAvg}</span><span class="cv-comp-lbl">6-month avg</span></div></div>
    </div>`;
  }

  let sumH = '';

  // Section 1: Top Performers (≥4.8)
  if (winnerPids.length) {
    sumH += `<div class="cv-section" data-section="1"><div class="cv-section-hdr cv-winners"><span class="icon">★</span> Top Performers <span class="cv-section-count">4.8 or above · last 60 days</span></div><div class="cv-card-grid">`;
    winnerPids.forEach(pid => { sumH += clCard(pid, 'cv-winner-card'); });
    sumH += '</div></div>';
  }

  // Section 2: Good Performers (4.7–4.79)
  if (nearlyPids.length) {
    sumH += `<div class="cv-section" data-section="2"><div class="cv-section-hdr cv-nearly"><span class="icon">◎</span> Good Performers <span class="cv-section-count">4.7 – 4.79 · just below elite</span></div><div class="cv-card-grid">`;
    nearlyPids.forEach(pid => { sumH += clCard(pid, 'cv-nearly-card'); });
    sumH += '</div></div>';
  }

  // Section 3: Needs Attention (<4.7)
  if (attentionPids.length) {
    sumH += `<div class="cv-section" data-section="3"><div class="cv-section-hdr cv-attention"><span class="icon">△</span> Needs Attention <span class="cv-section-count">${attentionPids.length} propert${attentionPids.length !== 1 ? 'ies' : 'y'}</span></div><div class="cv-card-grid">`;
    attentionPids.forEach(pid => { sumH += clCard(pid, 'cv-attention-card'); });
    sumH += '</div></div>';
  }

  // Not enough data
  if (noDataPids.length) {
    sumH += `<div class="cv-section" data-section="4"><div class="cv-section-hdr" style="color:var(--text2)"><span class="icon">○</span> Not Enough Data <span class="cv-section-count">${noDataPids.length} propert${noDataPids.length !== 1 ? 'ies' : 'y'} · need 3+ reviews</span></div><div class="cv-card-grid">`;
    for (const pid of noDataPids) {
      const p = getProp(pid);
      if (!p) continue;
      const s = allPropStats[pid] || {};
      sumH += `<div class="cv-attention-card" onclick="clDrillDown('${pid}')" style="opacity:.6"><div class="cv-card-name">${escHtml(p.name)}</div><div class="cv-card-sub">${s.recentReviews || 0} reviews in last 60 days (need 3+)</div></div>`;
    }
    sumH += '</div></div>';
  }

  if (!winnerPids.length && !nearlyPids.length && !attentionPids.length && !noDataPids.length) {
    sumH += '<div class="cl-no-data">Not enough review data in the last 60 days to identify trends yet (need at least 3 reviews per property).</div>';
  }

  summaryEl.innerHTML = sumH;
  logEl.innerHTML = '';

  // ── Staggered card animations (matching cleaner view) ──
  const SECTION_DELAYS = [0.05, 0.25, 0.45, 0.65, 0.85];
  const sections = summaryEl.querySelectorAll('.cv-section');
  sections.forEach((sec, i) => {
    const delay = SECTION_DELAYS[i] || (i * 0.2);
    setTimeout(() => {
      sec.classList.add('animate');
      const cards = sec.querySelectorAll('.cv-winner-card, .cv-nearly-card, .cv-attention-card');
      cards.forEach((card, j) => {
        setTimeout(() => card.classList.add('animate'), j * 50);
      });
    }, delay * 1000);
  });
}

// ── Drill down into property detail (inline, with back button) ──
function clDrillDown(pid) {
  clDetailPid = pid;
  renderCleaningLog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clBackToOverview() {
  clDetailPid = null;
  renderCleaningLog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clShowPropDetail(pid, allPropStats) {
  const summaryEl = document.getElementById('cl-summary');
  const logEl = document.getElementById('cl-log');
  if (!summaryEl || !logEl) return;

  const p = getProp(pid);
  const propRatings = (clAllRatings[pid] || []).slice().sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
  const s = allPropStats[pid] || {};
  const sixtyDaysAgo = Date.now() - 60 * 86400000;
  const sixtyDayRatings = propRatings.filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo);
  const recentAvg = sixtyDayRatings.length ? (sixtyDayRatings.reduce((s, r) => s + r.rating, 0) / sixtyDayRatings.length).toFixed(1) : '—';
  const allAvg = propRatings.length ? (propRatings.reduce((s, r) => s + r.rating, 0) / propRatings.length).toFixed(1) : '—';
  const perfect = sixtyDayRatings.filter(r => r.rating === 5).length;
  const recentFlags = clData.filter(e => e.pid === pid && new Date(e.reviewedAt).getTime() > sixtyDaysAgo);

  summaryEl.innerHTML = `<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin-bottom:16px;box-shadow:var(--shadow)">
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;color:var(--green)">${escHtml(p?.name || pid)}</div>
    <div style="font-size:.78rem;color:var(--text);margin-top:6px;font-weight:600">60-Day Cleaning Rating: <span style="color:${parseFloat(recentAvg) >= 4.8 ? 'var(--green)' : 'var(--red)'}">${recentAvg}/5</span> · ${sixtyDayRatings.length} reviews · ${perfect} perfect · ${recentFlags.length} flag${recentFlags.length !== 1 ? 's' : ''}</div>
    <div style="font-size:.74rem;color:var(--text2);margin-top:2px">Overall Cleaning Rating: ${allAvg}/5 · ${propRatings.length} total reviews · ${clData.filter(e => e.pid === pid).length} flags all-time</div>
    <div style="margin-top:8px"><button class="btn" style="font-size:.72rem;padding:4px 12px" onclick="clBackToOverview()">← Back to overview</button></div>
  </div>`;

  // ── Active Guest Cleaning Alerts (orange) ──
  let h = '';
  const propAlerts = clGetActiveAlertsForProp(pid);
  if (propAlerts.length > 0) {
    h += `<div class="cl-detail-alerts"><div class="cl-detail-alerts-title"><span style="font-size:1rem">💬</span> Guest Cleaning Alerts <span style="font-size:.65rem;color:var(--text3);font-weight:400;margin-left:4px">from Hostbuddy AI · not reflected in ratings</span></div>`;
    propAlerts.forEach(item => {
      const skipProblems = ['action_items','action_item','maintenance','issue','task','alert','notification','cleaning','clean'];
      let problem = (item.problem || '').trim();
      if (!problem || skipProblems.includes(problem.toLowerCase())) {
        problem = item.conversationSnippet || '';
      }
      const guest = item.guest || 'Guest';
      const timeAgo = item.receivedAt ? (() => { const m = Math.floor((Date.now() - new Date(item.receivedAt).getTime()) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; if (m < 1440) return Math.floor(m / 60) + 'h ago'; return Math.floor(m / 1440) + 'd ago'; })() : '';
      h += `<div class="cl-detail-alert-entry"><div style="font-weight:600;color:var(--text)">${escHtml(guest)}</div><div style="font-size:.7rem;color:var(--text3);margin-top:2px">${timeAgo} · During stay · Detected by Hostbuddy AI</div>`;
      if (problem) h += `<div style="color:var(--text2);margin-top:4px;line-height:1.45">"${escHtml(problem.substring(0, 200))}"</div>`;
      h += `<div class="cl-detail-alert-actions"><button onclick="clDismissAlert('${item.id}')">Dismiss</button><button onclick="clImportAlert('${item.id}')" style="color:var(--green);font-weight:600">Create Task</button></div></div>`;
    });
    h += '</div>';
  }

  // ── Reported During Stay (resolved cleaning tasks from HostBuddy) ──
  const reportedTasks = clGetReportedDuringStay(pid);
  if (reportedTasks.length > 0) {
    h += `<div class="cl-reported-section"><div class="cl-reported-title"><span style="font-size:.9rem">📋</span> Reported During Stay</div><div class="cl-reported-subtitle">Cleaning issues guests reported during their stay (imported from Hostbuddy AI). These don't affect the rating but show what the cleaning team missed.</div>`;
    reportedTasks.forEach(t => {
      const dateStr = new Date(t.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const isComplete = t.status === 'complete' || t.status === 'completed';
      const statusH = isComplete
        ? `<span class="cl-reported-status cl-reported-resolved">✓ Completed</span>`
        : `<span class="cl-reported-status cl-reported-open">⟳ Open</span>`;
      const guestNote = t.notes ? t.notes.find(n => n.text && n.text.includes('Guest said:')) : null;
      const guestQuote = guestNote ? guestNote.text.replace(/^Imported from HostBuddy AI\.\s*Guest said:\s*"?/, '').replace(/"$/, '') : t.problem;
      const isHistorical = !!t._historicalImport;
      const clickAttr = isHistorical ? '' : `onclick="clOpenTaskFromCleaning('${t.id}')"`;
      const clickClass = isHistorical ? 'cl-reported-entry cl-reported-static' : 'cl-reported-entry';
      const taskLink = isHistorical ? '' : '<span class="cl-reported-task-link">View Task →</span>';
      h += `<div class="${clickClass}" ${clickAttr}><div style="font-weight:600;color:var(--text)">${escHtml(t.guest || 'Guest')}</div><div style="font-size:.7rem;color:var(--text3);margin-top:2px">${dateStr} · During stay · Imported from Hostbuddy AI</div><div style="color:var(--text2);margin-top:4px;line-height:1.45">"${escHtml((guestQuote || t.problem || '').substring(0, 200))}"</div><div class="cl-reported-task-row">${statusH}${taskLink}</div></div>`;
    });
    h += '</div>';
  }

  // Show review flags for this property
  if (recentFlags.length > 0) {
    h += `<div style="background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.2);border-radius:8px;padding:12px 14px;margin-bottom:16px">
      <div style="font-size:.85rem;font-weight:600;color:var(--red);margin-bottom:8px">⚠ Review Flags (${recentFlags.length})</div>
      ${recentFlags.map(f => {
        const dateStr = new Date(f.reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return `<div style="font-size:.75rem;margin-bottom:8px;padding:8px;background:var(--white);border-radius:4px;border-left:3px solid var(--red)">
          <div style="font-weight:600;color:var(--text)">${escHtml(f.guest)}</div>
          <div style="font-size:.7rem;color:var(--text3);margin-top:2px">${dateStr} · Cleaning: ${f.cleanlinessRating}/5 · ${f.source}</div>
          <div style="color:var(--text2);margin-top:4px">${escHtml(f.text)}</div>
        </div>`;
      }).join('')}
    </div>`;
  }

  // Show all reviews
  const recent = propRatings.filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo);
  const older = propRatings.filter(r => new Date(r.reviewedAt).getTime() <= sixtyDaysAgo);
  if (recent.length) {
    h += recent.map(e => clDetailEntryHtml({ ...e, pid }, false)).join('');
  } else {
    h += '<div style="color:var(--text2);font-size:.82rem;padding:12px 0;font-style:italic">No cleaning reviews in the last 60 days.</div>';
  }
  if (older.length) {
    h += `<div style="margin-top:16px"><button class="btn" id="cl-older-btn" style="width:100%;text-align:center;font-size:.8rem;padding:10px" onclick="document.getElementById('cl-older-entries').style.display='';this.style.display='none'">Older Reviews (${older.length})</button>`;
    h += `<div id="cl-older-entries" style="display:none;margin-top:8px">${older.map(e => clDetailEntryHtml({ ...e, pid }, false)).join('')}</div></div>`;
  }
  if (!propRatings.length) {
    h += '<div class="cl-empty">No cleaning ratings for this property.</div>';
  }
  logEl.innerHTML = h;
}

// ── Entry rendering helper for detail view ──
function clDetailEntryHtml(e, showPropName) {
  const prop = getProp(e.pid);
  const dateStr = new Date(e.reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const checkIn = e.checkIn || e.check_in || '';
  const checkOut = e.checkOut || e.check_out || '';
  const stayStr = checkIn ? `${new Date(checkIn).toLocaleDateString('en-US', {month:'short',day:'numeric'})} – ${new Date(checkOut).toLocaleDateString('en-US', {month:'short',day:'numeric'})}` : '';
  const cleanRating = e.cleanlinessRating ?? e.rating ?? null;
  let ratingClass = 'good';
  if (cleanRating !== null) {
    if (cleanRating <= 2) ratingClass = 'bad';
    else if (cleanRating <= 3) ratingClass = 'ok';
  }
  const guestName = e.guest || 'Anonymous';
  const text = e.text || '';
  const source = e.source || '';
  return `<div class="cl-entry"${e.isFlagged ? ' style="border-left:3px solid var(--red)"' : ''}>
    <div class="cl-entry-hdr">
      <div>
        <span class="cl-entry-date">${dateStr}</span>
        ${showPropName ? `<span style="font-size:.74rem;color:var(--green);margin-left:8px;font-weight:600">${escHtml(prop?.name || e.pid)}</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${cleanRating !== null ? `<span class="cl-entry-rating ${ratingClass}">Cleaning: ${cleanRating}/5</span>` : ''}
        ${e.overallRating ? `<span style="font-size:.7rem;color:var(--text2)">Overall: ${'★'.repeat(e.overallRating)}${'☆'.repeat(5 - e.overallRating)}</span>` : ''}
      </div>
    </div>
    ${text ? `<div class="cl-entry-text">${escHtml(text.length > 500 ? text.slice(0, 500) + '...' : text)}</div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <span class="cl-entry-guest">Guest: ${escHtml(guestName)}${stayStr ? ' · Stay: ' + stayStr : ''}</span>
      ${source ? `<span class="cl-entry-source">Source: ${source}</span>` : ''}
    </div>
  </div>`;
}

// ── Cleaning Picker ────────────────────────────────────────────
function clChipLabel(p) {
  if (!p) return '?';
  const n = p.name;
  const match = n.match(/^(PRC|UMC)\s*-\s*(\d+)/);
  if (match) return match[1] + '\u2011' + match[2]; // PRC‑1, UMC‑10
  const hillside = n.match(/Hillside Haven:\s*(.+)/);
  if (hillside) return hillside[1];
  return n;
}

function renderClPicker() {
  const el = document.getElementById('cl-picker');
  if (!el) return;
  const isFiltered = clSelectedProps !== null;

  function groupActive(nb) { return isFiltered && nb.props.every(p => clSelectedProps.has(p)); }
  function groupPartial(nb) { return isFiltered && !groupActive(nb) && nb.props.some(p => clSelectedProps.has(p)); }

  let h = '<div class="cl-picker-wrap">';
  h += '<div class="cl-picker-label">Filter by Properties</div>';
  h += '<div class="cl-picker-bar">';
  h += `<button class="cl-picker-btn${!isFiltered ? ' active' : ''}" onclick="clPickerSelectAll()">All Properties</button>`;
  for (const nb of NBS) {
    const cls = groupActive(nb) ? ' active' : groupPartial(nb) ? ' partial' : '';
    h += `<button class="cl-picker-btn${cls}" onclick="clPickerToggleGroup('${nb.id}')">${nb.name} <span style="opacity:.65;font-size:.75em">(${nb.props.length})</span></button>`;
  }
  h += '</div>';

  // Individual chips — show for any neighborhood that has at least 1 prop selected
  if (isFiltered) {
    const activeNbs = NBS.filter(nb => nb.props.some(p => clSelectedProps.has(p)));
    if (activeNbs.length) {
      h += '<div class="cl-picker-chips">';
      for (const nb of activeNbs) {
        for (const pid of nb.props) {
          const p = getProp(pid);
          const sel = clSelectedProps.has(pid);
          h += `<span class="cl-chip${sel ? ' selected' : ''}" onclick="clPickerToggleProp('${pid}')" title="${escHtml(p ? p.name : pid)}">${escHtml(clChipLabel(p))}</span>`;
        }
      }
      h += '</div>';
    }
  }

  h += '</div>';
  el.innerHTML = h;
}

function clPickerSelectAll() {
  clSelectedProps = null;
  renderCleaningLog();
}

function clPickerToggleGroup(nbId) {
  const nb = NBS.find(n => n.id === nbId);
  if (!nb) return;
  if (!clSelectedProps) {
    clSelectedProps = new Set(nb.props);
  } else {
    const allIn = nb.props.every(p => clSelectedProps.has(p));
    if (allIn) {
      nb.props.forEach(p => clSelectedProps.delete(p));
      if (clSelectedProps.size === 0) clSelectedProps = null;
    } else {
      nb.props.forEach(p => clSelectedProps.add(p));
    }
  }
  renderCleaningLog();
}

function clPickerToggleProp(pid) {
  if (!clSelectedProps) {
    clSelectedProps = new Set([pid]);
  } else if (clSelectedProps.has(pid)) {
    clSelectedProps.delete(pid);
    if (clSelectedProps.size === 0) clSelectedProps = null;
  } else {
    clSelectedProps.add(pid);
  }
  renderCleaningLog();
}

// ── Cleaner View Link Generator (Admin) ───────────────────────
let cvSelectedProps = new Set();
let cvSavedLinks = []; // in-memory cache of index

async function openCleanerLinkModal() {
  cvSelectedProps = new Set();
  const el = document.getElementById('cv-modal');
  if (!el) return;
  el.classList.add('open');

  // Reset form
  document.getElementById('cv-name').value = '';
  document.getElementById('cv-result').style.display = 'none';
  document.getElementById('cv-result').innerHTML = '';
  renderCvPropPicker();

  // Load saved links index
  const savedLinksEl = document.getElementById('cv-saved-links');
  if (savedLinksEl) savedLinksEl.innerHTML = '<div style="font-size:.78rem;color:var(--text2);padding:6px 0">Loading saved links...</div>';

  try {
    const raw = await S.get('se_cv_index');
    cvSavedLinks = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
  } catch (e) {
    cvSavedLinks = [];
  }

  cvRenderSavedLinks();
}

function closeCleanerLinkModal() {
  const el = document.getElementById('cv-modal');
  if (el) el.classList.remove('open');
}

function cvRenderSavedLinks() {
  const el = document.getElementById('cv-saved-links');
  const newToggle = document.getElementById('cv-new-toggle');
  const newForm = document.getElementById('cv-new-form');
  const cancelBtn = document.getElementById('cv-cancel-new-btn');
  if (!el) return;

  if (!cvSavedLinks.length) {
    // No saved links — show form directly, hide toggle
    el.innerHTML = '';
    if (newToggle) newToggle.style.display = 'none';
    if (newForm) newForm.style.display = '';
    if (cancelBtn) cancelBtn.style.display = 'none';
    return;
  }

  // Show saved links, collapse the new-form behind a toggle
  if (newToggle) newToggle.style.display = '';
  if (newForm) newForm.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = '';

  let h = `<div style="margin-bottom:14px">
    <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);margin-bottom:8px">Saved Cleaner Links</div>`;

  for (const link of cvSavedLinks) {
    const shareUrl = 'https://storybook-webhook.vercel.app/api/cleaner-page?token=' + link.token;
    const propNames = (link.properties || []).map(pid => { const p = getProp(pid); return p ? p.name.replace(/^(PRC|UMC)\s*-\s*\d+\s*-?\s*/i, '') : pid; });
    const propSummary = link.properties.length <= 3
      ? propNames.join(', ')
      : propNames.slice(0, 2).join(', ') + ` +${link.properties.length - 2} more`;

    h += `<div class="cv-saved-row" id="cv-saved-${link.token}">
      <div class="cv-saved-info">
        <div class="cv-saved-name">${escHtml(link.name)}</div>
        <div class="cv-saved-meta">${link.properties.length} propert${link.properties.length !== 1 ? 'ies' : 'y'} · ${escHtml(propSummary)}</div>
        <div class="cv-saved-url" id="cv-url-${link.token}" style="display:none">
          <input type="text" value="${shareUrl}" readonly onclick="this.select()" style="flex:1;padding:5px 8px;font-size:.72rem;border:1px solid var(--border);border-radius:5px;background:#fff;color:var(--text);font-family:inherit;min-width:0">
          <button class="btn btn-g" onclick="cvCopySavedLink('${link.token}')" style="font-size:.7rem;padding:4px 10px;white-space:nowrap" id="cv-copy-btn-${link.token}">Copy</button>
        </div>
      </div>
      <div class="cv-saved-actions">
        <button class="btn btn-g" onclick="cvToggleSavedUrl('${link.token}')" style="font-size:.72rem;padding:4px 12px" id="cv-show-btn-${link.token}">Get Link</button>
        <button onclick="cvRemoveSavedLink('${link.token}')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:1rem;padding:4px;line-height:1" title="Remove">×</button>
      </div>
    </div>`;
  }

  h += '</div><div style="border-top:1px solid var(--border);margin-bottom:14px"></div>';
  el.innerHTML = h;
}

function cvToggleSavedUrl(token) {
  const urlRow = document.getElementById('cv-url-' + token);
  const showBtn = document.getElementById('cv-show-btn-' + token);
  if (!urlRow) return;
  const isVisible = urlRow.style.display !== 'none';
  urlRow.style.display = isVisible ? 'none' : 'flex';
  if (showBtn) showBtn.textContent = isVisible ? 'Get Link' : 'Hide';
  if (!isVisible) {
    // Auto-select the URL input
    const input = urlRow.querySelector('input');
    if (input) setTimeout(() => input.select(), 50);
  }
}

function cvCopySavedLink(token) {
  const urlRow = document.getElementById('cv-url-' + token);
  const btn = document.getElementById('cv-copy-btn-' + token);
  if (!urlRow) return;
  const input = urlRow.querySelector('input');
  if (!input) return;
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
  }).catch(() => { document.execCommand('copy'); });
}

async function cvRemoveSavedLink(token) {
  if (!confirm('Remove this cleaner link from the saved list? The link itself will still work if they have it bookmarked.')) return;
  cvSavedLinks = cvSavedLinks.filter(l => l.token !== token);
  try { await S.set('se_cv_index', JSON.stringify(cvSavedLinks)); } catch (e) {}
  cvRenderSavedLinks();
}

function cvToggleNewForm() {
  const form = document.getElementById('cv-new-form');
  const toggleBtn = document.getElementById('cv-new-toggle-btn');
  const cancelBtn = document.getElementById('cv-cancel-new-btn');
  if (!form) return;
  const isHidden = form.style.display === 'none';
  form.style.display = isHidden ? '' : 'none';
  if (toggleBtn) toggleBtn.textContent = isHidden ? '− Hide' : '＋ Create Link for a New Cleaner';
  if (cancelBtn) cancelBtn.style.display = isHidden ? '' : 'none';
}

function cvCheckGenerateBtn() {
  const name = (document.getElementById('cv-name')?.value || '').trim();
  const btn = document.getElementById('cv-generate-btn');
  if (btn) btn.disabled = !name || cvSelectedProps.size === 0;
}

function renderCvPropPicker() {
  const el = document.getElementById('cv-prop-picker');
  if (!el) return;
  let h = '';
  for (const nb of NBS) {
    const allSel = nb.props.every(p => cvSelectedProps.has(p));
    const someSel = !allSel && nb.props.some(p => cvSelectedProps.has(p));
    h += `<div style="margin-bottom:10px">`;
    h += `<div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:var(--text3);font-weight:700;margin-bottom:5px;display:flex;align-items:center;gap:6px">`;
    h += `<button class="cl-picker-btn${allSel ? ' active' : someSel ? ' partial' : ''}" style="font-size:.72rem;padding:3px 10px" onclick="cvToggleGroup('${nb.id}')">${nb.name}</button>`;
    h += `</div>`;
    h += `<div style="display:flex;flex-wrap:wrap;gap:4px">`;
    for (const pid of nb.props) {
      const p = getProp(pid);
      const sel = cvSelectedProps.has(pid);
      h += `<span class="cl-chip${sel ? ' selected' : ''}" onclick="cvToggleProp('${pid}')">${escHtml(clChipLabel(p))}</span>`;
    }
    h += `</div></div>`;
  }
  el.innerHTML = h;
  cvCheckGenerateBtn();
}

function cvToggleGroup(nbId) {
  const nb = NBS.find(n => n.id === nbId);
  if (!nb) return;
  const allIn = nb.props.every(p => cvSelectedProps.has(p));
  if (allIn) {
    nb.props.forEach(p => cvSelectedProps.delete(p));
  } else {
    nb.props.forEach(p => cvSelectedProps.add(p));
  }
  renderCvPropPicker();
}

function cvToggleProp(pid) {
  if (cvSelectedProps.has(pid)) cvSelectedProps.delete(pid);
  else cvSelectedProps.add(pid);
  renderCvPropPicker();
}

async function cvGenerateLink() {
  const name = (document.getElementById('cv-name').value || '').trim();
  if (!name) { alert('Please enter a name for this cleaner.'); return; }
  if (cvSelectedProps.size === 0) { alert('Please select at least one property.'); return; }

  const btn = document.getElementById('cv-generate-btn');
  if (btn) { btn.textContent = 'Generating...'; btn.disabled = true; }

  try {
    // Deterministic token based on name + sorted property list
    const props = [...cvSelectedProps].sort();
    const rawKey = name.toLowerCase().replace(/\s+/g, '') + ':' + props.join(',');
    let hash = 0;
    for (let i = 0; i < rawKey.length; i++) { hash = ((hash << 5) - hash) + rawKey.charCodeAt(i); hash |= 0; }
    const token = 'cv' + Math.abs(hash).toString(36) + Date.now().toString(36).slice(-4);

    // Save link data to KV
    const created = new Date().toISOString();
    const data = { name, properties: props, created };
    await S.set('se_cv_' + token, JSON.stringify(data));

    // Update saved index — replace existing entry for this name or add new
    cvSavedLinks = cvSavedLinks.filter(l => l.name.toLowerCase() !== name.toLowerCase());
    cvSavedLinks.unshift({ name, token, properties: props, created });
    await S.set('se_cv_index', JSON.stringify(cvSavedLinks));

    // Build shareable link
    const shareUrl = 'https://storybook-webhook.vercel.app/api/cleaner-page?token=' + token;

    // Show result inline in the form
    const resultEl = document.getElementById('cv-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div style="background:var(--green-light);border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin-top:12px">
        <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--green);font-weight:700;margin-bottom:6px">Link Generated</div>
        <div style="font-size:.76rem;color:var(--text2);margin-bottom:8px">Saved for <strong>${escHtml(name)}</strong> · ${props.length} propert${props.length !== 1 ? 'ies' : 'y'}. It'll appear at the top next time you open this modal.</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <input type="text" id="cv-link-input" value="${shareUrl}" readonly style="flex:1;padding:7px 10px;font-size:.78rem;border:1px solid var(--border);border-radius:6px;background:#fff;color:var(--text);font-family:inherit;min-width:200px" onclick="this.select()">
          <button class="btn btn-g" onclick="cvCopyLink()" style="font-size:.74rem;padding:5px 12px">Copy Link</button>
        </div>
        <div style="font-size:.68rem;color:var(--text3);margin-top:6px">This link never expires and can be bookmarked.</div>
      </div>`;

    // Refresh saved links panel to include the new entry
    cvRenderSavedLinks();
    // Keep form visible so user can copy the newly generated link
    const form = document.getElementById('cv-new-form');
    if (form) form.style.display = '';

  } catch (e) {
    console.error('[cleaner-view] Generate link error:', e.message);
    alert('Failed to generate link. Please try again.');
  }

  if (btn) { btn.textContent = 'Generate Link'; btn.disabled = cvSelectedProps.size === 0; }
}

function cvCopyLink() {
  const input = document.getElementById('cv-link-input');
  if (!input) return;
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = input.nextElementSibling;
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000); }
  }).catch(() => { document.execCommand('copy'); });
}

// ── REPLACEMENTS & PURCHASES (now powered by Tasks with category=replacement) ──
let rpData = []; // Legacy — kept for migration only
let rpPhaseFilter = 'needed'; // 'needed'|'purchased'|'delivered'|'all'

// ── Migration: convert old rpData items into tasks ──
async function loadReplacements() {
  try {
    const r = await S.get('se_purchases');
    if (r) rpData = JSON.parse(r.value);
  } catch (e) { rpData = []; }
  // SAFETY: only run migration if tasks loaded successfully (2026-04-11 fix)
  if (rpData.length && !tasksLoadedOk) {
    console.warn('[SAFETY] Skipping replacements migration — tasks did not load');
    return;
  }
  if (rpData.length) {
    let migrated = 0;
    for (const item of rpData) {
      // Check for duplicate (already migrated)
      if (tasks.find(t => t._migratedFromRp === item.id)) continue;
      const rv = item.review;
      const guest = rv?.guest || '';
      const t = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6) + migrated,
        _migratedFromRp: item.id,
        property: item.property || '',
        guest: guest,
        problem: item.item || 'Replacement item',
        category: 'replacement',
        status: item.status === 'purchased' ? 'complete' : 'open',
        date: '',
        vendor: '',
        urgent: false,
        recurring: false,
        purchaseNote: item.item || '',
        purchaseStatus: item.status === 'purchased' ? 'purchased' : 'needed',
        purchaser: 'owner',
        purchasedAt: item.purchasedAt || '',
        notes: [{
          text: `Migrated from old Replacements list.${rv?.feedback ? ' Guest feedback: ' + rv.feedback.slice(0,150) : ''}${rv?.resCode ? ' Res: ' + rv.resCode : ''}`,
          type: 'admin',
          time: item.created || new Date().toISOString()
        }],
        vendorNotes: '',
        created: item.created || new Date().toISOString(),
      };
      tasks.unshift(t);logTaskChange('created',t);
      migrated++;
    }
    if (migrated) {
      await saveTasks();
      // Clear legacy data after successful migration
      rpData = [];
      await save('se_purchases', []);
      showToast(`Migrated ${migrated} replacement items into tasks.`);
    }
  }
}

// ── Helpers: get replacement tasks from the main tasks array ──
function getReplacementTasks() {
  return tasks.filter(t => t.category === 'replacement' || (t.purchaseNote && t.purchaseStatus));
}

function rpSetPhase(phase) {
  rpPhaseFilter = phase;
  renderReplacements();
}

function populateRpPropFilter() {
  const sel = document.getElementById('rp-prop-filter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="all">All Properties</option>';
  const repTasks = getReplacementTasks();
  NBS.forEach(nb => {
    const og = document.createElement('optgroup');
    og.label = nb.name;
    nb.props.forEach(pid => {
      const p = getProp(pid); if (!p) return;
      const count = repTasks.filter(t => t.property === pid && (t.purchaseStatus === 'needed' || !t.purchaseStatus)).length;
      const o = document.createElement('option');
      o.value = pid;
      o.textContent = p.name + (count ? ` (${count})` : '');
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  sel.value = current || 'all';
}

// ── Open the new-task modal pre-filled for a replacement ──
function openNewReplacementTask() {
  openAddTask();
  // After modal opens, pre-set category to replacement
  setTimeout(() => {
    const catSel = document.getElementById('f-category');
    if (catSel) catSel.value = 'replacement';
  }, 50);
}

function renderReplacements() {
  const propFilter = document.getElementById('rp-prop-filter')?.value || 'all';
  const buyerFilter = document.getElementById('rp-purchaser-filter')?.value || 'all';
  const listEl = document.getElementById('rp-list');
  const purchasedEl = document.getElementById('rp-purchased');

  // Highlight active phase tab
  ['needed','purchased','delivered','all'].forEach(p => {
    const btn = document.getElementById('rp-tab-' + p);
    if (!btn) return;
    if (p === rpPhaseFilter) { btn.style.background = '#e65100'; btn.style.color = '#fff'; btn.style.borderColor = '#e65100'; }
    else { btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = ''; }
  });

  // Get all replacement-type tasks
  let repTasks = getReplacementTasks();

  // Apply property filter
  if (propFilter !== 'all') repTasks = repTasks.filter(t => t.property === propFilter);
  // Apply buyer filter
  if (buyerFilter !== 'all') repTasks = repTasks.filter(t => (t.purchaser || 'owner') === buyerFilter);

  // Apply phase filter
  let filtered;
  if (rpPhaseFilter === 'all') {
    filtered = repTasks;
  } else if (rpPhaseFilter === 'needed') {
    filtered = repTasks.filter(t => !t.purchaseStatus || t.purchaseStatus === 'needed');
  } else if (rpPhaseFilter === 'purchased') {
    filtered = repTasks.filter(t => t.purchaseStatus === 'purchased');
  } else {
    filtered = repTasks.filter(t => t.purchaseStatus === 'delivered' || isDone(t));
  }

  // Count badges on tabs
  const cNeeded = repTasks.filter(t => !t.purchaseStatus || t.purchaseStatus === 'needed').length;
  const cPurchased = repTasks.filter(t => t.purchaseStatus === 'purchased').length;
  const cDelivered = repTasks.filter(t => t.purchaseStatus === 'delivered' || isDone(t)).length;
  const tabN = document.getElementById('rp-tab-needed');
  const tabP = document.getElementById('rp-tab-purchased');
  const tabD = document.getElementById('rp-tab-delivered');
  if (tabN) tabN.textContent = `Needs Buying (${cNeeded})`;
  if (tabP) tabP.textContent = `Purchased \u2014 Deliver (${cPurchased})`;
  if (tabD) tabD.textContent = `Delivered (${cDelivered})`;

  if (!filtered.length) {
    const emptyMsg = {
      needed: 'No items need buying. Create a replacement task or they\'ll auto-import from guest reviews.',
      purchased: 'No items waiting for delivery.',
      delivered: 'No delivered items yet.',
      all: 'No replacement tasks. Use "+ New Replacement" to create one.'
    };
    listEl.innerHTML = `<div class="rp-empty">${emptyMsg[rpPhaseFilter]}</div>`;
    purchasedEl.innerHTML = '';
    populateRpPropFilter();
    return;
  }

  // Sort: urgent first, then by created date (newest first)
  filtered.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(b.created) - new Date(a.created);
  });

  // Group by property
  const grouped = {};
  filtered.forEach(t => {
    if (!grouped[t.property]) grouped[t.property] = [];
    grouped[t.property].push(t);
  });

  let h = '';
  for (const [pid, items] of Object.entries(grouped)) {
    const p = getProp(pid);
    const nb = getNb(pid);
    const propName = p ? p.name : pid;
    const propColor = nb ? `var(--${nb.cls})` : 'var(--gold)';
    h += `<div style="margin-bottom:20px">
      <div style="font-weight:700;font-size:.82rem;color:${propColor};margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">${escHtml(propName)} <span style="font-weight:400;font-size:.72rem;color:var(--text2);text-transform:none;letter-spacing:0">(${items.length})</span></div>`;
    items.forEach(t => {
      const ps = t.purchaseStatus || 'needed';
      const statusColor = ps === 'needed' ? '#e65100' : ps === 'purchased' ? '#1565c0' : 'var(--green)';
      const statusLabel = ps === 'needed' ? 'Buy' : ps === 'purchased' ? 'Deliver' : 'Done';
      const buyerLabel = t.purchaser === 'vendor' ? 'Vendor buys' : 'You buy';
      const vendorLine = t.vendor ? `<span class="tmi">${t.vendor}</span>` : '';
      const dateLine = t.date ? `<span class="tmi">${fmtDate(t.date)}</span>` : '';
      h += `<div class="rp-card" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:10px 12px" onclick="openDetail('${t.id}')">
        <div style="flex-shrink:0;width:52px;text-align:center">
          <div style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${statusColor};border:1.5px solid ${statusColor};border-radius:var(--radius);padding:3px 6px">${statusLabel}</div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:.88rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(t.purchaseNote || t.problem)}</div>
          <div style="font-size:.72rem;color:var(--text2);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="color:${statusColor};font-weight:600">${buyerLabel}</span>
            ${vendorLine}${dateLine}
            ${t.urgent?'<span style="color:var(--red);font-weight:700">URGENT</span>':''}
            ${t.guest?`<span>From ${t.guest.split(' ')[0]}</span>`:''}
          </div>
        </div>
        ${ps==='needed'?`<button class="btn rp-btn-done" onclick="event.stopPropagation();rpQuickPurchased('${t.id}')" title="Mark as purchased" style="flex-shrink:0">&#10003;</button>`:''}
        ${ps==='purchased'?`<button class="btn rp-btn-done" onclick="event.stopPropagation();rpQuickDelivered('${t.id}')" title="Mark as delivered" style="flex-shrink:0;background:var(--green);color:#fff;border-color:var(--green)">&#10003;</button>`:''}
      </div>`;
    });
    h += '</div>';
  }
  listEl.innerHTML = h;
  purchasedEl.innerHTML = '';
  populateRpPropFilter();
}

// Quick-action buttons on the Replacements tab cards
async function rpQuickPurchased(id) {
  const t = tasks.find(x => x.id === id); if (!t) return;
  t.purchaseStatus = 'purchased';
  t.purchasedAt = new Date().toISOString();
  await saveTasks(); renderReplacements(); renderAll();
  showToast('Marked as purchased \u2014 ready for delivery.');
}
async function rpQuickDelivered(id) {
  const t = tasks.find(x => x.id === id); if (!t) return;
  t.purchaseStatus = 'delivered';
  t.status = 'complete';logTaskChange('completed',t);
  await saveTasks(); renderReplacements(); renderAll();
  showToast('Delivered \u2014 task complete.');
}

// ── Vendor Day Sheet Logic ──────────────────────────────
(function(){
  if(!window._vendorMode)return;
  const VAPI=PROXY_BASE+'/api/vendor';
  const token=window._vendorToken;
  let vTasks=[];
  let vVendor='';
  let vDate='';
  let vPayMethods=['venmo','cashapp']; // vendor's allowed payment methods
  let vGuestAlerts={}; // {propId: [{type:'checkin'|'checkout', guest, time}]}
  const MAX_PHOTOS_PER_TASK=10;

  // Client-side image compression — resize to 1600px max, 82% JPEG quality
  function vsCompressImage(file){
    return new Promise((resolve,reject)=>{
      const img=new Image();const url=URL.createObjectURL(file);
      img.onload=()=>{
        URL.revokeObjectURL(url);
        let w=img.width,h=img.height;
        if(w>1600||h>1600){const r=Math.min(1600/w,1600/h);w=Math.round(w*r);h=Math.round(h*r);}
        const c=document.createElement('canvas');c.width=w;c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        c.toBlob(blob=>{if(!blob){reject(new Error('Compression failed'));return;}resolve(blob);},'image/jpeg',0.82);
      };
      img.onerror=()=>reject(new Error('Could not load image'));
      img.src=url;
    });
  }

  // Set default logo initially (will be overridden by KV logo from API if available)
  try{document.getElementById('vs-logo').src=DEFAULT_LOGO;}catch(e){}

  let vIsAgenda=false; // true when showing multi-day schedule
  let vByDate={}; // grouped tasks by date (agenda mode)
  let vSheetFields=[]; // custom fields from settings
  let vProjects=[]; // active projects this vendor is assigned to (agenda mode)
  let vNeedsSched=[]; // undated tasks assigned to this vendor (agenda mode)
  let vIcalByProp={}; // per-property cached reservations for the scheduling calendar

  async function vsLoad(){
    try{
      const r=await fetch(VAPI+'?token='+encodeURIComponent(token));
      if(!r.ok){vsShowError();return;}
      const data=await r.json();
      vTasks=data.tasks||[];
      vVendor=data.vendor||'';
      vDate=data.date||'';
      vGuestAlerts=data.guestAlerts||{};
      vPayMethods=data.paymentMethods||['venmo','cashapp'];
      vSheetFields=data.sheetFields||['address','doorCode'];
      vIsAgenda=(data.type==='agenda');
      vByDate=data.byDate||{};
      vProjects=data.projects||[];
      vNeedsSched=data.needsScheduling||[];
      // Apply logo from API (KV-stored custom logo) if available
      if(data.logo){try{document.getElementById('vs-logo').src=data.logo;}catch(e){}}
      if(vIsAgenda){
        document.getElementById('vs-subtitle').textContent=
          vVendor+' — Upcoming Schedule';
      }else{
        document.getElementById('vs-subtitle').textContent=
          vVendor+' — Jobs for '+new Date(vDate+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      }
      document.getElementById('vs-loading').style.display='none';
      document.getElementById('vs-tasks').style.display='block';
      if(vIsAgenda) vsRenderAgenda(); else vsRender();
      // Render embedded projects (agenda mode only)
      if(vIsAgenda&&vProjects.length) vsRenderProjects();
      // Auto-expand the first task after a short delay to teach vendors that cards are tappable
      if(vTasks.length){
        setTimeout(()=>{
          const first=document.querySelector('.vs-card');
          if(first)first.classList.add('vs-expanded');
        },400);
      }
      // Prefetch bookings for every property with an undated task so the
      // Good Days strip can render instantly inside the calendar modal when
      // the vendor taps Pick-a-date. Runs async after the agenda paints.
      if(vIsAgenda&&vNeedsSched&&vNeedsSched.length){
        (async()=>{
          try{
            vBookingsByProp=await vsPrefetchNeedsBookings();
            // If a picker is already open (e.g. vendor tapped before prefetch
            // completed), re-render so the strip appears.
            if(vDpState&&vDpState.taskId)vsRenderPicker();
          }catch(e){console.warn('[vs-best-days]',e);}
        })();
      }
    }catch(e){
      console.error('[vendor-sheet]',e);
      vsShowError();
    }
  }

  function vsShowError(){
    document.getElementById('vs-loading').style.display='none';
    document.getElementById('vs-error').style.display='block';
  }

  function vsRender(){
    const wrap=document.getElementById('vs-tasks');
    if(!vTasks.length){wrap.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2)">No tasks assigned for today.</div>';return;}
    // Group by neighborhood, then property (tasks come pre-sorted from API)
    let html='';
    let lastNb='';
    let lastProp='';
    let lastPropId='';
    let lastPropShort='';
    let propGroupOpen=false;
    vTasks.forEach(t=>{
      const nb=t.neighborhood||'Other';
      const nbCls=t.neighborhoodCls||'';
      if(nb!==lastNb){
        if(propGroupOpen){html+='</div>';propGroupOpen=false;}
        html+=`<div class="vs-nb-header" style="color:var(--${nbCls||'green'})">${nb}</div>`;
        lastNb=nb;lastProp='';
      }
      if(t.propertyName!==lastProp){
        if(propGroupOpen){html+=vsReportBtn(lastPropId,lastPropShort);html+='</div>';}
        const shortName=t.propertyName.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
        // Guest alerts — compact inline pills
        const propAlerts=vGuestAlerts[t.property]||[];
        let alertHtml='';
        if(propAlerts.length){
          alertHtml='<div class="vs-alert-row">'+propAlerts.map(a=>{
            const icon=a.type==='checkout'?'&#x1F6AA;':a.type==='inhouse'?'&#x1F6A8;':'&#x1F3E0;';
            const label=a.type==='checkout'
              ?`Guests checking out this morning`
              :a.type==='inhouse'
              ?`Guests in house — announce yourself`
              :`Guests checking in this afternoon`;
            return `<div class="vs-guest-alert vs-guest-alert-${a.type}">${icon} ${label}</div>`;
          }).join('')+'</div>';
        }
        // Build property meta from settings-driven fields
        let metaParts=[];
        if(t.address)metaParts.push('<a href="https://maps.google.com/?q='+encodeURIComponent(t.address)+'" target="_blank">'+t.address+'</a>');
        if(t.doorCode)metaParts.push('Code: '+t.doorCode);
        if(t.wifiName)metaParts.push('WiFi: '+t.wifiName);
        if(t.wifiPassword)metaParts.push('WiFi Pass: '+t.wifiPassword);
        if(t.checkoutTime)metaParts.push('Checkout: '+t.checkoutTime);
        if(t.checkinTime)metaParts.push('Check-in: '+t.checkinTime);
        if(t.parking)metaParts.push('Parking: '+t.parking);
        if(t.lockbox)metaParts.push('Lockbox: '+t.lockbox);
        if(t.trashDay)metaParts.push('Trash: '+t.trashDay);
        if(t.specialNotes)metaParts.push(t.specialNotes);
        html+=`<div class="vs-prop-header" style="border-left-color:var(--${nbCls||'green'})">
          <div class="vs-prop-name">${shortName}</div>
          <div class="vs-prop-meta">${metaParts.join(' &middot; ')}</div>
          ${alertHtml}
        </div>`;
        html+='<div class="vs-prop-group">';
        propGroupOpen=true;
        lastProp=t.propertyName;
        lastPropId=t.property;
        lastPropShort=shortName;
      }
      html+=vsCard(t);
    });
    if(propGroupOpen){html+=vsReportBtn(lastPropId,lastPropShort);html+='</div>';}
    wrap.innerHTML=html;
  }

  // ── Needs-Your-Schedule Render: undated tasks the vendor picks dates for ──
  // Renders the full vsCard for each task (photos, notes, purchase, filter,
  // upload, etc.) so vendors see the same context they'd see on a dated task.
  // "Pick a date" lives inside the expanded card detail (see vsCard).
  // Shared property header renderer — same fields whether the task is
  // scheduled or waiting on the vendor's schedule. Fields come from
  // sanitizeWithFields (vendor.js) which applies uniformly to both buckets.
  function vsPropMetaParts(t){
    const parts=[];
    if(t.address)parts.push('<a href="https://maps.google.com/?q='+encodeURIComponent(t.address)+'" target="_blank">'+t.address+'</a>');
    if(t.doorCode)parts.push('Code: '+t.doorCode);
    if(t.wifiName)parts.push('WiFi: '+t.wifiName);
    if(t.wifiPassword)parts.push('WiFi Pass: '+t.wifiPassword);
    if(t.checkoutTime)parts.push('Checkout: '+t.checkoutTime);
    if(t.checkinTime)parts.push('Check-in: '+t.checkinTime);
    if(t.parking)parts.push('Parking: '+t.parking);
    if(t.lockbox)parts.push('Lockbox: '+t.lockbox);
    if(t.trashDay)parts.push('Trash: '+t.trashDay);
    if(t.specialNotes)parts.push(t.specialNotes);
    return parts;
  }
  function vsPropHeaderHtml(t,shortName,nbCls,alertHtml){
    const metaParts=vsPropMetaParts(t);
    return`<div class="vs-prop-header" style="border-left-color:var(--${nbCls||'green'})">
      <div class="vs-prop-name">${shortName}</div>
      ${metaParts.length?`<div class="vs-prop-meta">${metaParts.join(' &middot; ')}</div>`:''}
      ${alertHtml||''}
    </div>`;
  }

  function vsRenderNeedsSchedHtml(){
    if(!vNeedsSched||!vNeedsSched.length)return'';
    let html=`<div class="vs-needs-sched">
      <div class="vs-needs-hdr">
        <span class="vs-needs-title">Needs Your Schedule</span>
        <span class="vs-needs-count">${vNeedsSched.length}</span>
      </div>
      <div class="vs-needs-help">Tap a task to see details, then pick a date that works for you.</div>`;
    // Bucket neighborhood → property, preserving pre-sorted order
    const nbGroups=[];const nbSeen={};
    vNeedsSched.forEach(t=>{
      const nb=t.neighborhood||'Other';
      const nbCls=t.neighborhoodCls||'green';
      if(!nbSeen[nb]){
        nbSeen[nb]={nb,nbCls,propSeen:{},props:[]};
        nbGroups.push(nbSeen[nb]);
      }
      const g=nbSeen[nb];
      if(!g.propSeen[t.propertyName]){
        g.propSeen[t.propertyName]={propertyName:t.propertyName,items:[]};
        g.props.push(g.propSeen[t.propertyName]);
      }
      g.propSeen[t.propertyName].items.push(t);
    });
    nbGroups.forEach(ng=>{
      html+=`<div class="vs-needs-nb" style="color:var(--${ng.nbCls})">${ng.nb}</div>`;
      ng.props.forEach(p=>{
        const shortName=p.propertyName.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
        // First task carries the property meta fields (address/codes/WiFi etc.)
        // — same sanitizeWithFields is applied to needs-sched tasks in vendor.js.
        const first=p.items[0]||{};
        html+=vsPropHeaderHtml(first,shortName,ng.nbCls,'');
        html+=`<div class="vs-needs-prop-group">`;
        p.items.forEach(t=>{
          html+=vsCard(t);
        });
        html+=`</div>`; // vs-needs-prop-group
      });
    });
    html+=`</div>`; // vs-needs-sched
    return html;
  }

  // ── Good Days strip: compute per-day tier across every property with an undated task ──
  // tier='locked'   → that day is checkout/checkin/turn at that property (ideal — empty 10–4)
  // tier='open'     → no booking at that property that day (workable but could get booked later)
  // tier='booked'   → guest in house that day (not schedulable by vendor)
  async function vsPrefetchNeedsBookings(){
    if(!vNeedsSched||!vNeedsSched.length)return {};
    const props=[...new Set(vNeedsSched.map(t=>t.property))];
    const out={};
    await Promise.all(props.map(async pid=>{
      out[pid]=await vsFetchBookings(pid);
    }));
    return out;
  }

  function vsComputeBestDays(bookingsByProp){
    const today=new Date();today.setHours(12,0,0,0);
    // Unique properties that have undated tasks in this agenda
    const propIds=[...new Set(vNeedsSched.map(t=>t.property))];
    const propMeta={};
    vNeedsSched.forEach(t=>{
      if(!propMeta[t.property]){
        propMeta[t.property]={
          id:t.property,
          name:(t.propertyName||'').replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,''),
          neighborhoodCls:t.neighborhoodCls||'green',
        };
      }
    });
    const days=[];
    for(let i=0;i<21;i++){
      const d=new Date(today.getTime()+i*86400000);d.setHours(12,0,0,0);
      const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      // For every property with needs-sched tasks, classify the day
      const perProp=propIds.map(pid=>{
        const st=vsDayState(d,bookingsByProp[pid]||[]);
        let tier;
        if(st==='turn'||st==='checkin'||st==='checkout')tier='locked';
        else if(st==='booked')tier='booked';
        else tier='open';
        return{pid,tier,state:st,meta:propMeta[pid]};
      });
      const lockedCount=perProp.filter(p=>p.tier==='locked').length;
      const bookedCount=perProp.filter(p=>p.tier==='booked').length;
      const openCount=perProp.filter(p=>p.tier==='open').length;
      // Overall day tier
      let overall;
      if(bookedCount===perProp.length)overall='skip'; // guest-in-house everywhere — useless
      else if(lockedCount===perProp.length)overall='locked'; // ideal across the board
      else if(lockedCount>0&&bookedCount===0)overall='partial-locked'; // some ideal, rest open
      else if(lockedCount>0)overall='partial-mixed'; // some ideal, some blocked
      else if(openCount===perProp.length)overall='open'; // all workable but none ideal
      else overall='partial-open'; // some open, some blocked
      days.push({ds,d,perProp,lockedCount,bookedCount,openCount,overall});
    }
    return{days,propIds,propMeta};
  }

  // Returns the Good Days strip HTML for embedding inside the calendar modal.
  // Returns '' when there's <2 properties with needs-sched tasks or no data.
  function vsRenderBestDaysHtml(){
    if(!vNeedsSched||!vNeedsSched.length)return'';
    const uniqueProps=[...new Set(vNeedsSched.map(t=>t.property))];
    if(uniqueProps.length<2)return'';
    const computed=vsComputeBestDays(vBookingsByProp||{});
    const {days}=computed;
    const rank=d=>{
      if(d.overall==='skip')return-1;
      return d.lockedCount*3 + d.openCount*1 - d.bookedCount*2;
    };
    const candidates=days.filter(d=>d.overall!=='skip').sort((a,b)=>{
      const r=rank(b)-rank(a);
      if(r!==0)return r;
      return a.d-b.d;
    }).slice(0,8).sort((a,b)=>a.d-b.d);
    if(!candidates.length){
      return`<div class="vs-bd-empty">No common workable days found in the next 21 days — guests are in house at every property. Admin will coordinate.</div>`;
    }
    const fmt=d=>d.toLocaleDateString('en-US',{weekday:'short',month:'numeric',day:'numeric'});
    let h=`<div class="vs-best-days">
      <div class="vs-bd-hdr">Good days for ${uniqueProps.length} properties</div>
      <div class="vs-bd-help">Turn, checkout, and check-in days are ideal — properties are empty from 10am to 4pm.</div>
      <div class="vs-bd-strip">`;
    candidates.forEach(day=>{
      let chipCls='vs-bd-chip';
      let tierLabel='';
      if(day.overall==='locked'){chipCls+=' vs-bd-locked';tierLabel='All ideal';}
      else if(day.overall==='partial-locked'){chipCls+=' vs-bd-partial-locked';tierLabel=`${day.lockedCount} ideal • ${day.openCount} open`;}
      else if(day.overall==='partial-mixed'){chipCls+=' vs-bd-partial-mixed';tierLabel=`${day.lockedCount} ideal • ${day.bookedCount} blocked`;}
      else if(day.overall==='open'){chipCls+=' vs-bd-open';tierLabel='All open';}
      else{chipCls+=' vs-bd-partial-mixed';tierLabel=`${day.openCount} open • ${day.bookedCount} blocked`;}
      let dots='';
      day.perProp.forEach(p=>{
        const nbCls=p.meta.neighborhoodCls||'green';
        let dotCls='vs-bd-dot';
        if(p.tier==='locked')dotCls+=' vs-bd-dot-locked';
        else if(p.tier==='booked')dotCls+=' vs-bd-dot-booked';
        else dotCls+=' vs-bd-dot-open';
        const stLabel=p.state==='turn'?'Turn':p.state==='checkin'?'Check-in':p.state==='checkout'?'Checkout':p.state==='booked'?'Guest in house':'Open';
        dots+=`<span class="${dotCls}" style="--nb:var(--${nbCls})" title="${p.meta.name} — ${stLabel}"></span>`;
      });
      // Only chips that have at least one IDEAL property (turn/checkin/checkout)
      // are clickable for bulk assign. Pure-open chips can't be bulk-picked;
      // vendor has to manually pick since those days aren't guaranteed empty.
      const clickable=day.lockedCount>=1;
      const click=clickable?` onclick="window._vsPickBulk('${day.ds}')"`:'';
      if(clickable)chipCls+=' vs-bd-clickable';
      h+=`<div class="${chipCls}"${click}>
        <div class="vs-bd-date">${fmt(day.d)}</div>
        <div class="vs-bd-tier">${tierLabel}</div>
        <div class="vs-bd-dots">${dots}</div>
      </div>`;
    });
    h+=`</div></div>`;
    return h;
  }

  // Bulk-pick: vendor tapped a Good Days chip. Collect every undated task
  // whose property is IDEAL on that date (turn/checkin/checkout = locked tier),
  // show a confirmation overlay, then fire one batch call on confirm.
  window._vsPickBulk=function(ds){
    if(!vNeedsSched||!vNeedsSched.length)return;
    // Recompute so we pick the same ideal set that rendered the chip
    const computed=vsComputeBestDays(vBookingsByProp||{});
    const day=computed.days.find(d=>d.ds===ds);
    if(!day)return;
    // Tasks whose property is IDEAL on this date
    const idealPropIds=new Set(day.perProp.filter(p=>p.tier==='locked').map(p=>p.pid));
    const idealTasks=vNeedsSched.filter(t=>idealPropIds.has(t.property));
    if(!idealTasks.length)return;
    // Tasks skipped because their property isn't ideal on this date
    const skippedTasks=vNeedsSched.filter(t=>!idealPropIds.has(t.property));
    const dateLabel=new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
    // Render confirmation overlay in the modal panel (replaces panel contents)
    const modal=document.getElementById('vs-dp-modal');
    if(!modal)return;
    let taskRows='';
    idealTasks.forEach(t=>{
      const shortName=(t.propertyName||'').replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
      const nbCls=t.neighborhoodCls||'green';
      taskRows+=`<div class="vs-bulk-row">
        <div class="vs-bulk-row-prop" style="color:var(--${nbCls})">${shortName}</div>
        <div class="vs-bulk-row-prob">${t.problem}</div>
      </div>`;
    });
    let skipHtml='';
    if(skippedTasks.length){
      const skipNames=[...new Set(skippedTasks.map(t=>(t.propertyName||'').replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'')))];
      skipHtml=`<div class="vs-bulk-skip">
        <strong>Not scheduled today:</strong> ${skipNames.join(', ')}.
        These aren't guaranteed empty on ${dateLabel} — pick a day for each one on the calendar below.
      </div>`;
    }
    const idealIds=JSON.stringify(idealTasks.map(t=>t.id)).replace(/"/g,'&quot;');
    const h=`<div class="vs-dp-panel" onclick="event.stopPropagation()">
      <div class="vs-dp-header">
        <div>
          <div class="vs-dp-title">Confirm schedule</div>
          <div class="vs-dp-sub">${dateLabel}</div>
        </div>
        <button class="vs-dp-close" onclick="window._vsClosePicker()">&times;</button>
      </div>
      <div class="vs-bulk-confirm">
        <div class="vs-bulk-lead">Schedule ${idealTasks.length} task${idealTasks.length!==1?'s':''} on <strong>${dateLabel}</strong>? These properties are empty from 10am to 4pm that day.</div>
        <div class="vs-bulk-list">${taskRows}</div>
        ${skipHtml}
      </div>
      <div class="vs-dp-footer">
        <div class="vs-dp-footer-btns" style="width:100%;justify-content:space-between">
          <button class="btn" onclick="window._vsCancelBulk()">Back to calendar</button>
          <button class="btn btn-g" onclick='window._vsConfirmBulk(&quot;${ds}&quot;,${idealIds})'>Schedule ${idealTasks.length}</button>
        </div>
      </div>
    </div>`;
    modal.innerHTML=h;
  };

  window._vsCancelBulk=function(){
    vsRenderPicker(); // re-render the normal calendar view
  };

  window._vsConfirmBulk=async function(ds,taskIds){
    const footerBtns=document.querySelector('.vs-dp-footer-btns');
    if(footerBtns){footerBtns.querySelectorAll('button').forEach(b=>{b.disabled=true;b.style.opacity='.5';});}
    try{
      const r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action:'selfScheduleMany',taskIds,date:ds})});
      if(!r.ok){
        const err=await r.json().catch(()=>({error:'Unknown error'}));
        alert('Could not save: '+(err.error||'Please try again.'));
        if(footerBtns){footerBtns.querySelectorAll('button').forEach(b=>{b.disabled=false;b.style.opacity='';});}
        return;
      }
      // Keep the modal open — show the success panel with addresses, codes,
      // WiFi etc. (the same info an admin would text). Vendor dismisses when
      // ready; dismiss triggers refresh + scroll to that day in the agenda.
      vsRenderScheduledSuccess(taskIds,ds);
    }catch(e){
      alert('Network error. Please try again.');
      if(footerBtns){footerBtns.querySelectorAll('button').forEach(b=>{b.disabled=false;b.style.opacity='';});}
    }
  };

  // ── Post-schedule success panel — rendered inside the picker modal after
  // either single or batch self-schedule. Shows the same info admin would text:
  // date, property address (tap-to-Maps), door code, WiFi, plus each task.
  // Source: vNeedsSched snapshot (pre-refresh) since those tasks already carry
  // full prop fields via sanitizeWithFields in vendor.js.
  function vsRenderScheduledSuccess(scheduledIds,ds){
    const modal=document.getElementById('vs-dp-modal');
    if(!modal)return;
    const idSet=new Set(scheduledIds);
    const tasks=(vNeedsSched||[]).filter(t=>idSet.has(t.id));
    const dateLabel=new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
    // Group by property, preserving first-seen order
    const propBuckets={};const propOrder=[];
    tasks.forEach(t=>{
      if(!propBuckets[t.propertyName]){
        propBuckets[t.propertyName]={first:t,items:[]};
        propOrder.push(t.propertyName);
      }
      propBuckets[t.propertyName].items.push(t);
    });
    let body='';
    propOrder.forEach(pn=>{
      const b=propBuckets[pn];
      const shortName=pn.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
      const nbCls=b.first.neighborhoodCls||'green';
      body+=vsPropHeaderHtml(b.first,shortName,nbCls,'');
      body+='<div class="vs-success-tasks">';
      b.items.forEach(t=>{
        body+=`<div class="vs-success-task">
          ${t.urgent?'<span class="vs-urgent" style="margin-right:6px">Urgent</span>':''}
          ${t.problem.replace(/</g,'&lt;')}
        </div>`;
      });
      body+='</div>';
    });
    const multi=tasks.length>1;
    const h=`<div class="vs-dp-panel" onclick="event.stopPropagation()">
      <div class="vs-dp-header">
        <div>
          <div class="vs-dp-title"><span style="color:var(--green)">&#x2713;</span> Scheduled</div>
          <div class="vs-dp-sub">${dateLabel}</div>
        </div>
        <button class="vs-dp-close" onclick="window._vsCloseAndScroll('${ds}')">&times;</button>
      </div>
      <div class="vs-success-body">
        <div class="vs-success-lead">You're set for <strong>${dateLabel}</strong>. Here's what you'll need at ${multi?'each property':'the property'}:</div>
        ${body}
      </div>
      <div class="vs-dp-footer">
        <div class="vs-dp-footer-btns" style="width:100%;justify-content:flex-end">
          <button class="btn btn-g" onclick="window._vsCloseAndScroll('${ds}')">Got it &mdash; view my schedule</button>
        </div>
      </div>
    </div>`;
    modal.innerHTML=h;
  }

  window._vsCloseAndScroll=async function(ds){
    vsClosePicker();
    await vsLoad();
    // After agenda re-renders, scroll to the day header for that date
    requestAnimationFrame(()=>{
      const hdr=document.getElementById('vs-day-'+ds);
      if(hdr)hdr.scrollIntoView({behavior:'smooth',block:'start'});
    });
  };

  // Cache of bookings across all properties with undated tasks; populated during vsLoad
  let vBookingsByProp={};

  // ── Agenda Render: multi-day schedule grouped by date ──
  function vsRenderAgenda(){
    const wrap=document.getElementById('vs-tasks');
    // If nothing to show (no dated tasks AND nothing needs scheduling), empty state.
    if(!vTasks.length&&(!vNeedsSched||!vNeedsSched.length)){
      wrap.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2)">No upcoming tasks scheduled.</div>';
      return;
    }
    const dates=Object.keys(vByDate).sort();
    let html=vsRenderNeedsSchedHtml();
    dates.forEach(dateStr=>{
      const dayTasks=vByDate[dateStr]||[];
      if(!dayTasks.length)return;
      const d=new Date(dateStr+'T12:00:00');
      const dayLabel=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      html+=`<div id="vs-day-${dateStr}" style="margin-top:16px;margin-bottom:6px;padding:8px 12px;background:var(--green);color:#fff;border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;scroll-margin-top:12px">${dayLabel} <span style="font-size:.78rem;opacity:.8;font-family:'DM Sans',sans-serif;font-weight:400">(${dayTasks.length} task${dayTasks.length!==1?'s':''})</span></div>`;
      // Group by neighborhood, then property within each day
      let lastNb='';
      let lastProp='';
      dayTasks.forEach(t=>{
        const nb=t.neighborhood||'Other';
        const nbCls=t.neighborhoodCls||'';
        if(nb!==lastNb){
          html+=`<div class="vs-nb-header" style="color:var(--${nbCls||'green'})">${nb}</div>`;
          lastNb=nb;lastProp='';
        }
        if(t.propertyName!==lastProp){
          const shortName=t.propertyName.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
          // Guest alerts for this property on this date
          const dayAlerts=(vGuestAlerts[dateStr]||{})[t.property]||[];
          let alertHtml='';
          if(dayAlerts.length){
            alertHtml='<div class="vs-alert-row">'+dayAlerts.map(a=>{
              const icon=a.type==='checkout'?'&#x1F6AA;':a.type==='inhouse'?'&#x1F6A8;':'&#x1F3E0;';
              const label=a.type==='checkout'
                ?'Guests checking out this morning'
                :a.type==='inhouse'
                ?'Guests in house — announce yourself'
                :'Guests checking in this afternoon';
              return `<div class="vs-guest-alert vs-guest-alert-${a.type}">${icon} ${label}</div>`;
            }).join('')+'</div>';
          }
          html+=vsPropHeaderHtml(t,shortName,nbCls,alertHtml);
          lastProp=t.propertyName;
        }
        html+=vsCard(t);
      });
    });
    wrap.innerHTML=html;
  }

  // ── EMBEDDED PROJECTS (rendered below agenda tasks) ─────────────────────────
  function vsRenderProjects(){
    const wrap=document.getElementById('vs-tasks');
    if(!vProjects.length)return;
    let html='<div style="margin-top:28px">';
    vProjects.forEach(proj=>{
      const {project_id,title,source,items,total,done,has_pdf}=proj;
      const failCount=items.filter(i=>i.status==='fail').length;
      const pct=total?Math.round(done/total*100):0;
      const circ=2*Math.PI*26;
      const off=circ-(pct/100)*circ;
      // ── Project header ──
      html+=`<div style="margin-bottom:6px;padding:10px 14px;background:linear-gradient(135deg,#1a3a25,#0f2a1a);color:#fff;border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600">&#x1F4CB; ${title}</div>`;
      // ── Source document card ──
      if(source){
        const cParts=[];
        if(source.inspector_phone)cParts.push(source.inspector_phone);
        if(source.inspector_email)cParts.push(source.inspector_email);
        let dateBxs='';
        if(source.inspection_date)dateBxs+=`<div class="pvs-date-box"><div class="pvs-date-lbl">Inspection</div><div class="pvs-date-val">${source.inspection_date}</div></div>`;
        if(source.reinspection_date)dateBxs+=`<div class="pvs-date-box pvs-date-urgent"><div class="pvs-date-lbl">Re-Inspection</div><div class="pvs-date-val">${source.reinspection_date}</div></div>`;
        if(source.next_annual)dateBxs+=`<div class="pvs-date-box"><div class="pvs-date-lbl">Next Annual</div><div class="pvs-date-val">${source.next_annual}</div></div>`;
        html+=`<div class="pvs-source-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div class="pvs-source-label" style="margin-bottom:0">Source Document</div>
            ${has_pdf?`<button class="pvs-report-btn" onclick="vsProjectPdf('${project_id}')">&#128196; View Full Report</button>`:''}
          </div>
          <div class="pvs-source-body">
            <div class="pvs-source-person">
              ${source.inspector?`<div class="pvs-source-name">${source.inspector}</div>`:''}
              ${cParts.length?`<div class="pvs-source-contact">${cParts.join(' &middot; ')}</div>`:''}
              ${source.address?`<div class="pvs-source-address">&#128205; ${source.address}</div>`:''}
            </div>
            ${dateBxs?`<div class="pvs-date-row">${dateBxs}</div>`:''}
          </div>
        </div>`;
      }
      // ── Progress ring ──
      html+=`<div class="pvs-ring-wrap">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#c8e6c9" stroke-width="5"/>
          <circle cx="32" cy="32" r="26" fill="none" stroke="#2d6a3f" stroke-width="5"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 32 32)" style="transition:stroke-dashoffset .5s"/>
          <text x="32" y="36" text-anchor="middle" fill="#2d6a3f" font-size="14" font-weight="700">${pct}%</text>
        </svg>
        <div>
          <div class="pvs-ring-label">${done} of ${total} tasks complete</div>
          <div class="pvs-ring-sub">${failCount} fail items &middot; ${items.length} total items</div>
          ${pct===100?'<div class="pvs-all-done">&#127881; All items complete!</div>':''}
        </div>
      </div>`;
      // ── Item rows ──
      const sorted=[...items].sort((a,b)=>{
        if(a.status==='fail'&&b.status!=='fail')return -1;
        if(a.status!=='fail'&&b.status==='fail')return 1;return 0;
      });
      html+=`<div class="pvs-items-panel"><div class="pvs-items-hdr"><span>Items (${items.length})</span><span>${failCount} fail &middot; ${items.length-failCount} pass</span></div>`;
      sorted.forEach(item=>{
        const isComplete=item.task_status==='complete'||item.task_status==='resolved_by_guest';
        const hasTask=!!item.task_id;
        const remarkText=item.remark||item.name;
        let checkHtml='';
        if(item.status==='fail'&&hasTask){
          checkHtml=isComplete
            ?`<div class="pvs-check pvs-checked" onclick="vsProjectToggle('${project_id}','${item.item_id}',true)" title="Tap to undo">&#x2713;</div>`
            :`<div class="pvs-check" onclick="vsProjectToggle('${project_id}','${item.item_id}',false)" title="Mark complete"></div>`;
        }
        const roomLabel=item.room&&item.room.trim()?`<span class="pvs-room-tag">${item.room}</span>`:'';
        // PDF page link — opens report to the specific page for this item
        const pdfHint=(has_pdf&&item.page&&!isComplete)?` <span class="pvs-pdf-hint" onclick="vsProjectPdf('${project_id}',${item.page})">pg ${item.page}</span>`:'';
        // Notes — filter out system/auto notes, same logic as standalone project view
        const visibleNotes=(item.task_notes||[]).filter(n=>{
          if(!n.text)return false;
          if(/^Combined with/i.test(n.text))return false;
          if(/Imported from Hostbuddy/i.test(n.text))return false;
          if(/Marked complete by.*via project/i.test(n.text))return false;
          if(/Completion undone by/i.test(n.text))return false;
          if(n.type==='system'||n.type==='admin_log')return false;
          return true;
        });
        const notesHtml=visibleNotes.length?`<div class="pvs-notes">${visibleNotes.map(n=>{
          const who=n.by||'Storybook Escapes';
          const when=n.time?new Date(n.time).toLocaleDateString():'';
          return `<div class="pvs-note"><span class="pvs-note-who">${who}${when?' · '+when:''}</span> ${n.text.replace(/</g,'&lt;')}</div>`;
        }).join('')}</div>`:'';
        html+=`<div class="pvs-row ${item.status==='fail'?'pvs-row-fail':'pvs-row-pass'} ${isComplete?'pvs-row-done':''}" id="vsp-${project_id}-${item.item_id}">
          <div class="pvs-row-banner">${checkHtml}
            <div class="pvs-row-info">
              <div class="pvs-row-remark ${isComplete?'pvs-strikethrough':''}">${remarkText}${pdfHint}</div>
              <div class="pvs-row-meta">
                <span class="pvs-pill ${item.status}">${item.status.toUpperCase()}</span>
                ${roomLabel}
                ${isComplete&&item.task_completed_by?`<span class="pvs-completed-by">Done by ${item.task_completed_by}</span>`:''}
              </div>
              ${notesHtml}
            </div>
          </div>
        </div>`;
      });
      html+=`</div>`; // close pvs-items-panel
    });
    html+=`</div>`;
    // Append below existing tasks (don't replace)
    wrap.insertAdjacentHTML('beforeend',html);
  }

  // ── Project PDF viewer (mirrors pvsOpenPdf from standalone project view) ──
  let _vsPdfLib=null;
  const _vsPdfCache={}; // {projectId: {bytes, doc}}
  let _vsPdfCurrentPage=0;
  let _vsPdfTotalPages=0;
  let _vsPdfCurrentProject=null;

  function _vsLoadPdfLib(){
    if(_vsPdfLib)return Promise.resolve(_vsPdfLib);
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload=()=>{const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';_vsPdfLib=lib;resolve(lib);};
      s.onerror=()=>reject(new Error('Failed to load pdf.js'));
      document.head.appendChild(s);
    });
  }

  async function _vsRenderPdfPage(canvas,doc,pageNum){
    const pg=await doc.getPage(pageNum);
    const wrap=canvas.parentElement;
    const wrapWidth=wrap.clientWidth-32;
    const unscaledVp=pg.getViewport({scale:1});
    const scale=wrapWidth/unscaledVp.width;
    const viewport=pg.getViewport({scale});
    const dpr=window.devicePixelRatio||1;
    canvas.width=viewport.width*dpr;canvas.height=viewport.height*dpr;
    canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    await pg.render({canvasContext:ctx,viewport}).promise;
  }

  function _vsUpdatePdfNav(){
    const badge=document.getElementById('pvs-pdf-page');
    const prevBtn=document.getElementById('pvs-pdf-prev');
    const nextBtn=document.getElementById('pvs-pdf-next');
    if(badge)badge.textContent='Page '+_vsPdfCurrentPage+' of '+_vsPdfTotalPages;
    if(prevBtn)prevBtn.style.opacity=_vsPdfCurrentPage<=1?'.3':'1';
    if(prevBtn)prevBtn.style.pointerEvents=_vsPdfCurrentPage<=1?'none':'auto';
    if(nextBtn)nextBtn.style.opacity=_vsPdfCurrentPage>=_vsPdfTotalPages?'.3':'1';
    if(nextBtn)nextBtn.style.pointerEvents=_vsPdfCurrentPage>=_vsPdfTotalPages?'none':'auto';
  }

  async function _vsGoToPage(delta){
    const newPage=_vsPdfCurrentPage+delta;
    if(newPage<1||newPage>_vsPdfTotalPages||!_vsPdfCurrentProject)return;
    const cached=_vsPdfCache[_vsPdfCurrentProject];
    if(!cached||!cached.doc)return;
    _vsPdfCurrentPage=newPage;
    _vsUpdatePdfNav();
    const wrap=document.getElementById('pvs-pdf-wrap');
    wrap.innerHTML='';
    const canvas=document.createElement('canvas');canvas.style.display='block';canvas.style.margin='0 auto';
    wrap.appendChild(canvas);
    await _vsRenderPdfPage(canvas,cached.doc,newPage);
    wrap.scrollTop=0;
  }
  window.vsPdfPrev=function(){_vsGoToPage(-1);};
  window.vsPdfNext=function(){_vsGoToPage(1);};

  window.vsProjectPdf=async function(projectId,page){
    _vsPdfCurrentProject=projectId;
    // Create modal if it doesn't exist
    let modal=document.getElementById('pvs-pdf-modal');
    if(!modal){
      modal=document.createElement('div');modal.id='pvs-pdf-modal';modal.className='pvs-pdf-modal';
      modal.innerHTML=`<div class="pvs-pdf-inner">
        <div class="pvs-pdf-header">
          <span id="pvs-pdf-title" class="pvs-pdf-title">Source Document</span>
          <div style="display:flex;align-items:center;gap:6px">
            <button id="pvs-pdf-prev" onclick="vsPdfPrev()" style="background:none;border:1px solid #c8e6c9;color:#2d6a3f;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:.82rem;font-weight:700">&#x25C0;</button>
            <span id="pvs-pdf-page" class="pvs-pdf-page-badge"></span>
            <button id="pvs-pdf-next" onclick="vsPdfNext()" style="background:none;border:1px solid #c8e6c9;color:#2d6a3f;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:.82rem;font-weight:700">&#x25B6;</button>
          </div>
          <button class="pvs-pdf-close" onclick="document.getElementById('pvs-pdf-modal').classList.remove('open')">&#10005;</button>
        </div>
        <div class="pvs-pdf-frame-wrap" id="pvs-pdf-wrap" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:16px;background:#525659"></div>
      </div>`;
      document.body.appendChild(modal);
    }
    document.getElementById('pvs-pdf-title').textContent='Source Document';
    modal.classList.add('open');
    const wrap=document.getElementById('pvs-pdf-wrap');
    wrap.innerHTML='<div style="text-align:center;padding:40px;color:#ccc">Loading PDF...</div>';
    try{
      let cached=_vsPdfCache[projectId];
      if(!cached){
        const r=await fetch(VAPI+'?token='+encodeURIComponent(token)+'&projectPdf='+encodeURIComponent(projectId));
        if(!r.ok)throw new Error('Failed to fetch');
        const data=await r.json();
        if(!data.pdf_data)throw new Error('No PDF');
        const byteStr=atob(data.pdf_data.split(',')[1]);
        const bytes=new Uint8Array(byteStr.length);
        for(let i=0;i<byteStr.length;i++)bytes[i]=byteStr.charCodeAt(i);
        cached={bytes,doc:null};_vsPdfCache[projectId]=cached;
      }
      const lib=await _vsLoadPdfLib();
      if(!cached.doc)cached.doc=await lib.getDocument({data:cached.bytes}).promise;
      const doc=cached.doc;
      _vsPdfTotalPages=doc.numPages;
      _vsPdfCurrentPage=page&&page<=doc.numPages?page:1;
      _vsUpdatePdfNav();
      // Render single page with nav
      wrap.innerHTML='';
      const canvas=document.createElement('canvas');canvas.style.display='block';canvas.style.margin='0 auto';
      wrap.appendChild(canvas);
      await _vsRenderPdfPage(canvas,doc,_vsPdfCurrentPage);
      wrap.scrollTop=0;
    }catch(e){
      console.error('[vs-project-pdf]',e);
      wrap.innerHTML='<div style="text-align:center;padding:40px;color:#f88">Could not load PDF. Please try again.</div>';
    }
  };

  // ── Project item toggle (mark done / undo) ──
  window.vsProjectToggle=async function(projectId,itemId,undo){
    const action=undo?'undoProjectDone':'markProjectDone';
    // Find item in local state for optimistic update
    const proj=vProjects.find(p=>p.project_id===projectId);
    const item=proj?proj.items.find(i=>i.item_id===itemId):null;
    // Disable check while saving
    const rowEl=document.getElementById('vsp-'+projectId+'-'+itemId);
    const checkEl=rowEl?rowEl.querySelector('.pvs-check'):null;
    if(checkEl){checkEl.style.opacity='.4';checkEl.style.pointerEvents='none';}
    try{
      const r=await fetch(VAPI+'?token='+encodeURIComponent(token),{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({token,action,project_id:projectId,item_id:itemId})
      });
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||'Failed');
      // Update local state
      if(item){
        item.task_status=j.task_status;
        if(action==='markProjectDone')item.task_completed_by=vVendor;
        else item.task_completed_by=null;
        // Recount
        const taskItems=proj.items.filter(i=>!!i.task_id);
        proj.total=taskItems.length;
        proj.done=taskItems.filter(i=>i.task_status==='complete'||i.task_status==='resolved_by_guest').length;
      }
      // Re-render projects section (clear old, re-append)
      document.querySelectorAll('.pvs-source-card,.pvs-ring-wrap,.pvs-items-panel,[id^="vsp-"]').forEach(el=>{
        if(el.closest('#vs-tasks'))el.remove();
      });
      // Remove the project wrapper div too
      const vsT=document.getElementById('vs-tasks');
      const lastDiv=vsT.lastElementChild;
      if(lastDiv&&!lastDiv.classList.contains('vs-card')&&!lastDiv.classList.contains('vs-nb-header')&&!lastDiv.classList.contains('vs-prop-header'))lastDiv.remove();
      vsRenderProjects();
    }catch(e){
      if(checkEl){checkEl.style.opacity='1';checkEl.style.pointerEvents='auto';}
      alert('Could not save. Please check your connection and try again.');
    }
  };

  // Read-only filter service panel shown inside vs-card-detail. Tells the
  // vendor what to install and where the filters live. Does NOT ask for
  // counts here — counts are collected in the "Mark as Done" modal so they
  // happen at close-out after service (see _vsMarkDone filter branch).
  function vsFilterPanel(t){
    const ctx=t&&t.filter_context;
    if(!ctx||!Array.isArray(ctx.sizes)||ctx.sizes.length===0)return'';
    const esc=s=>String(s==null?'':s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    // Total filters to install across all sizes (sum of required_per_change)
    const totalFilters=ctx.sizes.reduce((s,sz)=>s+(Number(sz.required_per_change)||0),0);
    const multi=totalFilters>1;
    const heading=multi
      ?`<div class="vs-filter-rule">Replace ${totalFilters} filters at this cabin.</div>`
      :'';
    const storage=ctx.storage_location
      ?`<div class="vs-filter-storage"><span class="vs-filter-storage-label">Filter storage at cabin:</span> ${esc(ctx.storage_location)}</div>`
      :`<div class="vs-filter-storage vs-filter-storage-missing">Filter storage location not yet recorded &mdash; please record it when you complete this task.</div>`;
    const rows=ctx.sizes.map(sz=>{
      const sizeLabel=esc(sz.size).replace('x','&times;');
      const locs=Array.isArray(sz.locations)&&sz.locations.length
        ?sz.locations.map(esc).join(', ')
        :'Location not recorded';
      return`<div class="vs-filter-row"><div class="vs-filter-install">Install <strong>${sz.required_per_change}&times; ${sizeLabel}</strong> &mdash; ${locs}</div></div>`;
    }).join('');
    return`<div class="vs-filter">
      <div class="vs-filter-icon">&#x1F32C;&#xFE0F;</div>
      <div class="vs-filter-content">
        <div class="vs-filter-label">HVAC Filter Service</div>
        ${heading}
        ${storage}
        <div class="vs-filter-rows">${rows}</div>
        <div class="vs-filter-footnote">You'll record remaining counts when you mark this task done.</div>
      </div>
    </div>`;
  }

  function vsCard(t){
    const done=!!t.vendorDone;
    const nbCls=t.neighborhoodCls||'';
    const photos=[];
    const refPhotos=Array.isArray(t.photos)&&t.photos.length?t.photos:t.photoUrl?[t.photoUrl]:[];
    refPhotos.forEach((u,i)=>photos.push({url:u,label:refPhotos.length>1?'Reference photo '+(i+1):'Reference photo'}));
    (t.vendorPhotos||[]).forEach(p=>photos.push({url:p.url,label:'Uploaded — '+new Date(p.uploadedAt).toLocaleDateString()}));
    // Filter notes: skip "Combined with" and "Imported from Hostbuddy AI"
    const filteredNotes=(t.notes||[]).filter(n=>!/^Combined with existing task/i.test(n.text)&&!/Imported from Hostbuddy AI/i.test(n.text));
    const notes=filteredNotes.map(n=>{
      const who=n.type==='vendor'?'You':(n.by||'Storybook Escapes');
      return`<div class="vs-note"><div class="vs-note-meta">${who} — ${new Date(n.time).toLocaleString()}</div><div>${n.text.replace(/</g,'&lt;')}</div></div>`;
    }).join('');
    // Undated tasks can't be marked complete — vendor must pick a date first.
    // The circle-check is hidden; a "Needs a date" chip takes its slot.
    const canComplete=!!t.date;
    return`<div class="vs-card ${done?'vs-done':''}" id="vsc-${t.id}" style="border-left:3px solid var(--${nbCls||'green'})">
      <div class="vs-card-banner" onclick="window._vsToggle('${t.id}')">
        ${canComplete
          ?`<div class="vs-card-check" onclick="event.stopPropagation();window._vsCircleCheck('${t.id}',${!!done})">${done?'&#x2713;':''}</div>`
          :`<div class="vs-card-check vs-card-check-locked" title="Pick a date first">&#x1F4C5;</div>`}
        <div class="vs-card-info">
          <div class="vs-card-prob">${t.problem}</div>
          <div class="vs-card-badges">
            ${t.urgent?'<span class="vs-urgent">Urgent</span>':''}
            ${t.purchaseNote?'<span class="vs-purchase-tag">Purchase needed</span>':''}
            ${!canComplete?'<span class="vs-needs-date-tag">Needs a date</span>':''}
            ${done?'<span style="font-size:.7rem;color:var(--green);font-weight:500">Submitted &#x2713;</span>':''}
          </div>
        </div>
        <span class="vs-chevron" style="font-size:.8rem;color:var(--text3);transition:transform .3s ease;display:inline-block">&#x25BE;</span>
      </div>
      <div class="vs-card-detail">
        ${t.purchaseNote?`<div class="vs-purchase">
          <div class="vs-purchase-icon">&#x1F6D2;</div>
          <div class="vs-purchase-content">
            <div class="vs-purchase-label">Purchase before arriving</div>
            <div class="vs-purchase-text">${t.purchaseNote.replace(/</g,'&lt;')}</div>
          </div>
        </div>`:''}
        ${vsFilterPanel(t)}
        ${photos.length?`<div class="vs-photos">${photos.map(p=>`<div><img src="${p.url}" onclick="window.open('${p.url}','_blank')" title="Tap to view full size"><div class="vs-photo-label">${p.label}</div></div>`).join('')}</div>`:''}
        <div class="vs-fb-upload-row">
          <div class="vs-fb-upload-btn" onclick="document.getElementById('vpi-${t.id}').click()">&#x1F4F7; Photo<input type="file" id="vpi-${t.id}" accept="image/*" multiple style="display:none" onchange="window._vsUploadPhotos('${t.id}',this.files)"></div>
          <div class="vs-fb-upload-btn" onclick="document.getElementById('vri-${t.id}').click()">&#x1F9FE; Receipt<input type="file" id="vri-${t.id}" accept="image/*" style="display:none" onchange="window._vsUploadPhotos('${t.id}',this.files)"></div>
        </div>
        <div id="vps-${t.id}" style="font-size:.72rem;color:var(--text3);margin:4px 0"></div>
        ${(vIsAgenda&&!done)?`<div class="vs-change-date-row"><button class="${t.date?'vs-change-date-btn':'vs-pick-date-btn-lg'}" onclick="window._vsPickDate('${t.id}')"><svg viewBox="0 0 24 24" width="${t.date?12:14}" height="${t.date?12:14}" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg> ${t.date?'Change date':'Pick a date'}</button></div>`:''}
        <div class="vs-notes">${notes}
          <div class="vs-note-input">
            <textarea id="vsn-${t.id}" placeholder="Leave a note..." rows="1"></textarea>
            <button onclick="window._vsAddNote('${t.id}')">Send</button>
          </div>
        </div>
        ${done?`<div class="vs-done-bar">
          <span class="vs-done-status">Submitted — awaiting confirmation</span><button class="vs-done-btn vs-btn-undo" onclick="window._vsUndoDone('${t.id}')">Undo</button>
        </div>`:''}
      </div>
    </div>`;
  }

  // Report Issue button — rendered at property level below last task
  function vsReportBtn(propId,propName){
    return`<div style="padding:6px 0" id="vsrw-${propId}">
      <div class="vs-report-link" id="vsrb-${propId}" onclick="window._vsShowReport('${propId}')">
        <span class="vs-report-link-icon">&#x1F527;</span>
        <span class="vs-report-link-label">Report an issue at ${propName}</span>
      </div>
      <div id="vsrf-${propId}" style="display:none;margin-top:8px;padding:14px;background:#f8faf8;border:1.5px solid var(--green-mid,#2e7d52);border-radius:var(--radius);box-shadow:var(--shadow)">
        <div style="font-size:.74rem;text-transform:uppercase;letter-spacing:1px;color:var(--green);margin-bottom:10px;font-weight:700">What did you find at ${propName}?</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <div class="vs-type-btn" id="vsrt-${propId}-needs" onclick="window._vsSelType('${propId}','needs_attention')" style="flex:1;padding:10px 8px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);cursor:pointer;text-align:center;transition:all .15s">
            <div style="font-size:1.2rem">&#x26A0;&#xFE0F;</div>
            <div style="font-size:.72rem;font-weight:600">Needs Attention</div>
            <div style="font-size:.6rem;color:var(--text3);margin-top:2px;line-height:1.3">Can't fix now</div>
          </div>
          <div class="vs-type-btn" id="vsrt-${propId}-fixed" onclick="window._vsSelType('${propId}','fixed_while_here')" style="flex:1;padding:10px 8px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);cursor:pointer;text-align:center;transition:all .15s">
            <div style="font-size:1.2rem">&#x2705;</div>
            <div style="font-size:.72rem;font-weight:600">Fixed While Here</div>
            <div style="font-size:.6rem;color:var(--text3);margin-top:2px;line-height:1.3">Just logging it</div>
          </div>
        </div>
        <textarea id="vsrd-${propId}" placeholder="Describe what you found..." rows="3" style="width:100%;border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-family:inherit;font-size:16px;resize:vertical;margin-bottom:0" oninput="window._vsCheckDesc('${propId}')"></textarea>
        <div class="vs-photo-step" id="vsrp-${propId}">
          <div class="vs-photo-step-title">Got a photo?</div>
          <div class="vs-photo-step-hint">A photo helps Chip see exactly what's going on.</div>
          <div class="vs-photo-upload-rpt" onclick="document.getElementById('vsrpi-${propId}').click()">
            <span style="font-size:1.2rem">&#x1F4F7;</span>
            <div>
              <div style="font-size:.76rem;font-weight:500;color:var(--green)">Take or Upload a Photo</div>
              <div style="font-size:.62rem;color:var(--text3)">Up to 10 photos — auto-compressed</div>
            </div>
          </div>
          <input type="file" id="vsrpi-${propId}" accept="image/*" multiple style="display:none" onchange="window._vsRptPreview('${propId}',this.files)">
          <div class="vs-rpt-preview" id="vsrpv-${propId}"></div>
          <span class="vs-photo-skip" onclick="document.getElementById('vsrp-${propId}').classList.remove('open')">Skip — no photo needed</span>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;justify-content:flex-end">
          <button onclick="window._vsHideReport('${propId}')" style="padding:8px 18px;border-radius:7px;font-weight:600;cursor:pointer;font-family:inherit;border:1px solid var(--border);background:var(--white);color:var(--text2)">Cancel</button>
          <button onclick="window._vsSubmitReport('${propId}')" style="padding:8px 18px;border-radius:7px;font-weight:600;cursor:pointer;font-family:inherit;border:1px solid var(--green);background:var(--green);color:#fff">Submit</button>
        </div>
      </div>
      <div id="vsrc-${propId}" style="display:none;margin-top:8px;padding:12px 14px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:var(--radius);font-size:.8rem;color:#2e7d32">
        &#x2713; Reported — Chip will review this. Thanks!
      </div>
    </div>`;
  }

  // Track selected report type per property
  const _vsReportType={};

  // Track report photo files per property
  const _vsReportPhotos={};

  window._vsShowReport=function(propId){
    const btn=document.getElementById('vsrb-'+propId);
    if(btn)btn.style.display='none';
    document.getElementById('vsrf-'+propId).style.display='block';
    _vsReportPhotos[propId]=[];
    // Check if description already has content (for re-opens)
    window._vsCheckDesc(propId);
  };
  window._vsHideReport=function(propId){
    document.getElementById('vsrf-'+propId).style.display='none';
    const btn=document.getElementById('vsrb-'+propId);
    if(btn)btn.style.display='flex';
    _vsReportPhotos[propId]=[];
    const pv=document.getElementById('vsrpv-'+propId);
    if(pv)pv.innerHTML='';
    const ps=document.getElementById('vsrp-'+propId);
    if(ps)ps.classList.remove('open');
  };
  window._vsCheckDesc=function(propId){
    const desc=document.getElementById('vsrd-'+propId);
    const photoStep=document.getElementById('vsrp-'+propId);
    if(desc&&photoStep&&desc.value.trim().length>10){
      photoStep.classList.add('open');
    }
  };
  window._vsRptPreview=function(propId,files){
    if(!_vsReportPhotos[propId])_vsReportPhotos[propId]=[];
    const container=document.getElementById('vsrpv-'+propId);
    const maxPhotos=10;
    for(const file of files){
      if(!file.type.startsWith('image/'))continue;
      if(_vsReportPhotos[propId].length>=maxPhotos){alert('Maximum '+maxPhotos+' photos per report.');break;}
      _vsReportPhotos[propId].push(file);
      const img=document.createElement('img');
      img.src=URL.createObjectURL(file);
      container.appendChild(img);
    }
  };
  window._vsSelType=function(propId,type){
    _vsReportType[propId]=type;
    const needs=document.getElementById('vsrt-'+propId+'-needs');
    const fixed=document.getElementById('vsrt-'+propId+'-fixed');
    if(needs)needs.style.borderColor=type==='needs_attention'?'var(--green)':'var(--border)';
    if(needs)needs.style.background=type==='needs_attention'?'var(--green-light)':'var(--white)';
    if(fixed)fixed.style.borderColor=type==='fixed_while_here'?'var(--green)':'var(--border)';
    if(fixed)fixed.style.background=type==='fixed_while_here'?'var(--green-light)':'var(--white)';
  };
  window._vsSubmitReport=async function(propId){
    const desc=(document.getElementById('vsrd-'+propId)||{}).value||'';
    if(!desc.trim()){alert('Please describe what you found.');return;}
    const reportType=_vsReportType[propId];
    if(!reportType){alert('Please select "Needs Attention" or "Fixed While Here".');return;}
    // Upload report photos first (compress + sequential upload)
    let photoUrls=[];
    const photos=_vsReportPhotos[propId]||[];
    if(photos.length>0){
      const submitBtn=document.querySelector('#vsrf-'+propId+' button:last-child');
      const origText=submitBtn?submitBtn.textContent:'Submit';
      for(let i=0;i<photos.length;i++){
        if(submitBtn)submitBtn.textContent=`Uploading ${i+1}/${photos.length}...`;
        try{
          const compressed=await vsCompressImage(photos[i]);
          const fname='report-'+propId+'-'+Date.now()+'-'+(i+1)+'.jpg';
          const ur=await fetch(VAPI+'?token='+encodeURIComponent(token)+'&taskId=report_'+propId+'&filename='+encodeURIComponent(fname),{method:'POST',headers:{'Content-Type':'image/jpeg'},body:compressed});
          if(ur.ok){const d=await ur.json();if(d.url)photoUrls.push(d.url);}
        }catch(e){console.error('Report photo upload error:',e);}
      }
      if(submitBtn)submitBtn.textContent=origText;
    }
    try{
      const r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        token,action:'reportIssue',propertyId:propId,description:desc.trim(),reportType,
        photoUrl:photoUrls.length===1?photoUrls[0]:photoUrls.length>1?photoUrls:null
      })});
      if(!r.ok){alert('Failed to submit. Please try again.');return;}
      document.getElementById('vsrf-'+propId).style.display='none';
      document.getElementById('vsrc-'+propId).style.display='block';
      _vsReportPhotos[propId]=[];
    }catch(e){alert('Network error. Please try again.');}
  };

  window._vsToggle=function(id){
    const el=document.getElementById('vsc-'+id);
    if(el)el.classList.toggle('vs-expanded');
  };

  window._vsCircleCheck=function(id,isDone){
    if(isDone) window._vsUndoDone(id);
    else window._vsMarkDone(id);
  };

  // Feedback modal state
  let _vsFbFiles=[];let _vsFbReceiptFiles=[];

  window._vsMarkDone=function(id){
    const t=vTasks.find(x=>x.id===id);if(!t)return;
    _vsFbFiles=[];_vsFbReceiptFiles=[];
    const isHvac=(t.category||'').toLowerCase()==='hvac';
    const isFilter=!!(t.filter_context&&Array.isArray(t.filter_context.sizes)&&t.filter_context.sizes.length);
    const esc=s=>String(s==null?'':s).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // Filter-service fields (storage location + per-size counts). All counts
    // are required before the Submit button enables. Server enforces again.
    let filterHtml='';
    if(isFilter){
      const ctx=t.filter_context;
      const locVal=ctx.storage_location?esc(ctx.storage_location):'';
      const locPlaceholder=ctx.storage_location?'':'e.g. Main floor laundry closet, upper shelf';
      const sizeRows=ctx.sizes.map((sz,i)=>{
        const sizeLabel=esc(sz.size).replace('x','&times;');
        const locs=Array.isArray(sz.locations)&&sz.locations.length?sz.locations.map(esc).join(', '):'';
        return`<div class="vs-fb-filter-row">
          <div class="vs-fb-filter-row-label">
            <strong>${sizeLabel}</strong>
            <div class="vs-fb-filter-row-sub">Install ${sz.required_per_change}&times;${locs?' &mdash; '+locs:''}</div>
          </div>
          <input type="number" min="0" step="1" inputmode="numeric" class="vs-fb-filter-count" id="vsfb-fc-${i}" data-size="${esc(sz.size)}" placeholder="Count" oninput="window._vsFbCount()">
        </div>`;
      }).join('');
      filterHtml=`<div class="vs-fb-filter">
        <div class="vs-fb-filter-title">Filter Service &mdash; Close-out</div>
        <div class="vs-fb-filter-storage-block">
          <label class="vs-fb-filter-label">Where are the filters stored at this cabin?</label>
          <input type="text" id="vsfb-fl-storage" class="vs-fb-filter-text" value="${locVal}" placeholder="${locPlaceholder}" oninput="window._vsFbCount()">
        </div>
        <div class="vs-fb-filter-label" style="margin-top:10px">After service, how many of each size are left at the cabin?</div>
        <div class="vs-fb-filter-rows">${sizeRows}</div>
      </div>`;
    }

    const title=isFilter?'Complete Filter Service':'Mark as Done';
    const subText=isFilter
      ?'Record remaining filters and storage location, then tell Chip what you did.'
      :'Quick notes on what you did — helps Chip keep records straight.';
    const submitLabel=isFilter?'Submit &amp; Complete':'Submit Done';

    const overlay=document.createElement('div');
    overlay.className='vs-fb-overlay';
    overlay.id='vsfb-overlay';
    overlay.innerHTML=`<div class="vs-fb-modal">
      <div class="vs-fb-title">${title}</div>
      <div class="vs-fb-sub">${subText}</div>
      <div style="font-size:.82rem;font-weight:500;color:var(--text);margin-bottom:14px;padding:10px 12px;background:var(--surface2);border-radius:8px;border-left:3px solid var(--green)">${t.problem}</div>
      ${filterHtml}
      <textarea class="vs-fb-textarea" id="vsfb-text" placeholder="What did you do? Any notes for Chip..." oninput="window._vsFbCount()"></textarea>
      <div class="vs-fb-charcount" id="vsfb-cc">0 / 10 minimum</div>
      ${isHvac?'<div class="vs-fb-photo-req"><span>&#x1F4F7;</span> HVAC tasks require a photo of the completed work</div>':''}
      <div class="vs-fb-upload-row">
        <div class="vs-fb-upload-btn" onclick="document.getElementById('vsfb-photo').click()">&#x1F4F7; Photo<input type="file" id="vsfb-photo" accept="image/*" multiple style="display:none" onchange="window._vsFbPreview('photo',this.files)"></div>
        <div class="vs-fb-upload-btn" onclick="document.getElementById('vsfb-receipt').click()">&#x1F9FE; Receipt<input type="file" id="vsfb-receipt" accept="image/*" style="display:none" onchange="window._vsFbPreview('receipt',this.files)"></div>
      </div>
      <div id="vsfb-previews" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"></div>
      <div class="vs-fb-actions">
        <button style="padding:10px 22px;border-radius:8px;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;background:transparent;color:var(--text2);border:1px solid var(--border)" onclick="document.getElementById('vsfb-overlay').remove()">Cancel</button>
        <button id="vsfb-submit" style="padding:10px 22px;border-radius:8px;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;background:var(--green);color:#fff;border:1px solid var(--green);opacity:.4" onclick="window._vsFbSubmit('${id}',${isHvac},${isFilter})">${submitLabel}</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
    // Initial enable-state pass (so filter-count check runs even before focus)
    setTimeout(()=>{window._vsFbCount&&window._vsFbCount();document.getElementById(isFilter?'vsfb-fc-0':'vsfb-text')?.focus();},100);
  };

  window._vsFbCount=function(){
    const ta=document.getElementById('vsfb-text');
    const cc=document.getElementById('vsfb-cc');
    const btn=document.getElementById('vsfb-submit');
    if(!ta||!cc)return;
    const len=ta.value.trim().length;
    cc.textContent=len+' / 10 minimum';
    cc.style.color=len>=10?'var(--green)':'var(--text3)';
    // Filter tasks also require all size counts + a storage location filled
    let filterOk=true;
    const countInputs=document.querySelectorAll('.vs-fb-filter-count');
    if(countInputs.length){
      countInputs.forEach(inp=>{
        const v=(inp.value||'').trim();
        const n=parseInt(v,10);
        if(v===''||!Number.isFinite(n)||n<0)filterOk=false;
      });
      const locInp=document.getElementById('vsfb-fl-storage');
      if(locInp&&!(locInp.value||'').trim())filterOk=false;
    }
    const ok=len>=10&&filterOk;
    if(btn)btn.style.opacity=ok?'1':'.4';
  };

  window._vsFbPreview=function(type,files){
    if(!files||!files.length)return;
    if(type==='photo')_vsFbFiles.push(...Array.from(files));
    else _vsFbReceiptFiles.push(...Array.from(files));
    const prev=document.getElementById('vsfb-previews');if(!prev)return;
    let h='';
    _vsFbFiles.forEach((f,i)=>{h+=`<div style="position:relative"><img src="${URL.createObjectURL(f)}" style="width:54px;height:54px;object-fit:cover;border-radius:6px;border:1px solid var(--border)"><div style="font-size:.55rem;color:var(--text3);text-align:center">Photo</div></div>`;});
    _vsFbReceiptFiles.forEach((f,i)=>{h+=`<div style="position:relative"><img src="${URL.createObjectURL(f)}" style="width:54px;height:54px;object-fit:cover;border-radius:6px;border:1px solid var(--gold)"><div style="font-size:.55rem;color:var(--gold);text-align:center">Receipt</div></div>`;});
    prev.innerHTML=h;
  };

  window._vsFbSubmit=async function(id,isHvac,isFilter){
    const ta=document.getElementById('vsfb-text');
    const txt=(ta?ta.value:'').trim();
    if(txt.length<10){
      if(ta){ta.style.borderColor='var(--red)';ta.style.animation='none';ta.offsetHeight;ta.style.animation='vsShake .4s ease';}
      return;
    }
    if(isHvac&&_vsFbFiles.length===0){alert('HVAC tasks require at least one photo.');return;}

    // Filter tasks: collect + validate all size counts and storage location
    let filterCounts=null, filterStorageLoc=null;
    if(isFilter){
      filterCounts={};
      let bad=false;
      document.querySelectorAll('.vs-fb-filter-count').forEach(inp=>{
        const sz=inp.getAttribute('data-size');
        const raw=(inp.value||'').trim();
        const n=parseInt(raw,10);
        if(raw===''||!Number.isFinite(n)||n<0){bad=true;inp.style.borderColor='var(--red)';}
        else{inp.style.borderColor='';filterCounts[sz]=n;}
      });
      const locInp=document.getElementById('vsfb-fl-storage');
      filterStorageLoc=locInp?(locInp.value||'').trim():'';
      if(!filterStorageLoc){bad=true;if(locInp)locInp.style.borderColor='var(--red)';}
      if(bad){alert('Please enter a count for every size and confirm the filter storage location.');return;}
    }

    // Remove modal
    document.getElementById('vsfb-overlay')?.remove();
    // Upload photos first if any
    const t=vTasks.find(x=>x.id===id);
    if(t&&(_vsFbFiles.length||_vsFbReceiptFiles.length)){
      const allFiles=[..._vsFbFiles,..._vsFbReceiptFiles];
      for(const file of allFiles){
        try{
          const compressed=await vsCompressImage(file);
          const fname=`vendor-${id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}.jpg`;
          const r=await fetch(VAPI+'?token='+encodeURIComponent(token)+'&taskId='+encodeURIComponent(id)+'&filename='+encodeURIComponent(fname),{
            method:'POST',headers:{'Content-Type':'image/jpeg'},body:compressed
          });
          if(r.ok){const data=await r.json();if(!t.vendorPhotos)t.vendorPhotos=[];t.vendorPhotos.push({url:data.url,uploadedAt:new Date().toISOString(),uploadedBy:vVendor});}
        }catch(e){}
      }
    }
    // Submit via API — filter tasks use filter_recount (writes inventory +
    // marks done atomically); everything else uses markDone.
    try{
      let r;
      if(isFilter){
        r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          token,action:'filter_recount',taskId:id,counts:filterCounts,storage_location:filterStorageLoc,note:txt
        })});
      }else{
        r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action:'markDone',taskId:id})});
      }
      if(!r.ok){alert('Failed to submit. Please try again.');return;}
      const data=await r.json();
      if(t){
        t.vendorDone=data.vendorDone;
        if(!t.notes)t.notes=[];
        if(isFilter){
          // Server already wrote a recount summary note — also push the
          // vendor's free-text note so it appears in the local UI right away
          t.notes.push({text:txt,type:'vendor',time:data.vendorDone,by:vVendor});
          // Optimistic local filter_context update so re-render doesn't
          // show stale on-hand data if the panel is reopened
          if(t.filter_context&&Array.isArray(t.filter_context.sizes)){
            t.filter_context.sizes.forEach(sz=>{
              if(filterCounts&&(sz.size in filterCounts)){
                sz.on_hand=filterCounts[sz.size];
                sz.confirmed=true;
              }
            });
            if(filterStorageLoc)t.filter_context.storage_location=filterStorageLoc;
          }
        } else {
          t.notes.push({text:txt,type:'vendor',time:data.vendorDone,by:vVendor});
        }
      }
      // Completion animation
      const card=document.getElementById('vsc-'+id);
      if(card){
        const check=card.querySelector('.vs-card-check');
        if(check){check.innerHTML='&#x2713;';check.classList.add('vs-check-pop');}
        card.classList.add('vs-done');
        setTimeout(()=>{card.classList.remove('vs-expanded');card.classList.add('vs-collapsing');},600);
        setTimeout(()=>{vsRender();checkPaymentPrompt(id);},1100);
      } else {
        vsRender();checkPaymentPrompt(id);
      }
    }catch(e){alert('Network error. Please try again.');}
    _vsFbFiles=[];_vsFbReceiptFiles=[];
  };

  window._vsUndoDone=async function(id){
    try{
      const r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action:'undoDone',taskId:id})});
      if(!r.ok){alert('Failed. Please try again.');return;}
      const t=vTasks.find(x=>x.id===id);
      if(t){t.vendorDone=null;if(!t.notes)t.notes=[];t.notes.push({text:'Unmarked as done by vendor.',type:'vendor',time:new Date().toISOString()});}
      vsRender();
    }catch(e){alert('Network error. Please try again.');}
  };

  window._vsAddNote=async function(id){
    const inp=document.getElementById('vsn-'+id);
    const txt=(inp?inp.value:'').trim();
    if(!txt)return;
    try{
      const r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action:'addNote',taskId:id,text:txt})});
      if(!r.ok){alert('Failed to send note.');return;}
      const t=vTasks.find(x=>x.id===id);
      if(t){if(!t.notes)t.notes=[];t.notes.push({text:txt,type:'vendor',time:new Date().toISOString()});}
      vsRender();
      // Re-expand the card
      setTimeout(()=>{const el=document.getElementById('vsc-'+id);if(el)el.classList.add('vs-expanded');},10);
    }catch(e){alert('Network error.');}
  };

  window._vsUploadPhotos=async function(id,files){
    if(!files||!files.length)return;
    const t=vTasks.find(x=>x.id===id);if(!t)return;
    const existing=(t.vendorPhotos||[]).length;
    const remaining=MAX_PHOTOS_PER_TASK-existing;
    if(remaining<=0){alert('This task already has '+MAX_PHOTOS_PER_TASK+' photos (max limit).');return;}
    const batch=Array.from(files).slice(0,remaining);
    if(batch.length<files.length){alert('Only uploading '+batch.length+' of '+files.length+' photos (limit is '+MAX_PHOTOS_PER_TASK+' per task).');}
    const statusEl=document.getElementById('vps-'+id);
    let uploaded=0;
    for(const file of batch){
      uploaded++;
      if(statusEl)statusEl.textContent='Uploading '+uploaded+' of '+batch.length+'...';
      try{
        const compressed=await vsCompressImage(file);
        const fname=`vendor-${id}-${Date.now()}-${uploaded}.jpg`;
        const r=await fetch(VAPI+'?token='+encodeURIComponent(token)+'&taskId='+encodeURIComponent(id)+'&filename='+encodeURIComponent(fname),{
          method:'POST',headers:{'Content-Type':'image/jpeg'},body:compressed
        });
        if(!r.ok){if(statusEl)statusEl.textContent='Failed to upload photo '+uploaded+'. Tap to retry.';continue;}
        const data=await r.json();
        if(!t.vendorPhotos)t.vendorPhotos=[];
        t.vendorPhotos.push({url:data.url,uploadedAt:new Date().toISOString(),uploadedBy:vVendor});
      }catch(e){if(statusEl)statusEl.textContent='Upload error on photo '+uploaded+'.';continue;}
    }
    if(statusEl)statusEl.textContent='';
    vsRender();
    setTimeout(()=>{const el=document.getElementById('vsc-'+id);if(el)el.classList.add('vs-expanded');},10);
  };

  // Copy-to-clipboard helper for Cash App guided flow
  window._vsCopyText=function(text,btnId){
    navigator.clipboard.writeText(text).then(()=>{
      const btn=document.getElementById(btnId);if(!btn)return;
      btn.textContent='Copied!';btn.classList.add('copied');
      setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);
    }).catch(()=>{
      const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
      const btn=document.getElementById(btnId);if(!btn)return;
      btn.textContent='Copied!';btn.classList.add('copied');
      setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);
    });
  };

  // ── Payment Prompt Logic ────────────────────────────────
  // Payment groups: properties that share a bank account get grouped
  // PRC (all 6), UMC (all 6), Hillside (both) = shared accounts
  // Gatlinburg, Alpine, Sevierville properties = individual accounts
  const PAY_GROUPS=[
    {id:'prc',label:'Paradise Ridge',props:['prc1','prc2','prc3','prc4','prc5','prc6']},
    {id:'umc',label:'Upper Middle Creek',props:['umc10','umc20','umc30','umc40','umc50','umc60']},
    {id:'hillside',label:'Hillside Haven',props:['hillside_big','hillside_cottage']},
    {id:'bearadise',label:'Bearadise Lodge',props:['bearadise']},
    {id:'wizards',label:"The Wizard's Edge",props:['wizards']},
    {id:'hibernation',label:'Hibernation Station',props:['hibernation']},
    {id:'hero',label:'Hero Hideout',props:['hero']},
    {id:'magic',label:'Magic Mountain',props:['magic']},
  ];
  const VENMO_USER='Chip-Burns';
  const CASHAPP_TAG='chipburns';
  // Track which groups we've already prompted for (avoid re-prompting on re-render)
  const _payPrompted=new Set();

  function getPayGroup(propId){
    return PAY_GROUPS.find(g=>g.props.includes(propId))||null;
  }

  function checkPaymentPrompt(justCompletedTaskId){
    // Skip payment prompt entirely if no payment methods enabled for this vendor
    if(!vPayMethods||vPayMethods.length===0)return;
    const justDone=vTasks.find(t=>t.id===justCompletedTaskId);
    if(!justDone)return;
    const group=getPayGroup(justDone.property);
    if(!group)return;
    if(_payPrompted.has(group.id))return;

    // Get all tasks in this payment group
    const groupTasks=vTasks.filter(t=>group.props.includes(t.property));
    if(groupTasks.length===0)return;

    // Check if ALL tasks in this group are now done
    const allDone=groupTasks.every(t=>!!t.vendorDone);
    if(!allDone)return;

    _payPrompted.add(group.id);

    // Build property list for the note
    const propNames=[...new Set(groupTasks.map(t=>{
      const short=t.propertyName.replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
      return short;
    }))];
    const taskCount=groupTasks.length;
    const dateStr=vDate?new Date(vDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'today';
    const noteText=`Maintenance ${dateStr} - ${group.label}`;

    // Venmo deep link (request/charge)
    const venmoUrl=`https://venmo.com/${VENMO_USER}?txn=charge&note=${encodeURIComponent(noteText)}`;
    // Record payment request to API so admin side knows
    function recordPayment(method,amount){
      const body={token,action:'paymentRequested',method,groupProps:group.props};
      if(amount)body.amount=amount;
      fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});
      groupTasks.forEach(t=>{t.vendorPaymentRequested={method,time:new Date().toISOString()};if(amount)t.vendorPaymentRequested.amount=amount;});
    }

    // Build and show prompt overlay
    const gid=group.id;
    const overlay=document.createElement('div');
    overlay.className='vp-overlay';
    overlay.id='vp-overlay-'+gid;
    overlay.innerHTML=`<div class="vp-prompt">
      <div class="vp-prompt-hdr">
        <div class="vp-prompt-check">&#x2713;</div>
        <div class="vp-prompt-title">${group.label} — All Done!</div>
        <div class="vp-prompt-sub">${taskCount} task${taskCount!==1?'s':''} completed</div>
      </div>
      <div class="vp-prompt-body">
        <div class="vp-prompt-note">Send a payment request for your work at <strong>${propNames.join(', ')}</strong></div>
        <div class="vp-pay-btns">
          ${vPayMethods.includes('venmo')?`<a href="${venmoUrl}" class="vp-pay-btn venmo" id="vp-venmo-${gid}" target="_blank">
            <span style="font-size:1.1rem">💸</span> Request via Venmo
          </a>`:''}
          ${vPayMethods.includes('cashapp')?`<button class="vp-pay-btn cashapp" id="vp-cash-${gid}" onclick="document.getElementById('vp-ca-flow-${gid}').style.display='block';this.style.display='none'">
            <span style="font-size:1.1rem">💵</span> Request via Cash App
          </button>`:''}
        </div>
        ${vPayMethods.includes('cashapp')?`<div id="vp-ca-flow-${gid}" style="display:none">
          <div style="margin-bottom:14px">
            <label style="font-size:.76rem;font-weight:600;color:var(--text2);display:block;margin-bottom:4px">How much are you requesting?</label>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:1rem;font-weight:600;color:var(--text)">$</span>
              <input type="number" id="ca-amount-${gid}" placeholder="0.00" min="0" step="0.01" style="flex:1;max-width:140px;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius);font-family:inherit;font-size:.95rem;font-weight:600;background:var(--white);color:var(--text)" oninput="document.getElementById('ca-amt-d-${gid}').textContent=this.value?'$'+parseFloat(this.value).toFixed(2):'your amount'">
            </div>
            <div style="font-size:.64rem;color:var(--text3);margin-top:3px">This amount will be saved to your invoice for Chip's records.</div>
          </div>
          <div class="vp-cashapp-steps">
            <div class="step"><div class="num">1</div><div>Open <strong>Cash App</strong> on your phone</div></div>
            <div class="step"><div class="num">2</div><div>Tap <strong>Request</strong>, then enter <strong>\$${CASHAPP_TAG}</strong>
              <button class="vp-copy-btn" id="ca-cp-tag-${gid}" onclick="window._vsCopyText('\$${CASHAPP_TAG}','ca-cp-tag-${gid}')">Copy</button>
            </div></div>
            <div class="step"><div class="num">3</div><div>Add note: <strong>${noteText}</strong>
              <button class="vp-copy-btn" id="ca-cp-note-${gid}" onclick="window._vsCopyText('${noteText}','ca-cp-note-${gid}')">Copy</button>
            </div></div>
            <div class="step"><div class="num">4</div><div>Enter <strong><span id="ca-amt-d-${gid}">your amount</span></strong> and tap <strong>Request</strong></div></div>
          </div>
          <a href="https://cash.app" class="vp-pay-btn cashapp" target="_blank" id="vp-ca-open-${gid}" style="text-decoration:none;display:flex;align-items:center;justify-content:center">
            💵 Open Cash App
          </a>
        </div>`:''}
        <div class="vp-pay-ids">
          ${vPayMethods.includes('venmo')?`<strong>Venmo:</strong> @${VENMO_USER}<br>`:''}
          ${vPayMethods.includes('cashapp')?`<strong>Cash App:</strong> \\$${CASHAPP_TAG}`:''}
        </div>
        <button class="vp-prompt-skip" onclick="this.closest('.vp-overlay').remove()">I'll send a request later</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    // Track Venmo click
    document.getElementById('vp-venmo-'+gid).addEventListener('click',()=>recordPayment('venmo'));
    // Track Cash App open (with amount capture)
    document.getElementById('vp-ca-open-'+gid)?.addEventListener('click',function(){
      const inp=document.getElementById('ca-amount-'+gid);
      const amt=inp?parseFloat(inp.value):0;
      recordPayment('cashapp',amt>0?amt:undefined);
    });
    // Close on backdrop click
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  }

  // ─────────────────────────────────────────────────────────────
  // VENDOR CALENDAR — self-schedule or reschedule a task
  // Opens a date picker restricted to a 21-day window from today.
  // Shows property bookings as bars. Guest-in-house days are hard-blocked
  // (no click); vendors can only pick turn / checkout / check-in / open days.
  // ─────────────────────────────────────────────────────────────
  let vDpState={taskId:null,viewYear:0,viewMonth:0,selected:null,bookings:[],propertyId:null};

  function vsFmtDate(ds){
    return new Date(ds+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  }

  async function vsFetchBookings(propId){
    if(vIcalByProp[propId])return vIcalByProp[propId];
    const hospId=(typeof HOSPITABLE_IDS!=='undefined'?HOSPITABLE_IDS[propId]:null);
    if(!hospId){vIcalByProp[propId]=[];return[];}
    try{
      const url=`${PROXY_BASE}/api/hospitable?action=reservations&pid=${hospId}`;
      const r=await fetch(url,{signal:AbortSignal.timeout(15000)});
      if(!r.ok){vIcalByProp[propId]=[];return[];}
      const json=await r.json();
      const pd=s=>{const m=(s||'').match(/(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3],12,0,0):null;};
      const evs=(json.data||[])
        .filter(rv=>rv.arrival_date&&rv.departure_date&&rv.status!=='cancelled')
        .map(rv=>({
          start:pd(rv.arrival_date),
          end:pd(rv.departure_date),
          summary:rv.guest_name||(rv.guest&&rv.guest.name)||'Guest',
        }))
        .filter(ev=>ev.start&&ev.end);
      vIcalByProp[propId]=evs;
      return evs;
    }catch(e){
      console.warn('[vs-bookings]',propId,e.message);
      vIcalByProp[propId]=[];
      return[];
    }
  }

  window._vsPickDate=async function(taskId){
    const t=(vNeedsSched||[]).find(x=>x.id===taskId)||vTasks.find(x=>x.id===taskId);
    if(!t)return;
    // Ensure the modal container exists
    let modal=document.getElementById('vs-dp-modal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='vs-dp-modal';
      modal.className='vs-dp-modal';
      document.body.appendChild(modal);
      modal.addEventListener('click',function(e){if(e.target===modal)vsClosePicker();});
    }
    // Set initial view = today's month
    const today=new Date();
    vDpState.taskId=taskId;
    vDpState.propertyId=t.property;
    vDpState.viewYear=today.getFullYear();
    vDpState.viewMonth=today.getMonth();
    vDpState.selected=t.date||null; // pre-select the current date if rescheduling
    // Show loading state immediately so the vendor sees feedback
    modal.innerHTML=`<div class="vs-dp-panel"><div class="vs-dp-load">Loading calendar...</div></div>`;
    modal.classList.add('open');
    document.body.style.overflow='hidden';
    // Fetch bookings (cached after first fetch per property)
    vDpState.bookings=await vsFetchBookings(t.property);
    vsRenderPicker();
  };

  function vsClosePicker(){
    const modal=document.getElementById('vs-dp-modal');
    if(modal){modal.classList.remove('open');modal.innerHTML='';}
    document.body.style.overflow='';
    vDpState.taskId=null;
  }
  window._vsClosePicker=vsClosePicker;

  // Alias to the module-scope dayState — single source of truth.
  const vsDayState=dayState;

  function vsRenderPicker(){
    const modal=document.getElementById('vs-dp-modal');
    if(!modal)return;
    const t=(vNeedsSched||[]).find(x=>x.id===vDpState.taskId)||vTasks.find(x=>x.id===vDpState.taskId);
    if(!t){vsClosePicker();return;}
    const today=new Date();today.setHours(12,0,0,0);
    const maxDate=new Date(today.getTime()+21*86400000);maxDate.setHours(12,0,0,0);
    const y=vDpState.viewYear,mo=vDpState.viewMonth;
    const first=new Date(y,mo,1,12,0,0);
    const last=new Date(y,mo+1,0,12,0,0);
    const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const selVal=vDpState.selected;
    const bookings=vDpState.bookings||[];
    // Navigation bounds: can only view months containing any day in [today, maxDate]
    const minNavY=today.getFullYear(),minNavM=today.getMonth();
    const maxNavY=maxDate.getFullYear(),maxNavM=maxDate.getMonth();
    const canGoPrev=(y>minNavY)||(y===minNavY&&mo>minNavM);
    const canGoNext=(y<maxNavY)||(y===maxNavY&&mo<maxNavM);

    // Build the week grid
    const sc=first.getDay();
    const tot=Math.ceil((sc+last.getDate())/7)*7;
    const weeks=[];let wk=[];
    for(let i=0;i<tot;i++){
      const dn=i-sc+1;
      const d=new Date(y,mo,dn,12,0,0);
      wk.push({dn,d,isOther:dn<1||dn>last.getDate()});
      if(wk.length===7){weeks.push(wk);wk=[];}
    }

    const shortProp=(t.propertyName||'').replace(/^(PRC|UMC)\s*-\s*\d+\s*-\s*/,'');
    const titleAction=t.date?'Change date':'Pick a date';
    const sub=t.date?`Currently scheduled for ${vsFmtDate(t.date)}`:'';
    let h=`<div class="vs-dp-panel" onclick="event.stopPropagation()">
      <div class="vs-dp-header">
        <div>
          <div class="vs-dp-title">${titleAction}</div>
          <div class="vs-dp-sub">${shortProp} — ${t.problem}${sub?'<br>'+sub:''}</div>
        </div>
        <button class="vs-dp-close" onclick="window._vsClosePicker()">&times;</button>
      </div>
      <div class="vs-dp-body">
        <div class="vs-dp-range">You can pick any day from today through ${vsFmtDate(maxDate.toISOString().slice(0,10))}.</div>
        ${vsRenderBestDaysHtml()}
        <div class="dp-phdr">
          <div class="dp-ptitle">${MONTHS[mo]} ${y}</div>
          <div class="dp-pnav">
            <button ${canGoPrev?'':'disabled style="opacity:.3;cursor:not-allowed"'} onclick="window._vsDpNav(-1)">&#x2190;</button>
            <button ${canGoNext?'':'disabled style="opacity:.3;cursor:not-allowed"'} onclick="window._vsDpNav(1)">&#x2192;</button>
          </div>
        </div>
        <div class="dp-cal-wrap"><div class="dp-dow-row">`;
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(dw=>h+=`<div class="dp-dow">${dw}</div>`);
    h+=`</div>`;
    const COL_PCT=100/7;
    weeks.forEach(wk=>{
      const wkStart=wk[0].d;
      const wkEnd=new Date(wk[6].d.getFullYear(),wk[6].d.getMonth(),wk[6].d.getDate()+1,12,0,0);
      h+=`<div class="dp-week-row">`;
      wk.forEach(({dn,d,isOther})=>{
        if(isOther){h+=`<div class="dp-cell dp-other"></div>`;return;}
        const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const isSel=selVal===ds;
        const isPast=d<today;
        const isToday=d.toDateString()===today.toDateString();
        const isBeyond=d>maxDate;
        const st=vsDayState(d,bookings);
        const isGuestInHouse=st==='booked';
        // Booked days are hard-blocked for vendors: no click, no "schedule anyway"
        // option. Admin only can schedule through a guest stay.
        const disabled=isPast||isBeyond||isGuestInHouse;
        let cls='dp-cell';
        if(isToday)cls+=' dp-today-cell';
        if(isSel)cls+=' dp-selected';
        if(disabled)cls+=' dp-disabled';
        if(isGuestInHouse&&!isPast&&!isBeyond)cls+=' dp-guest-locked';
        const dnCls='dp-dn'+(isToday?' dp-today-num':'');
        const click=!disabled?`onclick="window._vsSelDate('${ds}')"`:'';
        h+=`<div class="${cls}" ${click}><div class="${dnCls}">${dn}</div></div>`;
      });
      // Render reservation bars overlaying this week
      bookings.forEach(r=>{
        if(!r.start||!r.end)return;
        if(r.start>=wkEnd||r.end<=wkStart)return;
        const barStart=r.start<wkStart?wkStart:r.start;
        const barEnd=r.end>wkEnd?wkEnd:r.end;
        const msPerDay=86400000;
        const startCol=Math.round((barStart.getTime()-wkStart.getTime())/msPerDay);
        const endCol=Math.round((barEnd.getTime()-wkStart.getTime())/msPerDay);
        if(endCol<=startCol)return;
        const isFirst=r.start>=wkStart;
        const isLast=r.end<=wkEnd;
        let left=isFirst?(startCol+0.5)*COL_PCT:0;
        let right=isLast?Math.min((endCol+0.5)*COL_PCT,100):100;
        let width=right-left;
        if(width<=0)return;
        let barCls='dp-res-bar';
        if(isFirst)barCls+=' dp-bar-start';
        if(isLast)barCls+=' dp-bar-end';
        h+=`<div class="${barCls}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%"><span class="dp-res-name">${(r.summary||'').replace(/</g,'&lt;')}</span></div>`;
      });
      h+=`</div>`;
    });
    h+=`</div>`; // dp-cal-wrap
    // Legend explaining the day-state colors
    h+=`<div class="vs-dp-legend">
      <span class="vs-dp-lg-item"><span class="vs-dp-lg-sw vs-dp-lg-turn"></span>Turn / Checkout / Check-in <em>(ideal — property is empty 10am-4pm)</em></span>
      <span class="vs-dp-lg-item"><span class="vs-dp-lg-sw vs-dp-lg-open"></span>Open day <em>(could get booked later)</em></span>
      <span class="vs-dp-lg-item"><span class="vs-dp-lg-sw vs-dp-lg-locked"></span>Guest in house <em>(not schedulable — ask admin)</em></span>
    </div>`;
    // Confirm / Cancel footer
    const selLabel=vDpState.selected?vsFmtDate(vDpState.selected):'—';
    const canConfirm=!!vDpState.selected;
    h+=`<div class="vs-dp-footer">
      <div class="vs-dp-selected">${vDpState.selected?'Selected: <strong>'+selLabel+'</strong>':'No date selected yet'}</div>
      <div class="vs-dp-footer-btns">
        <button class="btn" onclick="window._vsClosePicker()">Cancel</button>
        <button class="btn btn-g" ${canConfirm?'':'disabled style="opacity:.4;cursor:not-allowed"'} onclick="window._vsConfirmPicker()">Confirm</button>
      </div>
    </div></div></div>`;
    modal.innerHTML=h;
  }

  window._vsDpNav=function(dir){
    const newMo=vDpState.viewMonth+dir;
    const d=new Date(vDpState.viewYear,newMo,1);
    vDpState.viewYear=d.getFullYear();
    vDpState.viewMonth=d.getMonth();
    vsRenderPicker();
  };

  window._vsSelDate=function(ds){
    // Booked days can't reach this handler — they render without an onclick.
    vDpState.selected=ds;
    vsRenderPicker();
  };

  window._vsConfirmPicker=async function(){
    if(!vDpState.selected||!vDpState.taskId)return;
    const taskId=vDpState.taskId;
    const date=vDpState.selected;
    // Lock the confirm button to prevent double-submit
    const footerBtns=document.querySelector('.vs-dp-footer-btns');
    if(footerBtns){footerBtns.querySelectorAll('button').forEach(b=>{b.disabled=true;b.style.opacity='.5';});}
    try{
      const r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action:'selfSchedule',taskId,date})});
      if(!r.ok){
        const err=await r.json().catch(()=>({error:'Unknown error'}));
        alert('Could not save: '+(err.error||'Please try again.'));
        if(footerBtns){footerBtns.querySelectorAll('button').forEach(b=>{b.disabled=false;b.style.opacity='';});}
        return;
      }
      // Show success panel — same content admin would text if they scheduled.
      // vNeedsSched still contains the task pre-refresh (full prop fields).
      // If the task isn't in vNeedsSched (e.g. vendor changing an already-dated
      // task's date), we still show a success panel using vTasks as fallback.
      const inNeeds=(vNeedsSched||[]).some(t=>t.id===taskId);
      if(inNeeds){
        vsRenderScheduledSuccess([taskId],date);
      }else{
        // Rescheduled an already-dated task — pull from vTasks snapshot
        const t=(vTasks||[]).find(x=>x.id===taskId);
        if(t){
          // Prime a temp list so vsRenderScheduledSuccess can find it
          const prev=vNeedsSched;vNeedsSched=[t];
          vsRenderScheduledSuccess([taskId],date);
          vNeedsSched=prev;
        }else{
          window._vsCloseAndScroll(date);
        }
      }
    }catch(e){
      alert('Network error. Please try again.');
      if(footerBtns){footerBtns.querySelectorAll('button').forEach(b=>{b.disabled=false;b.style.opacity='';});}
    }
  };

  // Boot vendor sheet
  vsLoad();
})();

// ── Guest Context in Task Detail — show reservation + messages ──
async function renderGuestContext(t,p){
  const el=document.getElementById('d-guest-context');
  if(!el)return;
  el.innerHTML='';
  if(!t.property)return;
  const pid=t.property;
  const hospId=HOSPITABLE_IDS[pid];
  if(!hospId)return;

  // Find the relevant reservation: match by date overlap or closest upcoming
  let evs=icalCache[pid];
  if(!evs||evs==='error'){evs=await fetchIcal(pid);if(evs==='error')return;}

  // Find reservation that overlaps with task date, or closest upcoming
  let bestRes=null;
  const taskDate=t.date?new Date(t.date+'T12:00:00'):new Date();
  evs.forEach(ev=>{
    if(!ev.start||!ev.end)return;
    // Check if task date falls within reservation stay
    if(taskDate>=ev.start&&taskDate<=ev.end){
      bestRes=ev;
    }
    // Also check: next upcoming arrival if no overlap
    if(!bestRes&&ev.start>=new Date()){
      if(!bestRes||ev.start<bestRes.start)bestRes=ev;
    }
  });

  if(!bestRes||!bestRes.reservationId)return;

  // Render basic reservation info immediately
  const checkin=bestRes.start.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const checkout=bestRes.end.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  el.innerHTML=`<div class="stitle">Guest & Reservation</div>
    <div class="gc-wrap">
      <div class="gc-guest">${escHtml(bestRes.summary)}</div>
      <div class="gc-meta">${checkin} – ${checkout}${bestRes.platform?' · '+bestRes.platform:''}</div>
      <div class="gc-msgs" id="d-gc-msgs"><div class="gc-loading">Loading messages...</div></div>
    </div>`;

  // Fetch message thread in background
  try{
    const r=await fetch(`${PROXY_BASE}/api/hospitable?action=messages&rid=${bestRes.reservationId}`);
    if(!r.ok)throw new Error('API '+r.status);
    const json=await r.json();
    const msgsEl=document.getElementById('d-gc-msgs');
    if(!msgsEl)return;
    const msgs=(json.data||[]).slice(-10); // show last 10 messages
    if(!msgs.length){msgsEl.innerHTML='<div class="gc-loading">No messages yet.</div>';return;}
    let mh='';
    msgs.forEach(m=>{
      const isHost=m.sender_type==='host'||m.sender?.type==='host'||m.direction==='outgoing';
      const cls=isHost?'host':'guest';
      const sender=isHost?'Host':(bestRes.summary||'Guest');
      const time=m.created_at?new Date(m.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'';
      const body=m.body||m.message||m.text||'';
      mh+=`<div class="gc-msg ${cls}">
        <div class="gc-msg-sender">${escHtml(sender)}</div>
        <div>${escHtml(body.slice(0,500))}${body.length>500?'...':''}</div>
        ${time?`<div class="gc-msg-time">${time}</div>`:''}
      </div>`;
    });
    msgsEl.innerHTML=mh;
  }catch(e){
    console.warn('Could not load guest messages:',e.message);
    const msgsEl=document.getElementById('d-gc-msgs');
    if(msgsEl)msgsEl.innerHTML='<div class="gc-loading">Messages unavailable.</div>';
  }
}

// START
async function initApp(){
  startExpiryWatcher();
  await load();
  await loadSettings();
  await loadReplacements();
  await loadSmsTemplate();
  await loadCombinedSmsTemplate();
  await loadLogo();
  await loadRoadmap();
  populatePropSel('f-property');
  populatePropMulti('r-props');
  populatePropFilter();
  renderAll();
  hbStartPolling();
  await loadVendorReports(); // load vendor field reports
  clFetch(); // pre-load cleaning log in background
  cleanupOldPhotos(); // auto-delete photos from tasks resolved 30+ days ago
}
if(!window._vendorMode && !window._cleanerViewMode) initApp();

// ── Cleaner View (public, read-only) ─────────────────────────
// When loaded with #cv/{token}, fetch token data, then load and display cleaning performance
if (window._cleanerViewMode) {
  (async function initCleanerView() {
    const API = 'https://storybook-webhook.vercel.app';
    const token = window._cleanerViewToken;
    const loaderEl = document.getElementById('cv-loader');
    const loaderSub = document.getElementById('cv-loader-sub');
    const loaderBar = document.getElementById('cv-loader-bar');
    const loaderBadge = document.getElementById('cv-loader-badge');
    const loaderBadgeText = document.getElementById('cv-loader-badge-text');
    const contentWrap = document.getElementById('cv-content-wrap');
    const errorEl = document.getElementById('cv-error');
    const contentEl = document.getElementById('cv-content');
    const subtitleEl = document.getElementById('cv-subtitle');

    try {
      // 1. Validate token and get property list
      const res = await fetch(`${API}/api/cleaner-view?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error('Invalid link');
      const tokenData = await res.json();
      const cvName = tokenData.name;
      const cvProps = tokenData.properties;

      if (loaderSub) loaderSub.textContent = `${cvName}'s Cabins`;
      if (subtitleEl) subtitleEl.textContent = `Cleaning Performance — ${cvName}`;
      document.title = `${cvName} — Cleaning Performance`;

      // Start the loader bar
      setTimeout(() => { if (loaderBar) loaderBar.style.width = '100%'; }, 800);

      // 2. Fetch cleaning reviews — 6 months of data for comparison
      const hospEntries = Object.entries(HOSPITABLE_IDS).filter(([pid]) => cvProps.includes(pid));
      const cvAllRatings = {};
      const cvFlaggedData = [];
      const batchSize = 4;
      const sixMonthStart = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);

      for (let i = 0; i < hospEntries.length; i += batchSize) {
        const batch = hospEntries.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(async ([pid, hospId]) => {
            const url = `${API}/api/hospitable?action=reviews&pid=${hospId}&start=${sixMonthStart}&end=${today}`;
            const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!r.ok) return [];
            const d = await r.json();
            return (d.data || []).map(rv => ({ ...rv, _pid: pid }));
          })
        );
        for (const result of results) {
          if (result.status !== 'fulfilled') continue;
          for (const rv of result.value) {
            const pid = rv._pid;
            const cleanRating = (rv.private?.detailed_ratings || []).find(r => r.type === 'cleanliness');
            if (cleanRating && cleanRating.rating > 0) {
              if (!cvAllRatings[pid]) cvAllRatings[pid] = [];
              const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || 'Anonymous';
              const feedback = rv.private?.feedback || '';
              const publicReview = rv.public?.review || '';
              const ratingComments = (rv.private?.detailed_ratings || []).filter(r => r.comment).map(r => r.comment).join('; ');
              cvAllRatings[pid].push({
                rating: cleanRating.rating,
                reviewedAt: rv.reviewed_at,
                guest, checkIn: rv.reservation?.check_in || '', checkOut: rv.reservation?.check_out || '',
                overallRating: rv.public?.rating || 0,
                text: feedback || publicReview || ratingComments || '',
                source: feedback ? 'private feedback' : 'public review',
                isFlagged: false,
              });
            }
            if (typeof clIsCleaningRelevant === 'function' && clIsCleaningRelevant(rv)) {
              const entry = clBuildEntry(rv);
              entry.isFlagged = true;
              cvFlaggedData.push(entry);
              if (cvAllRatings[pid]) {
                const match = cvAllRatings[pid].find(r => r.reviewedAt === rv.reviewed_at);
                if (match) match.isFlagged = true;
              }
            }
          }
        }
      }

      // 3. Compute stats (needed for badge)
      const now = Date.now();
      const sixtyDaysAgo = now - 60 * 86400000;
      const allPropStats = {};
      for (const pid of cvProps) {
        const ratings = cvAllRatings[pid] || [];
        const recent = ratings.filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo);
        const sixMo = ratings.filter(r => new Date(r.reviewedAt).getTime() <= sixtyDaysAgo);
        const recentAvg = recent.length ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : null;
        const sixMoAvg = sixMo.length ? sixMo.reduce((s, r) => s + r.rating, 0) / sixMo.length : null;
        const perfect = recent.filter(r => r.rating === 5).length;
        const flags = cvFlaggedData.filter(e => e.pid === pid);
        const recentFlags = flags.filter(e => new Date(e.reviewedAt).getTime() > sixtyDaysAgo);
        allPropStats[pid] = { recentReviews: recent.length, recentAvg, sixMoAvg, perfect, totalReviews: ratings.length, totalFlags: flags.length, recentFlags: recentFlags.length };
      }

      const eliteCount = cvProps.filter(pid => {
        const s = allPropStats[pid];
        return s && s.recentReviews >= 3 && s.recentAvg !== null && Math.round(s.recentAvg * 10) / 10 >= 4.8;
      }).length;

      // 4. Show badge on loader, wait, then reveal content
      if (loaderBadgeText) loaderBadgeText.textContent = `${eliteCount} of ${cvProps.length} properties at elite level this period`;
      if (loaderBadge) {
        loaderBadge.style.opacity = '1';
        loaderBadge.style.transform = 'translateY(0)';
      }

      await new Promise(r => setTimeout(r, 600));

      // Fade out loader, fade in content
      if (loaderEl) loaderEl.classList.add('hidden');
      contentEl.style.display = 'block';
      contentWrap.style.opacity = '1';

      cvRender(cvName, cvProps, cvAllRatings, cvFlaggedData, allPropStats, eliteCount);

    } catch (e) {
      console.error('[cleaner-view] Init error:', e.message);
      if (loaderEl) loaderEl.classList.add('hidden');
      if (contentWrap) contentWrap.style.opacity = '1';
      if (errorEl) errorEl.style.display = 'block';
    }
  })();
}

// ── Gamified render for cleaner view ──────────────────────────
function cvRender(cvName, cvProps, cvAllRatings, cvFlaggedData, allPropStats, eliteCount) {
  const summaryEl = document.getElementById('cv-summary');
  const logEl = document.getElementById('cv-log');
  if (!summaryEl || !logEl) return;

  const now = Date.now();
  const sixtyDaysAgo = now - 60 * 86400000;

  // Categorize properties
  const winnerPids = cvProps.filter(pid => {
    const s = allPropStats[pid];
    return s && s.recentReviews >= 3 && s.recentAvg !== null && Math.round(s.recentAvg * 10) / 10 >= 4.8;
  }).sort((a, b) => (allPropStats[b].recentAvg || 0) - (allPropStats[a].recentAvg || 0));

  const nearlyPids = cvProps.filter(pid => {
    const s = allPropStats[pid];
    const avg = s && s.recentAvg !== null ? Math.round(s.recentAvg * 100) / 100 : null;
    return s && s.recentReviews >= 3 && avg !== null && avg >= 4.7 && Math.round(s.recentAvg * 10) / 10 < 4.8;
  }).sort((a, b) => (allPropStats[b].recentAvg || 0) - (allPropStats[a].recentAvg || 0));

  const attentionPids = cvProps.filter(pid => {
    const s = allPropStats[pid];
    const avg = s && s.recentAvg !== null ? Math.round(s.recentAvg * 100) / 100 : null;
    return s && s.recentReviews >= 3 && avg !== null && avg < 4.7;
  }).sort((a, b) => (allPropStats[a].recentAvg || 5) - (allPropStats[b].recentAvg || 5));

  const noDataPids = cvProps.filter(pid => { const s = allPropStats[pid]; return !s || s.recentReviews < 3; });

  // Overall stats
  const totalReviews = Object.values(allPropStats).reduce((s, p) => s + p.recentReviews, 0);
  const allRecentRatings = cvProps.flatMap(pid => (cvAllRatings[pid] || []).filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo));
  const overallAvg = allRecentRatings.length ? (allRecentRatings.reduce((s, r) => s + r.rating, 0) / allRecentRatings.length).toFixed(1) : '—';

  let sumH = '';

  // Hero bar
  sumH += `<div class="cv-hero">
    <div>
      <div class="cv-hero-name">${escHtml(cvName)}'s Properties</div>
      <div class="cv-hero-meta">${cvProps.length} properties · ${totalReviews} reviews in last 60 days · ${overallAvg}/5 avg cleanliness</div>
    </div>
    <div class="cv-hero-badge"><span class="star">★</span> ${eliteCount} of ${cvProps.length} properties at elite level this period</div>
  </div>`;

  // Helper: build a card
  function cvCard(pid, cardClass, sectionIdx, cardIdx) {
    const p = getProp(pid);
    if (!p) return '';
    const s = allPropStats[pid];
    const recentAvg = s.recentAvg !== null ? s.recentAvg.toFixed(1) : '—';
    const sixMoAvg = s.sixMoAvg !== null ? s.sixMoAvg.toFixed(1) : '—';
    const perfect = s.perfect || 0;

    // Trend pill (suppress downtrend for top performers to preserve positive energy)
    let trendH = '';
    if (s.recentAvg !== null && s.sixMoAvg !== null) {
      const diff = s.recentAvg - s.sixMoAvg;
      if (diff > 0.05) trendH = `<div class="cv-trend up">↑ up from ${sixMoAvg} · 6-month avg</div>`;
      else if (diff < -0.05) {
        if (cardClass === 'cv-winner-card') {
          trendH = `<div class="cv-trend elite">✓ Holding at elite level</div>`;
        } else {
          trendH = `<div class="cv-trend down">↓ down from ${sixMoAvg} · 6-month avg</div>`;
        }
      } else if (diff >= -0.05) trendH = `<div class="cv-trend flat">→ holding at ${recentAvg}</div>`;
    } else if (s.sixMoAvg === null) {
      trendH = `<div class="cv-trend flat">— not enough 6-month data</div>`;
    }

    // Flags for nearly-made-it and needs-attention
    let flagsH = '';
    if ((cardClass === 'cv-nearly-card' || cardClass === 'cv-attention-card') && cvFlaggedData.length > 0) {
      const propFlags = cvFlaggedData.filter(f => f.pid === pid);
      if (propFlags.length > 0) {
        flagsH = propFlags.slice(0, 2).map(f => `<div class="cv-flag-item"><span class="cv-flag-guest">${escHtml(f.guest)}</span><span class="cv-flag-text">${escHtml(f.text.substring(0, 60))}</span></div>`).join('');
        if (propFlags.length > 2) flagsH += `<div class="cv-flag-more">+${propFlags.length - 2} more flag${propFlags.length > 3 ? 's' : ''}</div>`;
        flagsH = `<div class="cv-flags">${flagsH}</div>`;
      }
    }

    return `<div class="${cardClass}" onclick="cvShowPropDetail('${pid}')">
      <div class="cv-card-name">${escHtml(p.name)}</div>
      <div class="cv-card-rating-row"><span class="cv-card-rating-label">60-day cleaning avg</span><span class="cv-card-rating-value">${recentAvg} / 5</span></div>
      <div class="cv-card-sub">${perfect}/${s.recentReviews} Excellent Cleaning Reviews</div>
      ${trendH}${flagsH}
      <div class="cv-comp-row"><div class="cv-comp-col"><span class="cv-comp-val">${recentAvg}</span><span class="cv-comp-lbl">Last 60 days</span></div><div class="cv-comp-divider"></div><div class="cv-comp-col"><span class="cv-comp-val muted">${sixMoAvg}</span><span class="cv-comp-lbl">6-month avg</span></div></div>
    </div>`;
  }

  // Section 1: Top Performers
  if (winnerPids.length) {
    sumH += `<div class="cv-section" data-section="1"><div class="cv-section-hdr cv-winners"><span class="icon">★</span> Top Performers <span class="cv-section-count">4.8 or above · last 60 days</span></div><div class="cv-card-grid">`;
    winnerPids.forEach((pid, i) => { sumH += cvCard(pid, 'cv-winner-card', 1, i); });
    sumH += '</div></div>';
  }

  // Section 2: Good Performers
  if (nearlyPids.length) {
    sumH += `<div class="cv-section" data-section="2"><div class="cv-section-hdr cv-nearly"><span class="icon">◎</span> Good Performers <span class="cv-section-count">4.7 – 4.79 · just below elite</span></div><div class="cv-card-grid">`;
    nearlyPids.forEach((pid, i) => { sumH += cvCard(pid, 'cv-nearly-card', 2, i); });
    sumH += '</div></div>';
  }

  // Section 3: Needs Attention
  if (attentionPids.length) {
    sumH += `<div class="cv-section" data-section="3"><div class="cv-section-hdr cv-attention"><span class="icon">△</span> Needs Attention <span class="cv-section-count">${attentionPids.length} propert${attentionPids.length !== 1 ? 'ies' : 'y'}</span></div><div class="cv-card-grid">`;
    attentionPids.forEach((pid, i) => { sumH += cvCard(pid, 'cv-attention-card', 3, i); });
    sumH += '</div></div>';
  }

  // Not enough data
  if (noDataPids.length) {
    sumH += `<div class="cv-section" data-section="4"><div class="cv-section-hdr" style="color:var(--text2)"><span class="icon">○</span> Not Enough Data <span class="cv-section-count">${noDataPids.length} propert${noDataPids.length !== 1 ? 'ies' : 'y'} · need 3+ reviews</span></div><div class="cv-card-grid">`;
    for (const pid of noDataPids) {
      const p = getProp(pid);
      if (!p) continue;
      const s = allPropStats[pid] || {};
      sumH += `<div class="cv-attention-card" onclick="cvShowPropDetail('${pid}')" style="opacity:.6"><div class="cv-card-name">${escHtml(p.name)}</div><div class="cv-card-sub">${s.recentReviews || 0} reviews in last 60 days (need 3+)</div></div>`;
    }
    sumH += '</div></div>';
  }

  if (!winnerPids.length && !nearlyPids.length && !attentionPids.length && !noDataPids.length) {
    sumH += '<div class="cl-empty">No review data available for these properties.</div>';
  }

  summaryEl.innerHTML = sumH;
  window._cvData = { cvName, cvProps, cvAllRatings, cvFlaggedData, allPropStats, eliteCount };

  // Flags and reviews shown only in property detail view, not on main overview
  logEl.innerHTML = '';

  // Animate sections sequentially (fast)
  const SECTION_DELAYS = [0.05, 0.25, 0.45, 0.65, 0.85];
  const sections = summaryEl.querySelectorAll('.cv-section');
  sections.forEach((sec, i) => {
    const delay = SECTION_DELAYS[i] || (i * 0.2);
    setTimeout(() => {
      sec.classList.add('animate');
      // Stagger cards within this section
      const cards = sec.querySelectorAll('.cv-winner-card, .cv-nearly-card, .cv-attention-card');
      cards.forEach((card, j) => {
        setTimeout(() => {
          card.classList.add('animate');
          // Trigger progress bar fills
          const fill = card.querySelector('.cv-progress-fill');
          if (fill) fill.style.width = fill.dataset.width;
        }, j * 50);
      });
    }, delay * 1000);
  });
  // Animate log section
  const logSections = logEl.querySelectorAll('.cv-section');
  logSections.forEach((sec, i) => {
    setTimeout(() => sec.classList.add('animate'), (SECTION_DELAYS[sections.length + i] || 1.0) * 1000);
  });
}

function cvEntryHtml(e, showPropName) {
  const prop = getProp(e.pid);
  const dateStr = new Date(e.reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const checkIn = e.checkIn || e.check_in || '';
  const checkOut = e.checkOut || e.check_out || '';
  const stayStr = checkIn ? `${new Date(checkIn).toLocaleDateString('en-US', {month:'short',day:'numeric'})} – ${new Date(checkOut).toLocaleDateString('en-US', {month:'short',day:'numeric'})}` : '';
  const cleanRating = e.cleanlinessRating ?? e.rating ?? null;
  let ratingClass = 'good';
  if (cleanRating !== null) {
    if (cleanRating <= 2) ratingClass = 'bad';
    else if (cleanRating <= 3) ratingClass = 'ok';
  }
  return `<div class="cl-entry"${e.isFlagged ? ' style="border-left:3px solid var(--red)"' : ''}>
    <div class="cl-entry-hdr">
      <div>
        <span class="cl-entry-date">${dateStr}</span>
        ${showPropName ? `<span style="font-size:.74rem;color:var(--green);margin-left:8px;font-weight:600">${escHtml(prop?.name || e.pid)}</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${cleanRating !== null ? `<span class="cl-entry-rating ${ratingClass}">Cleaning: ${cleanRating}/5</span>` : ''}
      </div>
    </div>
    ${e.text ? `<div class="cl-entry-text">${escHtml((e.text || '').length > 500 ? e.text.slice(0, 500) + '...' : e.text)}</div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <span class="cl-entry-guest">Guest: ${escHtml(e.guest || 'Anonymous')}${stayStr ? ' · Stay: ' + stayStr : ''}</span>
      ${e.source ? `<span class="cl-entry-source">Source: ${e.source}</span>` : ''}
    </div>
  </div>`;
}

// Drill into a specific property in cleaner view
function cvShowPropDetail(pid) {
  if (!window._cvData) return;
  const { cvAllRatings, allPropStats, cvFlaggedData } = window._cvData;
  const summaryEl = document.getElementById('cv-summary');
  const logEl = document.getElementById('cv-log');
  if (!summaryEl || !logEl) return;

  const p = getProp(pid);
  const propRatings = (cvAllRatings[pid] || []).slice().sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
  const s = allPropStats[pid] || {};
  const sixtyDaysAgo = Date.now() - 60 * 86400000;
  const sixtyDayRatings = propRatings.filter(r => new Date(r.reviewedAt) > new Date(sixtyDaysAgo));
  const recentAvg = sixtyDayRatings.length ? (sixtyDayRatings.reduce((s, r) => s + r.rating, 0) / sixtyDayRatings.length).toFixed(1) : '—';
  const allAvg = propRatings.length ? (propRatings.reduce((s, r) => s + r.rating, 0) / propRatings.length).toFixed(1) : '—';
  const perfect = sixtyDayRatings.filter(r => r.rating === 5).length;

  summaryEl.innerHTML = `<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin-bottom:16px;box-shadow:var(--shadow)">
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;color:var(--green)">${escHtml(p?.name || pid)}</div>
    <div style="font-size:.78rem;color:var(--text);margin-top:6px;font-weight:600">60-Day Cleaning Rating: <span style="color:${parseFloat(recentAvg) >= 4.8 ? 'var(--green)' : 'var(--red)'}">${recentAvg}/5</span> · ${sixtyDayRatings.length} reviews · ${perfect} perfect</div>
    <div style="margin-top:8px"><button class="btn" style="font-size:.72rem;padding:4px 12px" onclick="cvBackToOverview()">← Back to overview</button></div>
  </div>`;

  // Show flags for this property
  const propFlags = (cvFlaggedData || []).filter(f => f.pid === pid && new Date(f.reviewedAt).getTime() > sixtyDaysAgo);
  let h = '';
  if (propFlags.length > 0) {
    h += `<div style="background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.2);border-radius:8px;padding:12px 14px;margin-bottom:16px">
      <div style="font-size:.85rem;font-weight:600;color:var(--red);margin-bottom:8px">⚠ Recent Flags (${propFlags.length})</div>
      ${propFlags.map(f => {
        const dateStr = new Date(f.reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return `<div style="font-size:.75rem;margin-bottom:8px;padding:8px;background:var(--white);border-radius:4px;border-left:3px solid var(--red)">
          <div style="font-weight:600;color:var(--text)">${escHtml(f.guest)}</div>
          <div style="font-size:.7rem;color:var(--text3);margin-top:2px">${dateStr} · Cleaning: ${f.cleanlinessRating}/5 · ${f.source}</div>
          <div style="color:var(--text2);margin-top:4px">${escHtml(f.text)}</div>
        </div>`;
      }).join('')}
    </div>`;
  }

  // Show all reviews for this property
  const recent = propRatings.filter(r => new Date(r.reviewedAt).getTime() > sixtyDaysAgo);
  const older = propRatings.filter(r => new Date(r.reviewedAt).getTime() <= sixtyDaysAgo);
  if (recent.length) {
    h += recent.map(e => cvEntryHtml({ ...e, pid: pid }, false)).join('');
  } else {
    h += '<div style="color:var(--text2);font-size:.82rem;padding:12px 0;font-style:italic">No cleaning reviews in the last 60 days.</div>';
  }
  if (older.length) {
    h += `<div style="margin-top:16px"><button class="btn" id="cv-older-btn" style="width:100%;text-align:center;font-size:.8rem;padding:10px" onclick="document.getElementById('cv-older-entries').style.display='';this.style.display='none'">Older Reviews (${older.length})</button>`;
    h += `<div id="cv-older-entries" style="display:none;margin-top:8px">${older.map(e => cvEntryHtml({ ...e, pid: pid }, false)).join('')}</div></div>`;
  }
  if (!propRatings.length) {
    h += '<div class="cl-empty">No cleaning ratings for this property.</div>';
  }
  logEl.innerHTML = h;

  // Scroll to top of the property detail on mobile — flags are at the top
  const topEl = document.getElementById('cv-summary');
  if (topEl) topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cvBackToOverview() {
  if (!window._cvData) return;
  const { cvName, cvProps, cvAllRatings, cvFlaggedData, allPropStats, eliteCount } = window._cvData;
  cvRender(cvName, cvProps, cvAllRatings, cvFlaggedData, allPropStats, eliteCount);
  // Scroll back to top of overview
  const topEl = document.getElementById('cv-summary');
  if (topEl) topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ════════════════════════════════════════════════════════════════
// ═══════════════  PROPERTY BIBLE — Deploy 1  ════════════════════
// ════════════════════════════════════════════════════════════════
// KV keys:
//   se_pp         → { [propertyId]: profile }  (18 cabins)
//   se_pp_stashes → { [stashId]: stash }
//   se_pp_log     → append-only array of change records
//
// Visibility tiers are encoded at the SECTION level in the schema doc.
// Deploy 1 hard-codes the current role to 'admin' so Chip sees every
// field. When Deploy 2 introduces real vendors, flip PP_ROLE via the
// auth layer and the same render code will filter automatically.
const PP_ROLE = 'admin'; // 'admin' | 'operator' | 'vendor'
const PP_VIS_ORDER = { admin: 3, operator: 2, vendor: 1 };
function ppCanSee(tier) {
  return (PP_VIS_ORDER[PP_ROLE] || 0) >= (PP_VIS_ORDER[tier] || 0);
}
// Per-section visibility — matches property-profile-schema.md v0.1
const PP_SECTION_VIS = {
  connected_properties: 'vendor',
  access: 'operator',
  hvac: 'vendor',
  appliances: 'vendor',
  utilities: 'vendor',
  safety: 'vendor',
  outstanding_issues: 'admin',
};
// Fields within `access` that are admin-only (never leak to vendors even inside an operator-tier section)
const PP_ADMIN_PATHS = [
  'access.front_door.code',
  'access.exterior_backup_key.combo',
  'access.exterior_backup_key.location',
  'access.exterior_backup_key.last_verified',
  'access.exterior_backup_key.status',
  'access.exterior_backup_key.currently_holds_keys_for_other_cabins',
  'access.interior_master_key.combo',
  'access.interior_master_key.location',
  'access.interior_master_key.last_verified',
];
function ppPathIsAdmin(path) {
  return PP_ADMIN_PATHS.some((p) => path === p || path.startsWith(p + '.'));
}

let PP = null;
let PP_STASHES = null;
let PP_LOG = null;
let ppLoaded = false;
let ppLoading = false;
let ppCurrentId = null;
let ppTab = 'list'; // list | detail | inbox
let ppEditingPath = null;

function ppEsc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function ppHumanLabel(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function ppGetPath(obj, path) {
  return path.split('.').reduce((o, k) => {
    if (o == null) return undefined;
    if (/^\d+$/.test(k)) return o[parseInt(k, 10)];
    return o[k];
  }, obj);
}
function ppSetPath(obj, path, val) {
  const keys = path.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextKey = keys[i + 1];
    if (o[k] == null) o[k] = /^\d+$/.test(nextKey) ? [] : {};
    o = /^\d+$/.test(k) ? o[parseInt(k, 10)] : o[k];
  }
  const last = keys[keys.length - 1];
  if (/^\d+$/.test(last)) o[parseInt(last, 10)] = val;
  else o[last] = val;
}

async function ppLoadIfNeeded() {
  if (ppLoaded || ppLoading) {
    if (ppLoaded) ppRender();
    return;
  }
  ppLoading = true;
  const wrap = document.getElementById('pp-list-wrap');
  if (wrap) wrap.innerHTML = '<div class="pp-empty">Loading Property Bible…</div>';
  try {
    const [pp, stashes, log] = await Promise.all([S.get('se_pp'), S.get('se_pp_stashes'), S.get('se_pp_log')]);
    PP = pp && pp.value ? JSON.parse(pp.value) : {};
    PP_STASHES = stashes && stashes.value ? JSON.parse(stashes.value) : {};
    PP_LOG = log && log.value ? JSON.parse(log.value) : [];
    if (!Array.isArray(PP_LOG)) PP_LOG = [];
    ppLoaded = true;
  } catch (e) {
    console.error('[pp] load failed', e);
    if (wrap) wrap.innerHTML = '<div class="pp-empty">Failed to load Property Bible. Check your connection.</div>';
    ppLoading = false;
    return;
  }
  ppLoading = false;
  ppRender();
}

async function ppSave(key, value) {
  try {
    await S.set(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('[pp] save failed', key, e);
    if (typeof showToast === 'function') showToast('❌ Property save failed','','',5000);
    return false;
  }
}

function ppRender() {
  const listWrap = document.getElementById('pp-list-wrap');
  const detailWrap = document.getElementById('pp-detail-wrap');
  const inboxWrap = document.getElementById('pp-inbox-wrap');
  const invWrap = document.getElementById('pp-inv-wrap');
  if (!listWrap) return;
  listWrap.style.display = ppTab === 'list' ? '' : 'none';
  detailWrap.style.display = ppTab === 'detail' ? '' : 'none';
  inboxWrap.style.display = ppTab === 'inbox' ? '' : 'none';
  if (invWrap) invWrap.style.display = ppTab === 'inventory' ? '' : 'none';
  // Update tab buttons
  const tabList = document.getElementById('pp-tab-list');
  const tabInbox = document.getElementById('pp-tab-inbox');
  const tabInv = document.getElementById('pp-tab-inv');
  if (tabList && tabInbox) {
    // Cabins tab is active in 'list' and 'detail' (drill-down) modes
    tabList.classList.toggle('active', ppTab === 'list' || ppTab === 'detail');
    tabInbox.classList.toggle('active', ppTab === 'inbox');
    if (tabInv) tabInv.classList.toggle('active', ppTab === 'inventory');
  }
  const inboxCount = ppInboxCount();
  const badge = document.getElementById('pp-inbox-badge');
  if (badge) badge.textContent = inboxCount;

  if (ppTab === 'list') ppRenderList();
  else if (ppTab === 'detail') ppRenderDetail();
  else if (ppTab === 'inbox') ppRenderInbox();
  else if (ppTab === 'inventory') ppRenderInventory();
}

function ppSwitchTab(tab) {
  ppTab = tab;
  if (tab !== 'detail') ppCurrentId = null;
  ppRender();
}

function ppRenderList() {
  const wrap = document.getElementById('pp-list-wrap');
  if (!PP || !Object.keys(PP).length) {
    wrap.innerHTML = '<div class="pp-empty">No property profiles loaded yet. Run the import script: <code>node import-property-bible.js --token=…</code></div>';
    return;
  }
  let html = '';
  NBS.forEach((nb) => {
    const cabinsInNb = nb.props.filter((pid) => PP[pid]);
    if (!cabinsInNb.length) return;
    html += `<div style="margin-bottom:22px">`;
    html += `<h3 style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--green);margin-bottom:10px;font-weight:600">${ppEsc(nb.name)} <span style="font-size:.72rem;color:var(--text3);font-weight:400">— ${ppEsc(nb.sub)}</span></h3>`;
    html += `<div class="pp-list">`;
    cabinsInNb.forEach((pid) => {
      const p = PP[pid];
      const gapCount = (p._gaps || []).length;
      const issueCount = (p.outstanding_issues || []).filter((i) => i.status === 'imported' || i.status === 'imported_for_promotion').length;
      const appProp = getProp(pid);
      // Backup-key status dot (admin tier only)
      let keyDot = '';
      if (ppCanSee('admin')) {
        const kStatus = p && p.access && p.access.exterior_backup_key && p.access.exterior_backup_key.status;
        // unknown/missing both render red (same urgency)
        const kCls = kStatus === 'ok' ? 'ok' : (kStatus ? 'warn' : 'bad');
        const kLabel = kStatus || 'unknown';
        keyDot = `<span class="pp-card-stat key ${kCls}" title="Exterior backup key: ${ppEsc(kLabel)}">🔑 ${ppEsc(kLabel)}</span>`;
      }
      html += `<div class="pp-card nb-${nb.cls}" onclick="ppOpenDetail('${pid}')">`;
      html += `<div class="pp-card-title">${ppEsc(p.property_name || (appProp && appProp.name) || pid)}</div>`;
      html += `<div class="pp-card-sub">${ppEsc(p.address || (appProp && appProp.address) || '')}</div>`;
      html += `<div class="pp-card-stats">`;
      html += `<span class="pp-card-stat ${gapCount ? 'gap' : 'ok'}">${gapCount ? '⚠' : '✓'} ${gapCount} gap${gapCount === 1 ? '' : 's'}</span>`;
      html += `<span class="pp-card-stat ${issueCount ? 'issue' : 'ok'}">${issueCount ? '!' : '✓'} ${issueCount} issue${issueCount === 1 ? '' : 's'}</span>`;
      html += keyDot;
      html += `</div></div>`;
    });
    html += `</div></div>`;
  });
  wrap.innerHTML = html;
}

function ppOpenDetail(pid) {
  ppCurrentId = pid;
  ppTab = 'detail';
  ppEditingPath = null;
  ppRender();
  window.scrollTo(0, 0);
}

function ppRenderDetail() {
  const wrap = document.getElementById('pp-detail-wrap');
  const p = PP && PP[ppCurrentId];
  if (!p) {
    wrap.innerHTML = '<div class="pp-empty">Profile not found.</div>';
    return;
  }
  const appProp = getProp(ppCurrentId);
  const activeIssues = (p.outstanding_issues || []).filter((i) => i.status === 'imported' || i.status === 'imported_for_promotion');
  const resolvedIssues = (p.outstanding_issues || []).filter((i) => i.status === 'promoted' || i.status === 'dismissed');

  let h = '<div class="pp-detail">';
  h += `<button class="pp-back" onclick="ppSwitchTab('list')">← Back to cabins</button>`;
  h += `<div class="pp-header">`;
  h += `<h2>${ppEsc(p.property_name || (appProp && appProp.name) || ppCurrentId)}</h2>`;
  h += `<div class="pp-addr">${ppEsc(p.address || (appProp && appProp.address) || '')}</div>`;
  h += `<div class="pp-meta">Schema v${ppEsc(p.schema_version || '0.1')} · Last updated ${ppEsc(p.last_updated || '—')}${p.last_updated_by ? ' by ' + ppEsc(p.last_updated_by) : ''}</div>`;
  h += `</div>`;

  // Inline gaps banner
  if ((p._gaps || []).length) {
    h += `<div class="pp-gap-banner"><h4>⚠ ${p._gaps.length} Data Gap${p._gaps.length === 1 ? '' : 's'}</h4><ul>`;
    p._gaps.forEach((g) => { h += `<li>${ppEsc(g)}</li>`; });
    h += `</ul></div>`;
  }

  // Inline outstanding issues
  if (activeIssues.length) {
    h += `<div class="pp-issue-banner"><h4>! ${activeIssues.length} Outstanding Issue${activeIssues.length === 1 ? '' : 's'}</h4>`;
    activeIssues.forEach((iss) => { h += ppRenderIssue(iss); });
    h += `</div>`;
  }
  if (resolvedIssues.length) {
    h += `<details style="margin-bottom:14px"><summary style="cursor:pointer;font-size:.74rem;color:var(--text3);padding:6px 0">Show ${resolvedIssues.length} resolved/dismissed issue${resolvedIssues.length === 1 ? '' : 's'}</summary><div class="pp-issue-banner" style="background:var(--surface2);border-color:var(--border)">`;
    resolvedIssues.forEach((iss) => { h += ppRenderIssue(iss); });
    h += `</div></details>`;
  }

  // Filter Service panel (Deploy 2)
  if (typeof fsRenderPanel === 'function') {
    h += fsRenderPanel(p);
  }

  // Sections — render every top-level key except the handled-inline ones
  const SKIP = new Set(['property_id', 'property_name', 'address', 'last_updated', 'last_updated_by', 'schema_version', '_gaps', '_notes', 'outstanding_issues', 'is_parent_listing']);
  const ORDER = ['neighborhood', 'resort_position', 'square_footage', 'bedrooms', 'bathrooms', 'max_occupancy', 'theme', 'connected_properties', 'access', 'hvac', 'appliances', 'utilities', 'safety'];
  const orderedKeys = ORDER.filter((k) => k in p).concat(Object.keys(p).filter((k) => !ORDER.includes(k) && !SKIP.has(k)));
  const simpleTopLevel = [];
  orderedKeys.forEach((k) => {
    const v = p[k];
    if (v === null || typeof v !== 'object') simpleTopLevel.push(k);
  });

  if (simpleTopLevel.length) {
    h += `<div class="pp-section"><div class="pp-section-head" onclick="this.parentNode.classList.toggle('collapsed')"><h3>Overview</h3><span class="caret">▾</span></div><div class="pp-section-body">`;
    simpleTopLevel.forEach((k) => { h += ppFieldHtml(k, p[k], k, 'vendor'); });
    h += `</div></div>`;
  }

  orderedKeys.forEach((k) => {
    const v = p[k];
    if (v === null || typeof v !== 'object') return;
    const tier = PP_SECTION_VIS[k] || 'vendor';
    if (!ppCanSee(tier)) return;
    h += ppRenderSection(k, v, k, tier);
  });

  // Notes
  if (p._notes) {
    h += `<div class="pp-section"><div class="pp-section-head" onclick="this.parentNode.classList.toggle('collapsed')"><h3>Admin Notes</h3><span class="caret">▾</span></div><div class="pp-section-body">`;
    h += ppFieldHtml('_notes', p._notes, '_notes', 'admin');
    h += `</div></div>`;
  }

  h += '</div>';
  wrap.innerHTML = h;
  if (ppEditingPath) ppStartEdit(ppEditingPath, true);
}

function ppRenderSection(title, data, path, tier) {
  const label = ppHumanLabel(title);
  const visTag = `<span class="pp-visibility-tag pp-vis-${tier}">${tier}</span>`;
  let h = `<div class="pp-section"><div class="pp-section-head" onclick="this.parentNode.classList.toggle('collapsed')"><h3>${ppEsc(label)} ${visTag}</h3><span class="caret">▾</span></div><div class="pp-section-body">`;
  h += ppRenderNode(data, path, tier);
  h += `</div></div>`;
  return h;
}

function ppRenderNode(data, path, tier) {
  if (data === null || data === undefined) return '<div class="pp-field-val unset">(empty)</div>';
  if (Array.isArray(data)) {
    if (!data.length) return '<div class="pp-field-val unset">(none)</div>';
    // Special-case connected_properties — render as link chips
    if (path === 'connected_properties') return ppRenderConnected(data);
    let h = '';
    data.forEach((item, idx) => {
      const subpath = path + '.' + idx;
      h += `<div class="pp-sub-item">`;
      if (typeof item === 'object' && item !== null) {
        h += ppRenderNode(item, subpath, tier);
      } else {
        h += ppFieldHtml('#' + (idx + 1), item, subpath, tier);
      }
      h += `</div>`;
    });
    return h;
  }
  if (typeof data === 'object') {
    let h = '';
    Object.keys(data).forEach((k) => {
      const v = data[k];
      const subpath = path + '.' + k;
      // Hide admin-only paths when role can't see them
      if (ppPathIsAdmin(subpath) && !ppCanSee('admin')) return;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        // Nested object — render as sub-group
        h += `<div class="pp-sub-title">${ppEsc(ppHumanLabel(k))}</div>`;
        h += `<div class="pp-sub-list">${ppRenderNode(v, subpath, tier)}</div>`;
      } else if (Array.isArray(v)) {
        h += `<div class="pp-sub-title">${ppEsc(ppHumanLabel(k))}</div>`;
        h += `<div class="pp-sub-list">${ppRenderNode(v, subpath, tier)}</div>`;
      } else {
        h += ppFieldHtml(k, v, subpath, tier);
      }
    });
    return h;
  }
  // Scalar at root — wrap in a field
  return ppFieldHtml(path.split('.').pop(), data, path, tier);
}

function ppRenderConnected(arr) {
  let h = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">';
  arr.forEach((rel) => {
    const label = rel.relationship ? ppHumanLabel(rel.relationship) : 'connection';
    if (rel.property_id) {
      const target = PP && PP[rel.property_id];
      const name = (target && target.property_name) || (getProp(rel.property_id) && getProp(rel.property_id).name) || rel.property_id;
      h += `<span class="pp-conn" onclick="ppOpenDetail('${rel.property_id}')">${ppEsc(label)}: ${ppEsc(name)}</span>`;
    } else if (Array.isArray(rel.property_ids)) {
      h += `<div style="flex-basis:100%;font-size:.7rem;color:var(--text3);margin-top:4px">${ppEsc(label)}:</div>`;
      rel.property_ids.forEach((pid) => {
        if (pid === ppCurrentId) return;
        const target = PP && PP[pid];
        const name = (target && target.property_name) || (getProp(pid) && getProp(pid).name) || pid;
        h += `<span class="pp-conn" onclick="ppOpenDetail('${pid}')">${ppEsc(name)}</span>`;
      });
    }
    if (rel.notes) {
      h += `<div style="flex-basis:100%;font-size:.72rem;color:var(--text2);padding:4px 4px 8px;line-height:1.4">${ppEsc(rel.notes)}</div>`;
    }
  });
  h += '</div>';
  return h;
}

function ppFieldHtml(label, val, path, tier) {
  const escPath = ppEsc(path);
  let valHtml;
  if (val === null || val === undefined || val === '') {
    valHtml = `<div class="pp-field-val unset" data-pp-path="${escPath}" onclick="ppStartEdit('${escPath}')">(not set)</div>`;
  } else if (typeof val === 'boolean') {
    valHtml = `<div class="pp-field-val bool-${val ? 'true' : 'false'}" data-pp-path="${escPath}" onclick="ppStartEdit('${escPath}')">${val ? '✓ yes' : '✗ no'}</div>`;
  } else if (typeof val === 'object') {
    // Inline JSON display for edge cases
    valHtml = `<div class="pp-field-val" data-pp-path="${escPath}">${ppEsc(JSON.stringify(val))}</div>`;
  } else {
    valHtml = `<div class="pp-field-val" data-pp-path="${escPath}" onclick="ppStartEdit('${escPath}')">${ppEsc(val)}</div>`;
  }
  return `<div class="pp-field"><div class="pp-field-label">${ppEsc(ppHumanLabel(label))}</div>${valHtml}</div>`;
}

function ppStartEdit(path, rehydrate) {
  ppEditingPath = path;
  const p = PP && PP[ppCurrentId];
  if (!p) return;
  const cur = ppGetPath(p, path);
  const el = document.querySelector(`[data-pp-path="${CSS.escape(path)}"]`);
  if (!el) return;
  const curStr = cur === null || cur === undefined ? '' : String(cur);
  const isBool = typeof cur === 'boolean';
  const isLong = !isBool && curStr.length > 60;
  const field = el.parentNode;
  const escPath = ppEsc(path);
  let editor;
  if (isBool) {
    editor = `<select id="pp-ed-${escPath}"><option value="true"${cur ? ' selected' : ''}>yes</option><option value="false"${!cur ? ' selected' : ''}>no</option><option value="null">(unset)</option></select>`;
  } else if (isLong) {
    editor = `<textarea id="pp-ed-${escPath}">${ppEsc(curStr)}</textarea>`;
  } else {
    editor = `<input type="text" id="pp-ed-${escPath}" value="${ppEsc(curStr)}">`;
  }
  const html = `<div class="pp-field-edit">${editor}<button class="save" onclick="ppCommitEdit('${escPath}')">Save</button><button class="cancel" onclick="ppCancelEdit()">Cancel</button></div>`;
  // Replace the value element with the editor
  el.outerHTML = html;
  const input = document.getElementById('pp-ed-' + path);
  if (input) {
    input.focus();
    if (input.select) input.select();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !(input.tagName === 'TEXTAREA' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        ppCommitEdit(path);
      } else if (e.key === 'Escape') {
        ppCancelEdit();
      }
    });
  }
}

function ppCancelEdit() {
  ppEditingPath = null;
  ppRenderDetail();
}

async function ppCommitEdit(path) {
  const input = document.getElementById('pp-ed-' + path);
  if (!input) return;
  const raw = input.value;
  const p = PP[ppCurrentId];
  const oldVal = ppGetPath(p, path);
  // Parse new value based on the old value's type
  let newVal;
  if (raw === 'null' && input.tagName === 'SELECT') newVal = null;
  else if (typeof oldVal === 'boolean') newVal = raw === 'true';
  else if (typeof oldVal === 'number' && raw !== '') {
    const n = Number(raw);
    newVal = isNaN(n) ? raw : n;
  } else if (raw === '') newVal = null;
  else newVal = raw;

  if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
    ppEditingPath = null;
    ppRenderDetail();
    return;
  }

  ppSetPath(p, path, newVal);
  p.last_updated = new Date().toISOString().slice(0, 10);
  p.last_updated_by = (typeof getCurrentUserName === 'function' ? getCurrentUserName() : 'admin');

  // Append full change log entry
  const logEntry = {
    id: 'ppc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ts: new Date().toISOString(),
    user: p.last_updated_by,
    property_id: ppCurrentId,
    path: path,
    old_value: oldVal === undefined ? null : oldVal,
    new_value: newVal,
  };
  PP_LOG.push(logEntry);

  ppEditingPath = null;
  // Optimistic render
  ppRenderDetail();

  const okPP = await ppSave('se_pp', PP);
  const okLog = await ppSave('se_pp_log', PP_LOG);
  if (okPP && okLog) {
    if (typeof showToast === 'function') showToast('✓ Saved');
  }
}

function ppRenderIssue(iss) {
  const cls = iss.status === 'promoted' ? 'promoted' : iss.status === 'dismissed' ? 'dismissed' : '';
  const pri = iss.suggested_priority || 'normal';
  let h = `<div class="pp-issue ${cls}" data-iss="${ppEsc(iss.id)}">`;
  h += `<div class="pp-issue-desc">${ppEsc(iss.description)}</div>`;
  h += `<div class="pp-issue-meta">`;
  if (iss.suggested_category) h += `<span>${ppEsc(iss.suggested_category)}</span>`;
  h += `<span class="pri-${pri}">${ppEsc(pri)}</span>`;
  if (iss.suggested_vendor_name) h += `<span>→ ${ppEsc(iss.suggested_vendor_name)}</span>`;
  else if (iss.suggested_vendor_type) h += `<span>→ ${ppEsc(iss.suggested_vendor_type)}</span>`;
  if (iss.status === 'promoted') h += `<span>promoted → task ${ppEsc(iss.promoted_task_id || '')}</span>`;
  if (iss.status === 'dismissed') h += `<span>dismissed</span>`;
  h += `</div>`;
  if (iss.status === 'imported' || iss.status === 'imported_for_promotion') {
    h += `<div class="pp-issue-actions">`;
    h += `<button class="promote" onclick="ppPromoteIssue('${ppEsc(ppCurrentId)}','${ppEsc(iss.id)}')">Promote to Task</button>`;
    h += `<button class="dismiss" onclick="ppDismissIssue('${ppEsc(ppCurrentId)}','${ppEsc(iss.id)}')">Dismiss</button>`;
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

async function ppPromoteIssue(pid, issueId) {
  const p = PP[pid];
  if (!p) return;
  const iss = (p.outstanding_issues || []).find((i) => i.id === issueId);
  if (!iss) return;
  // Create a real task via the existing task system
  const newTaskId = 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const priorityUrgent = iss.suggested_priority === 'urgent';
  const newTask = {
    id: newTaskId,
    property: pid,
    category: iss.suggested_category || 'General',
    problem: iss.description,
    status: 'open',
    vendor: iss.suggested_vendor_name || '',
    date: '',
    urgent: priorityUrgent,
    guest: '',
    notes: [{ text: 'Promoted from Property Bible outstanding issue (' + issueId + ')', type: 'admin', time: new Date().toISOString(), by: (typeof getCurrentUserName === 'function' ? getCurrentUserName() : 'admin') }],
    photos: [],
    created: new Date().toISOString(),
  };
  tasks.push(newTask);logTaskChange('created',newTask);
  iss.status = 'promoted';
  iss.promoted_task_id = newTaskId;
  PP_LOG.push({
    id: 'ppc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ts: new Date().toISOString(),
    user: (typeof getCurrentUserName === 'function' ? getCurrentUserName() : 'admin'),
    property_id: pid,
    type: 'promote_issue',
    issue_id: issueId,
    task_id: newTaskId,
  });
  ppRenderDetail();
  if (typeof saveTasks === 'function') await saveTasks();
  await ppSave('se_pp', PP);
  await ppSave('se_pp_log', PP_LOG);
  if (typeof renderAll === 'function') renderAll();
  if (typeof showToast === 'function') showToast('✓ Promoted to task');
}

async function ppDismissIssue(pid, issueId) {
  const p = PP[pid];
  if (!p) return;
  const iss = (p.outstanding_issues || []).find((i) => i.id === issueId);
  if (!iss) return;
  iss.status = 'dismissed';
  PP_LOG.push({
    id: 'ppc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ts: new Date().toISOString(),
    user: (typeof getCurrentUserName === 'function' ? getCurrentUserName() : 'admin'),
    property_id: pid,
    type: 'dismiss_issue',
    issue_id: issueId,
  });
  ppRenderDetail();
  await ppSave('se_pp', PP);
  await ppSave('se_pp_log', PP_LOG);
  if (typeof showToast === 'function') showToast('Dismissed');
}

// ─── Filter Inventory sub-tab (Deploy 3) ──────────────────────────
// Portfolio matrix of filter stock per cabin, grouped by neighborhood.
// Reads hvac.filter_supply.current_inventory from each profile.
// Null counts are assumed 0 (red) until a vendor confirms on-site.
// Click any cell to record a count manually (owner edit path).

function ppInvGetLocation(p) {
  // Returns the filter storage location string for a cabin, resolving
  // shared stashes via stash_id when the local on_site_location is null.
  const fs = (p && p.hvac && p.hvac.filter_supply) || null;
  if (!fs) return null;
  if (fs.on_site_location) return fs.on_site_location;
  if (fs.stash_id && PP_STASHES && PP_STASHES[fs.stash_id]) {
    const stash = PP_STASHES[fs.stash_id];
    return stash.location || stash.on_site_location || null;
  }
  return null;
}

function ppRenderInventory() {
  const wrap = document.getElementById('pp-inv-wrap');
  if (!wrap) return;
  if (!PP || !Object.keys(PP).length) {
    wrap.innerHTML = '<div class="pp-empty">No property profiles loaded yet.</div>';
    return;
  }

  // Build ordered cabin list (by neighborhood) with nb metadata
  const ordered = [];
  NBS.forEach((nb) => {
    const cabinsInNb = nb.props.filter((pid) => PP[pid]);
    cabinsInNb.forEach((pid) => ordered.push({ pid, nb }));
  });
  const orderedIds = new Set(ordered.map((o) => o.pid));
  Object.keys(PP).forEach((pid) => {
    if (!orderedIds.has(pid)) ordered.push({ pid, nb: null });
  });

  // Portfolio-wide calculations using canonical sizes
  const allSizes = new Set();
  let confirmedSlots = 0, totalSlots = 0, outOfStock = 0;
  ordered.forEach(({ pid }) => {
    const inv = fsReadInv(PP[pid]);
    Object.keys(inv).forEach((s) => {
      allSizes.add(s);
      totalSlots++;
      const v = inv[s];
      if (v != null) confirmedSlots++;
      if ((v == null ? 0 : v) === 0) outOfStock++;
    });
  });
  const sizes = Array.from(allSizes).sort();
  const cabinCount = ordered.length;

  // Key-status stats (admin only)
  const canSeeKey = ppCanSee('admin');
  let keyAttention = 0;
  const kBreak = { missing: 0, unknown: 0, pending_install: 0 };
  ordered.forEach(({ pid }) => {
    const p = PP[pid];
    const s = p && p.access && p.access.exterior_backup_key && p.access.exterior_backup_key.status;
    if (s === 'ok' || s === 'present' || s === 'shared_with_sibling') return;
    keyAttention++;
    if (!s) kBreak.unknown++;
    else if (kBreak[s] != null) kBreak[s]++;
    else kBreak.unknown++;
  });

  let h = '';

  // ── Overview summary cards ──
  h += `<section class="inv-panel"><header><h2>Overview</h2></header>`;
  h += `<div class="inv-cards">`;
  h += `<div class="inv-card"><div class="k">Filter sizes tracked</div><div class="v">${sizes.length}</div><div class="sub">across ${cabinCount} cabins</div></div>`;
  h += `<div class="inv-card"><div class="k">Confirmed stock counts</div><div class="v warn">${confirmedSlots}</div><div class="sub">of ${totalSlots} slots — vendors to measure</div></div>`;
  h += `<div class="inv-card"><div class="k">Out of stock</div><div class="v bad">${outOfStock}</div><div class="sub">unmeasured slots assumed 0</div></div>`;
  if (canSeeKey) {
    const parts = [];
    if (kBreak.missing) parts.push(`${kBreak.missing} missing`);
    if (kBreak.unknown) parts.push(`${kBreak.unknown} unknown`);
    if (kBreak.pending_install) parts.push(`${kBreak.pending_install} pending`);
    const sub = parts.join(' · ') || 'all set';
    h += `<div class="inv-card"><div class="k">Key badges needing attention</div><div class="v bad">${keyAttention}</div><div class="sub">${ppEsc(sub)}</div></div>`;
  }
  h += `</div></section>`;

  // ── Filter Inventory Matrix (cabins as rows, sizes as columns) ──
  h += `<section class="inv-panel"><header><h2>Filter Inventory Matrix</h2></header>`;
  h += `<div class="inv-hint">Click any cell to enter or update its count. Unmeasured cells show as red <b>0</b> until a vendor confirms on-site. Click the <b>📍</b> column to record where filters are stashed at a cabin — you can fill this in even if you don't have a count yet.</div>`;
  h += `<div class="inv-matrix-wrap"><table class="inv-matrix"><thead><tr>`;
  h += `<th class="cabin-head">Cabin</th>`;
  h += `<th class="loc-head" title="Filter storage location">📍</th>`;
  sizes.forEach((sz) => {
    h += `<th class="size-col">${ppEsc(sz.replace('x','×'))}</th>`;
  });
  h += `</tr></thead><tbody>`;

  let lastNbCls = '__none__';
  ordered.forEach(({ pid, nb }) => {
    const nbCls = nb ? nb.cls : '__other__';
    if (nbCls !== lastNbCls) {
      const nbName = nb ? nb.name : 'Other';
      const nbClass = nb ? `nb-${nb.cls}` : '';
      h += `<tr class="nb-row ${nbClass}"><th colspan="${sizes.length + 2}">${ppEsc(nbName)}</th></tr>`;
      lastNbCls = nbCls;
    }
    const p = PP[pid];
    const name = p.property_name || pid;
    const fs = (p.hvac && p.hvac.filter_supply) || null;
    const inv = fsReadInv(p);
    const hasInv = Object.keys(inv).length > 0;
    const tracked = hasInv || (fs && (fs.on_site_location || fs.stash_id));
    const loc = ppInvGetLocation(p);

    h += `<tr class="cabin-row${tracked ? '' : ' untracked'}">`;
    h += `<th class="cabin-name" onclick="ppInvEditLocation('${pid}',event)" title="Click to edit filter storage">${ppEsc(name)}</th>`;
    if (!tracked) {
      h += `<td class="loc-cell na">—</td>`;
    } else {
      const isSet = !!loc;
      const display = isSet ? '✓' : 'set…';
      const cls = isSet ? 'loc-cell set' : 'loc-cell missing';
      const title = isSet ? `Stored: ${loc}` : 'Click to record storage location';
      h += `<td class="${cls}" onclick="ppInvEditLocation('${pid}',event)" title="${ppEsc(title)}">${display}</td>`;
    }
    sizes.forEach((sz) => {
      if (!(sz in inv)) {
        h += `<td class="count na">—</td>`;
        return;
      }
      const v = inv[sz];
      const confirmed = v != null;
      const count = v == null ? 0 : v;
      let cls;
      if (count === 0) cls = 'out';
      else if (count <= 2) cls = 'low';
      else cls = 'ok';
      const title = confirmed ? `Confirmed: ${count} on hand` : 'Unmeasured — assumed 0 until vendor confirms';
      h += `<td class="count ${cls}" onclick="ppInvEditCell(event,'${pid}','${ppEsc(sz)}')" title="${ppEsc(title)}">${count}</td>`;
    });
    h += `</tr>`;
  });

  h += `</tbody></table></div>`;

  // Matrix legend
  h += `<div class="inv-legend">`;
  h += `<span class="ok">in stock (confirmed)</span>`;
  h += `<span class="low">low</span>`;
  h += `<span class="out">out (0) — assumed zero until vendor confirms</span>`;
  h += `<span class="na">size not used at cabin</span>`;
  h += `</div></section>`;

  // ── Cabins · Exterior Backup Key Status (admin only) ──
  if (canSeeKey) {
    h += `<section class="inv-panel"><header><h2>Cabins · Exterior Backup Key Status</h2></header>`;
    h += `<div class="inv-hint">Click any status pill to change it. Unknown renders red under the "assume worst" rule — distinct label, same urgency.</div>`;
    h += `<ul class="inv-cabins">`;
    let lastK = '__none__';
    ordered.forEach(({ pid, nb }) => {
      const nbCls = nb ? nb.cls : '__other__';
      if (nbCls !== lastK) {
        const nbName = nb ? nb.name : 'Other';
        const nbClass = nb ? `nb-${nb.cls}` : '';
        h += `<li class="inv-cabins-nb ${nbClass}">${ppEsc(nbName)}</li>`;
        lastK = nbCls;
      }
      const p = PP[pid];
      const name = p.property_name || pid;
      const k = p && p.access && p.access.exterior_backup_key;
      const status = (k && k.status) || '';
      const label = status || 'unknown';
      const cls = status || 'unknown';
      h += `<li>`;
      h += `<div class="inv-dot ${cls}"></div>`;
      h += `<div class="inv-cabin-name">${ppEsc(name)}</div>`;
      h += `<div class="inv-cabin-key ${cls}" onclick="ppInvEditKey(event,'${pid}')" title="Click to change">${ppEsc(label)}</div>`;
      h += `</li>`;
    });
    h += `</ul></section>`;
  }

  wrap.innerHTML = h;
}

// ── Popover: edit a single cell (count + location) ──
function ppInvEditCell(ev, pid, size) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  ppInvOpenPopover({ pid, size, anchor: ev && ev.currentTarget });
}

// ── Popover: edit filter storage location only (no size) ──
function ppInvEditLocation(pid, ev) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  ppInvOpenPopover({ pid, size: null, locationOnly: true, anchor: ev && ev.currentTarget });
}

function ppInvOpenPopover({ pid, size, anchor, locationOnly }) {
  const existing = document.getElementById('pp-inv-pop');
  if (existing) existing.remove();

  const p = PP[pid];
  if (!p) return;
  if (!p.hvac) p.hvac = {};
  if (!p.hvac.filter_supply) p.hvac.filter_supply = {};
  const fs = p.hvac.filter_supply;
  const inv = fs.current_inventory || {};
  const storageLoc = fs.on_site_location || '';
  const sharedLoc = (!storageLoc && fs.stash_id && PP_STASHES && PP_STASHES[fs.stash_id])
    ? (PP_STASHES[fs.stash_id].location || '')
    : '';
  const currentCount = (size && inv[size] != null) ? inv[size] : '';
  const cabinName = p.property_name || pid;

  const pop = document.createElement('div');
  pop.id = 'pp-inv-pop';
  let html = '';
  html += `<div class="t">${ppEsc(cabinName)}${size ? ' — ' + ppEsc(size.replace('x','×')) : ''}</div>`;
  html += `<div class="s">${locationOnly ? 'Edit filter storage location' : 'Update stock count and storage'}</div>`;

  if (!locationOnly && size) {
    html += `<label>Count on hand</label>`;
    html += `<input type="number" id="pp-inv-pop-count" min="0" value="${currentCount}" placeholder="0">`;
  }
  html += `<label>Filter storage location</label>`;
  if (sharedLoc && !storageLoc) {
    html += `<div class="stash-note">Shared stash: ${ppEsc(sharedLoc)}</div>`;
  }
  html += `<input type="text" id="pp-inv-pop-loc" value="${ppEsc(storageLoc)}" placeholder="e.g. LR closet top shelf">`;
  if (!locationOnly && size) {
    html += `<label>Note (optional)</label>`;
    html += `<textarea id="pp-inv-pop-note" placeholder="e.g. restocked from Costco trip"></textarea>`;
  }
  html += `<div class="actions">`;
  html += `<button onclick="ppInvClosePop()">Cancel</button>`;
  html += `<button class="primary" onclick="ppInvSavePopover('${pid}',${size ? `'${ppEsc(size)}'` : 'null'})">Save</button>`;
  html += `</div>`;
  pop.innerHTML = html;
  document.body.appendChild(pop);

  // Position near anchor, clamped to viewport
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    const popW = 320;
    let left = rect.left + window.scrollX;
    if (left + popW > window.innerWidth - 12) left = window.innerWidth - popW - 12;
    pop.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    pop.style.left = Math.max(12, left) + 'px';
  } else {
    pop.style.top = (window.scrollY + 150) + 'px';
    pop.style.left = '50%';
    pop.style.transform = 'translateX(-50%)';
  }

  setTimeout(() => {
    const focusId = (locationOnly || !size) ? 'pp-inv-pop-loc' : 'pp-inv-pop-count';
    const f = document.getElementById(focusId);
    if (f) { f.focus(); if (f.select) f.select(); }
  }, 0);
  setTimeout(() => {
    document.addEventListener('click', ppInvPopOutsideClick);
  }, 0);
}

function ppInvClosePop() {
  const pop = document.getElementById('pp-inv-pop');
  if (pop) pop.remove();
  document.removeEventListener('click', ppInvPopOutsideClick);
}

function ppInvPopOutsideClick(e) {
  const pop = document.getElementById('pp-inv-pop');
  if (!pop) { document.removeEventListener('click', ppInvPopOutsideClick); return; }
  if (pop.contains(e.target)) return;
  // Ignore clicks on elements that open the popover themselves
  if (e.target.closest && (e.target.closest('.count') || e.target.closest('.loc-row') || e.target.closest('th.cabin') || e.target.closest('.inv-cabin-key'))) return;
  ppInvClosePop();
}

async function ppInvSavePopover(pid, size) {
  const p = PP[pid];
  if (!p) return;
  if (!p.hvac) p.hvac = {};
  if (!p.hvac.filter_supply) p.hvac.filter_supply = {};
  const fs = p.hvac.filter_supply;

  const countEl = document.getElementById('pp-inv-pop-count');
  const locEl = document.getElementById('pp-inv-pop-loc');
  const noteEl = document.getElementById('pp-inv-pop-note');
  const note = (noteEl && noteEl.value || '').trim();

  const entries = [];

  // Count change (only if size provided)
  if (size && countEl) {
    const raw = (countEl.value || '').trim();
    if (raw !== '') {
      const newCount = parseInt(raw, 10);
      if (isNaN(newCount) || newCount < 0) {
        if (typeof showToast === 'function') showToast('❌ Invalid count');
        return;
      }
      const canon = fsCanonSize(size);
      const prev = fsReadInv(p)[canon];
      if (prev !== newCount) {
        fsWriteInv(p, size, newCount);
        entries.push({
          path: 'hvac.filter_supply.current_inventory.' + canon,
          prev_value: prev == null ? null : prev,
          new_value: newCount,
        });
      }
    }
  }

  // Location change
  if (locEl) {
    const newLoc = (locEl.value || '').trim();
    const prevLoc = fs.on_site_location || '';
    if (newLoc !== prevLoc) {
      fs.on_site_location = newLoc || null;
      entries.push({
        path: 'hvac.filter_supply.on_site_location',
        prev_value: prevLoc || null,
        new_value: newLoc || null,
      });
    }
  }

  if (!entries.length) { ppInvClosePop(); return; }

  p.last_updated = new Date().toISOString().slice(0, 10);
  p.last_updated_by = 'chip';
  if (!Array.isArray(PP_LOG)) PP_LOG = [];
  const ts = new Date().toISOString();
  entries.forEach((e) => {
    PP_LOG.push({
      timestamp: ts,
      property_id: pid,
      path: e.path,
      prev_value: e.prev_value,
      new_value: e.new_value,
      source: 'owner_inventory_edit',
      note: note || null,
      by: 'chip',
    });
  });

  const okPp = await ppSave('se_pp', PP);
  const okLog = await ppSave('se_pp_log', PP_LOG);
  ppInvClosePop();
  if (okPp && okLog && typeof showToast === 'function') {
    showToast(`✓ Saved ${entries.length} change${entries.length === 1 ? '' : 's'}`);
  }
  ppRenderInventory();
}

// ── Popover: edit exterior backup key status (admin only) ──
function ppInvEditKey(ev, pid) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  if (!ppCanSee('admin')) return;
  const p = PP[pid];
  if (!p) return;
  if (!p.access) p.access = {};
  if (!p.access.exterior_backup_key) p.access.exterior_backup_key = {};
  const cur = p.access.exterior_backup_key.status || '';

  const existing = document.getElementById('pp-inv-pop');
  if (existing) existing.remove();

  const options = ['present', 'missing', 'unknown', 'pending_install', 'shared_with_sibling'];
  let html = `<div class="t">${ppEsc(p.property_name || pid)}</div>`;
  html += `<div class="s">Exterior backup key status</div>`;
  html += `<label>Status</label>`;
  html += `<select id="pp-inv-pop-key">`;
  options.forEach((o) => {
    const sel = o === cur ? ' selected' : '';
    html += `<option value="${o}"${sel}>${o}</option>`;
  });
  if (cur && !options.includes(cur)) {
    html += `<option value="${ppEsc(cur)}" selected>${ppEsc(cur)}</option>`;
  }
  html += `</select>`;
  html += `<div class="actions">`;
  html += `<button onclick="ppInvClosePop()">Cancel</button>`;
  html += `<button class="primary" onclick="ppInvSaveKey('${pid}')">Save</button>`;
  html += `</div>`;

  const pop = document.createElement('div');
  pop.id = 'pp-inv-pop';
  pop.innerHTML = html;
  document.body.appendChild(pop);

  const anchor = ev && ev.currentTarget;
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    const popW = 300;
    let left = rect.right + window.scrollX - popW;
    if (left < 12) left = 12;
    pop.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    pop.style.left = left + 'px';
  } else {
    pop.style.top = (window.scrollY + 150) + 'px';
    pop.style.left = '50%';
    pop.style.transform = 'translateX(-50%)';
  }

  setTimeout(() => {
    const f = document.getElementById('pp-inv-pop-key');
    if (f) f.focus();
  }, 0);
  setTimeout(() => {
    document.addEventListener('click', ppInvPopOutsideClick);
  }, 0);
}

async function ppInvSaveKey(pid) {
  const p = PP[pid];
  if (!p) return;
  if (!p.access) p.access = {};
  if (!p.access.exterior_backup_key) p.access.exterior_backup_key = {};
  const sel = document.getElementById('pp-inv-pop-key');
  if (!sel) return;
  const val = sel.value;
  const prev = p.access.exterior_backup_key.status || null;
  if (val === prev) { ppInvClosePop(); return; }
  p.access.exterior_backup_key.status = val;
  p.last_updated = new Date().toISOString().slice(0, 10);
  p.last_updated_by = 'chip';
  if (!Array.isArray(PP_LOG)) PP_LOG = [];
  PP_LOG.push({
    timestamp: new Date().toISOString(),
    property_id: pid,
    path: 'access.exterior_backup_key.status',
    prev_value: prev,
    new_value: val,
    source: 'owner_key_status_edit',
    note: null,
    by: 'chip',
  });
  const okPp = await ppSave('se_pp', PP);
  const okLog = await ppSave('se_pp_log', PP_LOG);
  ppInvClosePop();
  if (okPp && okLog && typeof showToast === 'function') {
    showToast(`✓ Key status: ${val}`);
  }
  ppRenderInventory();
  if (typeof ppRenderList === 'function') ppRenderList(); // refresh cabin list pills too
}
// ─── end Filter Inventory sub-tab ─────────────────────────────────

function ppInboxCount() {
  if (!PP) return 0;
  let n = 0;
  Object.values(PP).forEach((p) => {
    n += (p._gaps || []).length;
    n += (p.outstanding_issues || []).filter((i) => i.status === 'imported' || i.status === 'imported_for_promotion').length;
  });
  return n;
}

function ppRenderInbox() {
  const wrap = document.getElementById('pp-inbox-wrap');
  if (!PP) { wrap.innerHTML = ''; return; }
  const propIds = Object.keys(PP).sort();
  const totalGaps = propIds.reduce((n, pid) => n + (PP[pid]._gaps || []).length, 0);
  const totalIssues = propIds.reduce((n, pid) => n + (PP[pid].outstanding_issues || []).filter((i) => i.status === 'imported' || i.status === 'imported_for_promotion').length, 0);

  let h = `<div style="font-size:.78rem;color:var(--text2);margin-bottom:14px;line-height:1.5">All gaps and unpromoted outstanding issues across the portfolio. Click a row to jump to that cabin.</div>`;

  // Filter Service extreme rollup (Deploy 2) — surfaces extreme cabins only
  if (typeof fsRenderNeedsAttention === 'function') {
    h += fsRenderNeedsAttention();
  }

  // Issues first (they're actionable)
  h += `<div class="pp-inbox-group"><div class="pp-inbox-group-head"><h3>Outstanding Issues</h3><span class="count">${totalIssues}</span></div>`;
  if (!totalIssues) h += '<div class="pp-empty" style="padding:20px">None.</div>';
  propIds.forEach((pid) => {
    const p = PP[pid];
    const active = (p.outstanding_issues || []).filter((i) => i.status === 'imported' || i.status === 'imported_for_promotion');
    active.forEach((iss) => {
      h += `<div class="pp-inbox-row" onclick="ppOpenDetail('${pid}')">`;
      h += `<span class="pp-inbox-pill pp-pill-issue">${ppEsc(iss.suggested_priority || 'normal')}</span>`;
      h += `<div class="pp-inbox-body">${ppEsc(iss.description)}<div class="pp-inbox-cabin">${ppEsc(p.property_name || pid)}${iss.suggested_category ? ' · ' + ppEsc(iss.suggested_category) : ''}</div></div>`;
      h += `</div>`;
    });
  });
  h += `</div>`;

  // Gaps
  h += `<div class="pp-inbox-group"><div class="pp-inbox-group-head"><h3>Data Gaps</h3><span class="count">${totalGaps}</span></div>`;
  if (!totalGaps) h += '<div class="pp-empty" style="padding:20px">None.</div>';
  propIds.forEach((pid) => {
    const p = PP[pid];
    (p._gaps || []).forEach((g) => {
      h += `<div class="pp-inbox-row" onclick="ppOpenDetail('${pid}')">`;
      h += `<span class="pp-inbox-pill pp-pill-gap">gap</span>`;
      h += `<div class="pp-inbox-body">${ppEsc(g)}<div class="pp-inbox-cabin">${ppEsc(p.property_name || pid)}</div></div>`;
      h += `</div>`;
    });
  });
  h += `</div>`;

  wrap.innerHTML = h;
}
// ═══════════════  END Property Bible  ═══════════════

// ═══════════════  Filter Service (Deploy 2)  ═══════════════
// Tracks HVAC filter service per cabin. One cadence per cabin: all filters
// (disposable HVAC, washable mini-split, dehumidifier) get serviced together
// on a single handyman visit, because the profiling data explicitly couples
// them via `maintenance_coupling: "hvac_filter_change"` and equivalent notes.
//
// Thresholds (global, no per-cabin cadence field needed):
//   0-29 days since last service  → ok         (never shown)
//   30-59 days                    → bundle     (offer to bundle on task create)
//   60+ days, or no record        → extreme    (auto-create handyman task)
//
// Storage: hvac.filter_service = { last_service_date: "YYYY-MM-DD" | null }
//          written into each profile in se_pp.
// Task flag: filter_service_bundled = true  (on tasks that include filters)

const FS_BUNDLE_DAYS = 30;
const FS_EXTREME_DAYS = 60;

function fsDaysBetween(a, b) {
  const ms = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / ms);
}
function fsTodayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fsParseDate(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// Enumerate every filter item for a cabin that gets serviced on the visit.
// Returns [{kind, id, label, location, ladder_required}]
function fsAllFilters(profile) {
  const out = [];
  const hvac = profile.hvac || {};
  (hvac.disposable_filters || []).forEach((f) => {
    out.push({
      kind: 'hvac_disposable',
      id: f.id || '',
      label: 'HVAC Filter' + (f.size ? ' ' + f.size : '') + (f.quantity_per_change > 1 ? ' ×' + f.quantity_per_change : ''),
      location: f.location || '',
      ladder_required: !!f.ladder_required,
    });
  });
  (hvac.washable_filters || []).forEach((f) => {
    out.push({
      kind: 'mini_split_washable',
      id: f.id || '',
      label: (f.unit_label || 'Mini-Split') + ' (washable)',
      location: f.location || '',
      ladder_required: !!f.ladder_required,
    });
  });
  (hvac.dehumidifiers || []).forEach((d) => {
    if ((d.filter_type || '').toLowerCase() === 'washable') {
      out.push({
        kind: 'dehumidifier_washable',
        id: d.id || '',
        label: 'Dehumidifier (' + (d.location || 'unknown') + ') — wash filter',
        location: d.location || '',
        ladder_required: false,
      });
    }
  });
  return out;
}

// Given a profile, return current filter service state.
function fsStatus(profile) {
  const fs = (profile.hvac && profile.hvac.filter_service) || {};
  const last = fsParseDate(fs.last_service_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let daysSince = null;
  if (last) daysSince = fsDaysBetween(last, today);
  const filters = fsAllFilters(profile);
  if (!filters.length) return { state: 'none', daysSince, lastServiceDate: fs.last_service_date || null, filters };
  let state = 'ok';
  if (daysSince === null) state = 'extreme';
  else if (daysSince >= FS_EXTREME_DAYS) state = 'extreme';
  else if (daysSince >= FS_BUNDLE_DAYS) state = 'bundle';
  return { state, daysSince, lastServiceDate: fs.last_service_date || null, filters };
}

function fsStateLabel(state) {
  if (state === 'extreme') return { txt: 'EXTREME — service overdue 60+ days', cls: 'fs-extreme' };
  if (state === 'bundle') return { txt: 'Bundle window — due for service', cls: 'fs-bundle' };
  if (state === 'ok') return { txt: 'OK', cls: 'fs-ok' };
  return { txt: 'No filter data', cls: 'fs-none' };
}

// Property Bible detail-view panel (inserted by ppRenderDetail).
function fsRenderPanel(profile) {
  const s = fsStatus(profile);
  if (s.state === 'none') return '';
  const lab = fsStateLabel(s.state);
  const lastTxt = s.lastServiceDate ? s.lastServiceDate : '—';
  const daysTxt = s.daysSince === null ? 'never recorded' : s.daysSince + ' days ago';
  let h = '<div class="pp-section fs-panel"><div class="pp-section-head"><h3>Filter Service <span class="fs-pill ' + lab.cls + '">' + lab.txt + '</span></h3></div><div class="pp-section-body">';
  h += '<div class="fs-grid">';
  h += '<div class="fs-cell"><div class="fs-k">Last service</div><div class="fs-v">' + lastTxt + '</div></div>';
  h += '<div class="fs-cell"><div class="fs-k">Age</div><div class="fs-v">' + daysTxt + '</div></div>';
  h += '<div class="fs-cell"><div class="fs-k">Filters on this visit</div><div class="fs-v">' + s.filters.length + '</div></div>';
  h += '</div>';
  h += '<ul class="fs-filter-list">';
  s.filters.forEach((f) => {
    h += '<li><strong>' + ppEsc(f.label) + '</strong>' + (f.location ? ' — <span class="fs-loc">' + ppEsc(f.location) + '</span>' : '') + (f.ladder_required ? ' <span class="fs-ladder">ladder</span>' : '') + '</li>';
  });
  h += '</ul>';
  h += '<div class="fs-actions">';
  h += '<button class="btn btn-sm" onclick="fsBumpServiceDate(\'' + profile.property_id + '\')">Mark serviced today</button>';
  h += '<button class="btn btn-sm btn-ghost" onclick="fsEditServiceDate(\'' + profile.property_id + '\')">Edit last service date</button>';
  h += '</div>';
  h += '</div></div>';
  return h;
}

// Task-creation bundler banner. Renders inline in the task modal when a
// property is selected. Silent if nothing to bundle.
function fsRenderBundlerInline() {
  const wrap = document.getElementById('f-fs-bundler');
  if (!wrap) return;
  const pid = document.getElementById('f-property').value;
  if (!pid || !PP || !PP[pid]) { wrap.innerHTML = ''; return; }
  const s = fsStatus(PP[pid]);
  if (s.state !== 'bundle' && s.state !== 'extreme') { wrap.innerHTML = ''; return; }
  const lab = fsStateLabel(s.state);
  let h = '<div class="fs-bundler ' + lab.cls + '">';
  h += '<div class="fs-bundler-head"><strong>Filter service ' + (s.state === 'extreme' ? 'is extreme here' : 'is due at this cabin') + '</strong>';
  h += ' <span class="fs-bundler-sub">' + (s.daysSince === null ? 'no recorded service date' : s.daysSince + ' days since last service') + '</span></div>';
  h += '<label class="fs-bundler-check"><input type="checkbox" id="f-fs-bundle-cb" ' + (s.state === 'extreme' ? 'checked' : '') + '> Add filter service to this visit (' + s.filters.length + ' filter' + (s.filters.length === 1 ? '' : 's') + ')</label>';
  h += '</div>';
  wrap.innerHTML = h;
}

// Size canonicalization: all filters are 1" deep, so strip trailing "x1".
// "14x14x1" → "14x14", "20x25X1" → "20x25", "14x20" → "14x20".
function fsCanonSize(s) {
  if (!s) return s;
  return String(s).replace(/[xX]1$/, '');
}

// Read a cabin's current_inventory with keys collapsed to canonical form.
// If both "14x14" and "14x14x1" happen to exist, the confirmed (non-null)
// value wins; if both are confirmed, we take the max.
function fsReadInv(profile) {
  const raw = (profile && profile.hvac && profile.hvac.filter_supply && profile.hvac.filter_supply.current_inventory) || {};
  const out = {};
  Object.keys(raw).forEach((k) => {
    const c = fsCanonSize(k);
    const v = raw[k];
    if (!(c in out)) { out[c] = v; return; }
    // Collision — merge
    if (out[c] == null) { out[c] = v; return; }
    if (v == null) return;
    if (v > out[c]) out[c] = v;
  });
  return out;
}

// Write a count to current_inventory using the canonical key, and purge
// any non-canonical variants of that size at the same time.
function fsWriteInv(profile, size, value) {
  if (!profile.hvac) profile.hvac = {};
  if (!profile.hvac.filter_supply) profile.hvac.filter_supply = {};
  if (!profile.hvac.filter_supply.current_inventory) profile.hvac.filter_supply.current_inventory = {};
  const inv = profile.hvac.filter_supply.current_inventory;
  const canon = fsCanonSize(size);
  let prev = inv[canon];
  // Purge non-canonical duplicates of the same physical size
  Object.keys(inv).forEach((k) => {
    if (k !== canon && fsCanonSize(k) === canon) {
      if (prev == null && inv[k] != null) prev = inv[k];
      delete inv[k];
    }
  });
  inv[canon] = value;
  return prev == null ? null : prev;
}

// Required filters per size for a single visit. Respects quantity_per_change.
// ALL filters are replaced on a visit ("change one, change all" rule).
// Sizes are canonicalized so "14x14" and "14x14x1" collapse.
function fsRequiredBySize(profile) {
  const out = {};
  const hvac = (profile && profile.hvac) || {};
  (hvac.disposable_filters || []).forEach((f) => {
    if (!f.size) return;
    const c = fsCanonSize(f.size);
    const n = Number(f.quantity_per_change) || 1;
    out[c] = (out[c] || 0) + n;
  });
  return out;
}

// Effective purchaseNote for a task: either the stored value, or a
// synthesized filter shortfall if this is a filter task with no explicit
// purchaseNote. Backfills the Deploy 2 bootstrap tasks (which skipped
// fsMaybeStampTask's shortfall auto-population) and stays accurate as
// inventory changes between visits. Used by the admin dispatch view, task
// cards, and Job Sheet text generation.
function taskEffectivePurchaseNote(task) {
  if (!task) return '';
  if (task.purchaseNote) return task.purchaseNote;
  const isFilter = !!(task.filter_service_bundled || task.filter_auto_generated);
  if (!isFilter) return '';
  try {
    if (typeof PP === 'undefined' || !PP || !PP[task.property]) return '';
    const gaps = fsShortfallList(PP[task.property]);
    if (gaps && gaps.length) return 'Filters: ' + gaps.join(', ');
  } catch (e) {}
  return '';
}

// Effective purchaser for SMS routing. Filter tasks are always vendor-pickup
// on the way to the cabin — vendor grabs the filter en route, no owner
// delivery. Deploy 2 bootstrap tasks never set purchaser, so we force
// 'vendor' for any filter task regardless of stored value.
function taskEffectivePurchaser(task) {
  if (!task) return 'owner';
  const isFilter = !!(task.filter_service_bundled || task.filter_auto_generated);
  if (isFilter) return 'vendor';
  return task.purchaser || 'owner';
}

// Buy list from shortfall only (no opportunistic restocking). Uses assume-zero
// rule — unmeasured counts treated as 0 for shortfall math.
function fsShortfallList(profile) {
  const required = fsRequiredBySize(profile);
  const inv = (profile.hvac && profile.hvac.filter_supply && profile.hvac.filter_supply.current_inventory) || {};
  const gaps = [];
  Object.keys(required).sort().forEach((size) => {
    const need = required[size];
    const have = inv[size] == null ? 0 : inv[size]; // assume-zero
    const gap = Math.max(0, need - have);
    if (gap > 0) gaps.push(gap + '× ' + size.replace('x','×'));
  });
  return gaps;
}

// Build a notes string describing every filter to service. Includes the
// "change one, change all" rule, storage location, required quantities, and
// a heads-up about the recount close-out flow.
function fsBuildNotesBlock(profile) {
  const s = fsStatus(profile);
  const storage = (profile.hvac && profile.hvac.filter_supply && profile.hvac.filter_supply.on_site_location) || null;
  const required = fsRequiredBySize(profile);
  const needList = Object.keys(required).sort().map((sz) => required[sz] + '× ' + sz.replace('x','×')).join(', ');
  const lines = [
    '— FILTER SERVICE BUNDLED —',
    'REPLACE ALL filters at this cabin (change one, change all rule).',
    '',
  ];
  if (storage) lines.push('Filter storage at cabin: ' + storage);
  else lines.push('Filter storage: not yet recorded — please note where you find them when you arrive.');
  if (needList) lines.push('Per visit: ' + needList);
  lines.push('', 'Filters to service:');
  s.filters.forEach((f) => {
    let ln = '• ' + f.label;
    if (f.location) ln += ' @ ' + f.location;
    if (f.ladder_required) ln += ' (ladder)';
    lines.push(ln);
  });
  lines.push('', 'At close-out the app will ask you to recount what\'s left at the cabin for each size.', 'Write date on new filter and take a photo.');
  return lines.join('\n');
}

// Hook invoked from saveTask(). If bundler checkbox is checked, stamp the
// task with filter_service_bundled, append a notes block, and auto-populate
// Purchase Required from shortfall.
function fsMaybeStampTask(task) {
  const cb = document.getElementById('f-fs-bundle-cb');
  if (!cb || !cb.checked) return;
  if (!PP || !PP[task.property]) return;
  const p = PP[task.property];
  task.filter_service_bundled = true;
  const block = fsBuildNotesBlock(p);
  if (!task.notes) task.notes = [];
  task.notes.push({ text: block, type: 'admin', time: new Date().toISOString() });

  // Auto-populate Purchase Required from shortfall (only for today's visit).
  // Respects existing purchaseNote if set manually.
  if (!task.purchaseNote) {
    const shortfall = fsShortfallList(p);
    if (shortfall.length) {
      task.purchaseNote = 'Filters: ' + shortfall.join(', ');
      task.purchaseStatus = task.purchaseStatus || 'needed';
      task.purchaser = task.purchaser || 'vendor';
    }
  }
}

// Hook invoked from markComplete()/vdQuickComplete(). If the task was
// bundled with filter service (or is an auto-generated filter task), write
// today's date back into the cabin profile + append a change log entry.
async function fsOnTaskComplete(task) {
  if (!task) return;
  const isFilterTask = !!task.filter_service_bundled || !!task.filter_auto_generated;
  if (!isFilterTask) return;
  if (!PP || !PP[task.property]) return;
  const p = PP[task.property];
  if (!p.hvac) p.hvac = {};
  if (!p.hvac.filter_service) p.hvac.filter_service = {};
  const prev = p.hvac.filter_service.last_service_date || null;
  const today = fsTodayISO();
  p.hvac.filter_service.last_service_date = today;
  p.last_updated = today;
  p.last_updated_by = getCurrentUserName ? (getCurrentUserName() || 'user') : 'user';
  // Append change log
  try {
    if (!Array.isArray(PP_LOG)) PP_LOG = [];
    PP_LOG.push({
      id: 'chg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      ts: new Date().toISOString(),
      user: p.last_updated_by,
      property_id: task.property,
      path: 'hvac.filter_service.last_service_date',
      old_value: prev,
      new_value: today,
      source: 'task_complete',
      task_id: task.id,
    });
    await ppSave('se_pp_log', PP_LOG);
  } catch (e) { console.warn('[fs] log save failed', e); }
  try {
    await ppSave('se_pp', PP);
  } catch (e) { console.warn('[fs] profile save failed', e); }
}

// ── Recount modal (close-out for filter tasks) ────────────────────
// Vendor must enter how many of each filter size is left at the cabin
// before a filter task can be marked complete. Updates current_inventory
// and optionally filter storage location. Logs each change to se_pp_log.

let _fsRecountResolver = null;
let _fsRecountTask = null;

function fsPromptRecount(task) {
  return new Promise((resolve) => {
    if (!PP || !PP[task.property]) { resolve(true); return; }
    const p = PP[task.property];
    const sizes = fsRequiredBySize(p);
    if (!Object.keys(sizes).length) { resolve(true); return; }
    _fsRecountResolver = resolve;
    _fsRecountTask = task;
    fsRecountOpen(p, sizes);
  });
}

function fsRecountOpen(profile, sizes) {
  const existing = document.getElementById('fs-recount-modal');
  if (existing) existing.remove();

  const fs = (profile.hvac && profile.hvac.filter_supply) || {};
  const currentLoc = fs.on_site_location || '';
  const sharedLoc = (!currentLoc && fs.stash_id && PP_STASHES && PP_STASHES[fs.stash_id])
    ? (PP_STASHES[fs.stash_id].location || '') : '';
  const cabinName = profile.property_name || profile.property_id;

  let body = '';
  Object.keys(sizes).sort().forEach((size) => {
    const req = sizes[size];
    body += `<div class="fs-rc-row">`;
    body += `<div class="fs-rc-size"><b>${ppEsc(size.replace('x','×'))}</b> <span class="fs-rc-req">needed per visit: ${req}</span></div>`;
    body += `<input type="number" min="0" class="fs-recount-input" data-size="${ppEsc(size)}" placeholder="#" required>`;
    body += `</div>`;
  });

  const stashNote = sharedLoc && !currentLoc
    ? `<div class="fs-rc-stash-note">Shared stash recorded: ${ppEsc(sharedLoc)}</div>` : '';

  const html = `<div class="mo open" id="fs-recount-modal">
    <div class="modal" style="max-width:480px">
      <div class="mhdr">
        <div>
          <div class="mtitle">Close out filter visit</div>
          <div class="fs-rc-sub">${ppEsc(cabinName)}</div>
        </div>
        <button class="mclose" onclick="fsRecountCancel()">&times;</button>
      </div>
      <div class="fs-rc-intro">How many filters of each size are <b>left at the cabin</b> after today's work? Required for every size.</div>
      <div class="fs-rc-list">${body}</div>
      <div class="fs-rc-loc">
        <label>Filter storage location ${currentLoc ? '' : '(please capture if you found them)'}</label>
        ${stashNote}
        <input type="text" id="fs-recount-loc" value="${ppEsc(currentLoc)}" placeholder="e.g. LR closet top shelf">
      </div>
      <div class="fs-rc-actions">
        <button class="btn" onclick="fsRecountCancel()">Cancel</button>
        <button class="btn btn-g" onclick="fsRecountSave()">Save & Complete</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(() => {
    const first = document.querySelector('.fs-recount-input');
    if (first) first.focus();
  }, 20);
}

async function fsRecountSave() {
  const task = _fsRecountTask;
  if (!task) return;
  const p = PP && PP[task.property];
  if (!p) { fsRecountClose(true); return; }

  const inputs = document.querySelectorAll('.fs-recount-input');
  const counts = {};
  let missing = false;
  inputs.forEach((el) => {
    el.style.borderColor = '';
    const raw = (el.value || '').trim();
    if (raw === '') { missing = true; el.style.borderColor = 'var(--red)'; return; }
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 0) { missing = true; el.style.borderColor = 'var(--red)'; return; }
    counts[el.getAttribute('data-size')] = n;
  });
  if (missing) {
    if (typeof showToast === 'function') showToast('❌ Enter a count for every filter size');
    return;
  }

  if (!p.hvac) p.hvac = {};
  if (!p.hvac.filter_supply) p.hvac.filter_supply = {};
  if (!p.hvac.filter_supply.current_inventory) p.hvac.filter_supply.current_inventory = {};

  if (!Array.isArray(PP_LOG)) PP_LOG = [];
  const ts = new Date().toISOString();
  const by = (typeof getCurrentUserName === 'function' && getCurrentUserName()) || task.vendor || 'vendor';

  Object.keys(counts).forEach((size) => {
    const canon = fsCanonSize(size);
    const prev = fsReadInv(p)[canon];
    const newVal = counts[size];
    if (prev !== newVal) {
      fsWriteInv(p, size, newVal);
      PP_LOG.push({
        id: 'chg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        ts, user: by, property_id: task.property,
        path: 'hvac.filter_supply.current_inventory.' + canon,
        old_value: prev == null ? null : prev,
        new_value: newVal,
        source: 'filter_task_recount',
        task_id: task.id,
      });
    }
  });

  const locEl = document.getElementById('fs-recount-loc');
  if (locEl) {
    const newLoc = (locEl.value || '').trim();
    const prevLoc = p.hvac.filter_supply.on_site_location || '';
    if (newLoc && newLoc !== prevLoc) {
      p.hvac.filter_supply.on_site_location = newLoc;
      PP_LOG.push({
        id: 'chg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        ts, user: by, property_id: task.property,
        path: 'hvac.filter_supply.on_site_location',
        old_value: prevLoc || null,
        new_value: newLoc,
        source: 'filter_task_recount',
        task_id: task.id,
      });
    }
  }
  p.last_updated = fsTodayISO();
  p.last_updated_by = by;

  try { await ppSave('se_pp', PP); } catch (e) { console.warn('[fs] recount save failed', e); }
  try { await ppSave('se_pp_log', PP_LOG); } catch (e) { console.warn('[fs] recount log failed', e); }

  fsRecountClose(true);
}

function fsRecountCancel() { fsRecountClose(false); }
function fsRecountClose(ok) {
  const m = document.getElementById('fs-recount-modal');
  if (m) m.remove();
  const resolver = _fsRecountResolver;
  _fsRecountResolver = null;
  _fsRecountTask = null;
  if (resolver) resolver(ok);
}

// Needs Attention rollup. Extreme cabins only — bundle cabins stay quiet.
function fsRenderNeedsAttention() {
  if (!PP) return '';
  const extremes = [];
  Object.keys(PP).forEach((pid) => {
    const s = fsStatus(PP[pid]);
    if (s.state === 'extreme') extremes.push({ pid, status: s });
  });
  if (!extremes.length) return '';
  extremes.sort((a, b) => {
    const aa = a.status.daysSince === null ? Infinity : a.status.daysSince;
    const bb = b.status.daysSince === null ? Infinity : b.status.daysSince;
    return bb - aa;
  });
  let h = '<div class="pp-inbox-group"><div class="pp-inbox-group-head"><h3>Filter Service — Extreme</h3><span class="count">' + extremes.length + '</span></div>';
  extremes.forEach((e) => {
    const p = PP[e.pid];
    const ageTxt = e.status.daysSince === null ? 'no recorded service' : e.status.daysSince + ' days';
    h += '<div class="pp-inbox-row" onclick="ppOpenDetail(\'' + e.pid + '\')">';
    h += '<span class="pp-inbox-pill fs-extreme">extreme</span>';
    h += '<div class="pp-inbox-body">' + ppEsc(p.property_name || e.pid) + '<div class="pp-inbox-cabin">' + ageTxt + ' · ' + e.status.filters.length + ' filter' + (e.status.filters.length === 1 ? '' : 's') + '</div></div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

async function fsBumpServiceDate(pid) {
  if (!PP || !PP[pid]) return;
  if (!confirm('Mark filter service complete for this cabin as of today?')) return;
  const p = PP[pid];
  if (!p.hvac) p.hvac = {};
  if (!p.hvac.filter_service) p.hvac.filter_service = {};
  const prev = p.hvac.filter_service.last_service_date || null;
  const today = fsTodayISO();
  p.hvac.filter_service.last_service_date = today;
  p.last_updated = today;
  p.last_updated_by = getCurrentUserName ? (getCurrentUserName() || 'user') : 'user';
  if (!Array.isArray(PP_LOG)) PP_LOG = [];
  PP_LOG.push({
    id: 'chg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    ts: new Date().toISOString(),
    user: p.last_updated_by,
    property_id: pid,
    path: 'hvac.filter_service.last_service_date',
    old_value: prev,
    new_value: today,
    source: 'manual_bump',
  });
  await ppSave('se_pp', PP);
  await ppSave('se_pp_log', PP_LOG);
  ppRenderDetail();
  showToast('Marked serviced ' + today);
}

async function fsEditServiceDate(pid) {
  if (!PP || !PP[pid]) return;
  const p = PP[pid];
  const cur = (p.hvac && p.hvac.filter_service && p.hvac.filter_service.last_service_date) || '';
  const next = prompt('Set last service date (YYYY-MM-DD, or blank to clear):', cur);
  if (next === null) return;
  const clean = next.trim();
  if (clean && !/^\d{4}-\d{2}-\d{2}$/.test(clean)) { showToast('Date must be YYYY-MM-DD', 'err'); return; }
  if (!p.hvac) p.hvac = {};
  if (!p.hvac.filter_service) p.hvac.filter_service = {};
  const prev = p.hvac.filter_service.last_service_date || null;
  p.hvac.filter_service.last_service_date = clean || null;
  p.last_updated = fsTodayISO();
  p.last_updated_by = getCurrentUserName ? (getCurrentUserName() || 'user') : 'user';
  if (!Array.isArray(PP_LOG)) PP_LOG = [];
  PP_LOG.push({
    id: 'chg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    ts: new Date().toISOString(),
    user: p.last_updated_by,
    property_id: pid,
    path: 'hvac.filter_service.last_service_date',
    old_value: prev,
    new_value: clean || null,
    source: 'manual_edit',
  });
  await ppSave('se_pp', PP);
  await ppSave('se_pp_log', PP_LOG);
  ppRenderDetail();
  showToast('Updated');
}
// ═══════════════  END Filter Service  ═══════════════


// ═══════════════════════════════════════════════════════════════
//   REVIEWS PAGE — aggregated ratings over 52 weeks (Hospitable)
// ═══════════════════════════════════════════════════════════════
// Entry: switchView('reviews') → rvInit() → (cache hit?) rvRender() : rvFetchAll(false)
//
// Caching: localStorage key `se_rv_cache_v1` with 24-hour TTL. First visit
// each day triggers a fresh pull (~10-20s for 18 properties); subsequent
// loads are instant. User can force-refresh via the ↻ button.
//
// Data shape (rvData):
//   { generated_at, total_reviews,
//     weeks: [52 ISO-week-start-dates],
//     properties: { [pid]: { overall[52], cleanliness[52], counts[52] } } }
// Sparse weeks are null, NOT zero — excluded from averages and rendered as
// gaps in the sparkline path.
//
// Bucketing: by reservation check_out date (fallback to reviewed_at),
// Monday-start ISO weeks in UTC.
//
// Parent/combo Hospitable listings whose reviews fan out to multiple children
// are listed in RV_FAN_OUT. Each entry's reviews get duplicated into every
// child property's weekly bucket. The parent never shows as its own row.

const RV_FAN_OUT = [
  {
    key: 'hillside_both_houses',
    name: 'Hillside Haven - Both Houses',
    listing_id: 1654976,          // the numeric id Chip sees in Hospitable UI
    uuid: null,                   // TODO: need Hospitable property UUID for listing 1654976.
                                  //       Once set, reviews fan out to hillside_big + hillside_cottage.
    children: ['hillside_big', 'hillside_cottage'],
  },
];

const RV_BUCKET_WEEKS = 52;
const RV_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RV_CACHE_KEY = 'se_rv_cache_v1';
const RV_THRESH_GOOD = 4.8;
const RV_THRESH_MID  = 4.5;

let rvData = null;
let rvFetching = false;
let rvDrillPid = null;
let rvActiveSection = 'reviews';  // 'reviews' | 'cleaning'
let rvCleaningLoaded = false;
let rvPortfolioView = 'avg';   // 'avg' | 'all' | 'byNb'

// Neighborhood colors (hex — SVG can't use CSS vars reliably via attributes)
const RV_NB_COLOR = {
  prc: '#2d6a3f', umc: '#b8830a', gatlinburg: '#6b3fa0',
  alpine: '#c0392b', sevierville: '#2471a3', hillside: '#1a3a5c',
};
function rvNbForPid(pid) {
  for (const nb of NBS) if (nb.props.includes(pid)) return nb;
  return null;
}
function rvColorForPid(pid) {
  const nb = rvNbForPid(pid);
  return (nb && RV_NB_COLOR[nb.cls]) || '#4a6355';
}

// Monday 00:00 UTC of the week containing d
function rvIsoWeekStart(d) {
  const dt = new Date(d);
  const day = dt.getUTCDay();          // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1 - day);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() + diff));
}
function rvWeekKey(d) {
  return rvIsoWeekStart(d).toISOString().slice(0, 10);
}
function rvBuildWeeks() {
  const weeks = [];
  const thisWeek = rvIsoWeekStart(new Date());
  for (let i = RV_BUCKET_WEEKS - 1; i >= 0; i--) {
    const d = new Date(thisWeek);
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push(d.toISOString().slice(0, 10));
  }
  return weeks;
}
function rvAvg(arr) {
  const v = (arr || []).filter(x => x != null && !isNaN(x));
  if (!v.length) return null;
  return v.reduce((s, x) => s + x, 0) / v.length;
}
function rvSum(arr) {
  return (arr || []).reduce((s, x) => s + (x || 0), 0);
}
function rvFmt(v) { return v == null ? '—' : v.toFixed(2); }
function rvBadgeClass(v) {
  if (v == null) return 'rv-badge-none';
  if (v >= RV_THRESH_GOOD) return 'rv-badge-good';
  if (v >= RV_THRESH_MID)  return 'rv-badge-mid';
  return 'rv-badge-bad';
}

async function rvFetchAll(force) {
  if (rvFetching) return;

  if (!force) {
    try {
      const raw = localStorage.getItem(RV_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && cached.generated_at &&
            Date.now() - new Date(cached.generated_at).getTime() < RV_CACHE_TTL_MS) {
          rvData = cached;
          rvRender();
          return;
        }
      }
    } catch (e) { /* ignore cache errors */ }
  }

  rvFetching = true;
  const statusEl = document.getElementById('rv-status');
  if (statusEl) statusEl.textContent = 'Loading reviews...';
  const listEl = document.getElementById('rv-list');
  if (listEl && !rvData) listEl.innerHTML = '<div class="rv-loading">Loading reviews from Hospitable... this can take 10–20 seconds on first load.</div>';

  // Targets = every known property UUID + any RV_FAN_OUT entries that have a UUID set.
  const targets = Object.entries(HOSPITABLE_IDS)
    .filter(([, uuid]) => !!uuid)
    .map(([pid, uuid]) => ({ pid, uuid, fanOutTo: null }));
  for (const fo of RV_FAN_OUT) {
    if (fo.uuid) targets.push({ pid: fo.key, uuid: fo.uuid, fanOutTo: fo.children });
  }

  const weeks = rvBuildWeeks();
  const weekIndex = {};
  for (let i = 0; i < weeks.length; i++) weekIndex[weeks[i]] = i;
  const cutoff = new Date(weeks[0]);

  const props = {};
  for (const pid of Object.keys(HOSPITABLE_IDS)) {
    props[pid] = {
      overall_sum:   new Array(RV_BUCKET_WEEKS).fill(0),
      overall_count: new Array(RV_BUCKET_WEEKS).fill(0),
      clean_sum:     new Array(RV_BUCKET_WEEKS).fill(0),
      clean_count:   new Array(RV_BUCKET_WEEKS).fill(0),
    };
  }

  let totalReviews = 0;
  const batchSize = 4;
  for (let i = 0; i < targets.length; i += batchSize) {
    const batch = targets.slice(i, i + batchSize);
    if (statusEl) statusEl.textContent = `Loading reviews... ${Math.min(i + batchSize, targets.length)}/${targets.length} properties`;
    const results = await Promise.allSettled(batch.map(async t => {
      let page = 1;
      const revs = [];
      while (page <= 10) {
        try {
          const r = await fetch(
            `${PROXY_BASE}/api/hospitable?action=reviews&pid=${t.uuid}&start=2020-01-01&end=${new Date().toISOString().slice(0,10)}&page=${page}`,
            { signal: AbortSignal.timeout(15000) }
          );
          if (!r.ok) break;
          const data = await r.json();
          const batchR = data.data || [];
          revs.push(...batchR);
          if (!data.meta || page >= data.meta.last_page) break;
          page++;
        } catch (e) { break; }
      }
      return { t, revs };
    }));

    for (const res of results) {
      if (res.status !== 'fulfilled') continue;
      const { t, revs } = res.value;
      for (const rv of revs) {
        const bucketDateStr = rv.reservation?.check_out || rv.reviewed_at;
        if (!bucketDateStr) continue;
        const d = new Date(bucketDateStr);
        if (isNaN(d.getTime()) || d < cutoff) continue;
        const idx = weekIndex[rvWeekKey(d)];
        if (idx === undefined) continue;

        const overall = (rv.public?.rating != null) ? Number(rv.public.rating) : null;
        const cleanR = (rv.private?.detailed_ratings || []).find(dr => dr.type === 'cleanliness');
        const cleanRating = (cleanR && cleanR.rating > 0) ? Number(cleanR.rating) : null;

        const attribTo = t.fanOutTo ? t.fanOutTo : [t.pid];
        for (const apid of attribTo) {
          if (!props[apid]) continue;
          if (overall != null) {
            props[apid].overall_sum[idx] += overall;
            props[apid].overall_count[idx] += 1;
          }
          if (cleanRating != null) {
            props[apid].clean_sum[idx] += cleanRating;
            props[apid].clean_count[idx] += 1;
          }
        }
        totalReviews++;
      }
    }
  }

  const propertiesOut = {};
  for (const pid of Object.keys(props)) {
    const p = props[pid];
    propertiesOut[pid] = {
      overall:     p.overall_count.map((c, i) => c > 0 ? +(p.overall_sum[i] / c).toFixed(3) : null),
      cleanliness: p.clean_count.map((c, i)   => c > 0 ? +(p.clean_sum[i]   / c).toFixed(3) : null),
      counts:      p.overall_count.slice(),
    };
  }

  rvData = {
    generated_at: new Date().toISOString(),
    weeks,
    properties: propertiesOut,
    total_reviews: totalReviews,
  };
  try { localStorage.setItem(RV_CACHE_KEY, JSON.stringify(rvData)); } catch (e) { /* quota or private mode */ }

  rvFetching = false;
  if (statusEl) statusEl.textContent = `${totalReviews} reviews · updated ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`;
  rvRender();
}

function rvRender() {
  if (rvDrillPid) { rvRenderDrill(); return; }
  const listEl = document.getElementById('rv-list');
  if (!listEl) return;
  if (!rvData) {
    listEl.innerHTML = '<div class="rv-loading">Loading reviews from Hospitable...</div>';
    const pb = document.getElementById('rv-portfolio-body');
    if (pb) pb.innerHTML = '';
    return;
  }

  rvRenderPortfolio();

  const sortMode = (document.getElementById('rv-sort') || {}).value || 'lowAvg12';

  const summaries = {};
  for (const pid of Object.keys(rvData.properties)) {
    const p = rvData.properties[pid];
    const avg12 = rvAvg(p.overall);
    const avg4  = rvAvg(p.overall.slice(-4));
    const totalN = rvSum(p.counts);
    const drop = (avg12 != null && avg4 != null) ? (avg12 - avg4) : 0;
    summaries[pid] = { avg12, avg4, totalN, drop };
  }

  let html = '';
  for (const nb of NBS) {
    let ids = nb.props.filter(pid => rvData.properties[pid]);
    if (!ids.length) continue;
    ids = rvSortIds(ids, summaries, sortMode);
    html += `<div class="rv-nb-banner ${nb.cls}"><span class="rv-nb-name">${escHtml(nb.name)}</span><span class="rv-nb-sub">${escHtml(nb.sub)}</span></div>`;
    for (const pid of ids) html += rvRowHtml(pid, summaries[pid]);
  }
  if (!html) html = '<div class="rv-empty">No review data yet.</div>';
  listEl.innerHTML = html;
}

function rvSortIds(ids, sums, mode) {
  const arr = ids.slice();
  arr.sort((a, b) => {
    const sa = sums[a], sb = sums[b];
    // Properties with no reviews in the 12-mo window always sink to the bottom.
    const aEmpty = !sa.totalN, bEmpty = !sb.totalN;
    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
    switch (mode) {
      case 'lowAvg12': return (sa.avg12 ?? 99) - (sb.avg12 ?? 99);
      case 'lowAvg4':  return (sa.avg4  ?? 99) - (sb.avg4  ?? 99);
      case 'alpha': {
        const pa = getProp(a)?.name || a;
        const pb = getProp(b)?.name || b;
        return pa.localeCompare(pb);
      }
      case 'reviews':  return (sb.totalN || 0) - (sa.totalN || 0);
      case 'drop':     return (sb.drop ?? -99) - (sa.drop ?? -99);
      default:         return (sa.avg12 ?? 99) - (sb.avg12 ?? 99);
    }
  });
  return arr;
}

function rvRowHtml(pid, s) {
  const p = getProp(pid);
  const name = p ? p.name : pid;
  const badge = `<span class="rv-badge ${rvBadgeClass(s.avg12)}" title="12-month average">${rvFmt(s.avg12)}</span>`;
  const series = rvData.properties[pid].overall;
  const spark = rvSparkSvg(series);
  const dropTxt = (s.drop != null && s.drop > 0.15)
    ? `<span class="rv-drop">↓ ${s.drop.toFixed(2)} vs 12-mo</span>`
    : '';
  const sub = `
    <span>${s.totalN} review${s.totalN === 1 ? '' : 's'}</span>
    <span>4-wk avg: <strong>${rvFmt(s.avg4)}</strong></span>
    ${dropTxt}`;
  return `
    <div class="rv-row" onclick="rvOpenDrill('${pid}')">
      <div class="rv-row-info">
        <div class="rv-row-name">${escHtml(name)}</div>
        <div class="rv-row-sub">${sub}</div>
      </div>
      <div class="rv-row-badge">${badge}</div>
      <div class="rv-row-spark">${spark}</div>
      <div class="rv-row-arrow">›</div>
    </div>`;
}

// Inline SVG sparkline on demerit scale (y=0 at bottom = perfect; spikes up = slips).
// Nulls render as gaps (no line drawn across them).
function rvSparkSvg(series, width, height) {
  width = width || 170;
  height = height || 34;
  const pad = 2;
  const n = series.length;
  const yMin = 0, yMax = 1.5;
  const y = v => {
    const c = Math.max(yMin, Math.min(yMax, v));
    return pad + (height - 2 * pad) * (1 - (c - yMin) / (yMax - yMin));
  };
  const x = i => pad + (width - 2 * pad) * (i / Math.max(1, n - 1));
  const dem = rvDemeritSeries(series);

  // Inverted threshold bands (green at bottom, red at top)
  const bGood = `<rect x="0" y="${y(RV_DEM_GOOD).toFixed(1)}" width="${width}" height="${(y(0)         - y(RV_DEM_GOOD)).toFixed(1)}" fill="#d9efe0" opacity=".45"/>`;
  const bMid  = `<rect x="0" y="${y(RV_DEM_MID).toFixed(1)}"  width="${width}" height="${(y(RV_DEM_GOOD) - y(RV_DEM_MID)).toFixed(1)}"  fill="#fdf3d6" opacity=".45"/>`;
  const bBad  = `<rect x="0" y="${y(yMax).toFixed(1)}"        width="${width}" height="${(y(RV_DEM_MID)  - y(yMax)).toFixed(1)}"       fill="#fdf0ee" opacity=".45"/>`;

  let d = '';
  let pen = false;
  for (let i = 0; i < n; i++) {
    if (dem[i] == null) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(dem[i]).toFixed(1) + ' ';
    pen = true;
  }
  const path = d ? `<path d="${d}" fill="none" stroke="#0d3528" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>` : '';

  // Highlight the latest data point so the viewer knows where "now" is; color by severity.
  let lastDot = '';
  for (let i = n - 1; i >= 0; i--) {
    if (dem[i] != null) {
      const v = dem[i];
      const color = v >= RV_DEM_MID ? '#b3331f' : v >= RV_DEM_GOOD ? '#b58410' : '#0d3528';
      lastDot = `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.4" fill="${color}"/>`;
      break;
    }
  }

  return `<svg class="rv-spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${bGood}${bMid}${bBad}${path}${lastDot}</svg>`;
}

// ── Drill-in ──
function rvOpenDrill(pid) {
  rvDrillPid = pid;
  const main = document.getElementById('rv-main');
  const drill = document.getElementById('rv-drill');
  if (main) main.style.display = 'none';
  if (drill) drill.style.display = 'block';
  rvRenderDrill();
  window.scrollTo(0, 0);
}
function rvBack() {
  rvDrillPid = null;
  const main = document.getElementById('rv-main');
  const drill = document.getElementById('rv-drill');
  if (drill) drill.style.display = 'none';
  if (main) main.style.display = 'block';
}

function rvRenderDrill() {
  const body = document.getElementById('rv-drill-body');
  if (!body || !rvData || !rvDrillPid) return;
  const pid = rvDrillPid;
  const p = getProp(pid);
  const pd = rvData.properties[pid];
  if (!pd) { body.innerHTML = '<div class="rv-empty">No data for this property.</div>'; return; }

  const avg12 = rvAvg(pd.overall);
  const avg4  = rvAvg(pd.overall.slice(-4));
  const total = rvSum(pd.counts);
  const recent = rvSum(pd.counts.slice(-4));

  body.innerHTML = `
    <div class="rv-drill-head">
      <div>
        <div class="rv-drill-name">${escHtml(p?.name || pid)}</div>
        <div class="rv-drill-meta">${total} review${total === 1 ? '' : 's'} in last 12 months · ${recent} in last 4 weeks</div>
      </div>
      <span class="rv-badge ${rvBadgeClass(avg12)}" style="font-size:1rem;padding:6px 16px">${rvFmt(avg12)}</span>
    </div>
    <div class="rv-stats">
      <div class="rv-stat"><div class="rv-stat-lbl">12-mo overall</div><div class="rv-stat-val">${rvFmt(avg12)}</div></div>
      <div class="rv-stat"><div class="rv-stat-lbl">4-wk overall</div><div class="rv-stat-val">${rvFmt(avg4)}</div></div>
      <div class="rv-stat"><div class="rv-stat-lbl">Total reviews (12 mo)</div><div class="rv-stat-val">${total}</div></div>
      <div class="rv-stat"><div class="rv-stat-lbl">Reviews (4 wk)</div><div class="rv-stat-val">${recent}</div></div>
    </div>
    <div class="rv-chart-wrap">
      <div class="rv-chart-title">Stars below 5★ &mdash; <span style="color:var(--text3);font-weight:400">lower is better · flat on the baseline = perfect weeks</span></div>
      <div class="rv-chart-legend">
        <span><span class="dot" style="background:#0d3528"></span>≥ 4.8★ week</span>
        <span><span class="dot" style="background:#b58410"></span>4.5 – 4.8★</span>
        <span><span class="dot" style="background:#b3331f"></span>&lt; 4.5★</span>
        <span style="margin-left:auto;color:var(--text3)">Hover a week for detail</span>
      </div>
      ${rvLineChartSvg(pd.overall, pd.counts, rvData.weeks)}
    </div>`;
}

// Demerit-scale line chart. y=0 (bottom) = perfect 5★ week. Spikes upward = slips.
function rvLineChartSvg(overall, counts, weeks) {
  const W = 720, H = 260;
  const padL = 50, padR = 14, padT = 14, padB = 34;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const yMin = 0, yMax = 1.5;
  const y = v => padT + innerH * (1 - (Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin));
  const x = i => padL + innerW * (i / Math.max(1, overall.length - 1));
  const demSeries = rvDemeritSeries(overall);

  const buildPath = (series, color) => {
    let d = '', pen = false;
    for (let i = 0; i < series.length; i++) {
      if (series[i] == null) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(series[i]).toFixed(1) + ' ';
      pen = true;
    }
    return d ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` : '';
  };

  // Y-axis with dual labels (demerit + equivalent star rating)
  let yAxis = '';
  const ticks = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
  for (const v of ticks) {
    const yy = y(v);
    yAxis += `<line x1="${padL}" y1="${yy.toFixed(1)}" x2="${W - padR}" y2="${yy.toFixed(1)}" stroke="#e3e8e4" stroke-width=".6"/>`;
    const star = (5 - v).toFixed(2);
    yAxis += `<text x="${padL - 6}" y="${(yy + 3).toFixed(1)}" font-size="10" text-anchor="end" fill="#7a8a80">${star}★</text>`;
  }

  // Dashed zero-line baseline (perfect week)
  const yZero = y(0);
  const zeroLine = `<line x1="${padL}" y1="${yZero.toFixed(1)}" x2="${W - padR}" y2="${yZero.toFixed(1)}" stroke="#1f5a3a" stroke-width="1" stroke-dasharray="3,3" opacity=".5"/>`;

  // x-axis: anchor rightmost label at current week, step backward by 4
  let xAxis = '';
  for (let i = weeks.length - 1; i >= 0; i -= 4) {
    const lbl = new Date(weeks[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    xAxis += `<text x="${x(i).toFixed(1)}" y="${H - padB + 16}" font-size="10" text-anchor="middle" fill="#7a8a80">${escHtml(lbl)}</text>`;
  }

  // Points sized by severity — bigger dots for bigger slips
  let pts = '';
  for (let i = 0; i < weeks.length; i++) {
    if (demSeries[i] == null) continue;
    const d = demSeries[i];
    const r = d >= RV_DEM_MID ? 4.5 : d >= RV_DEM_GOOD ? 3.2 : 2.3;
    const color = d >= RV_DEM_MID ? '#b3331f' : d >= RV_DEM_GOOD ? '#b58410' : '#0d3528';
    pts += `<circle cx="${x(i).toFixed(1)}" cy="${y(d).toFixed(1)}" r="${r}" fill="${color}"/>`;
  }

  // Hover zones (invisible rects with <title> for native tooltip)
  let hover = '';
  const band = innerW / Math.max(1, weeks.length - 1);
  for (let i = 0; i < weeks.length; i++) {
    const dateLbl = new Date(weeks[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const parts = [`Week of ${dateLbl}`];
    if (overall[i] != null) {
      parts.push(`Avg ${overall[i].toFixed(2)}★  (lost ${demSeries[i].toFixed(2)})`);
    } else {
      parts.push('No reviews');
    }
    if (counts[i]) parts.push(`${counts[i]} review${counts[i] === 1 ? '' : 's'}`);
    const tip = parts.join(' · ');
    hover += `<rect x="${(x(i) - band / 2).toFixed(1)}" y="${padT}" width="${band.toFixed(1)}" height="${innerH}" fill="transparent"><title>${escHtml(tip)}</title></rect>`;
  }

  return `<svg class="rv-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    ${yAxis}
    ${rvThresholdBands(padL, innerW, y, yMin, yMax)}
    ${zeroLine}
    ${buildPath(demSeries, '#0d3528')}
    ${pts}
    ${xAxis}
    ${hover}
  </svg>`;
}

// ── Portfolio overview (always visible above the property list) ──

function rvSetPortfolioView(view) {
  rvPortfolioView = view;
  const tabs = document.querySelectorAll('#rv-tabs .rv-tab');
  tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-view') === view));
  rvRenderPortfolio();
}

// Weighted weekly portfolio average (weighted by review count) + per-week total volume.
// Returns { avg: [52 nums|null], totalCounts: [52 ints] }
function rvPortfolioAvgSeries() {
  const weeks = rvData.weeks;
  const avg = new Array(weeks.length).fill(null);
  const totalCounts = new Array(weeks.length).fill(0);
  for (let w = 0; w < weeks.length; w++) {
    let sumRating = 0, sumN = 0;
    for (const pid of Object.keys(rvData.properties)) {
      const p = rvData.properties[pid];
      const n = p.counts[w] || 0;
      if (n > 0 && p.overall[w] != null) {
        sumRating += p.overall[w] * n;
        sumN += n;
      }
    }
    totalCounts[w] = sumN;
    avg[w] = sumN > 0 ? +(sumRating / sumN).toFixed(3) : null;
  }
  return { avg, totalCounts };
}

function rvRenderPortfolio() {
  const body = document.getElementById('rv-portfolio-body');
  if (!body || !rvData) return;
  if (rvPortfolioView === 'all')       body.innerHTML = rvRenderPortfolioAll();
  else if (rvPortfolioView === 'byNb') body.innerHTML = rvRenderPortfolioByNb();
  else                                 body.innerHTML = rvRenderPortfolioAvg();
}

// ── Shared SVG helpers for portfolio charts ──
function rvPathFromSeries(series, x, y) {
  let d = '', pen = false;
  for (let i = 0; i < series.length; i++) {
    if (series[i] == null) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(series[i]).toFixed(1) + ' ';
    pen = true;
  }
  return d;
}
function rvYAxisSvg(y, yMin, yMax, x0, x1, step) {
  let s = '';
  for (let v = yMin; v <= yMax + 1e-6; v += step) {
    const yy = y(v);
    s += `<line x1="${x0}" y1="${yy.toFixed(1)}" x2="${x1}" y2="${yy.toFixed(1)}" stroke="#e3e8e4" stroke-width=".6"/>`;
    s += `<text x="${x0 - 6}" y="${(yy + 3).toFixed(1)}" font-size="10" text-anchor="end" fill="#7a8a80">${v.toFixed(1)}</text>`;
  }
  return s;
}
function rvXAxisSvg(weeks, x, yBase, everyN) {
  // Anchor rightmost label at the current week (last element), step backward
  let s = '';
  const step = everyN || 4;
  for (let i = weeks.length - 1; i >= 0; i -= step) {
    const lbl = new Date(weeks[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    s += `<text x="${x(i).toFixed(1)}" y="${yBase}" font-size="10" text-anchor="middle" fill="#7a8a80">${escHtml(lbl)}</text>`;
  }
  return s;
}
// Demerit-scale thresholds (lower = better).
// Rating ≥4.8 → demerit ≤0.2 (green). 4.5–4.8 → 0.2–0.5 (yellow). <4.5 → >0.5 (red).
const RV_DEM_GOOD = 0.2; // 5 - 4.8
const RV_DEM_MID  = 0.5; // 5 - 4.5
// Transform a rating (4.0–5.0) to demerit (stars lost below 5). Nulls preserved.
function rvDemerit(r) { return r == null ? null : Math.max(0, 5 - r); }
function rvDemeritSeries(series) { return series.map(rvDemerit); }
// Draw threshold bands on a demerit-scale chart (y(0) = bottom, y(yMax) = top).
function rvThresholdBands(x0, xW, y, yMin, yMax) {
  // yMin is 0 for demerit; kept in signature for legacy callers.
  const good = Math.min(RV_DEM_GOOD, yMax);
  const mid  = Math.min(RV_DEM_MID, yMax);
  return `
    <rect x="${x0}" y="${y(good).toFixed(1)}" width="${xW}" height="${(y(0)    - y(good)).toFixed(1)}" fill="#d9efe0" opacity=".35"/>
    <rect x="${x0}" y="${y(mid).toFixed(1)}"  width="${xW}" height="${(y(good) - y(mid)).toFixed(1)}"  fill="#fdf3d6" opacity=".35"/>
    <rect x="${x0}" y="${y(yMax).toFixed(1)}" width="${xW}" height="${(y(mid)  - y(yMax)).toFixed(1)}" fill="#fdf0ee" opacity=".35"/>`;
}

// View 1: portfolio demerit (stars below 5) + review volume bars
function rvRenderPortfolioAvg() {
  const { avg, totalCounts } = rvPortfolioAvgSeries();
  const weeks = rvData.weeks;
  const W = 720, H = 240;
  const padL = 52, padR = 34, padT = 14, padB = 32;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const yMin = 0;
  const x   = i => padL + innerW * (i / Math.max(1, weeks.length - 1));
  const maxCount = Math.max(1, ...totalCounts);
  // Bars occupy bottom 30% of inner area — layered behind the line.
  const barHMax = innerH * 0.3;
  const barYBase = padT + innerH;
  const barW = Math.max(2, (innerW / weeks.length) - 1);

  const demAvg = rvDemeritSeries(avg);

  // Dynamic y-axis ceiling: snap up to nearest 0.1 above the actual peak, min 0.3
  const peakDem = Math.max(0, ...demAvg.filter(v => v != null));
  const yMax = Math.max(0.3, Math.ceil((peakDem + 0.05) * 10) / 10);
  const y   = v => padT + innerH * (1 - (Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin));

  let bars = '';
  for (let i = 0; i < weeks.length; i++) {
    if (!totalCounts[i]) continue;
    const h = (totalCounts[i] / maxCount) * barHMax;
    bars += `<rect x="${(x(i) - barW / 2).toFixed(1)}" y="${(barYBase - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="#c9a84c" opacity=".35"><title>${escHtml(new Date(weeks[i]).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))} · ${totalCounts[i]} review${totalCounts[i]===1?'':'s'}</title></rect>`;
  }

  const dPath = rvPathFromSeries(demAvg, x, y);
  const pathEl = dPath ? `<path d="${dPath}" fill="none" stroke="#0d3528" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` : '';

  // Dashed zero baseline = perfect week
  const yZero = y(0);
  const zeroLine = `<line x1="${padL}" y1="${yZero.toFixed(1)}" x2="${W - padR}" y2="${yZero.toFixed(1)}" stroke="#1f5a3a" stroke-width="1" stroke-dasharray="3,3" opacity=".5"/>`;

  // Severity-colored dots
  let pts = '';
  for (let i = 0; i < weeks.length; i++) {
    if (demAvg[i] == null) continue;
    const d = demAvg[i];
    const r = d >= RV_DEM_MID ? 4.2 : d >= RV_DEM_GOOD ? 3.0 : 2.4;
    const color = d >= RV_DEM_MID ? '#b3331f' : d >= RV_DEM_GOOD ? '#b58410' : '#0d3528';
    const tip = `${new Date(weeks[i]).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · avg ${avg[i].toFixed(2)}★ (lost ${d.toFixed(2)}) · ${totalCounts[i]} review${totalCounts[i]===1?'':'s'}`;
    pts += `<circle cx="${x(i).toFixed(1)}" cy="${y(d).toFixed(1)}" r="${r}" fill="${color}"><title>${escHtml(tip)}</title></circle>`;
  }

  // Demerit y-axis with star-equivalent labels — ticks at standard thresholds + ceiling
  let yAxis = '';
  const stdTicks = [0, 0.2, 0.5, 1.0].filter(v => v < yMax - 1e-6);
  const ticks = [...new Set([...stdTicks, yMax])].sort((a, b) => a - b);
  for (const v of ticks) {
    const yy = y(v);
    yAxis += `<line x1="${padL}" y1="${yy.toFixed(1)}" x2="${W - padR}" y2="${yy.toFixed(1)}" stroke="#e3e8e4" stroke-width=".6"/>`;
    yAxis += `<text x="${padL - 6}" y="${(yy + 3).toFixed(1)}" font-size="10" text-anchor="end" fill="#7a8a80">${(5 - v).toFixed(1)}★</text>`;
  }

  // Right-side count axis (bars)
  const countTicks = [0, Math.round(maxCount / 2), maxCount];
  let rightAxis = '';
  for (const v of countTicks) {
    if (v === 0) continue;
    const h = (v / maxCount) * barHMax;
    const yy = barYBase - h;
    rightAxis += `<text x="${W - padR + 6}" y="${(yy + 3).toFixed(1)}" font-size="10" text-anchor="start" fill="#8f7624">${v}</text>`;
  }
  rightAxis += `<text x="${W - padR + 6}" y="${(barYBase + 3).toFixed(1)}" font-size="10" text-anchor="start" fill="#8f7624">0</text>`;

  const totalReviews = totalCounts.reduce((s, n) => s + n, 0);
  const weeksWithReviews = totalCounts.filter(n => n > 0).length;
  const overallWeightedAvg = (() => {
    let s = 0, n = 0;
    for (let i = 0; i < avg.length; i++) if (avg[i] != null) { s += avg[i] * totalCounts[i]; n += totalCounts[i]; }
    return n > 0 ? s / n : null;
  })();
  // Count weeks with visible slips (below 4.8★ → demerit > 0.2)
  const slipWeeks = demAvg.filter(v => v != null && v > RV_DEM_GOOD).length;

  return `
    <div class="rv-chart-title">Stars below 5★ &mdash; <span style="color:var(--text3);font-weight:400">lower is better · flat on the baseline = perfect week</span></div>
    <svg class="rv-portfolio-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      ${yAxis}
      ${rvThresholdBands(padL, innerW, y, yMin, yMax)}
      ${bars}
      ${zeroLine}
      ${pathEl}
      ${pts}
      ${rvXAxisSvg(weeks, x, H - padB + 16, 4)}
      ${rightAxis}
    </svg>
    <div class="rv-portfolio-legend">
      <span><span class="swatch" style="background:#0d3528;border-radius:50%"></span>Portfolio weekly avg (stars below 5★, count-weighted)</span>
      <span><span class="swatch" style="background:#b58410;border-radius:50%"></span>4.5 – 4.8★ week</span>
      <span><span class="swatch" style="background:#b3331f;border-radius:50%"></span>&lt; 4.5★ week</span>
      <span><span class="swatch" style="background:#c9a84c;opacity:.5"></span>Reviews that week</span>
    </div>
    <div class="rv-portfolio-stats">
      <span>12-mo portfolio avg: <strong>${rvFmt(overallWeightedAvg)}★</strong></span>
      <span>Weeks with a slip (&lt; 4.8★): <strong>${slipWeeks} / ${weeksWithReviews}</strong></span>
      <span>Reviews in window: <strong>${totalReviews}</strong></span>
    </div>`;
}

// View 2: all 18 lines + bold portfolio avg (demerit scale)
function rvRenderPortfolioAll() {
  const weeks = rvData.weeks;
  const W = 720, H = 260;
  const padL = 52, padR = 14, padT = 14, padB = 32;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const yMin = 0, yMax = 1.5;
  const y = v => padT + innerH * (1 - (Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin));
  const x = i => padL + innerW * (i / Math.max(1, weeks.length - 1));

  let thinPaths = '';
  for (const pid of Object.keys(rvData.properties)) {
    const series = rvData.properties[pid].overall;
    const d = rvPathFromSeries(rvDemeritSeries(series), x, y);
    if (!d) continue;
    const color = rvColorForPid(pid);
    const name = (getProp(pid) || {}).name || pid;
    thinPaths += `<path d="${d}" fill="none" stroke="${color}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" opacity=".55"><title>${escHtml(name)}</title></path>`;
  }

  const { avg, totalCounts } = rvPortfolioAvgSeries();
  const demAvg = rvDemeritSeries(avg);
  const dAvg = rvPathFromSeries(demAvg, x, y);
  const avgPath = dAvg ? `<path d="${dAvg}" fill="none" stroke="#0d3528" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>` : '';

  // Dashed zero baseline
  const yZero = y(0);
  const zeroLine = `<line x1="${padL}" y1="${yZero.toFixed(1)}" x2="${W - padR}" y2="${yZero.toFixed(1)}" stroke="#1f5a3a" stroke-width="1" stroke-dasharray="3,3" opacity=".5"/>`;

  // Y-axis with star-equivalent labels
  let yAxis = '';
  const ticks = [0, 0.2, 0.5, 1.0, 1.5];
  for (const v of ticks) {
    if (v > yMax + 1e-6) continue;
    const yy = y(v);
    yAxis += `<line x1="${padL}" y1="${yy.toFixed(1)}" x2="${W - padR}" y2="${yy.toFixed(1)}" stroke="#e3e8e4" stroke-width=".6"/>`;
    yAxis += `<text x="${padL - 6}" y="${(yy + 3).toFixed(1)}" font-size="10" text-anchor="end" fill="#7a8a80">${(5 - v).toFixed(1)}★</text>`;
  }

  // Hover zones for the portfolio avg line
  let hover = '';
  const band = innerW / Math.max(1, weeks.length - 1);
  for (let i = 0; i < weeks.length; i++) {
    const dateLbl = new Date(weeks[i]).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const parts = [dateLbl];
    if (avg[i] != null) parts.push(`Portfolio avg ${avg[i].toFixed(2)}★ (lost ${demAvg[i].toFixed(2)})`);
    else parts.push('No reviews');
    if (totalCounts[i]) parts.push(`${totalCounts[i]} review${totalCounts[i]===1?'':'s'}`);
    hover += `<rect x="${(x(i) - band / 2).toFixed(1)}" y="${padT}" width="${band.toFixed(1)}" height="${innerH}" fill="transparent"><title>${escHtml(parts.join(' · '))}</title></rect>`;
  }

  // Build neighborhood legend
  const legend = NBS.map(nb =>
    `<span><span class="swatch" style="background:${RV_NB_COLOR[nb.cls]}"></span>${escHtml(nb.name)}</span>`
  ).join('');

  return `
    <div class="rv-chart-title">Stars below 5★ per property &mdash; <span style="color:var(--text3);font-weight:400">each thin line = one property · bold = portfolio average</span></div>
    <svg class="rv-portfolio-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      ${yAxis}
      ${rvThresholdBands(padL, innerW, y, yMin, yMax)}
      ${zeroLine}
      ${thinPaths}
      ${avgPath}
      ${rvXAxisSvg(weeks, x, H - padB + 16, 4)}
      ${hover}
    </svg>
    <div class="rv-portfolio-legend">
      ${legend}
      <span style="margin-left:auto"><span class="swatch" style="background:#0d3528;width:18px;height:3px;border-radius:2px;vertical-align:1px"></span>Portfolio avg</span>
    </div>`;
}

// View 3: 6 small multiples, one per neighborhood (demerit scale)
function rvRenderPortfolioByNb() {
  const weeks = rvData.weeks;
  const yMin = 0, yMax = 1.5;
  const cells = NBS.map(nb => {
    // Build weighted weekly avg for this nb only
    const nbAvg = new Array(weeks.length).fill(null);
    const nbCount = new Array(weeks.length).fill(0);
    for (let w = 0; w < weeks.length; w++) {
      let sumR = 0, sumN = 0;
      for (const pid of nb.props) {
        const p = rvData.properties[pid];
        if (!p) continue;
        const n = p.counts[w] || 0;
        if (n > 0 && p.overall[w] != null) { sumR += p.overall[w] * n; sumN += n; }
      }
      nbAvg[w] = sumN > 0 ? +(sumR / sumN).toFixed(3) : null;
      nbCount[w] = sumN;
    }
    const nbTotalN = nbCount.reduce((s, n) => s + n, 0);
    const nbOverall = (() => {
      let s = 0, n = 0;
      for (let i = 0; i < nbAvg.length; i++) if (nbAvg[i] != null) { s += nbAvg[i] * nbCount[i]; n += nbCount[i]; }
      return n > 0 ? s / n : null;
    })();

    const W = 280, H = 100;
    const padL = 28, padR = 4, padT = 6, padB = 14;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const y = v => padT + innerH * (1 - (Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin));
    const x = i => padL + innerW * (i / Math.max(1, weeks.length - 1));
    const color = RV_NB_COLOR[nb.cls] || '#0d3528';

    let propPaths = '';
    for (const pid of nb.props) {
      const p = rvData.properties[pid];
      if (!p) continue;
      const d = rvPathFromSeries(rvDemeritSeries(p.overall), x, y);
      if (!d) continue;
      propPaths += `<path d="${d}" fill="none" stroke="${color}" stroke-width=".9" opacity=".45"/>`;
    }
    const dAvg = rvPathFromSeries(rvDemeritSeries(nbAvg), x, y);
    const avgPath = dAvg ? `<path d="${dAvg}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` : '';

    // Dashed zero baseline
    const yZero = y(0);
    const zeroLine = `<line x1="${padL}" y1="${yZero.toFixed(1)}" x2="${W - padR}" y2="${yZero.toFixed(1)}" stroke="${color}" stroke-width=".8" stroke-dasharray="3,3" opacity=".45"/>`;

    // Mini y-axis ticks labeled as stars (0.0 dem → 5★, 0.5 dem → 4.5★, 1.0 dem → 4★)
    let yticks = '';
    for (const v of [0, 0.5, 1.0]) {
      const yy = y(v);
      yticks += `<line x1="${padL}" y1="${yy.toFixed(1)}" x2="${W - padR}" y2="${yy.toFixed(1)}" stroke="#e3e8e4" stroke-width=".5"/>`;
      yticks += `<text x="${padL - 3}" y="${(yy + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="#8aaa95">${(5 - v).toFixed(1)}★</text>`;
    }

    return `
      <div class="rv-sm-cell">
        <div class="rv-sm-head">
          <span class="rv-sm-name" style="color:${color}">${escHtml(nb.name)}</span>
          <span class="rv-sm-avg"><span class="rv-badge ${rvBadgeClass(nbOverall)}" style="font-size:.7rem;padding:2px 8px">${rvFmt(nbOverall)}</span></span>
        </div>
        <svg class="rv-sm-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
          ${rvThresholdBands(padL, innerW, y, yMin, yMax)}
          ${yticks}
          ${zeroLine}
          ${propPaths}
          ${avgPath}
        </svg>
        <div class="rv-sm-meta">${nb.props.length} propert${nb.props.length === 1 ? 'y' : 'ies'} · ${nbTotalN} review${nbTotalN === 1 ? '' : 's'}</div>
      </div>`;
  }).join('');

  return `<div class="rv-sm-grid">${cells}</div>`;
}

function rvSetSection(name) {
  if (name !== 'reviews' && name !== 'cleaning') name = 'reviews';
  rvActiveSection = name;
  const secR = document.getElementById('rv-section-reviews');
  const secC = document.getElementById('rv-section-cleaning');
  if (secR) secR.style.display = (name === 'reviews')  ? '' : 'none';
  if (secC) secC.style.display = (name === 'cleaning') ? '' : 'none';
  const tabR = document.getElementById('rv-sec-tab-reviews');
  const tabC = document.getElementById('rv-sec-tab-cleaning');
  if (tabR) tabR.classList.toggle('active', name === 'reviews');
  if (tabC) tabC.classList.toggle('active', name === 'cleaning');
  // Lazy-load cleaning data on first switch
  if (name === 'cleaning' && !rvCleaningLoaded) {
    rvCleaningLoaded = true;
    if (typeof clLoaded !== 'undefined' && !clLoaded && !clFetching && typeof clFetch === 'function') {
      clFetch();
    }
  }
}

function rvInit() {
  // If a drill-in was open and user navigated away and back, restore list view
  if (rvDrillPid && document.getElementById('rv-main') &&
      document.getElementById('rv-main').style.display === 'none') {
    // keep drill open if they left it open — nothing to do
  }
  if (!rvData && !rvFetching) rvFetchAll(false);
  else rvRender();
}

// ═══════════════  END Reviews  ═══════════════

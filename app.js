// ── User Name Mapping (for note attribution) ─────────────────
const USER_NAME_MAP={'cb@chipburns.com':'Chip','properties@chipburns.com':'Chip'};
function getCurrentUserName(){
  try{const t=localStorage.getItem('se_auth_token');if(t){const p=JSON.parse(atob(t.split('.')[1]));return USER_NAME_MAP[(p.email||'').toLowerCase()]||p.name||'Admin';}}catch(e){}
  return 'Chip'; // fallback for dev
}

// ── Hospitable REST API v2 (replaces iCal) ──────────────────
// Property shortnames → Hospitable UUID property IDs
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
  {id:'prc6',name:"PRC - 6 - The Ringbearer's Roost",address:'1627 Paradise Ridge Dr. Unit 6',door:'1476'},
  {id:'umc10',name:'UMC - 10 - The Whispering Wand',address:'1181 Upper Middle Creek Rd., Cabin 10',door:'5582'},
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
  {id:'hillside_big',name:'Hillside Haven: The Big House',address:'226 Oak Hill, Jacksons Gap, AL',door:'4425'},
  {id:'hillside_cottage',name:'Hillside Haven: The Cottage',address:'218 Oak Hill, Jacksons Gap, AL',door:'O812'},
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
const VCAT = [
  {id:'cleaning',label:'Cleaning'},{id:'handyman',label:'Handyman'},
  {id:'plumbing',label:'Plumbing'},{id:'hvac',label:'HVAC / Electrical'},
  {id:'pest',label:'Pest Control'},{id:'landscaping',label:'Landscaping'},
  {id:'hot_tub',label:'Hot Tub'},{id:'pool',label:'Pool'},
  {id:'arcade',label:'Arcade / Billiards'},{id:'septic',label:'Septic'},
  {id:'water',label:'Water Filtration'},{id:'bed_bugs',label:'Bed Bugs'},
  {id:'other',label:'Other'},
];

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

async function load() {
  try{const r=await S.get('se_t');if(r)tasks=JSON.parse(r.value);}catch(e){tasks=[];}
  try{const r=await S.get('se_v');if(r)vendors=JSON.parse(r.value);else{vendors=JSON.parse(JSON.stringify(DEF_VENDORS));await save('se_v',vendors);}}catch(e){vendors=JSON.parse(JSON.stringify(DEF_VENDORS));}
  try{const r=await S.get('se_r');if(r)recurring=JSON.parse(r.value);else{recurring=JSON.parse(JSON.stringify(DEF_RECURRING));await save('se_r',recurring);}}catch(e){recurring=JSON.parse(JSON.stringify(DEF_RECURRING));}
}
async function save(k,v){try{await S.set(k,JSON.stringify(v));}catch(e){}}
const saveTasks=()=>save('se_t',tasks);
const saveVendors=()=>save('se_v',vendors);
const saveRec=()=>save('se_r',recurring);

// HELPERS
const getNb=id=>NBS.find(n=>n.props.includes(id));
const getProp=id=>PROPS.find(p=>p.id===id);
const getNbCls=id=>{const n=getNb(id);return n?n.cls:'other';};
const fmtDate=ds=>{if(!ds)return'';const d=new Date(ds+'T12:00:00');return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});};
const fmtReported=iso=>{if(!iso)return'';const d=new Date(iso);const now=new Date();const diff=now-d;const days=Math.floor(diff/864e5);const hrs=Math.floor(diff/36e5);const mins=Math.floor(diff/6e4);const ago=days>0?days===1?'1 day ago':`${days} days ago`:hrs>0?hrs===1?'1 hr ago':`${hrs} hrs ago`:mins>1?`${mins} min ago`:'Just now';return`${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})} (${ago})`;};

// INIT
function switchView(name,btn){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  btn.classList.add('active');
  // Cleaning log now pre-loaded on init; this is a fallback
  if (name === 'cleaning' && !clLoaded && !clFetching) clFetch();
  // Refresh replacements view when switching to it
  if (name === 'replacements') renderReplacements();
}

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

function renderAll(){renderVR();renderVD();renderUB();renderTasks();renderCalendar();renderRecurring();renderHistory();renderVendors();}

// URGENT BANNER
function renderUB(){
  const u=tasks.filter(t=>t.urgent&&!['complete','resolved_by_guest'].includes(t.status));
  const c=document.getElementById('ub-wrap');
  if(!u.length){c.innerHTML='';return;}
  c.innerHTML=`<div class="ub"><div class="ub-title">Urgent — Immediate Attention Required (${u.length})</div>${u.map(t=>{const p=getProp(t.property);return`<div class="ui" onclick="openDetail('${t.id}')"><div><div class="ui-prop">${p?p.name:t.property}</div><div class="ui-prob">${t.problem}</div></div><span class="upill">Urgent</span></div>`;}).join('')}</div>`;
}

// VENDOR-DONE BANNER — tasks vendors marked complete, awaiting admin confirmation
function renderVD(){
  const vd=tasks.filter(t=>t.vendorDone&&!['complete','resolved_by_guest'].includes(t.status));
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
  tasks.push(newTask);
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
  const u=tasks.filter(t=>t.urgent&&!['complete','resolved_by_guest'].includes(t.status)).length;
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
const CAT_LABELS={handyman:'Handyman',plumbing:'Plumbing',hvac:'HVAC',electrical:'Electrical',hot_tub:'Hot Tub',pool:'Pool',pest:'Pest Control',cleaning:'Cleaning',landscaping:'Landscaping',arcade:'Arcade / Billiards',septic:'Septic',water:'Water Filtration',bed_bugs:'Bed Bugs',other:'Other','':`Uncategorized`};
let catFilter='all';
let propFilter='all';
let dateSort=false;
function overdueBadge(t){
  if(!t.date||['complete','resolved_by_guest'].includes(t.status))return'';
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
  return`<div class="tc ${nbcls} ${t.status==='complete'?'done':''}" onclick="openDetail('${t.id}')">
    <div class="tc-top">${dot}<div class="tmain">
      <div class="tprop ${plcls}">${p?p.name:t.property}</div>
      <div class="tprob">${t.problem}</div>
      <div class="tmeta">
        ${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}
        ${t.recurring?'<span class="badge b-rec">Recurring</span>':''}
        <span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>
        ${t.date?`<span class="tmi">${t.date}</span>${overdueBadge(t)}`:(t.status!=='scheduled'?'<span class="tmi" style="color:var(--text3)">Not scheduled</span>':'')}
        ${t.vendor?`<span class="tmi">${t.vendor}</span>`:''}${t.vendorDone?'<span class="vd-badge">Vendor Done</span>':''}
        ${t.purchaseNote?'<span style="font-size:.62rem;color:#e65100;font-weight:600;background:#fff3e0;padding:1px 6px;border-radius:10px;border:1px solid #ffcc80">&#x1F6D2; Purchase</span>':''}
        ${t.guest?`<span class="tmi">Reported by ${t.guest}</span>`:''}
      </div>
    </div></div>
  </div>`;
}
function renderTasks(){
  const q=document.getElementById('search-input').value.toLowerCase();
  const active=tasks.filter(t=>!['complete','resolved_by_guest'].includes(t.status));
  let f=active.filter(t=>{
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

  // Sort within each group: urgent first, then by status, then by date
  const sortTasks=arr=>arr.sort((a,b)=>{
    if(a.urgent&&!b.urgent)return-1;if(!a.urgent&&b.urgent)return 1;
    const o={open:0,scheduled:1,in_progress:2};
    if(o[a.status]!==o[b.status])return o[a.status]-o[b.status];
    return new Date(b.created)-new Date(a.created);
  });

  const el=document.getElementById('task-list');
  if(!f.length){el.innerHTML='<div class="empty">No tasks found.</div>';return;}

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
    html+=`<div class="cat-section">
      <div class="cat-section-hdr"><span class="cat-section-title">Needs Scheduling</span><span class="cat-section-count">${needsScheduling.length}</span></div>
      <div class="task-list">${needsScheduling.map(taskCard).join('')}</div>
    </div>`;
  }
  if(scheduled.length){
    html+=`<div class="cat-section">
      <div class="cat-section-hdr"><span class="cat-section-title">Scheduled</span><span class="cat-section-count">${scheduled.length}</span></div>
      <div class="task-list">${scheduled.map(taskCard).join('')}</div>
    </div>`;
  }
  el.innerHTML=html;
}
function setCatFilter(c,btn){catFilter=c;document.querySelectorAll('.fb').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderTasks();}
function setPropFilter(v){propFilter=v;renderTasks();}
function toggleDateSort(){dateSort=!dateSort;document.getElementById('date-sort-btn').classList.toggle('active',dateSort);renderTasks();}
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
  const pid=px==='f'?document.getElementById('f-property').value:(tasks.find(t=>t.id===detailId)||{}).property;
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
      const allowPast=px==='d'&&detailId&&tasks.find(x=>x.id===detailId&&(x.status==='complete'||x.status==='resolved_by_guest'));
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
  popup.innerHTML=h;
}
async function dpNav(px,dir,y,m){
  const nd=new Date(y,m+dir,1);
  const pid=px==='f'?document.getElementById('f-property').value:(tasks.find(t=>t.id===detailId)||{}).property;
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
  let h=`<div class="vg-week-wrap ${hasUrg?'urg':''}" onclick="openVendorDay('${vg.name.replace(/'/g,"\\'")}','${ds}')">`;
  h+=`<div class="vg-week-hdr"><span class="vg-week-name">${firstName}</span><span class="vg-week-count">${vg.tasks.length} jobs</span></div>`;
  let lastNbName='';
  sorted.forEach(t=>{
    const nc=getNbCls(t.property);const nb=getNb(t.property);const nbName=nb?nb.name:'Other';
    const p=getProp(t.property);const sh=p?p.name.split(' - ').pop():t.property;
    if(nbName!==lastNbName){lastNbName=nbName;h+=`<div class="vg-week-nb-hdr vg-t-${nc}">${nbName}</div>`;}
    h+=`<div class="vg-week-task vg-t-${nc}"><div class="vg-week-task-prop">${sh}</div><div class="vg-week-task-desc">${t.problem}</div></div>`;
  });
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
function renderCalendar(){
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  if(calMode==='month'){
    document.getElementById('cal-title').textContent=`${MN[calDate.getMonth()]} ${calDate.getFullYear()}`;
    document.getElementById('cal-container').innerHTML=buildMonth();
  } else {
    const ws=wkStart(calDate);const we=new Date(ws);we.setDate(we.getDate()+6);
    const wTitle=ws.getMonth()===we.getMonth()?`${MN[ws.getMonth()]} ${ws.getDate()} – ${we.getDate()}, ${ws.getFullYear()}`:`${MN[ws.getMonth()]} ${ws.getDate()} – ${MN[we.getMonth()]} ${we.getDate()}, ${we.getFullYear()}`;
    document.getElementById('cal-title').textContent=wTitle;
    document.getElementById('cal-container').innerHTML=buildWeek(ws);
  }
  const leg=NBS.map(nb=>`<div class="cli"><div class="cld" style="background:var(--${nb.cls})"></div>${nb.name}</div>`).join('');
  document.getElementById('cal-legend').innerHTML=leg
    +'<div class="cli"><div class="cld" style="background:var(--border);border:1px dashed var(--border-dark)"></div>Suggested</div>'
    +'<div class="cli"><div class="cld" style="background:var(--red);outline:2px solid var(--red)"></div>Urgent</div>';
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
      const dayTasks=tasks.filter(t=>t.date===ds&&!['complete','resolved_by_guest'].includes(t.status));
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
        tasks.filter(t=>t.date===ds&&['complete','resolved_by_guest'].includes(t.status)).forEach(t=>{
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
  let h='<div class="wk-grid"><div class="wk-hrow"><div class="wk-corner"></div>';
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const isT=d.toDateString()===today.toDateString();h+=`<div class="wk-hcell ${isT?'tdc':''}"><div class="wd">${DOW[d.getDay()]}</div><div class="wdt">${MNS[d.getMonth()]} ${d.getDate()}</div></div>`;}
  h+='</div><div class="wk-brow"><div class="wk-lbl">All day</div>';
  for(let i=0;i<7;i++){
    const d=new Date(ws);d.setDate(ws.getDate()+i);
    const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    h+='<div class="wk-day">';
    const wkDayTasks=tasks.filter(t=>t.date===ds&&!['complete','resolved_by_guest'].includes(t.status));
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
      tasks.filter(t=>t.date===ds&&['complete','resolved_by_guest'].includes(t.status)).forEach(t=>{
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
function calPrev(){if(calMode==='month')calDate.setMonth(calDate.getMonth()-1);else calDate.setDate(calDate.getDate()-7);renderCalendar();}
function calNext(){if(calMode==='month')calDate.setMonth(calDate.getMonth()+1);else calDate.setDate(calDate.getDate()+7);renderCalendar();}
function calToday(){calDate=new Date();renderCalendar();}
function setCalMode(m,btn){calMode=m;document.querySelectorAll('.cal-mode').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderCalendar();}

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
        <button class="btn" onclick="genFromRec('${r.id}')">Generate Task</button>
        <button class="btn" style="font-size:.7rem" onclick="editRec('${r.id}')">Edit</button>
        <button class="btn btn-red" style="font-size:.7rem" onclick="delRec('${r.id}')">Remove</button>
      </div></div>`;
    });
    h+='</div></div>';
  });
  c.innerHTML=h;
}
let editRecId=null;
function populateRecVendor(selectedVendor){
  const cat=document.getElementById('r-cat').value;
  const sel=document.getElementById('r-vendor');
  const prev=selectedVendor!==undefined?selectedVendor:sel.value;
  sel.innerHTML='<option value="">— None —</option>';
  // Add vendors matching this category first, then all others
  const matched=vendors.filter(v=>v.categories.includes(cat));
  const others=vendors.filter(v=>!v.categories.includes(cat));
  if(matched.length){
    const og1=document.createElement('optgroup');og1.label='Recommended';
    matched.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name+' — '+v.role;og1.appendChild(o);});
    sel.appendChild(og1);
  }
  if(others.length){
    const og2=document.createElement('optgroup');og2.label='Other Vendors';
    others.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name+' — '+v.role;og2.appendChild(o);});
    sel.appendChild(og2);
  }
  sel.appendChild(Object.assign(document.createElement('option'),{value:'__custom__',textContent:'✎ Custom...'}));
  // Restore previous selection if it exists
  if(prev&&prev!=='__custom__'){
    const exists=Array.from(sel.options).some(o=>o.value===prev);
    sel.value=exists?prev:'__custom__';
    if(!exists&&prev){document.getElementById('r-vendor-custom').value=prev;document.getElementById('r-vendor-custom-wrap').style.display='';}
    else{document.getElementById('r-vendor-custom-wrap').style.display='none';}
  } else if(prev==='__custom__'){sel.value='__custom__';document.getElementById('r-vendor-custom-wrap').style.display='';}
  else{document.getElementById('r-vendor-custom-wrap').style.display='none';}
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
async function genFromRec(id){
  const r=recurring.find(x=>x.id===id);if(!r)return;
  const ps=r.properties.includes('all')?PROPS.map(p=>p.id):r.properties;let n=0;let skipped=0;
  ps.forEach(pid=>{
    // Prevent duplicates: skip if a task for this recurring item already exists on this date for this property
    const dup=tasks.some(x=>x.property===pid&&x.date===(r.nextDue||'')&&x.recurring&&x.problem===r.name&&!['complete','resolved_by_guest'].includes(x.status));
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
  if(!t.date||['complete','resolved_by_guest'].includes(t.status)||t.assignedToGuest)return;
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
    const alreadyScheduled=tasks.some(x=>x.property===t.property&&x.recurring&&matchesRecurring(x.problem)&&!['complete','resolved_by_guest'].includes(x.status));
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
  document.getElementById('task-modal').classList.add('open');
  if(propId)setTimeout(()=>document.getElementById('f-property').value=propId,50);
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
  const t={id:Date.now().toString(),property:pid,guest:document.getElementById('f-guest').value.trim(),problem:prob,category:document.getElementById('f-category').value,status:fStatus,date:fDate,vendor:document.getElementById('f-vendor').value.trim(),urgent:document.getElementById('f-urgent').checked,recurring:false,notes:nt?[{text:nt,type:'admin',time:new Date().toISOString()}]:[],vendorNotes:'',created:new Date().toISOString()};
  tasks.unshift(t);await saveTasks();closeModal('task-modal');renderAll();showToast('Task created.');
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
  // Badges — compact: status + combined reporter/date
  const guestFirst=t.guest?t.guest.split(' ')[0]:'';
  const createdShort=t.created?new Date(t.created).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
  const reporterBadge=(guestFirst||createdShort)?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">${guestFirst}${guestFirst&&createdShort?' \u00B7 ':''}${createdShort}</span>`:'';
  document.getElementById('d-badges').innerHTML=`
    ${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}
    ${t.recurring?'<span class="badge b-rec">Recurring</span>':''}
    <span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>
    ${reporterBadge}`;
  document.getElementById('d-purchase').value=t.purchaseNote||'';
  const pSaved=document.getElementById('d-purchase-saved');
  if(pSaved)pSaved.style.display=t.purchaseNote?'':'none';
  renderUrgentToggle(t);
  showTaskPhoto(t);
  showVendorPhotos(t);
  renderDetailVendors(t,p);renderNotes(t);checkCombine();
  closeVendorDD(); // reset dropdown state when opening a new task
  renderMiniCal(t.property).then(()=>renderDetailVendors(t,p));
  // Guest context section removed — not useful for admin workflow
  document.getElementById('d-guest-context').innerHTML='';
  // Guest communication tools — only during active guest stay
  renderGuestComm(t);
  const isDone=['complete','resolved_by_guest'].includes(t.status);
  document.getElementById('complete-btn').style.display=isDone?'none':'';
  // Vendor-done approval notice
  const vdNotice=document.getElementById('d-vendor-done-notice');
  if(vdNotice){
    if(t.vendorDone&&!['complete','resolved_by_guest'].includes(t.status)){
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
  await saveTasks();
  const pSaved=document.getElementById('d-purchase-saved');
  if(pSaved){pSaved.style.display=val?'':'none';}
  renderAll();
  showToast(val?'Purchase note saved.':'Purchase note cleared.');
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
    if(!['complete','resolved_by_guest'].includes(t.status))continue;
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
  const fmtD=new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  document.getElementById('vd-date').textContent=fmtD;
  document.getElementById('vd-title').textContent=`${vendorName} — ${vdTasks.length} Jobs`;
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
  // Render combined SMS if vendor exists in our list
  if(v){
    document.getElementById('vd-combined-sms').innerHTML=combinedVendorCard(v,vdTasks,sheetUrl);
  } else {
    document.getElementById('vd-combined-sms').innerHTML=`<div style="font-size:.82rem;color:var(--text2);padding:6px 0;margin-bottom:8px"><strong>${vendorName}</strong> is not in the vendor list — add them to send a combined message.</div>`;
  }
  // Render individual task cards sorted by neighborhood then property (matches SMS order)
  const sortedVd=[...vdTasks].sort((a,b)=>{
    const nbA=getNb(a.property),nbB=getNb(b.property);
    const nA=nbA?nbA.name:'zzz',nB=nbB?nbB.name:'zzz';
    if(nA!==nB)return nA.localeCompare(nB);
    return(a.property||'').localeCompare(b.property||'');
  });
  let th='';let lastNb='';let lastProp='';let propCount=0;
  // Pre-count tasks per property for grouping decisions
  const propCounts={};sortedVd.forEach(t=>{propCounts[t.property]=(propCounts[t.property]||0)+1;});
  sortedVd.forEach((t,i)=>{
    const p=getProp(t.property);const nc=getNbCls(t.property);const nb=getNb(t.property);const sh=p?p.name.split(' - ').pop():t.property;
    const nbName=nb?nb.name:'Other';
    // Neighborhood header when neighborhood changes
    if(nbName!==lastNb){
      if(lastProp&&propCounts[lastProp]>1) th+=`</div>`; // close previous property group
      if(lastNb) th+=`</div>`; // close previous neighborhood section
      th+=`<div class="vd-nb-section" style="margin-bottom:2px">`;
      th+=`<div class="vd-nb-hdr nb-${nc}-h" style="display:flex;align-items:center;gap:8px;padding:6px 0 4px;border-bottom:2px solid;margin-bottom:6px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px">${nbName}</div>`;
      lastNb=nbName;lastProp='';
    }
    // Property sub-group container when property changes and has multiple tasks
    if(t.property!==lastProp){
      if(lastProp&&propCounts[lastProp]>1) th+=`</div>`; // close previous property group
      if(propCounts[t.property]>1){
        th+=`<div style="background:rgba(0,0,0,.02);border-radius:8px;padding:6px 6px 6px 6px;margin-bottom:4px">`;
        th+=`<div style="font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--text3);padding:2px 8px 4px;display:flex;align-items:center;gap:6px"><span style="color:var(--${nc})">${sh}</span><span style="font-weight:400;letter-spacing:0;text-transform:none">${propCounts[t.property]} tasks</span></div>`;
      }
      lastProp=t.property;
    }
    th+=`<div class="tc nb-${nc}" style="cursor:pointer" onclick="closeModal('vendor-day-modal');openDetail('${t.id}')">
      <div class="tc-top"><div class="tdot dot-${t.status}"></div><div class="tmain"><div class="tprop pl-${nc}">${sh}</div><div class="tprob">${t.problem}</div>
      <div class="tmeta"><span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}<span class="tmi">${t.category?t.category.replace('_',' '):''}</span></div></div></div></div>`;
  });
  if(lastProp&&propCounts[lastProp]>1) th+=`</div>`; // close last property group
  if(lastNb) th+=`</div>`; // close last neighborhood section
  document.getElementById('vd-tasks').innerHTML=th;
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
  const phoneLinks=phone?`<div class="vc-action-row" style="flex-shrink:0">
    <a href="sms:${phone}" class="vc-action-btn vc-text"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg> Text ${phoneFmt}</a>
    <a href="tel:${phone}" class="vc-action-btn vc-call"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Call</a>
  </div>`:`<div class="vc-action-row" style="flex-shrink:0">
    <span class="vc-action-btn vc-disabled"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg> Text</span>
    <span class="vc-action-btn vc-disabled"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Call</span>
    <span class="vc-no-phone">No phone on file</span>
  </div>`;
  // Determine if guest action buttons should show
  const tRef=tasks.find(x=>x.id===detailId);
  const gcIsDone=tRef&&['complete','resolved_by_guest'].includes(tRef.status);
  const showAssignGuest=tRef&&!gcIsDone&&!tRef.assignedToGuest;
  const showResolved=tRef&&!gcIsDone;
  const gcActions=`<div class="gc-hosp-actions">
    ${showAssignGuest?`<button class="btn" onclick="assignToGuest()" style="border-color:var(--gold);color:var(--gold);font-size:.68rem;padding:2px 9px;box-shadow:none">Assign to Guest</button>`:''}
    ${showResolved?`<button class="btn" onclick="markResolvedByGuest()" style="border-color:var(--green);color:var(--green);font-size:.68rem;padding:2px 9px;box-shadow:none">Resolved by Guest</button>`:''}
  </div>`;
  el.innerHTML=`<div class="guest-comm">
    <div class="guest-comm-header">
      <div class="gc-hosp-left"><span style="font-size:.7rem;font-weight:600;color:var(--text2)">Guest at this property</span><span class="gc-hosp-badge">Hospitable</span></div>
      ${gcActions}
    </div>
    <div class="gc-top-row">
      <div class="gc-top-left">
        <div class="gc-guest-name">${guestName}</div>
        <div class="gc-guest-dates">${checkin} – ${checkout}${activeRes.platform?' · '+activeRes.platform:''}</div>
      </div>
      ${phoneLinks}
    </div>
    <div class="gc-msg-box">
      <textarea id="gc-msg-input" placeholder="Send a message to ${guestFirst} via Hospitable..."></textarea>
      <button class="gc-send-btn" onclick="sendGuestCommMsg('${activeRes.reservationId}','${guestFirst}')">Send</button>
    </div>
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
  if(t.status==='complete'||t.status==='resolved_by_guest'){
    titleEl.textContent='Vendor';
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
      const sameDayIds=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===assignedVendor.name.toLowerCase()&&x.date===t.date&&!['complete','resolved_by_guest'].includes(x.status)).map(x=>x.id);
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
        ${showAssign?`<button class="btn btn-g" onclick="assignVendor('${v.name.replace(/'/g,"\\'")}')">Assign</button>`:''}
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
    let sms=buildMultiSMS(taskList,v,sheetUrl);
    const tel=v.phone.replace(/\D/g,'');
    const smsId='sms-combined-'+v.id;
    const sorted=[...taskList].sort((a,b)=>{
      const nbA=getNb(a.property),nbB=getNb(b.property);
      const nA=nbA?nbA.name:'zzz',nB=nbB?nbB.name:'zzz';
      if(nA!==nB)return nA.localeCompare(nB);
      return(a.property||'').localeCompare(b.property||'');
    });
    const taskSummary=sorted.map(t=>{const p=getProp(t.property);return`<li>${p?p.name.split(' - ').pop():t.property}: ${t.problem}${t.urgent?' <span style="color:var(--red);font-weight:700">URGENT</span>':''}${t.purchaseNote?' <span style="color:#e65100;font-weight:600">&#x1F6D2; Buy: '+t.purchaseNote+'</span>':''}</li>`;}).join('');
    return`<div class="combined-sms-banner">
      <div class="combined-sms-hdr"><span class="combined-sms-title">Combined Message for ${v.name}</span><span class="combined-sms-count">${taskList.length} jobs</span></div>
      <ul class="combined-sms-tasks">${taskSummary}</ul>
      <div class="sms-box" style="margin-top:0">
        <div class="sms-lbl">Ready-to-Send Combined Text</div>
        <textarea class="sms-edit" id="${smsId}" style="min-height:200px">${sms.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
        <div class="sms-acts">
          <a id="${smsId}-link" href="sms:${tel}?body=${encodeURIComponent(sms)}" class="sms-btn sms-send" onclick="updateSmsLink('${smsId}','${tel}')">Open in Messages</a>
          <button class="sms-btn sms-copy" onclick="copySms('${smsId}')">Copy Text</button>
        </div>
      </div>
    </div>`;
  }

  // If a vendor is assigned and they're in our list
  if(assignedVendor){
    titleEl.textContent='Assigned Vendor';
    let h='';
    // Check for same-vendor same-day grouping → show combined SMS banner
    const sameDayTasks=getVendorDayTasks(assignedVendor.name,t.date);
    if(sameDayTasks.length>=2){
      h+=combinedCard(assignedVendor,sameDayTasks);
      h+=`<details style="margin-top:10px"><summary style="font-size:.78rem;color:var(--text2);cursor:pointer;padding:6px 0">Single-task message for this job only</summary>`;
      h+=vendorCard(assignedVendor,false);
      h+=`</details>`;
    } else {
      h+=vendorCard(assignedVendor,false);
    }
    // Show other vendors in a collapsible section
    const others=m.filter(v=>v.id!==assignedVendor.id).slice(0,3);
    if(others.length){
      h+=`<details style="margin-top:10px"><summary style="font-size:.78rem;color:var(--text2);cursor:pointer;padding:6px 0">Other vendors for this category (${others.length})</summary>`;
      h+=others.map(v=>vendorCard(v,true)).join('');
      h+=`</details>`;
    }
    area.innerHTML=h;
    return;
  }

  // If vendor is assigned but not in our list
  if(t.vendor){
    titleEl.textContent='Assigned Vendor';
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
  const sameDayIds=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===vendorName.toLowerCase()&&x.date===t.date&&!['complete','resolved_by_guest'].includes(x.status)).map(x=>x.id);
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
  const sameDayIds=tasks.filter(x=>x.vendor&&x.vendor.toLowerCase()===vendorName.toLowerCase()&&x.date===task.date&&!['complete','resolved_by_guest'].includes(x.status)).map(x=>x.id);
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
  if(t.purchaseNote)msg+=`\n\n🛒 You'll need to pick up: ${t.purchaseNote}`;
  if(t._vendorSheetUrl)msg+='\n\nClick this link for all the details!\n'+t._vendorSheetUrl;
  return msg;
}
/* Get all active tasks for a vendor on a specific date */
function getVendorDayTasks(vendorName,date){
  if(!vendorName||!date)return[];
  return tasks.filter(t=>t.vendor&&t.vendor.toLowerCase()===vendorName.toLowerCase()&&t.date===date&&!['complete','resolved_by_guest'].includes(t.status));
}
/* Build a consolidated SMS for multiple tasks going to the same vendor on the same day */
function buildMultiSMS(taskList,v,sheetUrlParam){
  const firstName=v.name.split(' ')[0];
  const date=taskList[0]&&taskList[0].date||'';
  const dateFmt=date?new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}):'today';
  const resolvedUrl=sheetUrlParam||(taskList[0]&&taskList[0]._vendorSheetUrl)||'';
  const linkText=resolvedUrl?'Click this link for all the details!\n'+resolvedUrl:'';
  // Build purchase items text if any tasks need materials bought
  const purchaseTasks=taskList.filter(t=>t.purchaseNote);
  let purchaseText='';
  if(purchaseTasks.length){
    const items=purchaseTasks.map(t=>{
      const p=getProp(t.property);const pName=p?p.name.split(' - ').pop().trim():t.property;
      return `• ${pName}: ${t.purchaseNote}`;
    }).join('\n');
    purchaseText=`🛒 You'll need to pick up some materials before heading out:\n${items}`;
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
/* Render combined SMS card for a vendor with multiple same-day tasks */
function combinedVendorCard(v,taskList,sheetUrl){
  // Sort tasks by neighborhood then property for grouped display
  const sorted=[...taskList].sort((a,b)=>{
    const nbA=getNb(a.property),nbB=getNb(b.property);
    const nA=nbA?nbA.name:'zzz',nB=nbB?nbB.name:'zzz';
    if(nA!==nB)return nA.localeCompare(nB);
    return(a.property||'').localeCompare(b.property||'');
  });
  const sms=buildMultiSMS(sorted,v,sheetUrl||'');const tel=v.phone.replace(/\D/g,'');
  const smsId='sms-combined-'+v.id;
  const taskSummary=sorted.map(t=>{const p=getProp(t.property);return`<li>${p?p.name.split(' - ').pop():t.property}: ${t.problem}${t.urgent?' <span style="color:var(--red);font-weight:700">URGENT</span>':''}${t.purchaseNote?' <span style="color:#e65100;font-weight:600">&#x1F6D2; Buy: '+t.purchaseNote+'</span>':''}</li>`;}).join('');
  return`<div class="combined-sms-banner">
    <div class="combined-sms-hdr"><span class="combined-sms-title">Combined Message for ${v.name}</span><span class="combined-sms-count">${taskList.length} jobs</span></div>
    <ul class="combined-sms-tasks">${taskSummary}</ul>
    <div class="sms-box" style="margin-top:0">
      <div class="sms-lbl">Ready-to-Send Combined Text</div>
      <textarea class="sms-edit" id="${smsId}" style="min-height:200px">${sms.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
      <div class="sms-acts">
        <a id="${smsId}-link" href="sms:${tel}?body=${encodeURIComponent(sms)}" class="sms-btn sms-send" onclick="updateSmsLink('${smsId}','${tel}')">Open in Messages</a>
        <button class="sms-btn sms-copy" onclick="copySms('${smsId}')">Copy Text</button>
      </div>
    </div>
  </div>`;
}
function renderNotes(t){
  const el=document.getElementById('d-notes');const ns=t.notes||[];
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
    tasks.filter(x=>x.id!==t.id&&x.property===t.property&&x.date===t.date&&!['complete','resolved_by_guest'].includes(x.status))
      .forEach(x=>{x.vendor=name;if(x.status==='open'&&x.date)x.status='scheduled';});
  }
  await saveTasks();
  // Refresh the modal fields to reflect the change immediately
  document.getElementById('d-vendor').value=name;
  document.getElementById('d-status').value=t.status;
  document.getElementById('d-badges').innerHTML=`
    ${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}
    ${t.recurring?'<span class="badge b-rec">Recurring</span>':''}
    <span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>
    ${t.category?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">${t.category.replace('_',' ')}</span>`:''}
    ${t.guest?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">Reported by ${t.guest}</span>`:''}
    ${t.created?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">${fmtReported(t.created)}</span>`:''}`;
  // Hide suggested vendors — assignment is done
  document.getElementById('d-vendors').innerHTML=`<div style="font-size:.8rem;color:var(--text2);padding:6px 0">Assigned to <strong>${name}</strong>.</div>`;
  renderAll();
  closeModal('detail-modal');
  showToast(`${name} assigned to all tasks on this date.`);
}

// ─── URGENT TOGGLE (detail modal) ───────────────────────────────
function renderUrgentToggle(task){
  const btn=document.getElementById('d-urgent-toggle');
  if(task.urgent){
    btn.className='btn urg-on';
    btn.innerHTML='&#x26A0; URGENT — click to remove';
  } else {
    btn.className='btn urg-off';
    btn.textContent='Mark as Urgent';
  }
}
async function toggleDetailUrgent(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.urgent=!t.urgent;
  renderUrgentToggle(t);
  // Re-render badges
  const nb=getNb(t.property);
  document.getElementById('d-badges').innerHTML=`
    ${t.urgent?'<span class="badge b-urgent">Urgent</span>':''}
    ${t.recurring?'<span class="badge b-rec">Recurring</span>':''}
    <span class="badge b-${t.status}">${t.status.replace('_',' ')}</span>
    ${t.category?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">${t.category.replace('_',' ')}</span>`:''}
    ${t.guest?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">Reported by ${t.guest}</span>`:''}
    ${t.created?`<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">${fmtReported(t.created)}</span>`:''}`;
  await saveTasks();renderAll();
  showToast(t.urgent?'Marked as urgent.':'Urgent removed.');
}

// ─── VENDOR SEARCHABLE DROPDOWN ─────────────────────────────────
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
});

async function markComplete(){
  const t=tasks.find(x=>x.id===detailId);if(!t)return;
  t.status='complete';document.getElementById('d-status').value='complete';
  document.getElementById('complete-btn').style.display='none';
  await saveTasks();closeModal('detail-modal');renderAll();showToast('Task marked complete.');
  // Check if this completes a payment group where vendor requested payment
  checkAdminPaymentPrompt(t);
}

// Quick-complete from vendor-done banner (no modal needed)
async function vdQuickComplete(id,e){
  e.stopPropagation();
  const t=tasks.find(x=>x.id===id);if(!t)return;
  t.status='complete';
  await saveTasks();renderAll();showToast('Task marked complete.');
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
  const allConfirmed=groupTasks.every(x=>x.status==='complete'||x.status==='resolved_by_guest');
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
async function deleteTask(){
  const deleted=tasks.find(x=>x.id===detailId);if(!deleted)return;
  const idx=tasks.indexOf(deleted);
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
  tasks.unshift(t);await saveTasks();
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
      const done=tasks.filter(t=>t.property===pid&&['complete','resolved_by_guest'].includes(t.status)).length;
      return`<div class="pc nb-${nb.cls} ${selProp===pid?'sel':''}" id="pc-${pid}" onclick="selPropFn('${pid}')" style="cursor:pointer">
        <div class="pc-name">${p.name.split(' - ').pop()}</div>
        <div class="pcs"><strong>${done}</strong> completed</div>
      </div>`;
    }).join('');
    gridHtml+=`<div class="nb-section" id="nb-${nb.cls}"><div class="nb-hdr nb-${nb.cls}-h"><h3>${nb.name}</h3><span class="nb-sub">${nb.sub}</span></div><div class="prop-grid nb-${nb.cls}">${cards}</div><div id="detail-slot-${nb.cls}"></div></div>`;
  });
  // Completed tasks list (shown when NO property is selected)
  const allDone=tasks.filter(t=>['complete','resolved_by_guest'].includes(t.status));
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
  const done=tasks.filter(t=>t.property===pid&&['complete','resolved_by_guest'].includes(t.status));
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
function renderVendors(){
  const c=document.getElementById('vendor-dir');let h='';
  VCAT.forEach(cat=>{
    const cv=vendors.filter(v=>v.categories.includes(cat.id));if(!cv.length)return;
    h+=`<div class="vs"><div class="vs-hdr"><h3>${cat.label}</h3></div><div class="vc-list">`;
    cv.forEach(v=>{
      h+=`<div class="vc"><div class="vc-top"><div class="vc-info">
        <div class="vc-name">${v.name}</div><div class="vc-role">${v.role}</div>
        <div class="vc-contact"><span class="vc-phone">${v.phone}</span>${v.email?`<span class="vc-email">${v.email}</span>`:''}</div>
        ${!v.email?`<span class="add-email" onclick="showEmailForm('${v.id}')">+ Add email</span>`:''}
        <div id="ef-${v.id}" style="display:none" class="email-form">
          <input type="email" placeholder="vendor@email.com" id="ei-${v.id}">
          <button class="btn btn-g" onclick="saveEmail('${v.id}')">Save</button>
          <button class="btn" onclick="document.getElementById('ef-${v.id}').style.display='none'">Cancel</button>
        </div>
        ${v.note?`<div class="vc-note">${v.note}</div>`:''}
        ${v.invoices&&v.invoices.length?`<div class="vc-inv-toggle" onclick="toggleVendorInvoices('${v.id}')">Invoices (${v.invoices.length})</div><div class="vc-inv-list" id="vinv-${v.id}" style="display:none">${v.invoices.slice().reverse().map(inv=>{const d=inv.createdAt?new Date(inv.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';return`<div class="vc-inv-row"><span class="vc-inv-id">${inv.id}</span><span class="vc-inv-date">${d}</span><span class="vc-inv-total">${inv.total>0?'$'+inv.total.toFixed(2):'—'}</span><button class="btn" style="padding:2px 8px;font-size:.68rem" onclick="regenInvoice('${inv.vendor.replace(/'/g,"\\'")}','${inv.method}','${inv.date}',${JSON.stringify(inv.taskIds).replace(/"/g,'&quot;')})">View</button></div>`;}).join('')}</div>`:''}
      </div><div class="vc-actions">
        <a href="sms:${v.phone.replace(/\D/g,'')}" class="btn">Text</a>
        ${v.email?`<a href="mailto:${v.email}" class="btn">Email</a>`:''}
        <button class="btn" onclick="openEditVendor('${v.id}')">Edit</button>
      </div></div></div>`;
    });
    h+='</div></div>';
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

// HOSTBUDDY INTEGRATION
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

// Match HostBuddy property name to our internal property ID
function hbMatchProperty(name) {
  if (!name || typeof name !== 'string') return '';
  const n = name.toLowerCase().trim();
  if (!n) return '';
  // Try exact match first
  const exact = PROPS.find(p => p.name.toLowerCase() === n);
  if (exact) return exact.id;
  // Try partial match — does any property name contain this string, or vice versa?
  const partial = PROPS.find(p => p.name.toLowerCase().includes(n) || n.includes(p.name.toLowerCase()));
  if (partial) return partial.id;
  // Try matching on keywords (e.g. "bearadise" in "Bearadise Lodge")
  const words = n.split(/[\s\-:,]+/).filter(w => w.length > 2);
  const kwMatch = PROPS.find(p => {
    const pn = p.name.toLowerCase();
    return words.some(w => pn.includes(w));
  });
  if (kwMatch) return kwMatch.id;
  return '';
}

// Deep-scan a raw payload object for any string that matches a property name
// Used as fallback when extractFields couldn't identify the property field
function hbDeepMatchProperty(raw) {
  if (!raw || typeof raw !== 'object') return '';
  const allStrings = [];
  function collect(obj) {
    if (!obj) return;
    if (typeof obj === 'string' && obj.length > 2 && obj.length < 200) allStrings.push(obj);
    else if (Array.isArray(obj)) obj.forEach(collect);
    else if (typeof obj === 'object') Object.values(obj).forEach(collect);
  }
  collect(raw);
  // Try each string against property matching (most specific first)
  for (const s of allStrings) {
    const pid = hbMatchProperty(s);
    if (pid) { console.log(`Deep-matched property "${s}" → ${pid}`); return pid; }
  }
  return '';
}

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
  tasks.unshift(t);
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
async function clImportHistorical() {
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
    tasks.unshift(t);
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

// ── Guest Feedback (Review Import) ─────────────────────────────
let rvItems = []; // filtered, maintenance-relevant reviews
let rvDismissed = [];
async function loadDismissed(){
  try{
    const r=await S.get('se_dismissed');
    if(r&&r.value)rvDismissed=JSON.parse(r.value);
  }catch(e){console.warn('[dismissed] Failed to load from KV:',e.message);}
}
async function saveDismissed(){try{await S.set('se_dismissed',JSON.stringify(rvDismissed));}catch(e){}}

// Phrases that indicate actionable maintenance, cleaning, or repair issues
// Deliberately narrow: must suggest something is BROKEN, DIRTY, INFESTED, or MALFUNCTIONING
const RV_SKIP_RATINGS = new Set(['facilities', 'staff', 'services']);
const RV_MAINT_KEYWORDS = /\b(broke|broken|leak|leaking|leaks|dirty|filthy|smell|odor|stain|stained|mold|mildew|cobweb|cobwebs|mouse|mice|rat|roach|cockroach|ant infestation|spider|critter|rodent|mouse feces|droppings|not work|doesn.t work|didn.t work|stopped work|won.t work|isn.t work|wasn.t work|needs? (to be )?(fix|replace|repair|clean)|broke down|out of order|clog|clogged|backed up|overflow|rusted|rusty|rotting|rotten|wobbly|wobbles|peeling|cracked|crack in)\b/i;

// Second-pass phrases: only match if they appear in a NEGATIVE context (near a problem indicator)
const RV_EQUIP_KEYWORDS = /\b(faucet|toilet|shower|hot water|water heater|hvac|furnace|fireplace|a\/c|air condition|dishwasher|washer|dryer|refrigerator|fridge|stove|oven|microwave|hot tub|jacuzzi|tub jets?|pots|pans|cookware|sewage|septic|plumbing|railing|gutter|roof)\b/i;
const RV_PROBLEM_CONTEXT = /\b(problem|issue|broke|broken|not work|doesn.t|didn.t|won.t|isn.t|wasn.t|poor|bad|cold|weak|low|no |lack|missing|need|replace|old|worn|dated|gross|disgusting|terrible|horrible|awful|disappoint|complain|unfortunately|however|only complaint|only issue|only problem|downside|negative|could improve|suggest|recommend (new|better|replacing|fixing))\b/i;

// Check if a review has actionable maintenance content (NOT cleaning-only)
// Cleaning-only issues go to the Cleaning Log tab, not here
function rvIsMaintRelevant(review) {
  const feedback = review.private?.feedback || '';
  const ratingComments = (review.private?.detailed_ratings || []).filter(r => r.comment).map(r => r.comment).join(' ');
  const allPrivateText = (feedback + ' ' + ratingComments).trim();

  // Skip reviews with no private feedback text AND no rating comments
  if (!allPrivateText) return false;

  // Skip if it's ONLY a cleaning issue (those go to Cleaning Log)
  const isCleaningOnly = CL_KEYWORDS.test(allPrivateText) && !RV_EQUIP_KEYWORDS.test(allPrivateText);
  if (isCleaningOnly) return false;

  // 1. Direct maintenance keywords (leak, broken, pests, etc.)
  if (RV_MAINT_KEYWORDS.test(allPrivateText)) return true;

  // 2. Equipment mentioned + negative context (e.g., "hot water" + "didn't last")
  if (RV_EQUIP_KEYWORDS.test(allPrivateText) && RV_PROBLEM_CONTEXT.test(allPrivateText)) return true;

  // 3. Purchase/replacement suggestion (route to Replacements tab on import)
  if (rvIsPurchaseItem(allPrivateText)) return true;

  // 4. Cleanliness rating ≤ 2 with any private text (they left feedback AND rated cleanliness poorly)
  const cleanRating = (review.private?.detailed_ratings || []).find(r => r.type === 'cleanliness');
  if (cleanRating && cleanRating.rating > 0 && cleanRating.rating <= 2) return true;

  return false;
}

// Build a problem description from the review
function rvBuildProblem(review) {
  // Prefer private feedback, fall back to public review snippet
  if (review.private?.feedback) return review.private.feedback;
  // Check for rating comments
  const comments = (review.private?.detailed_ratings || []).filter(r => r.comment).map(r => `${r.type}: ${r.comment}`);
  if (comments.length) return comments.join('; ');
  return review.public?.review || 'Guest feedback item';
}

// Guess a category from the review text
function rvGuessCategory(text) {
  if (!text) return '';
  const t = text.toLowerCase();
  if (/hot tub|jacuzzi|tub jet/i.test(t)) return 'hot_tub';
  if (/plumb|toilet|faucet|leak|drain|shower|water heater|hot water|sewage|septic/i.test(t)) return 'plumbing';
  if (/hvac|heat|heater|furnace|ac |a\/c|air condition|fireplace/i.test(t)) return 'hvac';
  if (/electric|light|outlet|switch|wifi|wi-fi|internet|tv|remote/i.test(t)) return 'electrical';
  if (/pest|mouse|mice|rat|roach|bug|ant|spider|critter|rodent|bed bug/i.test(t)) return 'pest';
  if (/clean|dirty|stain|mold|mildew|cobweb|smell|odor/i.test(t)) return 'cleaning';
  if (/deck|railing|porch|door|window|screen|lock|roof|gutter/i.test(t)) return 'handyman';
  if (/landscap|yard|tree|bush/i.test(t)) return 'landscaping';
  if (/pot|pan|cookware|dish|appliance|stove|oven|microwave|fridge|refrigerator|washer|dryer|dishwasher|towel|linen|sheet|mattress|pillow/i.test(t)) return 'other';
  return '';
}

// Reverse-lookup: Hospitable UUID → our property ID
function rvUuidToPid(uuid) {
  for (const [pid, uid] of Object.entries(HOSPITABLE_IDS)) {
    if (uid === uuid) return pid;
  }
  return '';
}

// Fetch reviews for all properties, filter to maintenance-relevant
async function rvFetch() {
  const allReviews = [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  // Fetch reviews for each property (in parallel, batched)
  const entries = Object.entries(HOSPITABLE_IDS);
  const batchSize = 4; // limit concurrency
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async ([pid, uuid]) => {
        try {
          const r = await fetch(`${PROXY_BASE}/api/hospitable?action=reviews&pid=${uuid}&start=${thirtyDaysAgo}&end=${today}`, { signal: AbortSignal.timeout(12000) });
          if (!r.ok) return [];
          const data = await r.json();
          return (data.data || []).map(rv => ({ ...rv, _pid: pid }));
        } catch (e) { return []; }
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.length) allReviews.push(...r.value);
    }
  }

  // Filter: only maintenance-relevant, not already dismissed, within last 30 days
  const cutoff = Date.now() - 30 * 86400000;
  let purchaseCount = 0;
  rvItems = [];
  for (const rv of allReviews) {
    if (rvDismissed.includes(rv.id)) continue;
    if (new Date(rv.reviewed_at).getTime() < cutoff) continue;
    if (!rvIsMaintRelevant(rv)) continue;

    // Auto-route purchase items directly to Replacements (skip the Tasks bar)
    const problem = rvBuildProblem(rv);
    if (rvIsPurchaseItem(problem)) {
      await rpImportFromReviewSilent(rv);
      rvDismissed.push(rv.id);
      purchaseCount++;
      continue;
    }

    rvItems.push(rv);
  }
  // Persist dismissed IDs if any purchase items were auto-imported
  if (purchaseCount) {
    saveDismissed();
    renderReplacements();
  }

  // Sort by date, newest first
  rvItems.sort((a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at));
  renderRV();
}

function renderRV() {
  const el = document.getElementById('rv-wrap');
  if (!rvItems.length) { el.innerHTML = ''; return; }
  let h = `<div class="rv-banner">
    <div class="rv-hdr">
      <div class="rv-title">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        Guest Feedback — Maintenance Items
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="rv-count">${rvItems.length} flagged</span>
        <button class="rv-btn rv-btn-import" onclick="rvImportAll()">Import All</button>
        <button class="rv-btn rv-btn-dismiss" onclick="rvDismissAll()">Dismiss All</button>
      </div>
    </div>`;
  rvItems.forEach(rv => {
    const prop = getProp(rv._pid);
    const propName = prop ? prop.name : rv._pid;
    const problem = rvBuildProblem(rv);
    const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || 'Anonymous';
    const reviewDate = new Date(rv.reviewed_at);
    const dateStr = reviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const stayDates = rv.reservation ? `${new Date(rv.reservation.check_in).toLocaleDateString('en-US', {month:'short',day:'numeric'})} – ${new Date(rv.reservation.check_out).toLocaleDateString('en-US', {month:'short',day:'numeric'})}` : '';
    // Show low ratings
    const lowRatings = (rv.private?.detailed_ratings || []).filter(r => r.rating > 0 && r.rating <= 3 && !RV_SKIP_RATINGS.has(r.type?.toLowerCase()));
    const ratingComments = (rv.private?.detailed_ratings || []).filter(r => r.comment && !RV_SKIP_RATINGS.has(r.type?.toLowerCase()));

    h += `<div class="rv-item" id="rv-${rv.id}" style="cursor:pointer" onclick="openRvDetail('${rv.id}')">
      <div class="rv-item-top">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
          <div class="rv-item-prop">${escHtml(propName)}</div>
          <div class="rv-item-btns">
            <button class="rv-btn rv-btn-import" onclick="event.stopPropagation();rvImport('${rv.id}')">Import</button>
            <button class="rv-btn rv-btn-replacement" onclick="event.stopPropagation();rvConvertToReplacement('${rv.id}')" style="background:rgba(180,150,60,.15);color:#b8830a;border-color:rgba(180,150,60,.3)">To Replacements</button>
            <button class="rv-btn rv-btn-dismiss" onclick="event.stopPropagation();rvDismiss('${rv.id}')">Dismiss</button>
          </div>
        </div>
        <div class="rv-item-prob">${escHtml(problem)}</div>
        <div class="rv-item-meta">
          <span>${escHtml(guest)}</span>
          <span>${dateStr}</span>
          ${stayDates ? `<span>${stayDates}</span>` : ''}
          ${rv.public?.rating ? `<span>${'★'.repeat(rv.public.rating)}${'☆'.repeat(5 - rv.public.rating)}</span>` : ''}
        </div>
        ${lowRatings.length ? `<div class="rv-item-ratings">${lowRatings.map(r => `<span class="rv-rating low">${r.type}: ${r.rating}/5</span>`).join('')}</div>` : ''}
        ${ratingComments.length ? `<div class="rv-item-snippet">${ratingComments.map(r => escHtml(r.type + ': ' + r.comment)).join(' · ')}</div>` : ''}
      </div>
    </div>`;
  });
  h += '</div>';
  el.innerHTML = h;
}

function openRvDetail(id) {
  const rv = rvItems.find(x => x.id === id);
  if (!rv) return;
  const prop = getProp(rv._pid);
  const propName = prop ? prop.name : rv._pid;
  const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || 'Anonymous';
  const reviewDate = new Date(rv.reviewed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const stayDates = rv.reservation ? `${new Date(rv.reservation.check_in).toLocaleDateString('en-US', {month:'short',day:'numeric'})} – ${new Date(rv.reservation.check_out).toLocaleDateString('en-US', {month:'short',day:'numeric'})}` : '';

  let h = `<div style="margin-bottom:14px">
    <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:#d4a840;font-weight:700;margin-bottom:4px">${escHtml(propName)}</div>
    <div style="font-size:.72rem;color:#8a7a50">Guest: ${escHtml(guest)} · ${reviewDate}${stayDates ? ' · Stay: ' + stayDates : ''}${rv.reservation?.code ? ' · Res: ' + rv.reservation.code : ''}</div>
    ${rv.public?.rating ? `<div style="font-size:.78rem;color:#d4a840;margin-top:4px">${'★'.repeat(rv.public.rating)}${'☆'.repeat(5 - rv.public.rating)}</div>` : ''}
  </div>`;

  // Full private feedback — no truncation
  const feedback = rv.private?.feedback;
  if (feedback) {
    h += `<div style="margin-bottom:14px">
      <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:#8a7a50;font-weight:600;margin-bottom:6px">Private Feedback</div>
      <div style="background:rgba(0,0,0,.2);border:1px solid rgba(180,150,60,.2);border-radius:8px;padding:14px;font-size:.86rem;color:#e8dcc0;line-height:1.65;white-space:pre-wrap;word-break:break-word">${escHtml(feedback)}</div>
    </div>`;
  }

  // Detailed ratings with comments
  const detailedRatings = (rv.private?.detailed_ratings || []).filter(r => !RV_SKIP_RATINGS.has(r.type?.toLowerCase()));
  if (detailedRatings.length) {
    h += `<div style="margin-bottom:14px">
      <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:#8a7a50;font-weight:600;margin-bottom:6px">Rating Breakdown</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">`;
    detailedRatings.forEach(r => {
      const rColor = r.rating <= 2 ? '#e06050' : r.rating <= 3 ? '#c0a830' : '#6ab06a';
      h += `<div style="background:rgba(0,0,0,.15);border-radius:6px;padding:6px 10px;font-size:.76rem">
        <span style="color:#b0a070">${escHtml(r.type)}:</span> <span style="color:${rColor};font-weight:700">${r.rating}/5</span>
        ${r.comment ? `<div style="font-size:.74rem;color:#c0b080;margin-top:3px;font-style:italic;line-height:1.4">${escHtml(r.comment)}</div>` : ''}
      </div>`;
    });
    h += '</div></div>';
  }

  // Public review if exists
  if (rv.public?.review) {
    h += `<div style="margin-bottom:10px">
      <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1px;color:#8a7a50;font-weight:600;margin-bottom:6px">Public Review</div>
      <div style="font-size:.82rem;color:#b0a070;line-height:1.5;font-style:italic;border-left:2px solid #8a7030;padding-left:10px">${escHtml(rv.public.review)}</div>
    </div>`;
  }

  document.getElementById('rv-detail-body').innerHTML = h;
  document.getElementById('rv-detail-ft').innerHTML = `
    <button class="rv-btn rv-btn-import" style="flex:1 1 100%;text-align:center" onclick="rvImport('${rv.id}');closeModal('rv-detail-modal')">Import as Task</button>
    <button class="rv-btn rv-btn-replacement" onclick="rvConvertToReplacement('${rv.id}')" style="background:rgba(180,150,60,.15);color:#b8830a;border-color:rgba(180,150,60,.3);flex:1">To Replacements</button>
    <button class="rv-btn rv-btn-dismiss" style="flex:1" onclick="rvDismiss('${rv.id}');closeModal('rv-detail-modal')">Dismiss</button>
    <button class="rv-btn rv-btn-dismiss" style="flex:1" onclick="closeModal('rv-detail-modal')">Close</button>`;
  document.getElementById('rv-detail-modal').classList.add('open');
}

async function rvConvertToReplacement(id) {
  const rv = rvItems.find(x => x.id === id);
  if (!rv) return;
  await rpImportFromReviewSilent(rv);
  // Mark the card so user knows it's been converted, but don't dismiss — Import as Task still available
  const card = document.getElementById('rv-' + id);
  if (card) {
    const btn = card.querySelector('.rv-btn-replacement');
    if (btn) { btn.textContent = 'Converted ✓'; btn.disabled = true; btn.style.opacity = '.6'; }
  }
  // Also mark in detail modal if open
  const ftBtns = document.querySelectorAll('#rv-detail-ft .rv-btn-replacement');
  ftBtns.forEach(btn => { btn.textContent = 'Converted ✓'; btn.disabled = true; btn.style.opacity = '.6'; });
  showToast('Replacement item created — you can still import as a task too.');
}

async function rvImport(id) {
  const rv = rvItems.find(x => x.id === id);
  if (!rv) return;
  const problem = rvBuildProblem(rv);

  // Route purchase/replacement items to the Replacements tab (interactive — opens editable modal)
  if (rvIsPurchaseItem(problem)) {
    rpImportFromReview(rv);
    rvDismissed.push(id);
    saveDismissed();
    rvItems = rvItems.filter(x => x.id !== id);
    renderRV();
    return;
  }

  const cat = rvGuessCategory(problem);
  const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || '';
  const t = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    property: rv._pid || '',
    guest: guest,
    problem: problem.slice(0, 500),
    category: cat,
    status: 'open',
    date: '',
    vendor: '',
    urgent: false,
    recurring: false,
    notes: [
      { text: `Imported from guest review (${new Date(rv.reviewed_at).toLocaleDateString()}).${rv.reservation?.code ? ' Reservation: ' + rv.reservation.code : ''} Private feedback from ${guest || 'guest'}.`, type: 'admin', time: new Date().toISOString() }
    ],
    vendorNotes: '',
    created: rv.reviewed_at || new Date().toISOString(),
  };
  tasks.unshift(t);
  await saveTasks();
  rvDismissed.push(id);
  saveDismissed();
  rvItems = rvItems.filter(x => x.id !== id);
  renderRV(); renderAll();
  showToast('Task imported from guest feedback.');
  detailId = t.id; openDetail(t.id);
}

async function rvImportAll() {
  let nTasks = 0, nPurchases = 0;
  for (const rv of [...rvItems]) {
    const problem = rvBuildProblem(rv);

    // Route purchase items to Replacements (silent for bulk import)
    if (rvIsPurchaseItem(problem)) {
      await rpImportFromReviewSilent(rv);
      rvDismissed.push(rv.id);
      nPurchases++;
      continue;
    }

    const cat = rvGuessCategory(problem);
    const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || '';
    tasks.unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6) + nTasks,
      property: rv._pid || '', guest: guest,
      problem: problem.slice(0, 500),
      category: cat, status: 'open', date: '', vendor: '',
      urgent: false, recurring: false,
      notes: [{ text: `Imported from guest review (${new Date(rv.reviewed_at).toLocaleDateString()}).${rv.reservation?.code ? ' Reservation: ' + rv.reservation.code : ''} Private feedback from ${guest || 'guest'}.`, type: 'admin', time: new Date().toISOString() }],
      vendorNotes: '', created: rv.reviewed_at || new Date().toISOString(),
    });
    rvDismissed.push(rv.id);
    nTasks++;
  }
  await saveTasks();
  saveDismissed();
  rvItems = [];
  renderRV(); renderAll(); renderReplacements();
  const parts = [];
  if (nTasks) parts.push(`${nTasks} task${nTasks > 1 ? 's' : ''}`);
  if (nPurchases) parts.push(`${nPurchases} replacement${nPurchases > 1 ? 's' : ''}`);
  showToast(`${parts.join(' and ')} imported from guest feedback.`);
}

function rvDismiss(id) {
  rvDismissed.push(id);
  saveDismissed();
  rvItems = rvItems.filter(x => x.id !== id);
  renderRV();
  showToast('Feedback dismissed.');
}

function rvDismissAll() {
  rvItems.forEach(rv => rvDismissed.push(rv.id));
  saveDismissed();
  rvItems = [];
  renderRV();
  showToast('All feedback dismissed.');
}

// ── REPLACEMENTS & PURCHASES ──────────────────────────────────────
let rpData = []; // { id, property, item, notes, status:'needed'|'purchased', created, purchasedAt? }
let rpHistProp = null; // selected property filter for Purchase History

const RP_PURCHASE_KEYWORDS = /\b(pots?|pans?|cookware|dishes?|plates?|cups?|glasses?|mugs?|utensils?|silverware|flatware|knife|knives|cutting boards?|bakeware|towels?|linens?|sheets?|bedding|comforters?|blankets?|pillows?|mattress(?:es)?|supplies|toiletries|soap|dish soap|shampoo|conditioner|toilet paper|paper towels?|coffee makers?|keurig|toasters?|blenders?|can openers?|corkscrews?|irons?|ironing boards?|hangers?|curtains?|blinds?|rugs?|mats?|brooms?|mops?|vacuums?|trash cans?|light bulbs?|batteries|remotes?|games?|board games?|puzzles?|toys?|dvds?|books?|decor|decorations?|furniture|chairs?|tables?|shelves?|shelf|mirrors?|pictures?|artwork|signs?|sponges?|dish rack|drying rack|wash cloths?|washcloths?|dish towels?|oven mitts?|pot holders?|shower curtains?|bath mats?|plungers?|fly swatters?|wine opener|bottle opener|colander|strainer|spatulas?|whisks?|tongs?|ladles?|peelers?|graters?|mixing bowls?|baking sheets?|cookie sheets?|tupperware|containers?|storage bins?|trash bags?|ziplock|ziploc|baggies|cleaning supplies|detergent|cleaner|windex|lysol|disinfectant|air freshener|candles?|night lights?|extension cords?|power strips?|surge protectors?|welcome mats?|door mats?|coat hooks?|key hooks?|drawer liners?|placemats?|coasters?|wine glasses|champagne glasses|shot glasses|measuring cups?|measuring spoons?|thermometers?|fire extinguishers?|smoke detectors?|carbon monoxide detectors?|first aid|band.?aids?|medicine)\b/i;

// Extract just the item name from review text (e.g. "Coffee maker" not the whole paragraph)
function rpExtractItemName(text) {
  if (!text) return '';
  // Match all purchasable items mentioned in the text
  const matches = [];
  const re = /\b(pots?\s*(?:and|&)?\s*pans?|cookware|dishes?|plates?|cups?|glasses?|wine glasses|champagne glasses|shot glasses|mugs?|utensils?|silverware|flatware|knives?|cutting boards?|bakeware|towels?|dish towels?|linens?|sheets?|bedding|comforters?|blankets?|pillows?|mattress(?:es)?|toiletries|soap|dish soap|shampoo|conditioner|toilet paper|paper towels?|coffee makers?|keurig|toasters?|blenders?|can openers?|corkscrews?|wine openers?|bottle openers?|irons?|ironing boards?|hangers?|curtains?|shower curtains?|blinds?|rugs?|bath mats?|mats?|brooms?|mops?|vacuums?|trash cans?|light bulbs?|batteries|remotes?|board games?|puzzles?|toys?|dvds?|books?|decor|decorations?|furniture|chairs?|tables?|shelves?|shelf|mirrors?|pictures?|artwork|signs?|sponges?|dish racks?|drying racks?|wash cloths?|washcloths?|oven mitts?|pot holders?|plungers?|fly swatters?|colanders?|strainers?|spatulas?|whisks?|tongs?|ladles?|peelers?|graters?|mixing bowls?|baking sheets?|cookie sheets?|tupperware|containers?|storage bins?|trash bags?|cleaning supplies|detergent|cleaner|air fresheners?|candles?|night lights?|extension cords?|power strips?|surge protectors?|welcome mats?|door mats?|coat hooks?|key hooks?|placemats?|coasters?|measuring cups?|measuring spoons?|thermometers?|fire extinguishers?|first aid)\b/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[1]);
  }
  if (!matches.length) return text.slice(0, 60);
  // Capitalize first letter, deduplicate
  const unique = [...new Set(matches.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()))];
  // Try to grab context: look for adjective/qualifier before the item (e.g. "new pots and pans", "better towels")
  const enhanced = unique.map(item => {
    const itemLower = item.toLowerCase();
    const idx = text.toLowerCase().indexOf(itemLower);
    if (idx > 0) {
      // Grab up to 3 words before the item for context
      const before = text.slice(Math.max(0, idx - 30), idx).trim();
      const words = before.split(/\s+/);
      const qualifiers = /^(new|better|more|extra|additional|replacement|larger|bigger|smaller|nicer|good|real|proper|decent|quality|clean|fresh|matching|stainless\s*steel|nonstick|non-stick)$/i;
      const contextWords = [];
      for (let i = words.length - 1; i >= 0 && contextWords.length < 2; i--) {
        if (qualifiers.test(words[i].replace(/[^a-z\s-]/gi, ''))) {
          contextWords.unshift(words[i].replace(/[^a-zA-Z\s-]/g, ''));
        } else break;
      }
      if (contextWords.length) return contextWords.join(' ') + ' ' + item.toLowerCase();
    }
    return item;
  });
  return enhanced.join(', ');
}

async function loadReplacements() {
  try {
    const r = await S.get('se_purchases');
    if (r) rpData = JSON.parse(r.value);
  } catch (e) { rpData = []; }
  // One-time migration: re-extract item names for review-imported items that have long text
  let migrated = false;
  rpData.forEach(item => {
    if (item.item && item.item.length > 40) {
      // Use full review feedback if available, otherwise try the stored item text itself
      const sourceText = item.review?.feedback || item.item;
      const extracted = rpExtractItemName(sourceText);
      if (extracted && extracted.length < item.item.length) {
        item.item = extracted;
        migrated = true;
      }
    }
  });
  if (migrated) await saveReplacementData();
}

async function saveReplacementData() {
  await save('se_purchases', rpData);
}

function rpSelHistProp(id) { rpHistProp = id || null; renderReplacements(); }
function populateRpPropFilter() {
  const sel = document.getElementById('rp-prop-filter');
  if (!sel) return;
  sel.innerHTML = '<option value="all">All Properties</option>';
  NBS.forEach(nb => {
    const og = document.createElement('optgroup');
    og.label = nb.name;
    nb.props.forEach(pid => {
      const p = getProp(pid);
      if (!p) return;
      const count = rpData.filter(e => e.property === pid && e.status === 'needed').length;
      const o = document.createElement('option');
      o.value = pid;
      o.textContent = p.name + (count ? ` (${count})` : '');
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
}

function populateRpPropertySelect() {
  const sel = document.getElementById('rp-property');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select property...</option>';
  NBS.forEach(nb => {
    const og = document.createElement('optgroup');
    og.label = nb.name;
    nb.props.forEach(pid => {
      const p = getProp(pid);
      if (!p) return;
      const o = document.createElement('option');
      o.value = pid;
      o.textContent = p.name;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
}

// Pending review data for the import-confirm flow
let rpPendingReview = null;

function openAddReplacement(prefill) {
  rpPendingReview = prefill?._reviewData || null;
  populateRpPropertySelect();
  document.getElementById('rp-property').value = prefill?.property || '';
  document.getElementById('rp-item').value = prefill?.item || '';
  document.getElementById('rp-notes').value = prefill?.notes || '';
  // Show/hide the review context preview
  const previewEl = document.getElementById('rp-import-preview');
  if (previewEl) {
    if (rpPendingReview?.feedback) {
      const truncated = rpPendingReview.feedback.length > 200 ? rpPendingReview.feedback.slice(0, 200) + '...' : rpPendingReview.feedback;
      previewEl.innerHTML = `<div style="font-size:.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--gold);font-weight:700;margin-bottom:5px">Guest Feedback</div><div style="font-size:.82rem;color:var(--text2);line-height:1.5;font-style:italic;border-left:3px solid var(--gold);padding:6px 10px;background:var(--surface2);border-radius:0 var(--radius) var(--radius) 0">${escHtml(truncated)}</div>`;
      previewEl.style.display = '';
    } else {
      previewEl.innerHTML = '';
      previewEl.style.display = 'none';
    }
  }
  document.getElementById('replacement-modal').classList.add('open');
}

async function saveReplacement() {
  const property = document.getElementById('rp-property').value;
  const item = document.getElementById('rp-item').value.trim();
  const notes = document.getElementById('rp-notes').value.trim();
  if (!property || !item) { showToast('Please select a property and enter an item description.'); return; }
  const entry = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    property,
    item,
    notes,
    status: 'needed',
    created: new Date().toISOString(),
  };
  // Attach review context if this came from an import
  if (rpPendingReview) {
    entry.review = rpPendingReview;
    entry.created = rpPendingReview._created || entry.created;
    rpPendingReview = null;
  }
  rpData.unshift(entry);
  await saveReplacementData();
  closeModal('replacement-modal');
  renderReplacements();
  showToast('Replacement item added.');
}

async function markPurchased(id) {
  const item = rpData.find(x => x.id === id);
  if (!item) return;
  item.status = 'purchased';
  item.purchasedAt = new Date().toISOString();
  await saveReplacementData();
  renderReplacements();
  showToast('Marked as purchased.');
}

async function deleteReplacement(id) {
  rpData = rpData.filter(x => x.id !== id);
  await saveReplacementData();
  renderReplacements();
  showToast('Item removed.');
}

async function rpConvertToTask(id) {
  const item = rpData.find(x => x.id === id);
  if (!item) return;
  const rv = item.review;
  const guest = rv?.guest || '';
  const feedback = rv?.feedback || item.item;
  const cat = rvGuessCategory(feedback);
  const t = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    property: item.property || '',
    guest: guest,
    problem: item.item + (rv?.feedback && rv.feedback !== item.item ? '\n\n' + rv.feedback : ''),
    category: cat,
    status: 'open',
    date: '',
    vendor: '',
    urgent: false,
    recurring: false,
    notes: [{
      text: `Converted from replacement buy list.${rv?.resCode ? ' Reservation: ' + rv.resCode : ''}${guest ? ' Guest: ' + guest + '.' : ''}`,
      type: 'admin',
      time: new Date().toISOString()
    }],
    vendorNotes: '',
    created: item.created || new Date().toISOString(),
  };
  tasks.unshift(t);
  await saveTasks();
  // Remove from replacements
  rpData = rpData.filter(x => x.id !== id);
  await saveReplacementData();
  closeModal('rp-detail-modal');
  renderReplacements();
  renderAll();
  showToast('Converted to maintenance task.');
  // Open the new task detail
  detailId = t.id;
  openDetail(t.id);
}

function openRpDetail(id) {
  const item = rpData.find(x => x.id === id);
  if (!item) return;
  const p = getProp(item.property);
  const nb = getNb(item.property);
  const propName = p ? p.name : item.property;
  const rv = item.review;

  // Header: property + item name
  document.getElementById('rp-detail-prop').textContent = propName;
  document.getElementById('rp-detail-prop').style.color = nb ? `var(--${nb.cls})` : 'var(--gold)';
  document.getElementById('rp-detail-title').textContent = item.item;

  // Badges
  const statusBadge = item.status === 'purchased'
    ? '<span class="badge b-complete">Purchased</span>'
    : '<span class="badge b-open">Needed</span>';
  const dateBadge = `<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">${fmtReported(item.created)}</span>`;
  const guestBadge = rv?.guest ? `<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">From ${escHtml(rv.guest)}</span>` : '';
  const resBadge = rv?.resCode ? `<span class="badge" style="background:var(--surface2);color:var(--text2);border:1px solid var(--border)">Res: ${rv.resCode}</span>` : '';
  document.getElementById('rp-detail-badges').innerHTML = statusBadge + dateBadge + guestBadge + resBadge;

  // Body
  let h = '';

  // Guest feedback section (if imported from review with full data)
  if (rv && (rv.feedback || rv.publicReview || rv.ratings?.length)) {
    // Stay info line
    if (rv.stayDates || rv.reviewDate) {
      h += `<div style="font-size:.74rem;color:var(--text2);margin-bottom:14px">Reviewed: ${rv.reviewDate || ''}${rv.stayDates ? ' · Stay: ' + rv.stayDates : ''}${rv.publicRating ? ' · Rating: ' + '★'.repeat(rv.publicRating) + '☆'.repeat(5 - rv.publicRating) : ''}</div>`;
    }

    // Private feedback — full, no truncation
    if (rv.feedback) {
      h += `<div class="stitle">Guest Feedback</div>`;
      h += `<div class="notes"><div class="note-item" style="background:var(--surface2);border-radius:var(--radius);padding:12px 14px;font-size:.86rem;line-height:1.65;white-space:pre-wrap;word-break:break-word">${escHtml(rv.feedback)}</div></div>`;
    }

    // Rating breakdown
    const filteredRatings = (rv.ratings || []).filter(r => !RV_SKIP_RATINGS.has(r.type?.toLowerCase()));
    if (filteredRatings.length) {
      h += `<div class="stitle">Rating Breakdown</div>`;
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">';
      filteredRatings.forEach(r => {
        const rColor = r.rating <= 2 ? '#cc6644' : r.rating <= 3 ? '#c0a830' : 'var(--green)';
        h += `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:6px 10px;font-size:.76rem">
          <span style="color:var(--text2)">${escHtml(r.type)}:</span> <span style="color:${rColor};font-weight:700">${r.rating}/5</span>
          ${r.comment ? `<div style="font-size:.74rem;color:var(--text2);margin-top:3px;font-style:italic;line-height:1.4">${escHtml(r.comment)}</div>` : ''}
        </div>`;
      });
      h += '</div>';
    }

    // Public review
    if (rv.publicReview) {
      h += `<div class="stitle">Public Review</div>`;
      h += `<div style="font-size:.82rem;color:var(--text2);line-height:1.5;font-style:italic;border-left:3px solid var(--gold);padding:8px 12px;background:var(--surface2);border-radius:0 var(--radius) var(--radius) 0;margin-bottom:8px">${escHtml(rv.publicReview)}</div>`;
    }
  } else {
    // Manual item or legacy import without full review data
    if (item.notes) {
      h += `<div style="font-size:.82rem;color:var(--text2);line-height:1.5;padding:4px 0;margin-bottom:8px">${escHtml(item.notes)}</div>`;
    }
  }

  // Source line
  if (item.notes && rv) {
    h += `<div style="font-size:.72rem;color:var(--text3);margin-top:12px;font-style:italic">${escHtml(item.notes)}</div>`;
  }

  document.getElementById('rp-detail-body').innerHTML = h;

  // Footer buttons
  const purchBtn = document.getElementById('rp-detail-purchase-btn');
  const delBtn = document.getElementById('rp-detail-delete-btn');
  const convertBtn = document.getElementById('rp-detail-convert-btn');
  if (item.status === 'needed') {
    purchBtn.style.display = '';
    purchBtn.onclick = async () => { await markPurchased(id); closeModal('rp-detail-modal'); };
    convertBtn.style.display = '';
    convertBtn.onclick = async () => { await rpConvertToTask(id); };
    delBtn.textContent = 'Skip — Don\u2019t Buy';
  } else {
    purchBtn.style.display = 'none';
    convertBtn.style.display = 'none';
    delBtn.textContent = 'Remove from History';
  }
  delBtn.style.display = '';
  delBtn.onclick = async () => { await deleteReplacement(id); closeModal('rp-detail-modal'); };

  rpDetailCurrentId = id;
  document.getElementById('rp-detail-modal').classList.add('open');
}

let rpDetailCurrentId = null;

function rpStartEditTitle() {
  const titleEl = document.getElementById('rp-detail-title');
  const inputEl = document.getElementById('rp-detail-title-input');
  inputEl.value = titleEl.textContent;
  titleEl.style.display = 'none';
  inputEl.style.display = '';
  inputEl.focus();
  inputEl.select();
}

function rpCancelEditTitle() {
  document.getElementById('rp-detail-title').style.display = '';
  document.getElementById('rp-detail-title-input').style.display = 'none';
}

async function rpSaveTitle() {
  const inputEl = document.getElementById('rp-detail-title-input');
  const titleEl = document.getElementById('rp-detail-title');
  const newName = inputEl.value.trim();
  inputEl.style.display = 'none';
  titleEl.style.display = '';
  if (!newName || !rpDetailCurrentId) return;
  const item = rpData.find(x => x.id === rpDetailCurrentId);
  if (!item || item.item === newName) return;
  item.item = newName;
  titleEl.textContent = newName;
  await saveReplacementData();
  renderReplacements();
  showToast('Item name updated.');
}

function renderReplacements() {
  const filter = document.getElementById('rp-prop-filter')?.value || 'all';
  const listEl = document.getElementById('rp-list');
  const purchasedEl = document.getElementById('rp-purchased');

  const needed = rpData.filter(x => x.status === 'needed' && (filter === 'all' || x.property === filter));
  const purchased = rpData.filter(x => x.status === 'purchased' && (filter === 'all' || x.property === filter));

  // ── Buy List (Needed) ──
  if (!needed.length) {
    listEl.innerHTML = '<div class="rp-empty">Nothing on the buy list. Use "Add Item" or items will auto-import from guest reviews.</div>';
  } else {
    // Group by property
    const grouped = {};
    needed.forEach(item => {
      if (!grouped[item.property]) grouped[item.property] = [];
      grouped[item.property].push(item);
    });
    let h = `<div class="rp-section-hdr"><span>Buy List</span><span class="rp-count">${needed.length} item${needed.length !== 1 ? 's' : ''}</span></div>`;
    for (const [pid, items] of Object.entries(grouped)) {
      const p = getProp(pid);
      const nb = getNb(pid);
      const propName = p ? p.name : pid;
      const propColor = nb ? `var(--${nb.cls})` : 'var(--gold)';
      h += `<div style="margin-bottom:18px">
        <div style="font-weight:700;font-size:.82rem;color:${propColor};margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">${escHtml(propName)} <span style="font-weight:400;font-size:.72rem;color:var(--text2);text-transform:none;letter-spacing:0">(${items.length})</span></div>`;
      items.forEach(item => {
        const source = item.review ? `From ${escHtml(item.review.guest || 'guest')}` : (item.notes || '');
        h += `<div class="rp-card" style="cursor:pointer;display:flex;align-items:center;gap:10px" onclick="openRpDetail('${item.id}')">
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="btn rp-btn-done" onclick="event.stopPropagation();markPurchased('${item.id}')" title="Bought it — moves to Purchase History">&#10003;</button>
            <button class="btn rp-btn-del" onclick="event.stopPropagation();deleteReplacement('${item.id}')" title="Skip — remove without buying" style="opacity:.5">&times;</button>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.92rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(item.item)}</div>
            ${source ? `<div style="font-size:.74rem;color:var(--text2);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${source}</div>` : ''}
          </div>
        </div>`;
      });
      h += '</div>';
    }
    listEl.innerHTML = h;
  }

  // ── Purchase History (styled like Service History completed tasks) ──
  if (!purchased.length) {
    purchasedEl.innerHTML = '';
  } else {
    // Property grid grouped by neighborhood (like Service History)
    let gridHtml = '';
    NBS.forEach(nb => {
      const cards = nb.props.map(pid => {
        const p = getProp(pid); if (!p) return '';
        const ct = purchased.filter(i => i.property === pid).length;
        if (!ct) return '';
        return `<div class="pc nb-${nb.cls} ${rpHistProp===pid?'sel':''}" onclick="rpSelHistProp('${pid}')" style="cursor:pointer">
          <div class="pc-name">${p.name.split(' - ').pop()}</div>
          <div class="pcs"><strong>${ct}</strong> purchased</div>
        </div>`;
      }).join('');
      if (cards.replace(/\s/g, '')) {
        gridHtml += `<div class="nb-section"><div class="nb-hdr nb-${nb.cls}-h"><h3>${nb.name}</h3><span class="nb-sub">${nb.sub}</span></div><div class="prop-grid">${cards}</div></div>`;
      }
    });

    let filtered = rpHistProp ? purchased.filter(i => i.property === rpHistProp) : purchased;
    filtered.sort((a, b) => new Date(b.purchasedAt || b.created) - new Date(a.purchasedAt || a.created));
    const filterLabel = rpHistProp ? `<span style="font-size:.76rem;color:var(--text2);margin-left:8px">Showing: <strong>${getProp(rpHistProp)?.name.split(' - ').pop()}</strong> <button onclick="rpSelHistProp(null)" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:.72rem;font-family:inherit;padding:0 4px">✕ Clear</button></span>` : '';

    let h = `${gridHtml}<div style="margin-top:20px;padding-top:18px;border-top:2px solid var(--border)">
      <div style="display:flex;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:6px">
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--green);font-weight:600;margin:0">Purchase History</h2>
        ${filterLabel}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">`;
    filtered.forEach(item => {
      const p = getProp(item.property);
      const nb = getNb(item.property);
      const nbc = nb ? 'nb-' + nb.cls : '';
      const plc = nb ? 'pl-' + nb.cls : '';
      const propShort = p ? p.name.split(' - ').pop() : item.property;
      const doneDate = item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      const source = item.review?.guest ? `From ${item.review.guest}` : (item.notes || '');
      h += `<div class="hi ${nbc}" onclick="openRpDetail('${item.id}')" style="border-left-width:3px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px">
              <span style="font-size:.82rem;font-weight:700;color:var(--text)">${doneDate}</span>
              <span style="font-size:.72rem;font-weight:600" class="${plc}">${escHtml(propShort)}</span>
            </div>
            <div style="font-size:.8rem;color:var(--text);line-height:1.4;margin-bottom:4px">${escHtml(item.item)}</div>
            ${source ? `<div style="font-size:.7rem;color:var(--text2)">${escHtml(source)}</div>` : ''}
          </div>
          <span class="badge b-complete" style="flex-shrink:0">Purchased</span>
        </div>
      </div>`;
    });
    h += '</div></div>';
    purchasedEl.innerHTML = h;
  }

  populateRpPropFilter();
}

// ── Route purchase-related review items to Replacements ──────────
function rvIsPurchaseItem(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  // Must mention a purchasable item AND a recommendation/suggestion context
  const hasItem = RP_PURCHASE_KEYWORDS.test(t);
  const hasSuggestion = /\b(recommend|suggest|need|new|better|replace|upgrade|get|buy|purchase|supply|provide|add|stock)\b/i.test(t);
  return hasItem && hasSuggestion;
}

// Silent import (for auto-routing during rvFetch bulk scan)
async function rpImportFromReviewSilent(rv) {
  const problem = rvBuildProblem(rv);
  const itemName = rpExtractItemName(problem);
  const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || 'Guest';
  const reviewDate = new Date(rv.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const stayDates = rv.reservation ? `${new Date(rv.reservation.check_in).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(rv.reservation.check_out).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : '';
  rpData.unshift({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    property: rv._pid || '',
    item: itemName,
    notes: `From ${guest} (${reviewDate})`,
    status: 'needed',
    created: rv.reviewed_at || new Date().toISOString(),
    review: {
      feedback: rv.private?.feedback || '',
      ratings: rv.private?.detailed_ratings || [],
      publicReview: rv.public?.review || '',
      publicRating: rv.public?.rating || null,
      guest,
      reviewDate,
      stayDates,
      resCode: rv.reservation?.code || '',
      _created: rv.reviewed_at || new Date().toISOString(),
    }
  });
  await saveReplacementData();
}

// Interactive import (opens editable modal for user confirmation)
function rpImportFromReview(rv) {
  const problem = rvBuildProblem(rv);
  const itemName = rpExtractItemName(problem);
  const guest = [rv.guest?.first_name, rv.guest?.last_name].filter(Boolean).join(' ') || 'Guest';
  const reviewDate = new Date(rv.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const stayDates = rv.reservation ? `${new Date(rv.reservation.check_in).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(rv.reservation.check_out).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : '';
  openAddReplacement({
    property: rv._pid || '',
    item: itemName,
    notes: `From ${guest} (${reviewDate})`,
    _reviewData: {
      feedback: rv.private?.feedback || '',
      ratings: rv.private?.detailed_ratings || [],
      publicReview: rv.public?.review || '',
      publicRating: rv.public?.rating || null,
      guest,
      reviewDate,
      stayDates,
      resCode: rv.reservation?.code || '',
      _created: rv.reviewed_at || new Date().toISOString(),
    }
  });
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
      // Apply logo from API (KV-stored custom logo) if available
      if(data.logo){try{document.getElementById('vs-logo').src=data.logo;}catch(e){}}
      document.getElementById('vs-subtitle').textContent=
        vVendor+' — Jobs for '+new Date(vDate+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      document.getElementById('vs-loading').style.display='none';
      document.getElementById('vs-tasks').style.display='block';
      vsRender();
      // Auto-expand the first task after a short delay to teach vendors that cards are tappable
      if(vTasks.length){
        setTimeout(()=>{
          const first=document.querySelector('.vs-card');
          if(first)first.classList.add('vs-expanded');
        },400);
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
        // Guest alerts for this property
        const propAlerts=vGuestAlerts[t.property]||[];
        let alertHtml='';
        if(propAlerts.length){
          alertHtml=propAlerts.map(a=>{
            const icon=a.type==='checkout'?'&#x1F6AA;':a.type==='inhouse'?'&#x1F6A8;':'&#x1F3E0;';
            const label=a.type==='checkout'
              ?`Guests checking out this morning`
              :a.type==='inhouse'
              ?`Guests are in house. Please announce yourself!`
              :`Guests checking in this afternoon`;
            return `<div class="vs-guest-alert vs-guest-alert-${a.type}">${icon} <strong>${label}</strong></div>`;
          }).join('');
        }
        html+=`<div class="vs-prop-header" style="border-left-color:var(--${nbCls||'green'})">
          <div class="vs-prop-name">${shortName}</div>
          <div class="vs-prop-meta">${t.address?'<a href="https://maps.google.com/?q='+encodeURIComponent(t.address)+'" target="_blank">'+t.address+'</a>':''}${t.doorCode?' &middot; Code: '+t.doorCode:''}</div>
          ${alertHtml}
        </div>`;
        // Purchase callout at property level
        const propPurchases=vTasks.filter(pt=>pt.property===t.property&&pt.purchaseNote);
        if(propPurchases.length){
          html+='<div class="vs-purchase-callout">';
          propPurchases.forEach(pt=>{
            html+=`<p style="margin:4px 0"><span style="font-size:.66rem;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:var(--red)">&#x1F6D2; Purchase needed:</span> ${pt.purchaseNote.replace(/</g,'&lt;')}</p>`;
          });
          html+='</div>';
        }
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
    return`<div class="vs-card ${done?'vs-done':''}" id="vsc-${t.id}" style="border-left:3px solid var(--${nbCls||'green'})">
      <div class="vs-card-banner" onclick="window._vsToggle('${t.id}')">
        <div class="vs-card-check" onclick="event.stopPropagation();window._vsCircleCheck('${t.id}',${!!done})">${done?'&#x2713;':''}</div>
        <div class="vs-card-info">
          <div class="vs-card-prob">${t.problem}</div>
          <div class="vs-card-badges">
            ${t.urgent?'<span class="vs-urgent">Urgent</span>':''}
            ${t.purchaseNote?'<span style="font-size:.7rem;color:#e65100;font-weight:600;background:#fff3e0;padding:1px 7px;border-radius:10px;border:1px solid #ffcc80">&#x1F6D2; Purchase needed</span>':''}
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
        ${photos.length?`<div class="vs-photos">${photos.map(p=>`<div><img src="${p.url}" onclick="window.open('${p.url}','_blank')" title="Tap to view full size"><div class="vs-photo-label">${p.label}</div></div>`).join('')}</div>`:''}
        <div class="vs-fb-upload-row">
          <div class="vs-fb-upload-btn" onclick="document.getElementById('vpi-${t.id}').click()">&#x1F4F7; Photo<input type="file" id="vpi-${t.id}" accept="image/*" multiple style="display:none" onchange="window._vsUploadPhotos('${t.id}',this.files)"></div>
          <div class="vs-fb-upload-btn" onclick="document.getElementById('vri-${t.id}').click()">&#x1F9FE; Receipt<input type="file" id="vri-${t.id}" accept="image/*" style="display:none" onchange="window._vsUploadPhotos('${t.id}',this.files)"></div>
        </div>
        <div id="vps-${t.id}" style="font-size:.72rem;color:var(--text3);margin:4px 0"></div>
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
    return`<div style="padding:8px 0" id="vsrw-${propId}">
      <button class="vs-report-btn" id="vsrb-${propId}" onclick="window._vsShowReport('${propId}')">
        <div class="vsrb-icon">&#x1F527;</div>
        <div class="vsrb-text">
          <div class="vsrb-main">Report an Issue at ${propName}</div>
          <div class="vsrb-hint">Found something else? Let Chip know!</div>
        </div>
      </button>
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
    const overlay=document.createElement('div');
    overlay.className='vs-fb-overlay';
    overlay.id='vsfb-overlay';
    overlay.innerHTML=`<div class="vs-fb-modal">
      <div class="vs-fb-title">Mark as Done</div>
      <div class="vs-fb-sub">Quick notes on what you did — helps Chip keep records straight.</div>
      <div style="font-size:.82rem;font-weight:500;color:var(--text);margin-bottom:14px;padding:10px 12px;background:var(--surface2);border-radius:8px;border-left:3px solid var(--green)">${t.problem}</div>
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
        <button id="vsfb-submit" style="padding:10px 22px;border-radius:8px;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;background:var(--green);color:#fff;border:1px solid var(--green);opacity:.4" onclick="window._vsFbSubmit('${id}',${isHvac})">Submit Done</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
    setTimeout(()=>document.getElementById('vsfb-text')?.focus(),100);
  };

  window._vsFbCount=function(){
    const ta=document.getElementById('vsfb-text');
    const cc=document.getElementById('vsfb-cc');
    const btn=document.getElementById('vsfb-submit');
    if(!ta||!cc)return;
    const len=ta.value.trim().length;
    cc.textContent=len+' / 10 minimum';
    cc.style.color=len>=10?'var(--green)':'var(--text3)';
    if(btn)btn.style.opacity=len>=10?'1':'.4';
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

  window._vsFbSubmit=async function(id,isHvac){
    const ta=document.getElementById('vsfb-text');
    const txt=(ta?ta.value:'').trim();
    if(txt.length<10){
      if(ta){ta.style.borderColor='var(--red)';ta.style.animation='none';ta.offsetHeight;ta.style.animation='vsShake .4s ease';}
      return;
    }
    if(isHvac&&_vsFbFiles.length===0){alert('HVAC tasks require at least one photo.');return;}
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
    // Mark done via API
    try{
      const r=await fetch(VAPI,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action:'markDone',taskId:id})});
      if(!r.ok){alert('Failed to submit. Please try again.');return;}
      const data=await r.json();
      if(t){t.vendorDone=data.vendorDone;if(!t.notes)t.notes=[];t.notes.push({text:txt,type:'vendor',time:data.vendorDone,by:vVendor});}
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

  // Boot vendor sheet
  vsLoad();
})();

// ── Guest Alert Banner — notify incoming guests about active issues ──
let gaItems=[]; // array of {task, reservation, propName, guestName, daysOut, message, reservationId}
let gaDismissed=new Set(); // dismissed alert IDs (persisted via rvDismissed/se_dismissed)
let gaSent=new Set(); // sent message IDs (transient per session)

async function gaFetch(){
  // Populate gaDismissed from persisted rvDismissed array
  rvDismissed.forEach(id=>gaDismissed.add(id));
  const today=new Date();today.setHours(0,0,0,0);
  const lookAhead=2; // days to look ahead for arrivals
  const alerts=[];

  // Find open/scheduled tasks (not complete, not resolved_by_guest)
  // Exclude routine recurring items that don't affect guest experience (HVAC filters, etc.)
  const GA_EXCLUDE=/hvac\s*filter|filter\s*replace/i;
  const activeTasks=tasks.filter(t=>!['complete','resolved_by_guest'].includes(t.status)&&!GA_EXCLUDE.test(t.problem||'')&&!t.assignedToGuest);
  if(!activeTasks.length){document.getElementById('ga-wrap').innerHTML='';gaItems=[];return;}

  // Group active tasks by property
  const byProp={};
  activeTasks.forEach(t=>{
    if(!byProp[t.property])byProp[t.property]=[];
    byProp[t.property].push(t);
  });

  // For each property with active tasks, check for upcoming arrivals
  for(const [pid,propTasks] of Object.entries(byProp)){
    const hospId=HOSPITABLE_IDS[pid];
    if(!hospId)continue;
    // Use cached reservation data or fetch
    let evs=icalCache[pid];
    if(!evs||evs==='error'){evs=await fetchIcal(pid);if(evs==='error')continue;}

    evs.forEach(ev=>{
      if(!ev.start||!ev.reservationId)return;
      const arrival=new Date(ev.start);arrival.setHours(0,0,0,0);
      const diffDays=Math.round((arrival-today)/(86400000));
      // Check arrivals within lookAhead days (including today)
      if(diffDays<0||diffDays>lookAhead)return;
      const p=getProp(pid);
      const propName=p?p.name:pid;
      propTasks.forEach(t=>{
        const alertId=`${t.id}_${ev.reservationId}`;
        if(gaDismissed.has(alertId))return;
        const guestFirst=(ev.summary||'Guest').split(' ')[0];
        const msg=gaGenerateMessage(guestFirst,propName,t.problem,diffDays);
        alerts.push({
          id:alertId,
          task:t,
          reservation:ev,
          propName,
          guestName:ev.summary||'Guest',
          guestFirst,
          daysOut:diffDays,
          message:msg,
          reservationId:ev.reservationId
        });
      });
    });
  }
  gaItems=alerts;
  renderGA();
}

function gaGenerateMessage(guestFirst,propName,issue,daysOut){
  const issueLower=issue.toLowerCase().replace(/\.$/,'');
  return `Hey ${guestFirst}! Just wanted to give you a heads-up — the last guest mentioned that ${issueLower}. We're looking into it but just in case it gives you any trouble, shoot me a message and I can get someone over to take care of it!`;
}

function renderGA(){
  const el=document.getElementById('ga-wrap');
  const active=gaItems.filter(a=>!gaSent.has(a.id)&&!gaDismissed.has(a.id));
  if(!active.length){el.innerHTML='';return;}
  let h=`<div class="ga-banner">
    <div class="ga-hdr">
      <div class="ga-title">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        Guest Heads-Up — Active Issues
      </div>
      <span class="ga-count">${active.length} alert${active.length!==1?'s':''}</span>
    </div>`;
  active.forEach(a=>{
    const dayLabel=a.daysOut===0?'Checking in TODAY':a.daysOut===1?'Checking in tomorrow':`Checking in in ${a.daysOut} days`;
    h+=`<div class="ga-item" id="ga-${a.id.replace(/[^a-zA-Z0-9_]/g,'-')}">
      <div class="ga-item-top">
        <div style="flex:1;min-width:0">
          <div class="ga-item-prop">${escHtml(a.propName)}</div>
          <div class="ga-item-issue">${escHtml(a.task.problem)}</div>
          <div class="ga-item-guest"><strong>${escHtml(a.guestName)}</strong> — ${dayLabel}</div>
        </div>
      </div>
      <textarea class="ga-msg-edit" id="ga-edit-${a.id.replace(/[^a-zA-Z0-9_]/g,'-')}" style="display:block">${escHtml(a.message)}</textarea>
      <div class="ga-item-btns">
        <button class="ga-btn ga-btn-send" onclick="gaSend('${a.id}')">Send to ${escHtml(a.guestFirst)}</button>
        <button class="ga-btn ga-btn-dismiss" onclick="gaDismiss('${a.id}')">Dismiss</button>
        <span class="ga-sent" id="ga-sent-${a.id.replace(/[^a-zA-Z0-9_]/g,'-')}">✓ Sent</span>
      </div>
    </div>`;
  });
  h+='</div>';
  el.innerHTML=h;
}

// gaToggleEdit removed — textarea is now always visible and directly editable

async function gaSend(id){
  const a=gaItems.find(x=>x.id===id);
  if(!a||!a.reservationId)return;
  const safeId=id.replace(/[^a-zA-Z0-9_]/g,'-');
  // Get message from the always-visible textarea
  const editEl=document.getElementById('ga-edit-'+safeId);
  const msg=editEl?editEl.value:a.message;
  if(!msg.trim()){showToast('Message is empty.');return;}

  // Show sending state
  const sendBtn=document.querySelector(`#ga-${safeId} .ga-btn-send`);
  if(sendBtn){sendBtn.textContent='Sending...';sendBtn.disabled=true;}

  try{
    const r=await fetch(`${PROXY_BASE}/api/hospitable?action=send_message&rid=${a.reservationId}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:msg})
    });
    if(!r.ok){
      const err=await r.json().catch(()=>({}));
      throw new Error(err.detail||`API returned ${r.status}`);
    }
    // Mark sent
    gaSent.add(id);
    const sentEl=document.getElementById('ga-sent-'+safeId);
    if(sentEl)sentEl.style.display='inline';
    if(sendBtn){sendBtn.textContent='Sent ✓';sendBtn.style.background='#2e7d52';sendBtn.style.borderColor='#2e7d52';}
    // Add note to the task
    const t=a.task;
    if(t){
      if(!t.notes)t.notes=[];
      t.notes.push({by:'admin',text:`Guest heads-up sent to ${a.guestName}: "${msg.slice(0,80)}${msg.length>80?'...':''}"`,time:new Date().toISOString()});
      await saveTasks();
    }
    showToast(`Message sent to ${a.guestName}!`);
    // Re-render after a moment
    setTimeout(()=>renderGA(),1500);
  }catch(e){
    console.error('Failed to send guest message:',e);
    showToast('Failed to send: '+e.message);
    if(sendBtn){sendBtn.textContent=`Send to ${a.guestFirst}`;sendBtn.disabled=false;}
  }
}

async function gaDismiss(id){
  gaDismissed.add(id);
  // Persist to same dismissed store as reviews (se_dismissed via KV)
  if(!rvDismissed.includes(id)){
    rvDismissed.push(id);
    await saveDismissed();
    console.log('[ga-dismiss] Saved dismissed ID:',id,'Total dismissed:',rvDismissed.length);
  }
  renderGA();
}

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
  await loadDismissed(); // load dismissed IDs from KV before fetching reviews
  rvFetch(); // fetch guest feedback reviews
  clFetch(); // pre-load cleaning log in background
  cleanupOldPhotos(); // auto-delete photos from tasks resolved 30+ days ago
  gaFetch(); // check for active issues at properties with arriving guests
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

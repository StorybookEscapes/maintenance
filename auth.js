// ── Auth Gate & Storage Client ──────────────────────────────
(function(){
  const GOOGLE_CLIENT_ID='998506456904-tlionif2dmsafl74qk0sinb4rvljdddm.apps.googleusercontent.com';
  const API_BASE='https://storybook-webhook.vercel.app';
  const ALLOWED=['properties@chipburns.com','cb@chipburns.com','john@chipburns.com'];

  // ── Vendor Day Sheet mode ──
  // URL: #v/{token} — skip auth, show vendor view only
  const _hash = window.location.hash;
  if (_hash.startsWith('#v/')) {
    const _vtoken = _hash.slice(3);
    if (_vtoken.length >= 6) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'none';
      document.getElementById('vendor-sheet').style.display = 'block';
      window._vendorToken = _vtoken;
      window._vendorMode = true;
      return; // Skip all auth — vendor.js endpoint handles access control
    }
  }

  // ── Project Vendor mode ──
  // URL: #pv/{token} — skip auth, show vendor-facing project sheet
  if (_hash.startsWith('#pv/')) {
    const _pvtoken = _hash.slice(4);
    if (_pvtoken.length >= 6) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'none';
      // Create container if index.html hasn't been updated yet
      let _pvSheet = document.getElementById('project-vendor-sheet');
      if (!_pvSheet) {
        _pvSheet = document.createElement('div');
        _pvSheet.id = 'project-vendor-sheet';
        _pvSheet.innerHTML = '<div id="pvs-root"></div>';
        document.body.appendChild(_pvSheet);
      }
      _pvSheet.style.display = 'block';
      window._projectVendorToken = _pvtoken;
      window._projectVendorMode = true;
      return;
    }
  }

  // ── Cleaner View mode ──
  // URL: #cv/{token} — skip auth, show read-only cleaning performance view
  if (_hash.startsWith('#cv/')) {
    const _cvtoken = _hash.slice(4);
    if (_cvtoken.length >= 6) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'none';
      document.getElementById('cleaner-view').style.display = 'block';
      window._cleanerViewToken = _cvtoken;
      window._cleanerViewMode = true;
      return; // Skip all auth — cleaner-view.js endpoint handles access control
    }
  }

  // Dev bypass: skip auth on non-production hosts
  if(window.location.hostname!=='storybookescapes.github.io'){
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').classList.add('authed');
    // Set up storage client that works without auth token for dev
    window.storage={
      get:async function(k){try{const r=await fetch(API_BASE+'/api/storage?key='+k);const j=await r.json();return j;}catch(e){return null;}},
      set:async function(k,v){try{await fetch(API_BASE+'/api/storage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:k,value:v})});}catch(e){}}
    };
    return;
  }

  // Production: set up storage client with auth token
  function makeStorage(token){
    return{
      get:async function(k){
        try{
          const current=readSessionToken();if(!current)return null;
          const r=await fetch(API_BASE+'/api/storage?key='+k,{headers:{'Authorization':'Bearer '+current}});
          if(!r.ok)return null;
          return await r.json();
        }catch(e){return null;}
      },
      set:async function(k,v){
        try{
          const current=readSessionToken();if(!current)return;
          await fetch(API_BASE+'/api/storage',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+current},body:JSON.stringify({key:k,value:v})});
        }catch(e){}
      }
    };
  }

  // Renewal keeps the open editor intact. A fresh Google token must still pass
  // the existing server's signature, audience, expiry and administrator checks.
  let signingIn=false, googleReady=false, sessionEmail='';
  const readPayload=token=>JSON.parse(decodeURIComponent(Array.from(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')),c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join('')));
  function readSessionToken(){
    try{const token=localStorage.getItem('se_auth_token');if(!token||!sessionEmail)return null;
      const payload=readPayload(token);
      if(String(payload.email||'').toLowerCase()!==sessionEmail||!Number.isFinite(payload.exp)||payload.exp*1000<=Date.now())return null;
      return token;
    }catch(e){return null;}
  }
  function authMessage(message){
    let node=document.getElementById('reauth-status')||document.getElementById('signin-status');
    if(!node){node=document.createElement('p');node.id='signin-status';node.setAttribute('role','status');document.getElementById('login-screen').appendChild(node);}
    node.textContent=message;
  }
  function renderSignIn(node){
    if(!node)return;
    if(!googleReady){node.textContent='Loading Google sign-in…';return;}
    node.textContent='';
    google.accounts.id.renderButton(node,{theme:'outline',size:'large',text:'signin_with',shape:'pill'});
  }
  window.maintenanceAuth={renderSignIn,readPayload,getToken:readSessionToken};
  window.addEventListener('storage',event=>{
    if(event.key==='se_auth_token'&&!readSessionToken()&&sessionEmail&&typeof showReAuthPrompt==='function')showReAuthPrompt();
  });
  async function handleCredentialResponse(response){
    if(signingIn)return;
    signingIn=true;
    const wasAuthed=document.getElementById('app').classList.contains('authed');
    try{
      const token=response&&response.credential;
      if(typeof token!=='string')throw new Error('Sign-in did not return a credential. Please try again.');
      const payload=readPayload(token), email=String(payload.email||'').toLowerCase();
      if(!ALLOWED.includes(email)||!Number.isFinite(payload.exp)||payload.exp*1000<=Date.now())
        throw new Error('Use an authorized account with a fresh Google sign-in.');
      if(wasAuthed&&sessionEmail&&email!==sessionEmail)
        throw new Error('Sign in with the same account to preserve this open session. Use a separate browser profile or private session to switch accounts.');
      authMessage('Checking your sign-in…');
      const r=await fetch(API_BASE+'/api/storage?key=se_settings',{
        method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
      if(!r.ok)throw new Error(r.status===401?'The server did not accept this sign-in. Please try again.':'Sign-in could not be confirmed. Your open edits are still here.');
      // The validation read does not replay an interrupted save or initialize
      // the app again during renewal. The user retries pending work explicitly.
      localStorage.setItem('se_auth_token',token);
      sessionEmail=email;window.storage=makeStorage(token);
      document.getElementById('login-screen').style.display='none';
      document.getElementById('app').classList.add('authed');
      if(wasAuthed){if(typeof maintenanceAuthRenewed==='function')maintenanceAuthRenewed();}
      else if(typeof initApp==='function')initApp();
    }catch(e){authMessage(e.message||'Sign-in failed. Please try again.');}
    finally{signingIn=false;}
  }

  // Remembered credentials still expire normally. Initialize Google even when
  // the stored credential is currently valid, so renewal is available in place.
  const existing=localStorage.getItem('se_auth_token');
  if(existing){
    try{
      const payload=readPayload(existing),email=String(payload.email||'').toLowerCase();
      if(Number.isFinite(payload.exp)&&payload.exp*1000>Date.now()&&ALLOWED.includes(email)){
        sessionEmail=email;window.storage=makeStorage(existing);
        document.getElementById('login-screen').style.display='none';
        document.getElementById('app').classList.add('authed');
      }else localStorage.removeItem('se_auth_token');
    }catch(e){localStorage.removeItem('se_auth_token');}
  }
  function tryInitGoogle(){
    if(typeof google==='undefined'||!google.accounts){setTimeout(tryInitGoogle,100);return;}
    google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleCredentialResponse});
    googleReady=true;renderSignIn(document.getElementById('g_id_signin'));
    renderSignIn(document.getElementById('reauth-google'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryInitGoogle);
  else tryInitGoogle();
})();

// ── Auth Gate & Storage Client ──────────────────────────────
(function(){
  const GOOGLE_CLIENT_ID='998506456904-tlionif2dmsafl74qk0sinb4rvljdddm.apps.googleusercontent.com';
  const API_BASE='https://storybook-webhook.vercel.app';
  const ALLOWED=['properties@chipburns.com','cb@chipburns.com'];

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
          const r=await fetch(API_BASE+'/api/storage?key='+k,{headers:{'Authorization':'Bearer '+token}});
          if(!r.ok)return null;
          return await r.json();
        }catch(e){return null;}
      },
      set:async function(k,v){
        try{
          await fetch(API_BASE+'/api/storage',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({key:k,value:v})});
        }catch(e){}
      }
    };
  }

  function handleCredentialResponse(response){
    const token=response.credential;
    // Decode JWT to check email
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      const email=(payload.email||'').toLowerCase();
      if(!ALLOWED.includes(email)){
        alert('Access denied. This account is not authorized.');
        return;
      }
      localStorage.setItem('se_auth_token',token);
      window.storage=makeStorage(token);
      document.getElementById('login-screen').style.display='none';
      document.getElementById('app').classList.add('authed');
      // Trigger app init if it's waiting
      if(typeof initApp==='function')initApp();
    }catch(e){alert('Sign-in failed. Please try again.');}
  }

  // Check for existing session (localStorage persists across tabs/restarts)
  const existing=localStorage.getItem('se_auth_token');
  if(existing){
    try{
      const payload=JSON.parse(atob(existing.split('.')[1]));
      if(payload.exp&&payload.exp*1000>Date.now()&&ALLOWED.includes((payload.email||'').toLowerCase())){
        window.storage=makeStorage(existing);
        document.getElementById('login-screen').style.display='none';
        document.getElementById('app').classList.add('authed');
        return;
      }
    }catch(e){}
    localStorage.removeItem('se_auth_token');
  }

  // Initialize Google Sign-In when the library loads
  function tryInitGoogle(){
    if(typeof google==='undefined'||!google.accounts){setTimeout(tryInitGoogle,100);return;}
    google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleCredentialResponse});
    google.accounts.id.renderButton(document.getElementById('g_id_signin'),{theme:'outline',size:'large',text:'signin_with',shape:'pill'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryInitGoogle);
  else tryInitGoogle();
})();

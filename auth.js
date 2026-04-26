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

  // ── Silent refresh ──────────────────────────────────────────────────
  // Google ID tokens expire in 1 hour (Google policy — can't be extended).
  // We schedule a silent re-auth ~10 minutes before expiry. Because the
  // user is already signed into Google in their browser, the prompt API
  // can usually re-issue a fresh credential without showing any UI. If
  // silent re-auth fails (signed out of Google, third-party cookies
  // blocked, etc.), a small "Session expiring — click to refresh" badge
  // appears in the corner so the user can re-sign with one click.
  let _refreshTimer=null;

  function scheduleRefresh(token){
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      if(!payload.exp)return;
      const expMs=payload.exp*1000;
      const refreshAt=expMs - 10*60*1000;       // 10 min before expiry
      const delay=Math.max(refreshAt - Date.now(), 5000);  // min 5s out
      if(_refreshTimer)clearTimeout(_refreshTimer);
      _refreshTimer=setTimeout(attemptSilentRefresh, delay);
    }catch(e){}
  }

  function attemptSilentRefresh(){
    // Google library loads async — wait for it
    if(typeof google==='undefined'||!google.accounts||!google.accounts.id){
      setTimeout(attemptSilentRefresh, 2000);
      return;
    }
    // The credential (if any) arrives via handleCredentialResponse; the
    // notification callback only tells us whether the prompt UI was shown.
    google.accounts.id.prompt(notification=>{
      // isNotDisplayed / isSkippedMoment / isDismissedMoment all mean the
      // silent attempt didn't yield a credential. Show the fallback badge.
      try{
        const noShow=notification && (
          (typeof notification.isNotDisplayed==='function' && notification.isNotDisplayed()) ||
          (typeof notification.isSkippedMoment==='function' && notification.isSkippedMoment()) ||
          (typeof notification.isDismissedMoment==='function' && notification.isDismissedMoment())
        );
        if(noShow)showRefreshBadge();
      }catch(e){
        // Notification API shape varies — be conservative and show badge
        showRefreshBadge();
      }
    });
  }

  function showRefreshBadge(){
    let b=document.getElementById('se-refresh-badge');
    if(!b){
      b=document.createElement('div');
      b.id='se-refresh-badge';
      b.style.cssText='position:fixed;top:12px;right:12px;background:#fff7ea;border:1.5px solid #d8b97a;color:#8a5a10;padding:9px 16px;border-radius:24px;font-size:.78rem;font-weight:600;cursor:pointer;z-index:9999;box-shadow:0 3px 12px rgba(0,0,0,.18);font-family:inherit;display:flex;align-items:center;gap:8px;-webkit-tap-highlight-color:transparent;transition:transform .15s,box-shadow .15s';
      b.innerHTML='<span style="font-size:1rem">&#x1F510;</span><span>Session expiring &mdash; click to refresh</span>';
      b.onmouseover=()=>{b.style.transform='translateY(-1px)';b.style.boxShadow='0 5px 16px rgba(0,0,0,.22)';};
      b.onmouseout=()=>{b.style.transform='';b.style.boxShadow='0 3px 12px rgba(0,0,0,.18)';};
      b.onclick=()=>{
        // Force the prompt UI to appear. New credential lands in
        // handleCredentialResponse which hides the badge.
        if(typeof google!=='undefined'&&google.accounts&&google.accounts.id){
          google.accounts.id.prompt();
        }
      };
      document.body.appendChild(b);
    }
    b.style.display='flex';
  }

  function hideRefreshBadge(){
    const b=document.getElementById('se-refresh-badge');
    if(b)b.style.display='none';
  }
  // Expose for manual debug if needed
  window._authShowRefreshBadge=showRefreshBadge;
  window._authHideRefreshBadge=hideRefreshBadge;

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
      // Detect refresh vs initial sign-in: if app is already authed, this
      // is a silent refresh and we shouldn't re-init the app.
      const appEl=document.getElementById('app');
      const isRefresh=appEl&&appEl.classList.contains('authed')&&!!localStorage.getItem('se_auth_token');
      localStorage.setItem('se_auth_token',token);
      window.storage=makeStorage(token);
      if(!isRefresh){
        document.getElementById('login-screen').style.display='none';
        appEl.classList.add('authed');
        if(typeof initApp==='function')initApp();
      }else{
        // Silent refresh succeeded — hide the "expiring" badge if it's up
        hideRefreshBadge();
        console.log('[auth] silent refresh succeeded');
      }
      // Always re-arm the next refresh based on the new token's exp
      scheduleRefresh(token);
    }catch(e){alert('Sign-in failed. Please try again.');}
  }

  // Initialize Google Sign-In when the library loads.
  // renderButton=true → also draws the Sign In button (login screen path).
  // renderButton=false → init-only so prompt() works for silent refresh
  //   without rendering anything visible.
  function tryInitGoogle(renderButton){
    if(typeof google==='undefined'||!google.accounts||!google.accounts.id){
      setTimeout(()=>tryInitGoogle(renderButton),100);
      return;
    }
    google.accounts.id.initialize({
      client_id:GOOGLE_CLIENT_ID,
      callback:handleCredentialResponse,
      auto_select:true,                  // enable silent re-auth via prompt()
      cancel_on_tap_outside:false,
    });
    if(renderButton){
      const slot=document.getElementById('g_id_signin');
      if(slot){
        google.accounts.id.renderButton(slot,{theme:'outline',size:'large',text:'signin_with',shape:'pill'});
      }
    }
  }

  // Check for existing session (localStorage persists across tabs/restarts)
  const existing=localStorage.getItem('se_auth_token');
  if(existing){
    try{
      const payload=JSON.parse(atob(existing.split('.')[1]));
      const valid=payload.exp&&payload.exp*1000>Date.now()&&ALLOWED.includes((payload.email||'').toLowerCase());
      if(valid){
        window.storage=makeStorage(existing);
        document.getElementById('login-screen').style.display='none';
        document.getElementById('app').classList.add('authed');
        // Schedule the next silent refresh; load Google library so it's
        // ready when the timer fires (no button rendered).
        scheduleRefresh(existing);
        if(document.readyState==='loading'){
          document.addEventListener('DOMContentLoaded',()=>tryInitGoogle(false));
        }else{
          tryInitGoogle(false);
        }
        return;
      }
      // Token has expired during a session that's been idle. Try a silent
      // refresh BEFORE bouncing the user to the login screen.
      const appEl=document.getElementById('app');
      // We need to leave login-screen visible until refresh resolves OR
      // we get a new credential. Use a short fallback: show login screen
      // AND attempt prompt — whichever resolves first wins. Simpler:
      // remove the expired token, render the login screen, but also init
      // Google with auto_select so One Tap appears immediately. If user
      // is signed into Google, One Tap re-issues with one click.
    }catch(e){}
    localStorage.removeItem('se_auth_token');
  }

  // No valid token → render login screen + Sign In button
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>tryInitGoogle(true));
  else tryInitGoogle(true);
})();

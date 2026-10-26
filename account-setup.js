// Serve only on the existing Google-approved GitHub Pages origin. No credential
// is stored in browser storage, URL parameters, telemetry or logs.
(function(){
 'use strict';const ORIGIN='https://storybookescapes.github.io',API='https://storybook-webhook.vercel.app/api/storage',CLIENT='998506456904-tlionif2dmsafl74qk0sinb4rvljdddm.apps.googleusercontent.com';
 if(location.origin!==ORIGIN)return;
 const el=id=>document.getElementById(id),status=el('setup-status');let challenge=null,credential=null,busy=false,waiting=0;
 async function prepare(){
  if(!window.google?.accounts?.id){if(waiting++<50)setTimeout(prepare,200);else{status.textContent='Google identity verification did not load. Restart when available.';el('setup-retry').hidden=false;}return;}
  credential=null;challenge=null;el('setup-form').hidden=true;el('setup-submit').disabled=true;el('setup-retry').hidden=true;el('setup-google').replaceChildren();
  try{const r=await fetch(API+'?sessionAction=enrollChallenge',{credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});challenge=await r.json();if(!r.ok)throw Error('Setup is unavailable. Try again later.');
   google.accounts.id.initialize({client_id:CLIENT,nonce:challenge.nonce,callback:response=>{credential=response.credential;let p;try{p=JSON.parse(atob(credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));}catch(_){credential=null;status.textContent='Identity response was not understood.';return;}el('setup-identity').textContent='Selected Google identity: '+String(p.email||'')+'. The server will verify this identity before enrollment.';el('setup-form').hidden=false;el('setup-submit').disabled=false;status.textContent='Choose your password privately below.';}});
   google.accounts.id.renderButton(el('setup-google'),{theme:'outline',size:'large',text:'signin_with'});status.textContent='Verify your own existing approved Google identity.';
  }catch(_){status.textContent='Setup is unavailable. No account was enrolled. Restart to try again.';el('setup-retry').hidden=false;}
 }
 el('setup-form').onsubmit=async event=>{event.preventDefault();if(busy||!credential||!challenge)return;
  const password=el('setup-password'),confirm=el('setup-confirm');if(password.value!==confirm.value){status.textContent='Passwords do not match.';return;}
  busy=true;el('setup-submit').disabled=true;
  try{const r=await fetch(API,{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionAction:'passwordEnroll',challengeId:challenge.challengeId,csrfToken:challenge.csrfToken,credential,password:password.value}),signal:AbortSignal.timeout(10000)});const data=await r.json();
   if(!r.ok||data.ok!==true||!Array.isArray(data.recoveryCodes)||data.recoveryCodes.length!==8)throw Error(data.error||'Enrollment could not be confirmed. Try password sign-in before another setup.');
   el('setup-form').hidden=true;el('setup-google').replaceChildren();el('setup-codes').textContent=data.recoveryCodes.join('\n');el('setup-recovery').hidden=false;status.textContent='Account enrolled: '+String(data.email||'')+'. Save its private recovery codes before leaving.';el('setup-retry').hidden=true;
  }catch(e){status.textContent=e.message+' No automatic retry was performed. If the result is uncertain, try password sign-in before restarting setup.';el('setup-retry').hidden=false;}
  finally{password.value='';confirm.value='';credential=null;challenge=null;busy=false;el('setup-submit').disabled=true;}
 };el('setup-retry').onclick=()=>{if(!busy){waiting=0;prepare();}};prepare();
})();

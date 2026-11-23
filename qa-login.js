/* Direct top-level Supabase Auth entrypoint (no iframe redirects or public secrets). */
(()=>{'use strict';
const PROJECT='https://naxotlqvimewbfowxwmw.supabase.co';
const KEY='sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL';
const PAGE=new URL(location.href),BASE=new URL('./',PAGE),RETURN=new URL('./login.html',BASE).href;
const by=id=>document.getElementById(id),status=by('status'),lang=by('lang');
const validPlans=new Set(['qa_day','qa_3days','qa_14days','qa_month','qa_3months','qa_year']);
const chosen=PAGE.searchParams.get('plan');
if(validPlans.has(chosen)){
 try{sessionStorage.setItem('qa-preferred-pass',chosen)}catch{}
 by('promo').textContent='QA STUDIO PRO · '+chosen.replace('qa_','').toUpperCase()+' · CREATE ACCOUNT';
}
try{lang.value=localStorage.getItem('qa-studio-language')==='en'?'en':'cs'}catch{lang.value='cs'}
lang.onchange=()=>{try{localStorage.setItem('qa-studio-language',lang.value)}catch{}};
const say=(cs,en)=>{status.textContent=lang.value==='en'?en:cs};
function revealStatus(){status.scrollIntoView({behavior:'smooth',block:'center'});try{status.focus({preventScroll:true})}catch{}}
function friendlyError(e){
 const code=String(e?.code||'').toLowerCase(),msg=String(e?.message||e||'');
 if(code==='invalid_credentials'||/invalid login credentials/i.test(msg))
  return ['Nesprávné heslo nebo e-mail. Účet už existuje – znovu ho neregistruj. Pokud heslo nevíš, použij obnovu až po uvolnění limitu e-mailů.','Incorrect email or password. Your account already exists. Do not register again.'];
 if(code==='over_email_send_rate_limit'||/email rate limit|too many requests|429/i.test(msg))
  return ['Supabase dočasně odmítá posílat další e-maily (limit 429). Opakované žádosti nepomohou.','Supabase email sending is temporarily blocked (429). More attempts will not help.'];
 if(code==='email_not_confirmed')return ['E-mail účtu ještě není potvrzený.','This account email is not confirmed yet.'];
 return ['Přihlášení selhalo: '+msg,'Sign-in failed: '+msg];
}
by('showPassword').onclick=()=>{
 const input=by('password'),visible=input.type==='password';
 input.type=visible?'text':'password';
 by('showPassword').textContent=visible?'🙈 Skrýt heslo / Hide password':'👁 Zobrazit heslo / Show password';
};
let supa=null,user=null,mode='email',recover=false;
const mailNotice=by('mailLimits'),sendButtons=[by('sendOtp'),by('sendReset')];
const MAIL_LOCK_KEY='qa-login-email-limit';
const COOLDOWN_MS=90000;
const warn=(msg)=>{mailNotice.hidden=false;mailNotice.textContent=msg;};
function rateState(){let until=0;try{until=Number(sessionStorage.getItem(MAIL_LOCK_KEY))||0}catch{};const blocked=until>Date.now();sendButtons.forEach(b=>{b.disabled=blocked;b.title=blocked?'Recently requested – wait until allowed by the email provider.':''});if(blocked)warn('A verification email was requested recently. Sending repeated messages may trigger Supabase email limits. / Ověřovací e-mail už byl vyžádán. Opakované odesílání způsobuje blokaci Supabase.');else if(mailNotice.textContent?.startsWith('A verification email')){mailNotice.hidden=true;mailNotice.textContent=''}return blocked}
function mailSent(){try{sessionStorage.setItem(MAIL_LOCK_KEY,String(Date.now()+COOLDOWN_MS))}catch{};rateState();}
function mailError(err){
 const code=String(err?.code||''),msg=String(err?.message||'');
 if(code==='over_email_send_rate_limit'||/email rate limit|rate limit exceeded|too many requests|429/i.test(msg)){
  warn('Supabase has temporarily blocked additional emails (429). New email links cannot be sent now. Use your existing password or an enabled social provider; stop retrying until the server limit clears. / Supabase dočasně blokuje další e-maily (429). Zkus stávající heslo nebo funkční Google přihlášení; další opakované odesílání nepomůže.');
  try{sessionStorage.setItem(MAIL_LOCK_KEY,String(Date.now()+5*60*1000))}catch{};rateState();
  return true;
 }
 return false;
}
async function socialOptions(){
 try{
  const res=await fetch(PROJECT+'/auth/v1/settings',{headers:{apikey:KEY},cache:'no-store'});
  if(!res.ok)throw Error('Provider settings unavailable');
  const cfg=await res.json();
  const google=cfg.external_google===true,facebook=cfg.external_facebook===true;
  by('googleAuth').hidden=!google;by('facebookAuth').hidden=!facebook;
  by('socialButtons').hidden=!google&&!facebook;
  by('socialNote').hidden=google||facebook;
  by('socialNote').textContent='Google/Facebook sign-in is not configured in Supabase. Use password sign-in instead. / Google/Facebook není v Supabase aktivované.';
 }catch{by('socialButtons').hidden=true;by('socialNote').hidden=false;by('socialNote').textContent='Social login availability cannot be verified. / Sociální přihlášení nebylo možné ověřit.'}
}
async function socialSignIn(provider,btn){
 btn.disabled=true;
 try{
  const {data,error}=await client().auth.signInWithOAuth({provider,options:{redirectTo:RETURN,skipBrowserRedirect:true}});
  if(error)throw error;
  if(!data?.url)throw Error('Provider redirect unavailable');
  const dest=new URL(data.url);
  if(dest.origin!==new URL(PROJECT).origin||dest.pathname!=='/auth/v1/authorize')throw Error('Unexpected OAuth redirect');
  location.assign(dest.href);
 }catch(e){say('Přihlášení '+provider+' selhalo: '+(e.message||e),'Could not sign in with '+provider+': '+(e.message||e));btn.disabled=false}
}
by('googleAuth').onclick=()=>socialSignIn('google',by('googleAuth'));
by('facebookAuth').onclick=()=>socialSignIn('facebook',by('facebookAuth'));
function email(){const v=by('email').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw Error('Zadej platný e-mail / Enter a valid email');return v}
const goStudio=()=>location.assign(BASE.href);
by('studio').onclick=goStudio;
function updateUI(){
 by('logout').hidden=!user;
 by('current').textContent=user?'✓ Přihlášený účet / Signed in: '+(user.email||'customer'):'';
 if(user){by('loginForm').hidden=true;by('alternatives').hidden=true;by('newPasswordSection').hidden=false}
 else{by('loginForm').hidden=false;by('alternatives').hidden=false;by('newPasswordSection').hidden=true}
}
async function refresh(){if(!supa)return;const {data,error}=await supa.auth.getUser();user=error?null:data.user;updateUI();return user}
function client(){if(!supa)throw Error('Authentication is still loading / Připojení se načítá');return supa}
async function loggedIn(){if(!await refresh())throw Error('No verified session was created');say('✓ Přihlášeno! Otevírám studio.','✓ Signed in! Opening the studio.');if(!recover)setTimeout(goStudio,350)}
async function run(btn,job){
 btn.disabled=true;
 const original=btn.textContent;
 btn.textContent='⏳ Checking / Kontroluji…';
 say('Ověřuji požadavek na zabezpečeném serveru…','Checking your request on the secure server…');
 try{await job()}
 catch(e){const message=friendlyError(e);say(message[0],message[1]);revealStatus()}
 finally{btn.disabled=false;btn.textContent=original}
}
by('loginForm').onsubmit=e=>{e.preventDefault();run(by('login'),async()=>{
 if(!by('password').value)throw Error('Enter password / Zadej heslo');
 const {data,error}=await client().auth.signInWithPassword({email:email(),password:by('password').value});
 if(error)throw error;
 if(!data?.session)throw Error('Sign-in session not returned');await loggedIn();
})};
by('register').onclick=()=>run(by('register'),async()=>{
 const pw=by('password').value;if(pw.length<8)throw Error('Password must contain at least 8 characters');
 const {data,error}=await client().auth.signUp({email:email(),password:pw,options:{emailRedirectTo:RETURN}});
 if(error){mailError(error);throw error}
 if(data?.session){await loggedIn();return}
 say('Registrace přijata. V e-mailu můžeš zkopírovat celý odkaz a vložit ho níže. Pokud už účet máš, zkus přihlášení nebo obnovu hesla.',
 'Registration requested. Copy the email verification link and paste below if it will not open. If your account exists, sign in or reset your password.');
});
by('sendOtp').onclick=()=>run(by('sendOtp'),async()=>{
 if(rateState())throw Error('A verification email was requested recently / E-mail už byl nedávno vyžádán.');
 const {error}=await client().auth.signInWithOtp({email:email(),options:{shouldCreateUser:false,emailRedirectTo:RETURN}});
 if(error){mailError(error);throw error}mailSent();mode='email';recover=false;
 say('Ověření vyžádáno. Obsahuje-li e-mail číselný kód, vlož ho sem. Pokud obsahuje pouze odkaz, zkopíruj jeho úplnou adresu bez otevření. Novější e-mail zneplatní starší odkaz.',
 'Verification requested. Enter the numeric code if your email contains one; otherwise copy and paste the full link without opening it. Newer emails invalidate older links.');
});
by('sendReset').onclick=()=>run(by('sendReset'),async()=>{
 if(rateState())throw Error('A verification email was requested recently / E-mail už byl nedávno vyžádán.');
 const {error}=await client().auth.resetPasswordForEmail(email(),{redirectTo:RETURN});if(error){mailError(error);throw error}
 mailSent();mode='recovery';recover=true;
 say('Obnova vyžádána. Pokud zpráva obsahuje číselný kód, zadej ho. Pokud je v ní jen odkaz, zkopíruj jeho adresu. Po ověření nastavíš nové heslo.',
 'Password recovery requested. Enter a code if the email contains one, or paste the link address to verify without clicking.');
});
by('verifyOtp').onclick=()=>run(by('verifyOtp'),async()=>{
 const code=by('otp').value.trim();if(!/^[0-9]{6,8}$/.test(code))throw Error('Enter a 6–8 digit code from your email if provided');
 const {data,error}=await client().auth.verifyOtp({email:email(),token:code,type:mode});
 if(error)throw error;if(!data?.session)throw Error('Code was not accepted');by('otp').value='';
 if(mode==='recovery'){recover=true;user=data.user;updateUI();say('Ověřeno, nastav nové heslo.','Verified. Choose a new password.');by('newPasswordSection').scrollIntoView({block:'start'})}
 else await loggedIn();
});
by('verifyLink').onclick=()=>run(by('verifyLink'),async()=>{
 const value=by('pasted').value.trim();
 const u=new URL(value);
 if(u.origin!==new URL(PROJECT).origin||u.pathname!=='/auth/v1/verify')throw Error('Paste only the official Supabase email verification URL. If the email contains a tracking link, copy the actual destination URL.');
 if(u.searchParams.has('redirect_to')&&/^http:\/\/localhost(?::\d+)?\//i.test(u.searchParams.get('redirect_to')||'')){
  say('V odkazu je špatná návratová adresa localhost. Ověření zde může fungovat, ale automatický návrat je nastaven nesprávně. /localhost must be fixed in Supabase settings.',
      'The email link redirects to localhost. In-app verification may still work, but Supabase redirect settings need correction.');
 }
 const type=u.searchParams.get('type');if(!['email','magiclink','signup','recovery','invite'].includes(type))throw Error('Unsupported verification link type');
 const token=u.searchParams.get('token_hash')||u.searchParams.get('token');
 if(!token||!/^[A-Za-z0-9_=-]{12,512}$/.test(token))throw Error('Verification link is missing a valid token');
 const otpType=type==='magiclink'?'email':type;
 const {data,error}=await client().auth.verifyOtp({token_hash:token,type:otpType});
 by('pasted').value='';if(error)throw error;if(!data?.session)throw Error('Link was expired or already used');
 if(otpType==='recovery'){recover=true;user=data.user;updateUI();say('Ověřeno, nastav nové heslo.','Verified. Set a new password.');by('newPasswordSection').scrollIntoView({block:'start'})}
 else await loggedIn();
});
by('savePassword').onclick=()=>run(by('savePassword'),async()=>{
 const pw=by('newPassword').value,repeat=by('confirmPassword').value;
 if(pw.length<8||pw!==repeat)throw Error('Passwords must match and contain at least 8 characters');
 if(!user)throw Error('Verified session or recovery required');
 const {data,error}=await client().auth.updateUser({password:pw});if(error)throw error;if(!data?.user)throw Error('Password change not confirmed');
 by('newPassword').value='';by('confirmPassword').value='';recover=false;
 say('✓ Heslo bylo změněno. Pokračuj do studia.','✓ Password changed. Continue to the studio.');
});
by('logout').onclick=()=>run(by('logout'),async()=>{await client().auth.signOut();user=null;recover=false;updateUI();say('Odhlášeno.','Signed out.')});
async function startup(){try{
 const m=await import('https://esm.sh/@supabase/supabase-js@2.56.0');
 supa=m.createClient(PROJECT,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 supa.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY'){recover=true;setTimeout(()=>{by('newPasswordSection').hidden=false;say('Ověřeno, zadej nové heslo.','Verified. Enter a new password.')},80)}if(event==='SIGNED_IN')setTimeout(refresh,0)});
 const u=new URLSearchParams(location.hash.replace(/^#/,''));
 const failed=u.get('error_code')||PAGE.searchParams.get('error_code');
 await refresh();
 rateState();socialOptions();
 if(failed)say('Odkaz je neplatný nebo vypršel. Po uvolnění limitu požádej o nový, případně vlož dosud neotevřenou adresu odkazu.','The email link expired or was already used. Ask for a fresh one after the email limit resets, or paste an unused link.');
 else if(user)say('✓ Jsi přihlášený. Můžeš jít do studia nebo změnit heslo.','✓ You are signed in. Go to the studio or change your password.');
 else say('Přihlas se heslem, číselným kódem (pokud je v e-mailu), nebo vlož zkopírovaný ověřovací odkaz.','Sign in with your password, a numeric email code (if provided), or a pasted verification URL.');
}catch(e){say('Chyba načítání přihlášení: '+(e.message||e),'Authentication failed to load: '+(e.message||e))}}
startup();
})();
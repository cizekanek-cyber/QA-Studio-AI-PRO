/* QA Studio AI PRO • Supabase přihlášení / licence. 2026-11-23.
   Browser receives only PUBLIC publishable key. Payments remain disabled until testing. */
(()=>{'use strict';
 if(document.getElementById('qaAccountPanel'))return;
 const PROJECT='https://naxotlqvimewbfowxwmw.supabase.co';
 const PUBLIC_KEY='sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL';
 // Redirect only to controlled production origins (no arbitrary redirect URLs).
 const REDIRECT_URL=new URL('./login.html',window.location.href).href;
 const rawAuthReturn=new URLSearchParams(window.location.hash.startsWith('#')?window.location.hash.slice(1):'');
 const RECOVERY_IN_URL=rawAuthReturn.get('type')==='recovery';
 const AUTH_RETURN_ERROR=rawAuthReturn.get('error_code')||rawAuthReturn.get('error')||new URLSearchParams(location.search).get('error_code');
 const nav=document.querySelector('.nav');
 if(!nav)return;
 const st=document.createElement('style');
 st.textContent='.qaAccPanel{background:#161d32;border:1px solid #35405b;border-radius:18px;padding:20px;color:#f7f9ff;max-width:740px;margin:auto}.qaAccPanel h2{margin:0 0 12px}.qaAccPanel p{color:#bac5da;line-height:1.6}.qaAccPanel input{padding:12px;background:#101629;color:white;border:1px solid #56617f;border-radius:12px;width:100%;max-width:380px;font:inherit}.qaAccPanel button{padding:11px 17px;border:1px solid #7060ac;border-radius:12px;background:#483385;color:#fff;margin:6px 6px 6px 0;font:inherit}.qaAccPanel button:disabled{opacity:.5;cursor:not-allowed}.qaNote{font-size:12px;color:#b6c0d6;margin-top:12px}.qaAccStatus{padding:10px 12px;background:#111b31;border-radius:11px;color:#dbf2ff;white-space:pre-wrap}.qaAccPanel .qaPayDisabled{background:#24314a;color:#b9c0cd}';
 st.textContent+='.qaAccPanel .qaHidden{display:none!important}.qaAccPanel #qaAdminPanel{border-top:1px solid #455373;padding-top:14px;margin-top:15px}.qaAccPanel .qaAdminKpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.qaAccPanel .qaAdminKpis span{display:block;background:#101a31;border:1px solid #44526a;border-radius:10px;padding:10px;font-size:12px}.qaAccPanel .qaAdminKpis strong{display:block;font-size:19px;color:white}.qaAccPanel #qaPassword{margin-top:8px}.qaAccPanel #qaEmail{margin-bottom:10px}';
 st.textContent+='.qaSocialLogin{border:1px solid #5263a2;background:#111c36;border-radius:14px;padding:15px;margin:0 0 19px}.qaSocialLogin h3{margin:0 0 9px;font-size:15px}.qaSocialLogin .qaSocialRow{display:flex;gap:8px;flex-wrap:wrap}.qaSocialLogin .qaSocialRow button{flex:1;min-width:120px;background:#222e4e;border:1px solid #8299c5}.qaSocialLogin .qaSocialRow button:disabled{opacity:.55;cursor:not-allowed}.qaSocialLogin .qaSocialStatus{font-size:12px;color:#c4d0e9;line-height:1.5;margin:7px 0}.qaSocialLogin .qaSocialWallets{font-size:12px;color:#f7dca3;background:#1b253e;border:1px solid #565576;padding:8px;border-radius:9px;margin-top:10px}';
 document.head.append(st);
 const tab=document.createElement('button');tab.type='button';tab.textContent='🔐 Účet / PREMIUM';tab.dataset.tab='qaAccountPanel';nav.append(tab);
 const sec=document.createElement('section');sec.className='tab';sec.id='qaAccountPanel';sec.innerHTML='<div class="qaAccPanel"><h2>🔐 Můj účet • QA Studio AI PRO</h2><p>Ověřte svůj e-mail a spravujte přístup k zakoupeným šablonám. Zákaznické platby zatím nejsou povolené.</p><div id="qaAuthForm"><label for="qaEmail">E-mail</label><div><input type="email" autocomplete="email" id="qaEmail" placeholder="vas@email.cz"></div><button id="qaSignIn">Poslat odkaz na e-mail</button></div><div id="qaSignOutBox" style="display:none"><button id="qaSignOut">Odhlásit</button><button id="qaRefresh">Zkontrolovat licenci</button></div><div id="qaAccountStatus" class="qaAccStatus" role="status">Připojuji bezpečné přihlášení…</div><div class="qaNote">Platba je zatím vypnutá, abychom před spuštěním dokončili zabezpečení a zkušební nákup. Neomezené používání šablon nezahrnuje neomezené AI generování.</div><div class="qaNote">Šest časových balíčků od 59 Kč za 24 hodin po 2 990 Kč za 365 dní. Po aktivaci se zpřístupní všechny hotové PRO/VIP předlohy a přidělené AI kredity. Najdeš je v záložce AI kredity / ceník. Platby a skutečné AI čerpání ještě nejsou aktivní.</div></div>';
 const parent=document.querySelector('.tab')?.parentElement||nav.parentElement;parent.append(sec);
 const form=sec.querySelector('#qaAuthForm');
 sec.querySelector('.qaAccPanel').insertAdjacentHTML('beforeend','<p class="qaNote"><a href="./licenses.html" target="_top" rel="noopener" style="color:#d7bcff">📄 Podmínky licencí / License information</a></p>');
 sec.querySelector('.qaAccPanel').insertAdjacentHTML('beforeend',`<div id="qaRecoveryBox" class="qaHidden" style="border:2px solid #a98af4;border-radius:15px;padding:18px;margin:18px 0;background:#202149">
 <h3>🔑 Set your new password / Nové heslo</h3>
 <p>You opened a password reset link. Choose a new password and save it. / Po otevření odkazu z e-mailu si nastav nové heslo.</p>
 <label for="qaNewPassword">New password / Nové heslo</label><input type="password" id="qaNewPassword" autocomplete="new-password" minlength="8" placeholder="At least 8 characters" />
 <label for="qaNewPasswordCheck" style="display:block;margin-top:11px">Repeat password / Zopakuj heslo</label><input type="password" id="qaNewPasswordCheck" autocomplete="new-password" minlength="8" placeholder="Repeat password" />
 <div><button type="button" id="qaSaveNewPassword">Save new password / Uložit heslo</button></div><p id="qaRecoveryStatus" role="status"></p>
 </div>`);
 const help=document.createElement('div');help.id='qaLoginHelp';help.innerHTML='<p style="font-size:13px;margin:5px 0 12px;color:#b9d8f9">Already registered? Choose <strong>Sign in</strong>, not Register. Forgot your password? Use <strong>Reset password</strong> below. / Máš účet? Přihlas se, neregistruj se znovu.</p>';
 form.append(help);
 const guest=document.createElement('button');guest.type='button';guest.id='qaGuestEdit';guest.textContent='Continue free without sign-in / Pokračovat zdarma bez přihlášení';guest.style.cssText='background:#16283b;border:1px solid #3d7d91';guest.onclick=()=>nav.querySelector('[data-tab="qaSceneLib"]')?.click();form.append(guest);
 
 form.insertAdjacentHTML('afterbegin','<div class="qaSocialLogin" id="qaSocialLogin"><h3>Quick sign-in · Rychlé přihlášení</h3><div class="qaSocialRow"><button type="button" id="qaLoginGoogle">G · Google</button><button type="button" id="qaLoginFacebook">f · Facebook</button><button type="button" id="qaLoginTikTok" disabled>TikTok · Coming soon</button></div><div class="qaSocialStatus" id="qaSocialStatus" role="status">Checking secure login options…</div><div class="qaSocialWallets">At checkout: Bank card · Apple Pay on supported devices · Google Pay: activation pending. Stripe handles payment details; this website never stores card numbers.</div></div>');
 form.insertAdjacentHTML('beforeend','<div style="margin-top:12px"><button id="qaModeLink" type="button">Odkaz na e-mail</button><button id="qaModePassword" type="button">Přihlášení heslem</button></div><div id="qaPasswordBox" class="qaHidden"><label for="qaPassword">Heslo (min. 8 znaků)</label><input id="qaPassword" type="password" autocomplete="current-password" placeholder="Heslo"><div><button id="qaPassLogin" type="button">Přihlásit</button><button id="qaPassRegister" type="button">Registrovat</button><button id="qaPassReset" type="button">Obnovit heslo</button></div></div>');
 sec.querySelector('.qaAccPanel').insertAdjacentHTML('beforeend','<div id="qaAdminPanel" class="qaHidden"><h2>Administrace majitele</h2><p>Tržby a předplatná uvidí pouze serverově ověřený správce.</p><button id="qaAdminRefresh" type="button">Načíst tržby</button><div class="qaAdminKpis"><span><strong id="qaGross">–</strong>Hrubé tržby Kč</span><span><strong id="qaPayments">–</strong>Transakce</span><span><strong id="qaSubs">–</strong>Předplatná</span></div><p id="qaAdminInfo" class="qaNote"></p></div>');

 sec.querySelector('#qaAdminPanel').insertAdjacentHTML('beforeend','<h3>Model hospodaření · pouze majitel, nejde o skutečné tržby</h3><p class="qaNote">Jednorázové licence editoru bez automatické obnovy. Počítá se modelový poplatek Stripe 1,5 % + 6,50 Kč (standardní karta EHP). Skutečné poplatky se mohou lišit.</p><div><label>Balíček <select id="qaFinancePlan"><option value="editor_day">1 den · 19 Kč</option><option value="editor_week">7 dní · 69 Kč</option><option value="editor_14days">14 dní · 119 Kč</option><option value="editor_month" selected>30 dní · 199 Kč</option><option value="editor_90days">90 dní · 449 Kč</option><option value="editor_year">365 dní · 1 299 Kč</option></select></label><label>Počet prodaných balíčků / měsíc <input type="number" id="qaCustomers" min="0" step="10" value="100" style="max-width:125px"></label><label>Fixní provoz Kč/měs. <input type="number" id="qaFixedCost" min="0" step="100" value="1000" style="max-width:130px"></label></div><div id="qaForecast" class="qaAccStatus" style="margin-top:8px;line-height:1.8"></div><p class="qaNote">Externí AI používá zákazník na vlastní účet; její náklady nejsou součástí našich licencí. Výsledek nezahrnuje daně, vratky, chargebacky, dražší karty, marketing, účetnictví a další provozní náklady.</p>');
 function cashForecast(){
  const offers={"editor_day":{"price":19},"editor_week":{"price":69},"editor_14days":{"price":119},"editor_month":{"price":199},"editor_90days":{"price":449},"editor_year":{"price":1299}};
  const plan=offers[sec.querySelector('#qaFinancePlan').value]||offers.editor_month;
  const n=Math.max(0,Number(sec.querySelector('#qaCustomers').value)||0);
  const fixed=Math.max(0,Number(sec.querySelector('#qaFixedCost').value)||0);
  const fee=plan.price*.015+6.5, unit=plan.price-fee;
  const profit=n*unit-fixed;
  const breakEven=unit>0?Math.ceil(fixed/unit):null;
  const kr=x=>x.toLocaleString('cs-CZ',{maximumFractionDigits:2})+' Kč';
  sec.querySelector('#qaForecast').textContent=
   'Příjmy: '+kr(n*plan.price)+'\n'
   +'Poplatky Stripe: −'+kr(n*fee)+'\n'
   +'Modelové fixní náklady: −'+kr(fixed)+'\n'
   +'Příspěvek na provoz a zisk z 1 balíčku: '+kr(unit)+'\n'
   +'Zbývá před dalšími náklady a daněmi: '+kr(profit)+'\n'
   +'Bod zvratu: '+(breakEven===null?'nedosažitelný při tomto limitu':'cca '+breakEven+' prodejů za měsíc');
 }
 for(const id of ['qaFinancePlan','qaFixedCost','qaCustomers'])sec.querySelector('#'+id).addEventListener(id==='qaFinancePlan'?'change':'input',cashForecast);
 cashForecast();

 const q=s=>sec.querySelector(s),status=q('#qaAccountStatus');
 tab.addEventListener('click',()=>{
 if(!window.__qaAuthenticatedUserId){
  window.top.location.assign(new URL('./login.html',window.location.href).href);
  return;
 }
 document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e===sec));
 nav.querySelectorAll('button').forEach(e=>e.classList.toggle('active',e===tab));
 window.scrollTo({top:0,behavior:'smooth'});
});
 let supa=null,auth=null,adminAccess=false,lastVerifiedUser=null;
 const loginGoogle=q('#qaLoginGoogle'),loginFacebook=q('#qaLoginFacebook'),socialStatus=q('#qaSocialStatus');
 const recoveryBox=q('#qaRecoveryBox'),recoveryStatus=q('#qaRecoveryStatus');
 let recoveryMode=RECOVERY_IN_URL;
 function openRecoveryForm(){
  recoveryMode=true;recoveryBox.classList.remove('qaHidden');tab.click();recoveryBox.scrollIntoView({behavior:'smooth',block:'center'});
  q('#qaNewPassword').focus({preventScroll:true});
 }
 q('#qaSaveNewPassword').onclick=async()=>{
  const a=q('#qaNewPassword').value,b=q('#qaNewPasswordCheck').value,save=q('#qaSaveNewPassword');
  if(a.length<8){recoveryStatus.textContent='Password must have at least 8 characters. / Heslo musí mít alespoň 8 znaků.';return}
  if(a!==b){recoveryStatus.textContent='Passwords do not match. / Hesla se neshodují.';return}
  if(!supa){recoveryStatus.textContent='Authentication is still loading. / Přihlášení se načítá.';return}
  save.disabled=true;
  try{
   const {data,error}=await supa.auth.updateUser({password:a});
   if(error)throw error;
   if(!data?.user)throw Error('Password update was not confirmed');
   q('#qaNewPassword').value='';q('#qaNewPasswordCheck').value='';
   recoveryMode=false;recoveryBox.classList.add('qaHidden');
   status.textContent='✓ Password updated. You are signed in. / Heslo uloženo, jsi přihlášený.';
   await sessionInfo();
  }catch(e){recoveryStatus.textContent='Could not save new password: '+(e.message||e)}
  finally{save.disabled=false}
 };
 
 async function providerSetup(){
   try{
     const response=await fetch(PROJECT+'/auth/v1/settings',{headers:{apikey:PUBLIC_KEY},cache:'no-store'});
     if(!response.ok)throw Error('Provider status is unavailable');
     const flags=await response.json();
     const google=flags.external_google===true,facebook=flags.external_facebook===true;
     loginGoogle.disabled=!google;loginFacebook.disabled=!facebook;
     loginGoogle.textContent=google?'G · Continue with Google':'G · Google (setup needed)';
     loginFacebook.textContent=facebook?'f · Continue with Facebook':'f · Facebook (setup needed)';
     socialStatus.textContent=google||facebook?'Select a configured provider. You will confirm login with Google or Facebook.':'Google and Facebook sign-in require OAuth provider setup in Supabase. Email registration is available below.';
   }catch(e){
     loginGoogle.disabled=true;loginFacebook.disabled=true;
     loginGoogle.textContent='G · Google (verify setup)';
     loginFacebook.textContent='f · Facebook (verify setup)';
     socialStatus.textContent='Social provider settings could not be verified. Use email registration; social login cannot start until its provider is configured.';
   }
 }
 async function oauth(provider){
   if(!supa){socialStatus.textContent='Authentication is loading; use email or try again.';return}
   const b=provider==='google'?loginGoogle:loginFacebook;b.disabled=true;socialStatus.textContent='Opening secure '+provider+' sign-in…';
   try{
     const result=await supa.auth.signInWithOAuth({provider,options:{redirectTo:REDIRECT_URL,skipBrowserRedirect:true}});
     if(result.error)throw result.error;
     if(!result.data?.url)throw Error('Login redirect is not available');
     const url=new URL(result.data.url);
     if(url.origin!==new URL(PROJECT).origin||!url.pathname.startsWith('/auth/v1/authorize'))throw Error('Unexpected OAuth redirect');
     window.top.location.assign(url.toString());
   }catch(e){socialStatus.textContent='Social sign-in: '+(e.message||e)+'. You can use email and password instead.';b.disabled=false}
 }
 loginGoogle.onclick=()=>oauth('google');loginFacebook.onclick=()=>oauth('facebook');
 
 const qEmail=()=>{const value=q('#qaEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Zadejte platný e-mail.');return value};
 async function sendServer(slug,body){if(!auth)throw Error('Nejdřív se přihlas.');const r=await fetch(PROJECT+'/functions/v1/'+slug,{method:'POST',headers:{'Content-Type':'application/json',apikey:PUBLIC_KEY,Authorization:'Bearer '+auth.access_token},body:JSON.stringify(body)});const x=await r.json().catch(()=>({}));if(!r.ok)throw Error(x.error||('Server '+r.status));return x}
 async function adminStats(){if(!adminAccess)return;try{q('#qaAdminInfo').textContent='Ověřuji na serveru…';const d=await sendServer('qa-admin',{action:'summary'});q('#qaGross').textContent=Number(d.gross_czk||0).toLocaleString('cs-CZ');q('#qaPayments').textContent=Number(d.paid_transactions||0).toLocaleString('cs-CZ');q('#qaSubs').textContent=Number(d.active_subscriptions||0).toLocaleString('cs-CZ');q('#qaAdminInfo').textContent=d.note||''}catch(e){q('#qaAdminInfo').textContent='Administrace: '+(e.message||e)}}

 async function sessionInfo(){
  if(!supa)return;
  try{
   const r=await supa.auth.getSession();
   auth=r.data.session;
   if(!auth||auth.user.id!==lastVerifiedUser){adminAccess=false;q('#qaAdminPanel').classList.add('qaHidden');for(const id of ['qaGross','qaPayments','qaSubs'])q('#'+id).textContent='–';lastVerifiedUser=null;}
   window.__qaAuthenticatedUserId=auth?.user?.id||null;
   q('#qaAuthForm').style.display=auth?'none':'block';
   q('#qaSignOutBox').style.display=auth?'block':'none';
   if(!auth){adminAccess=false;q('#qaAdminPanel').classList.add('qaHidden');status.textContent='Nepřihlášený uživatel. Vytváření návrhů zdarma funguje bez účtu.';return;}
   status.textContent='✓ Signed in / Přihlášen: '+auth.user.email+'\nOvěřuji licenci…';
   window.dispatchEvent(new CustomEvent('qa:auth-ready',{detail:{user_id:auth.user.id}}));
   const res=await fetch(PROJECT+'/functions/v1/qa-template',{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLIC_KEY,'Authorization':'Bearer '+auth.access_token},body:JSON.stringify({action:'status'})});
   const j=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(j.error||'Nelze ověřit licence ('+res.status+')');
   const tier=j.is_admin?'ADMIN':j.vip?'VIP':j.plus?'PRO':'FREE';
   const expiry=j.plus_until?new Date(j.plus_until):null;
   const formatted=expiry&&Number.isFinite(expiry.getTime())?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Prague'}).format(expiry):null;
   let msg='Licence / License: '+tier;
   if(formatted&&!j.is_admin)msg+='\nPlatnost do / Valid until: '+formatted;
   if(j.prepaid_active)msg+='\nJednorázový balíček / Prepaid pass · bez automatického obnovení';
   if(j.christmas)msg+='\nVánoční balíček: aktivní';
   if(!j.plus&&!j.is_admin&&!j.christmas)msg+='\nNení aktivní placená licence. / No paid license is active.';
   adminAccess=Boolean(j.is_admin);lastVerifiedUser=auth.user.id;q('#qaAdminPanel').classList.toggle('qaHidden',!adminAccess);status.textContent='Přihlášen: '+auth.user.email+'\n'+msg+(adminAccess?'\nPřístup majitele ověřen serverem.':'');if(adminAccess)adminStats();
  }catch(e){
   status.textContent=auth?.user?.email?
    '✓ Signed in / Přihlášen: '+auth.user.email+'\nLicense check needs attention / Kontrola licence není dostupná: '+(e?.message||'Server unavailable'):
    'Sign-in error / Chyba přihlášení: '+(e?.message||'Chyba připojení');
  }
 }
 async function startup(){
  try{
   if(!window.QAAuthCore){
     await new Promise((resolve,reject)=>{
       const script=document.createElement('script');script.src='./qa-auth-core.js?v=20261123-core01';
       script.onload=resolve;script.onerror=()=>reject(new Error('Authentication module did not load'));
       document.head.append(script);
     });
   }
   supa=window.QAAuthCore.createClient();
   supa.auth.onAuthStateChange((event)=>{
     if(event==='PASSWORD_RECOVERY'){setTimeout(openRecoveryForm,0)}
     setTimeout(sessionInfo,0)
   });
   const callback=await supa.auth.handleRedirect();
   if(callback?.error)status.textContent='Ověřovací odkaz: '+callback.error.message;
   await sessionInfo();
   providerSetup();
   if(RECOVERY_IN_URL&&auth)setTimeout(openRecoveryForm,60);
   if(AUTH_RETURN_ERROR){
     status.textContent='The email login link has expired or was already used. Request a new password reset link below. / Odkaz z e-mailu vypršel nebo už byl použit. Nech si poslat nový odkaz.';
     tab.click();
     setTimeout(()=>q('#qaModePassword')?.click(),50);
   }
  }catch(e){status.textContent='Přihlášení není dostupné: '+(e?.message||'Chyba načtení')}
 }
 const mailCooldownKey='qa-studio-auth-mail-cooldown-v2';
 let mailPending=false;
 async function guardedMail(task){
   let until=0;try{until=Number(localStorage.getItem(mailCooldownKey))||0}catch{}
   if(mailPending||until>Date.now())throw Error('Please wait before requesting another email / Vyčkej před odesláním dalšího e-mailu.');
   mailPending=true;
   try{const result=await task();if(result.error)throw result.error;if(!result.data?.session){try{localStorage.setItem(mailCooldownKey,String(Date.now()+10*60*1000))}catch{}}return result;}
   catch(e){if(e.status===429||e.code==='over_email_send_rate_limit'){try{localStorage.setItem(mailCooldownKey,String(Date.now()+60*60*1000))}catch{}}throw e;}
   finally{mailPending=false;}
 }
 q('#qaSignIn').onclick=async()=>{const email=q('#qaEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Zadejte platnou e-mailovou adresu.';return}if(!supa){status.textContent='Připojení zatím není hotové.';return}const b=q('#qaSignIn');b.disabled=true;try{const r=await guardedMail(()=>supa.auth.signInWithOtp({email,options:{emailRedirectTo:REDIRECT_URL}}));if(r.error)throw r.error;status.textContent='Žádost přijata. Zkontroluj spam a nejnovější e-mail. Pokud odkaz vrací na localhost, v Supabase Authentication → URL Configuration povol URL beta aplikace. Pro zákaznické e-maily je potřeba vlastní SMTP.'}catch(e){status.textContent='Přihlášení: '+(e?.message||'Chyba')}finally{b.disabled=false}};
 q('#qaSignOut').onclick=async()=>{try{await supa?.auth.signOut()}catch(e){status.textContent=e?.message||'Chyba odhlášení'}await sessionInfo()};
 q('#qaRefresh').onclick=sessionInfo;
 q('#qaModePassword').onclick=()=>{q('#qaPasswordBox').classList.remove('qaHidden');q('#qaSignIn').classList.add('qaHidden')};
 q('#qaModeLink').onclick=()=>{q('#qaPasswordBox').classList.add('qaHidden');q('#qaSignIn').classList.remove('qaHidden')};
 q('#qaPassLogin').onclick=async()=>{
  const b=q('#qaPassLogin');b.disabled=true;
  try{
   if(!supa)throw Error('Authentication is loading');
   const email=qEmail(),password=q('#qaPassword').value;
   if(!password)throw Error('Vyplň heslo.');
   const r=await supa.auth.signInWithPassword({email,password});if(r.error)throw r.error;
   if(!r.data?.session)throw Error('Session was not created');
   await sessionInfo();
  }catch(e){
   const code=String(e.code||''),msg=String(e.message||e);
   status.textContent=(code==='invalid_credentials'||/invalid login credentials/i.test(msg))?
   'Wrong email or password. / Nesprávný e-mail nebo heslo. Máš-li účet, klikni na Obnovit heslo a vytvoř si nové.':
   (code==='email_not_confirmed'?'Confirm your email first. / Nejdřív potvrď e-mail.':'Sign in failed / Přihlášení selhalo: '+msg);
  }finally{b.disabled=false}
 };
 q('#qaPassRegister').onclick=async()=>{try{const email=qEmail(),password=q('#qaPassword').value;if(password.length<8)throw Error('Heslo musí mít alespoň 8 znaků.');const r=await guardedMail(()=>supa.auth.signUp({email,password,options:{emailRedirectTo:REDIRECT_URL}}));if(r.error)throw r.error;status.textContent=r.data.session?'Registrace dokončena.':'Registrace přijata. Potvrď e-mail; veřejné doručování vyžaduje vlastní SMTP.';if(r.data.session)await sessionInfo()}catch(e){status.textContent='Registrace: '+(e.message||e)}};
 q('#qaPassReset').textContent='🔑 Reset password / Obnovit heslo';
 q('#qaPassReset').onclick=async()=>{
  const b=q('#qaPassReset');b.disabled=true;
  try{
   if(!supa)throw Error('Authentication is loading');
   const {error}=await guardedMail(()=>supa.auth.resetPasswordForEmail(qEmail(),{redirectTo:REDIRECT_URL}));
   if(error)throw error;
   status.textContent='✓ Password reset email requested. Open only the NEWEST message, then choose a new password in the app. / Odkaz pro obnovu byl vyžádán. Otevři pouze NEJNOVĚJŠÍ e-mail a v aplikaci nastav nové heslo.';
  }catch(e){status.textContent='Password recovery error / Chyba obnovy hesla: '+(e.message||e)}
  finally{b.disabled=false}
 };
 q('#qaAdminRefresh').onclick=adminStats;
 // Password login is the primary path: email links are a secondary fallback.
 q('#qaModePassword').click();
 startup();
})();
/* QA Studio AI PRO · direct first-party sign-in v20261123.2
   No third-party JS CDN required. Public beta / no active customer checkout. */
(()=>{'use strict';
const by=id=>document.getElementById(id);
const core=window.QAAuthCore;
const ui={form:by('authForm'),email:by('email'),password:by('password'),message:by('message'),messageText:by('messageText'),language:by('language'),help:by('emailHelp')};
const origin=location.origin;
const destination=new URL('./',location.href).href;
const callback=new URL('./login.html',location.href).href;
const VERSION='auth-core-20261123-02';
const validPlans={'qa_day':['1 den / day','59 Kč'],'qa_3days':['3 dny / days','129 Kč'],'qa_14days':['14 dní / days','279 Kč'],'qa_month':['30 dní / days','449 Kč'],'qa_3months':['90 dní / days','1 099 Kč'],'qa_year':['365 dní / days','2 990 Kč']};
const i18n={
 cs:{home:'Domů',promoTitle:'Tvoř bez hranic. Začni bezpečně.',promoText:'Obrázky, videošablony, kreativní nástroje a připravované AI služby v jednom studiu.',benefit1:'Základní editor zdarma',benefit2:'Hotové kreativní šablony',benefit3:'PRO balíčky dle délky',benefit4:'Bez automatické obnovy',betaNote:'PRO/VIP balíčky jsou v přípravě. Veřejné platby a externí AI generování zatím nejsou aktivní.',stepOne:'① Účet',stepTwo:'② PRO / VIP',stepThree:'③ Studio',heading:'Vítej v QA Studio',subtitle:'Rychlé a zabezpečené přihlášení. Bez závislosti na externí přihlašovací knihovně.',alreadySignedIn:'Jsi ověřený. Můžeš pokračovat do studia.',enterStudio:'Vstoupit do studia',logout:'Odhlásit',email:'E-mail',password:'Heslo',show:'Zobrazit',hide:'Skrýt',signIn:'Přihlásit se',register:'Vytvořit účet',registerHint:'Máš už potvrzený e-mail? Zadej svůj e-mail a heslo z registrace a klikni na Přihlásit se. Další ověřovací e-mail nepotřebuješ.',forgot:'Zapomněl/a jsem heslo',freeEditor:'Pokračovat zdarma bez účtu',socialHeading:'Rychlé přihlášení, pokud je dostupné',socialPending:'Google a Facebook se objeví po aktivaci přihlášení u poskytovatelů.',emailHelpTitle:'Ověřit kód nebo zkopírovaný odkaz z e-mailu',emailHelpText:'Pokud zpráva obsahuje jen tlačítko Sign in, ČÍSELNÝ KÓD v ní není. Jde o jednorázový odkaz. Po potvrzení e-mailu se vrať do aplikace a přihlas se heslem z registrace. Šestimístný kód se bude odesílat až po zapnutí příslušných šablon Supabase.',sendCode:'Poslat přihlašovací e-mail',sendRecovery:'Poslat obnovu hesla',otpLabel:'Ověřovací kód (pokud ho e-mail obsahuje)',codeTypeLabel:'Kód je určený pro',codeLogin:'Přihlášení',codeRecovery:'Obnovu hesla',codeSignup:'Registraci',verifyCode:'Ověřit kód',pasteLabel:'Zkopírovaná adresa ověřovacího odkazu',verifyLink:'Ověřit odkaz bez otevření',newPasswordHeading:'Nastavení nového hesla',newPasswordHelp:'Změna hesla je dostupná pouze po úspěšném ověření účtu.',newPassword:'Nové heslo',confirmPassword:'Zopakovat nové heslo',savePassword:'Uložit nové heslo',diagnostics:'Diagnostika připojení',checkConnection:'Zkontrolovat spojení',copyDiagnostics:'Kopírovat diagnostiku',diagNote:'Diagnostika neobsahuje heslo ani přístupové tokeny. Neposílej sem žádné ověřovací odkazy.',disclaimer:'V aplikaci se neukládají čísla platebních karet. Žádná ostrá platba se zatím neúčtuje.'},
 en:{home:'Home',promoTitle:'Create without limits. Start securely.',promoText:'Images, video templates, creative tools and upcoming AI services in one studio.',benefit1:'Free basic editor',benefit2:'Ready-made creative templates',benefit3:'Time-based PRO packages',benefit4:'No automatic renewals',betaNote:'PRO/VIP passes are being prepared. Live payments and external AI generation are not active yet.',stepOne:'① Account',stepTwo:'② PRO / VIP',stepThree:'③ Studio',heading:'Welcome to QA Studio',subtitle:'Fast and secure sign-in, without an external login library dependency.',alreadySignedIn:'Your account is verified. Continue to the studio.',enterStudio:'Open studio',logout:'Sign out',email:'Email address',password:'Password',show:'Show',hide:'Hide',signIn:'Sign in',register:'Create account',registerHint:'Already confirmed your email? Enter your email and the password you chose when registering, then click Sign in. No new confirmation email is needed.',forgot:'Forgot password?',freeEditor:'Continue free without account',socialHeading:'One-tap sign-in when available',socialPending:'Google and Facebook appear once the providers are configured.',emailHelpTitle:'Verify an email code or copied link',emailHelpText:'If the email only contains a Sign in button, there is NO NUMERIC CODE. It is a one-time link. Once the email is confirmed, return to the app and use the password set during registration. Six-digit codes require Supabase email templates to be enabled.',sendCode:'Send sign-in email',sendRecovery:'Send password recovery',otpLabel:'Verification code (only if provided)',codeTypeLabel:'This code is for',codeLogin:'Sign-in',codeRecovery:'Password recovery',codeSignup:'Registration',verifyCode:'Verify code',pasteLabel:'Copied email verification URL',verifyLink:'Verify copied link',newPasswordHeading:'Set a new password',newPasswordHelp:'You can change your password only after signing in or verifying the recovery email.',newPassword:'New password',confirmPassword:'Repeat new password',savePassword:'Save password',diagnostics:'Connection diagnostics',checkConnection:'Test connection',copyDiagnostics:'Copy diagnostics',diagNote:'Diagnostics never include passwords or access tokens. Never share verification links.',disclaimer:'Payment card numbers are never stored here. Live payments are currently off.'}
};
let currentLang='cs';try{const stored=localStorage.getItem('qa-studio-language');currentLang=stored||((navigator.language||'cs').toLowerCase().startsWith('cs')?'cs':'en')}catch{}
ui.language.value=[...ui.language.options].some(x=>x.value===currentLang)?currentLang:'en';
const lang=()=>currentLang==='cs'?'cs':'en';
function translate(){const d=i18n[lang()];document.documentElement.lang=lang();document.querySelectorAll('[data-i18n]').forEach(el=>{const value=d[el.dataset.i18n];if(value)el.textContent=value});by('togglePassword').textContent=d[ui.password.type==='text'?'hide':'show'];}
translate();ui.language.onchange=()=>{currentLang=ui.language.value;try{localStorage.setItem('qa-studio-language',currentLang)}catch{}translate()};
let client=null,user=null,recovery=false,authReady=false,providerStatus='unknown',lastCode='none',serverState='not_checked';
const cooldownKey='qa-studio-auth-mail-cooldown-v2';
const MAIL_PAUSE=10*60*1000;
const SERVER_LIMIT_PAUSE=60*60*1000;
let pending=false;
function say(cs,en,kind='info',scroll=false){ui.messageText.textContent=lang()==='cs'?cs:en;ui.message.dataset.kind=kind;ui.message.firstElementChild.textContent=kind==='error'?'⚠':kind==='ok'?'✓':kind==='warn'?'!':'ⓘ';if(scroll){ui.message.scrollIntoView({block:'center',behavior:'smooth'});ui.message.focus({preventScroll:true})}}
function msgError(e){
  const code=String(e?.code||'').toLowerCase(),m=String(e?.message||'');lastCode=code||'unknown';
  if(code==='invalid_credentials'||/invalid login credentials/i.test(m))return ['Účet existuje, ale e-mail nebo heslo nesouhlasí. Zkontroluj heslo přes „Zobrazit“. Neregistruj se znovu. Pokud heslo neznáš, použij obnovu až po uvolnění e-mailového limitu.','The account exists, but the email or password is incorrect. Check your password with Show. Do not register again. If forgotten, use recovery after the email limit resets.'];
  if(code==='over_email_send_rate_limit'||e.status===429||/email rate limit/i.test(m))return ['Supabase nyní blokuje odesílání dalších e-mailů (429). Více pokusů nepomůže. Nejde to obejít v aplikaci.','Supabase is blocking additional emails (429). Repeating requests will not help. The app cannot override the server limit.'];
  if(code==='email_not_confirmed')return ['E-mail účtu ještě není potvrzený. Ověř ho pomocí platného kódu nebo odkazu.','The account email is not confirmed. Verify it with a valid code or link.'];
  if(code==='otp_expired'||code==='token_expired'||/token not found|expired/i.test(m))return ['Ověřovací odkaz vypršel nebo už byl použit. Pokud byl e-mail mezitím potvrzený, přihlas se heslem z registrace – další odkaz není potřeba.','The verification link expired or was already used. If the email is already confirmed, sign in with your registration password; no new link is needed.'];
  if(code==='timeout')return ['Spojení vypršelo. Zkus otevřít aplikaci v Chromu mimo vestavěný prohlížeč.','Connection timed out. Try opening the app in Chrome outside the in-app browser.'];
  if(code==='network_error')return ['Nelze se spojit se Supabase. Zkontroluj internet a zkus Chrome.','Could not connect to Supabase. Check internet access and try Chrome.'];
  return ['Operace se nepodařila: '+m,'Operation failed: '+m];
}
function handleError(e){const [cs,en]=msgError(e);say(cs,en,'error',true);if(e.status===429||e.code==='over_email_send_rate_limit'){startCooldown(SERVER_LIMIT_PAUSE);setRateNotice(true)}}
async function action(btn,task){if(pending)return;pending=true;btn.disabled=true;const old=btn.textContent;btn.textContent='⏳ '+(lang()==='cs'?'Ověřuji…':'Checking…');say('Spojuji se se zabezpečeným serverem…','Connecting to secure authentication server…');try{await task()}catch(e){handleError(e)}finally{pending=false;btn.disabled=false;btn.textContent=old;lockEmailsIfNeeded()}}
const need=()=>{if(!client)throw Object.assign(new Error('Zabezpečené přihlášení se nenačetlo. Obnov stránku.'),{code:'not_ready'});return client.auth};
function validEmail(){const value=ui.email.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){ui.email.focus();throw Object.assign(new Error('Zadej platný e-mail.'),{code:'invalid_email'})}return value}
function enterStudio(){location.assign(destination)}
by('goFree').onclick=enterStudio;by('enterStudio').onclick=enterStudio;
by('togglePassword').onclick=()=>{ui.password.type=ui.password.type==='password'?'text':'password';translate()};
by('showHelp').onclick=()=>{ui.help.open=true;ui.help.scrollIntoView({block:'start',behavior:'smooth'});say('Pokud neznáš heslo, požádej o obnovu jen jednou. Opakování může způsobit blokaci e-mailů.','If you forgot your password, request recovery only once. Repeated requests may block email delivery.','warn')};
const chosen=new URL(location.href).searchParams.get('plan');if(validPlans[chosen]){try{sessionStorage.setItem('qa-preferred-pass',chosen)}catch{};by('selectedPlan').hidden=false;by('selectedPlan').textContent='♛ PRO · '+validPlans[chosen].join(' · ')+' · '+(lang()==='cs'?'Platba zatím není aktivní':'Checkout not active yet')}
function setAuthView(){
  by('signedIn').hidden=!user;ui.form.hidden=!!user;
  by('socialArea').hidden=!!user;
  if(user){by('signedInLabel').textContent='✓ '+(user.email||'Verified customer');by('emailHelp').open=false}
  by('recoverPanel').hidden=!user||!recovery;
}
function startCooldown(ms){try{localStorage.setItem(cooldownKey,String(Date.now()+ms))}catch{};lockEmailsIfNeeded()}
function cooldown(){try{return Number(localStorage.getItem(cooldownKey))||0}catch{return 0}}
function lockEmailsIfNeeded(){
 const seconds=Math.max(0,Math.ceil((cooldown()-Date.now())/1000));
 const blocked=seconds>0;
 for(const id of ['sendCode','sendRecovery'])by(id).disabled=blocked;
 setRateNotice(blocked,seconds);
 return blocked;
}
function setRateNotice(blocked,seconds=0){
 const el=by('rateNotice');el.hidden=!blocked;
 if(!blocked){el.textContent='';return}
 const minutes=Math.ceil(seconds/60);
 el.textContent=lang()==='cs'
 ?'Z ochranných důvodů je další odeslání e-mailu dostupné přibližně za '+minutes+' min. Skutečný limit serveru Supabase může trvat déle. Přihlášení heslem tím není omezené.'
 :'Another email request is available in about '+minutes+' min. The Supabase server limit may last longer. Password login is not affected.';
}
setInterval(lockEmailsIfNeeded,15000);
async function signedIn(result){
  if(!result?.session?.access_token)throw new Error('Server did not create a session');
  const check=await need().getUser();if(check.error||!check.data.user)throw check.error||new Error('Unable to verify session');
  user=check.data.user;setAuthView();say('✓ Přihlášení úspěšné. Otevírám studio.','✓ Signed in successfully. Opening the studio.','ok');
  if(!recovery)setTimeout(enterStudio,850);
}
ui.form.onsubmit=e=>{e.preventDefault();action(by('login'),async()=>{
  const email=validEmail(),password=ui.password.value;
  if(!password){ui.password.focus();throw Object.assign(new Error('Zadej heslo.'),{code:'missing_password'})}
  const {data,error}=await need().signInWithPassword({email,password});if(error)throw error;
  await signedIn(data);
})};
by('register').onclick=()=>action(by('register'),async()=>{
  const email=validEmail(),password=ui.password.value;if(password.length<8)throw Object.assign(new Error('Pro nový účet je potřeba heslo o minimálně 8 znacích.'),{code:'weak_password'});
  const {data,error}=await need().signUp({email,password,options:{emailRedirectTo:callback}});if(error)throw error;
  if(data.session){await signedIn(data);return}
  by('codeType').value='signup';
  ui.help.open=true;
  say('Registrace přijata. Potvrď e-mail jednou pomocí odkazu nebo kódu, pokud ho zpráva obsahuje. Zpráva s tlačítkem Sign in nemá číselný kód! Po potvrzení se vrať sem a přihlas se heslem z registrace; nový účet nezakládej.','Registration received. Confirm your email once using its link, or the code if present. An email with only a Sign in button has no numeric code! After confirmation return here and sign in with your registration password; do not sign up again.','ok',true)
});
async function emailAction(mode){
  if(lockEmailsIfNeeded()){say('Ověřovací e-mail byl vyžádán nedávno. Počkej, ať nepřekročíš limit Supabase.','An email was requested recently. Avoid exceeding the Supabase rate limit.','warn',true);return}
  const e=validEmail();let error;
  if(mode==='recovery')({error}=await need().resetPasswordForEmail(e,{redirectTo:callback}));
  else ({error}=await need().signInWithOtp({email:e,options:{emailRedirectTo:callback,shouldCreateUser:false}}));
  if(error)throw error;startCooldown(MAIL_PAUSE);
  by('codeType').value=mode==='recovery'?'recovery':'email';
  ui.help.open=true;
  say('Požadavek přijat. Zpráva se samotným tlačítkem Sign in neobsahuje kód; jde o odkaz, který lze použít jen jednou. Kódy vyžadují aktivní e-mailové šablony Supabase.','Request accepted. An email containing only a Sign in button has no code; its link can be used only once. Codes require configured Supabase email templates.','ok',true)
}
by('sendCode').onclick=()=>action(by('sendCode'),()=>emailAction('email'));
by('sendRecovery').onclick=()=>action(by('sendRecovery'),()=>emailAction('recovery'));
async function handleVerified(result,type){if(!result?.session)throw new Error('Verification did not create a session');if(type==='recovery'){
  recovery=true;const check=await need().getUser();if(check.error||!check.data.user)throw check.error||new Error('Cannot verify user');user=check.data.user;setAuthView();by('recoverPanel').scrollIntoView({block:'center',behavior:'smooth'});
  say('E-mail ověřen. Nyní si nastav nové heslo.','Email verified. Set your new password now.','ok');
}else await signedIn(result)}
by('verifyCode').onclick=()=>action(by('verifyCode'),async()=>{
 const code=by('code').value.trim(),type=by('codeType').value;if(!/^\d{6,8}$/.test(code))throw new Error('Ověřovací kód musí mít 6–8 číslic, pokud ho e-mail obsahuje.');
 const {data,error}=await need().verifyOtp({email:validEmail(),token:code,type});if(error)throw error;
 by('code').value='';await handleVerified(data,type)
});
by('verifyLink').onclick=()=>action(by('verifyLink'),async()=>{
 const raw=by('pastedLink').value.trim();let url;try{url=new URL(raw)}catch{throw new Error('Vlož úplnou adresu odkazu (https://...).')}
 if(url.origin!=='https://naxotlqvimewbfowxwmw.supabase.co'||url.pathname!=='/auth/v1/verify')throw new Error('Použij pouze oficiální neotevřený odkaz ze Supabase, ne odkaz z jiné stránky.');
 const type=url.searchParams.get('type');if(!['email','signup','invite','magiclink','recovery'].includes(type))throw new Error('Tento typ odkazu není podporovaný.');
 const token_hash=url.searchParams.get('token_hash')||url.searchParams.get('token');if(!token_hash||!/^[a-zA-Z0-9_=-]{12,512}$/.test(token_hash))throw new Error('V odkazu chybí platný ověřovací token.');
 const {data,error}=await need().verifyOtp({token_hash,type});if(error)throw error;
 by('pastedLink').value='';await handleVerified(data,type)
});
by('savePassword').onclick=()=>action(by('savePassword'),async()=>{
 if(!user)throw new Error('Nejdřív musíš ověřit účet.');
 const pw=by('newPassword').value,confirmation=by('confirmPassword').value;
 if(pw.length<8||pw!==confirmation)throw new Error('Nová hesla se musí shodovat a mít alespoň 8 znaků.');
 const {data,error}=await need().updateUser({password:pw});if(error)throw error;if(!data.user)throw new Error('Server nepotvrdil uložení hesla.');
 by('newPassword').value='';by('confirmPassword').value='';recovery=false;setAuthView();
 say('✓ Nové heslo uloženo. Můžeš pokračovat do studia.','✓ Password changed. Continue to the studio.','ok',true)
});
by('logout').onclick=()=>action(by('logout'),async()=>{await need().signOut();user=null;recovery=false;setAuthView();say('Odhlášeno.','Signed out.','info')});
async function providerCheck(){
 try{
  const info=await core.request('/settings',{timeout:12000});serverState='online';
  const g=info.external_google===true,f=info.external_facebook===true;
  by('google').hidden=!g;by('facebook').hidden=!f;
  providerStatus='Google: '+(g?'enabled':'not configured')+', Facebook: '+(f?'enabled':'not configured');
  by('socialInfo').textContent=g||f?(lang()==='cs'?'Přihlášení potvrď u poskytovatele.':'Confirm sign-in with your provider.'):(lang()==='cs'?'Google a Facebook nejsou zatím v Supabase nastavené.':'Google and Facebook are not configured in Supabase yet.');
 }catch(e){serverState='offline_or_blocked';providerStatus='unknown';by('google').hidden=true;by('facebook').hidden=true;
  by('socialInfo').textContent=lang()==='cs'?'Dostupnost poskytovatelů se nepodařilo ověřit. Použij e-mail.':'Could not verify social providers. Use email sign-in.';
 }
 updateDiagnostics();
}
for(const provider of ['google','facebook'])by(provider).onclick=()=>action(by(provider),async()=>{
 const {data,error}=await need().signInWithOAuth({provider,options:{redirectTo:callback,skipBrowserRedirect:true}});if(error)throw error;
 const url=new URL(data.url);if(url.origin!==core.project||url.pathname!=='/auth/v1/authorize')throw new Error('Unexpected provider redirect');location.assign(url.href)
});
function diagnosticText(){return [
 'QA STUDIO AI PRO · '+VERSION,
 'Page: '+location.origin+location.pathname,
 'Origin HTTPS: '+(location.protocol==='https:'?'yes':'no'),
 'Supabase Auth: '+serverState,
 'Social providers: '+providerStatus,
 'Auth adapter: '+(authReady?'ready':'not ready'),
 'Authenticated: '+(user?'yes':'no'),
 'Last error code: '+lastCode,
 'Browser: '+navigator.userAgent.replace(/\d+\.\d+(?:\.\d+)*/g,'x').slice(0,190)
 ].join('\n')}
function updateDiagnostics(){by('diagnosticText').textContent=diagnosticText()}
by('checkConnection').onclick=()=>action(by('checkConnection'),async()=>{await providerCheck();say('Kontrola spojení dokončena.','Connection check completed.','ok');updateDiagnostics()});
by('copyDiagnostics').onclick=()=>{
 const message=diagnosticText();if(navigator.clipboard?.writeText){navigator.clipboard.writeText(message).then(()=>say('Diagnostika zkopírována.','Diagnostics copied.','ok')).catch(()=>say('Kopírování blokuje prohlížeč. Vyber text diagnostiky ručně.','Clipboard blocked. Select the diagnostics text manually.','warn'))}
 else say('Prohlížeč nepovolil kopírování. Můžeš vybrat text diagnostiky ručně.','Clipboard unavailable. Select the diagnostics text manually.','warn');
};
async function boot(){
 if(!core){say('Chybí místní ověřovací modul. Obnov stránku nebo otevři Chrome.','Local authentication module failed to load. Reload or open in Chrome.','error');return}
 try{
  client=core.createClient();authReady=true;
  client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recovery=true;setTimeout(()=>{by('recoverPanel').hidden=false},0)}});
  const callbackResult=await client.auth.handleRedirect();
  if(callbackResult.error)handleError(callbackResult.error);
  const {data,error}=await client.auth.getUser();
  user=error?null:data.user;
  if(callbackResult.event==='PASSWORD_RECOVERY')recovery=true;
  setAuthView();lockEmailsIfNeeded();
  if(!callbackResult.error){
   if(user)say('✓ Účet je přihlášený. Můžeš vstoupit do studia.','✓ Your account is signed in. Continue to the studio.','ok');
   else say('Přihlášení je připravené. Zadej svůj e-mail a heslo.','Sign-in is ready. Enter your email and password.','info');
  }
  providerCheck();updateDiagnostics();
 }catch(e){handleError(e);updateDiagnostics()}
}
boot();
})();
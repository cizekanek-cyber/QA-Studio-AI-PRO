/* QA Studio AI PRO • Supabase přihlášení / licence. 2026-11-23.
   Browser receives only PUBLIC publishable key. Payments remain disabled until testing. */
(()=>{'use strict';
 if(document.getElementById('qaAccountPanel'))return;
 const PROJECT='https://naxotlqvimewbfowxwmw.supabase.co';
 const PUBLIC_KEY='sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL';
 const REDIRECT_URL='https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/beta/';
 const nav=document.querySelector('.nav');
 if(!nav)return;
 const st=document.createElement('style');
 st.textContent='.qaAccPanel{background:#161d32;border:1px solid #35405b;border-radius:18px;padding:20px;color:#f7f9ff;max-width:740px;margin:auto}.qaAccPanel h2{margin:0 0 12px}.qaAccPanel p{color:#bac5da;line-height:1.6}.qaAccPanel input{padding:12px;background:#101629;color:white;border:1px solid #56617f;border-radius:12px;width:100%;max-width:380px;font:inherit}.qaAccPanel button{padding:11px 17px;border:1px solid #7060ac;border-radius:12px;background:#483385;color:#fff;margin:6px 6px 6px 0;font:inherit}.qaAccPanel button:disabled{opacity:.5;cursor:not-allowed}.qaNote{font-size:12px;color:#b6c0d6;margin-top:12px}.qaAccStatus{padding:10px 12px;background:#111b31;border-radius:11px;color:#dbf2ff;white-space:pre-wrap}.qaAccPanel .qaPayDisabled{background:#24314a;color:#b9c0cd}';
 st.textContent+='.qaAccPanel .qaHidden{display:none!important}.qaAccPanel #qaAdminPanel{border-top:1px solid #455373;padding-top:14px;margin-top:15px}.qaAccPanel .qaAdminKpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.qaAccPanel .qaAdminKpis span{display:block;background:#101a31;border:1px solid #44526a;border-radius:10px;padding:10px;font-size:12px}.qaAccPanel .qaAdminKpis strong{display:block;font-size:19px;color:white}.qaAccPanel #qaPassword{margin-top:8px}.qaAccPanel #qaEmail{margin-bottom:10px}';
 document.head.append(st);
 const tab=document.createElement('button');tab.type='button';tab.textContent='🔐 Účet / PREMIUM';tab.dataset.tab='qaAccountPanel';nav.append(tab);
 const sec=document.createElement('section');sec.className='tab';sec.id='qaAccountPanel';sec.innerHTML='<div class="qaAccPanel"><h2>🔐 Můj účet • QA Studio AI PRO</h2><p>Ověřte svůj e-mail a spravujte přístup k zakoupeným šablonám. Zákaznické platby zatím nejsou povolené.</p><div id="qaAuthForm"><label for="qaEmail">E-mail</label><div><input type="email" autocomplete="email" id="qaEmail" placeholder="vas@email.cz"></div><button id="qaSignIn">Poslat přihlašovací odkaz</button></div><div id="qaSignOutBox" style="display:none"><button id="qaSignOut">Odhlásit</button><button id="qaRefresh">Zkontrolovat licenci</button></div><div id="qaAccountStatus" class="qaAccStatus" role="status">Připojuji bezpečné přihlášení…</div><div class="qaNote">Platba je zatím vypnutá, abychom před spuštěním dokončili zabezpečení a zkušební nákup. Neomezené používání šablon nezahrnuje neomezené AI generování.</div><div><button class="qaPayDisabled" disabled>Vánoce – 99 Kč</button><button class="qaPayDisabled" disabled>PLUS – 129 Kč/měs.</button><button class="qaPayDisabled" disabled>PLUS – 1 190 Kč/rok</button></div></div>';
 const parent=document.querySelector('.tab')?.parentElement||nav.parentElement;parent.append(sec);
 const form=sec.querySelector('#qaAuthForm');
 form.insertAdjacentHTML('beforeend','<div style="margin-top:12px"><button id="qaModeLink" type="button">Přihlášení odkazem</button><button id="qaModePassword" type="button">E-mail a heslo</button></div><div id="qaPasswordBox" class="qaHidden"><label for="qaPassword">Heslo (min. 8 znaků)</label><input id="qaPassword" type="password" autocomplete="current-password" placeholder="Heslo"><div><button id="qaPassLogin" type="button">Přihlásit</button><button id="qaPassRegister" type="button">Registrovat</button><button id="qaPassReset" type="button">Obnovit heslo</button></div></div>');
 sec.querySelector('.qaAccPanel').insertAdjacentHTML('beforeend','<div id="qaAdminPanel" class="qaHidden"><h2>Administrace majitele</h2><p>Tržby a předplatná uvidí pouze serverově ověřený správce.</p><button id="qaAdminRefresh" type="button">Načíst tržby</button><div class="qaAdminKpis"><span><strong id="qaGross">–</strong>Hrubé tržby Kč</span><span><strong id="qaPayments">–</strong>Transakce</span><span><strong id="qaSubs">–</strong>Předplatná</span></div><p id="qaAdminInfo" class="qaNote"></p></div>');

 sec.querySelector('#qaAdminPanel').insertAdjacentHTML('beforeend','<h3>Plán cash flow · model, nikoli skutečné tržby</h3><p class="qaNote">Předplatné 129 Kč / měsíc · platební poplatek model 1,5 % + 6,50 Kč · Stripe Billing 0,7 %. Náklady na AI a provoz můžeš měnit.</p><div><label>Fixní provozní náklady Kč/měs. <input type="number" id="qaFixedCost" min="0" step="100" value="1000" style="max-width:140px"></label><label>AI náklad Kč/měs. na předplatitele <input type="number" id="qaAiCost" min="0" step="10" value="50" style="max-width:140px"></label><label>Aktivní předplatitelé <input type="number" id="qaCustomers" min="0" step="10" value="100" style="max-width:130px"></label></div><div id="qaForecast" class="qaAccStatus" style="margin-top:8px;line-height:1.8"></div><p class="qaNote">Výsledek je orientační a neobsahuje daně, vratky, reklamní rozpočet, účetní služby, jiné platební metody ani skutečné jednotkové ceny AI. Výchozí náklady jsou ilustrativní předpoklady.</p>');
 function cashForecast(){
  const n=Math.max(0,Number(sec.querySelector('#qaCustomers').value)||0);
  const fixed=Math.max(0,Number(sec.querySelector('#qaFixedCost').value)||0);
  const ai=Math.max(0,Number(sec.querySelector('#qaAiCost').value)||0);
  const price=129,fee=price*.015+6.5+price*.007,unit=price-fee-ai;
  const profit=n*unit-fixed;
  const breakEven=unit>0?Math.ceil(fixed/unit):null;
  const kr=x=>x.toLocaleString('cs-CZ',{maximumFractionDigits:2})+' Kč';
  sec.querySelector('#qaForecast').textContent=
   'Příjmy: '+kr(n*price)+'\n'
   +'Stripe Payments + Billing: −'+kr(n*fee)+'\n'
   +'Odhad nákladů AI: −'+kr(n*ai)+'\n'
   +'Fixní provoz: −'+kr(fixed)+'\n'
   +'Zbývá před daněmi a dalšími náklady: '+kr(profit)+'\n'
   +'Bod zvratu: '+(breakEven===null?'nedosažitelný s touto cenou a nákladem':breakEven+' platících členů');
 }
 for(const id of ['qaFixedCost','qaAiCost','qaCustomers'])sec.querySelector('#'+id).addEventListener('input',cashForecast);
 cashForecast();

 const q=s=>sec.querySelector(s),status=q('#qaAccountStatus');
 tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e===sec));nav.querySelectorAll('button').forEach(e=>e.classList.toggle('active',e===tab));window.scrollTo({top:0,behavior:'smooth'})});
 let supa=null,auth=null,adminAccess=false,lastVerifiedUser=null;
 const qEmail=()=>{const value=q('#qaEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Zadejte platný e-mail.');return value};
 async function sendServer(slug,body){if(!auth)throw Error('Nejdřív se přihlas.');const r=await fetch(PROJECT+'/functions/v1/'+slug,{method:'POST',headers:{'Content-Type':'application/json',apikey:PUBLIC_KEY,Authorization:'Bearer '+auth.access_token},body:JSON.stringify(body)});const x=await r.json().catch(()=>({}));if(!r.ok)throw Error(x.error||('Server '+r.status));return x}
 async function adminStats(){if(!adminAccess)return;try{q('#qaAdminInfo').textContent='Ověřuji na serveru…';const d=await sendServer('qa-admin',{action:'summary'});q('#qaGross').textContent=Number(d.gross_czk||0).toLocaleString('cs-CZ');q('#qaPayments').textContent=Number(d.paid_transactions||0).toLocaleString('cs-CZ');q('#qaSubs').textContent=Number(d.active_subscriptions||0).toLocaleString('cs-CZ');q('#qaAdminInfo').textContent=d.note||''}catch(e){q('#qaAdminInfo').textContent='Administrace: '+(e.message||e)}}

 async function sessionInfo(){
  if(!supa)return;
  try{
   const r=await supa.auth.getSession();
   auth=r.data.session;
   if(!auth||auth.user.id!==lastVerifiedUser){adminAccess=false;q('#qaAdminPanel').classList.add('qaHidden');for(const id of ['qaGross','qaPayments','qaSubs'])q('#'+id).textContent='–';lastVerifiedUser=null;}
   q('#qaAuthForm').style.display=auth?'none':'block';
   q('#qaSignOutBox').style.display=auth?'block':'none';
   if(!auth){adminAccess=false;q('#qaAdminPanel').classList.add('qaHidden');status.textContent='Nepřihlášený uživatel. Vytváření návrhů zdarma funguje bez účtu.';return;}
   status.textContent='Přihlášen: '+auth.user.email+'\nOvěřuji licence…';
   const res=await fetch(PROJECT+'/functions/v1/qa-template',{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLIC_KEY,'Authorization':'Bearer '+auth.access_token},body:JSON.stringify({action:'status'})});
   const j=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(j.error||'Nelze ověřit licence ('+res.status+')');
   let msg=j.plus?'PLUS aktivní do '+(j.plus_until||'obnovení'):j.christmas?'Vánoční balíček je aktivní':'Bez placené licence';
   adminAccess=Boolean(j.is_admin);lastVerifiedUser=auth.user.id;q('#qaAdminPanel').classList.toggle('qaHidden',!adminAccess);status.textContent='Přihlášen: '+auth.user.email+'\n'+msg+(adminAccess?'\nPřístup majitele ověřen serverem.':'');if(adminAccess)adminStats();
  }catch(e){status.textContent='Kontrola přístupu: '+(e?.message||'Chyba připojení')}
 }
 async function startup(){
  try{
   const m=await import('https://esm.sh/@supabase/supabase-js@2.56.0');
   supa=m.createClient(PROJECT,PUBLIC_KEY,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
   supa.auth.onAuthStateChange(()=>{setTimeout(sessionInfo,0)});
   await sessionInfo();
  }catch(e){status.textContent='Přihlášení není dostupné: '+(e?.message||'Chyba načtení')}
 }
 q('#qaSignIn').onclick=async()=>{const email=q('#qaEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Zadejte platnou e-mailovou adresu.';return}if(!supa){status.textContent='Připojení zatím není hotové.';return}const b=q('#qaSignIn');b.disabled=true;try{const r=await supa.auth.signInWithOtp({email,options:{emailRedirectTo:REDIRECT_URL}});if(r.error)throw r.error;status.textContent='Žádost přijata. Zkontroluj spam a nejnovější e-mail. Pokud odkaz vrací na localhost, v Supabase Authentication → URL Configuration povol URL beta aplikace. Pro zákaznické e-maily je potřeba vlastní SMTP.'}catch(e){status.textContent='Přihlášení: '+(e?.message||'Chyba')}finally{b.disabled=false}};
 q('#qaSignOut').onclick=async()=>{try{await supa?.auth.signOut()}catch(e){status.textContent=e?.message||'Chyba odhlášení'}await sessionInfo()};
 q('#qaRefresh').onclick=sessionInfo;
 q('#qaModePassword').onclick=()=>{q('#qaPasswordBox').classList.remove('qaHidden');q('#qaSignIn').classList.add('qaHidden')};
 q('#qaModeLink').onclick=()=>{q('#qaPasswordBox').classList.add('qaHidden');q('#qaSignIn').classList.remove('qaHidden')};
 q('#qaPassLogin').onclick=async()=>{try{const email=qEmail(),password=q('#qaPassword').value;const r=await supa.auth.signInWithPassword({email,password});if(r.error)throw r.error;await sessionInfo()}catch(e){status.textContent='Přihlášení heslem: '+(e.message||e)}};
 q('#qaPassRegister').onclick=async()=>{try{const email=qEmail(),password=q('#qaPassword').value;if(password.length<8)throw Error('Heslo musí mít alespoň 8 znaků.');const r=await supa.auth.signUp({email,password,options:{emailRedirectTo:REDIRECT_URL}});if(r.error)throw r.error;status.textContent=r.data.session?'Registrace dokončena.':'Registrace přijata. Potvrď e-mail; veřejné doručování vyžaduje vlastní SMTP.';if(r.data.session)await sessionInfo()}catch(e){status.textContent='Registrace: '+(e.message||e)}};
 q('#qaPassReset').onclick=async()=>{try{const r=await supa.auth.resetPasswordForEmail(qEmail(),{redirectTo:REDIRECT_URL});if(r.error)throw r.error;status.textContent='Pokud je účet registrovaný, přijde e-mail pro obnovu hesla.'}catch(e){status.textContent='Obnova hesla: '+(e.message||e)}};
 q('#qaAdminRefresh').onclick=adminStats;
 startup();
})();
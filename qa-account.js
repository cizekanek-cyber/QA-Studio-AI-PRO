/* QA Studio AI PRO • Supabase přihlášení / licence. 2026-11-23.
   Browser receives only PUBLIC publishable key. Payments remain disabled until testing. */
(()=>{'use strict';
 if(document.getElementById('qaAccountPanel'))return;
 const PROJECT='https://naxotlqvimewbfowxwmw.supabase.co';
 const PUBLIC_KEY='sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL';
 const nav=document.querySelector('.nav');
 if(!nav)return;
 const st=document.createElement('style');
 st.textContent='.qaAccPanel{background:#161d32;border:1px solid #35405b;border-radius:18px;padding:20px;color:#f7f9ff;max-width:740px;margin:auto}.qaAccPanel h2{margin:0 0 12px}.qaAccPanel p{color:#bac5da;line-height:1.6}.qaAccPanel input{padding:12px;background:#101629;color:white;border:1px solid #56617f;border-radius:12px;width:100%;max-width:380px;font:inherit}.qaAccPanel button{padding:11px 17px;border:1px solid #7060ac;border-radius:12px;background:#483385;color:#fff;margin:6px 6px 6px 0;font:inherit}.qaAccPanel button:disabled{opacity:.5;cursor:not-allowed}.qaNote{font-size:12px;color:#b6c0d6;margin-top:12px}.qaAccStatus{padding:10px 12px;background:#111b31;border-radius:11px;color:#dbf2ff;white-space:pre-wrap}.qaAccPanel .qaPayDisabled{background:#24314a;color:#b9c0cd}';
 document.head.append(st);
 const tab=document.createElement('button');tab.type='button';tab.textContent='🔐 Účet / PREMIUM';tab.dataset.tab='qaAccountPanel';nav.append(tab);
 const sec=document.createElement('section');sec.className='tab';sec.id='qaAccountPanel';sec.innerHTML='<div class="qaAccPanel"><h2>🔐 Můj účet • QA Studio AI PRO</h2><p>Ověřte svůj e-mail a spravujte přístup k zakoupeným šablonám. Zákaznické platby zatím nejsou povolené.</p><div id="qaAuthForm"><label for="qaEmail">E-mail</label><div><input type="email" autocomplete="email" id="qaEmail" placeholder="vas@email.cz"></div><button id="qaSignIn">Poslat přihlašovací odkaz</button></div><div id="qaSignOutBox" style="display:none"><button id="qaSignOut">Odhlásit</button><button id="qaRefresh">Zkontrolovat licenci</button></div><div id="qaAccountStatus" class="qaAccStatus" role="status">Připojuji bezpečné přihlášení…</div><div class="qaNote">Platba je zatím vypnutá, abychom před spuštěním dokončili zabezpečení a zkušební nákup. Neomezené používání šablon nezahrnuje neomezené AI generování.</div><div><button class="qaPayDisabled" disabled>Vánoce – 99 Kč</button><button class="qaPayDisabled" disabled>PLUS – 129 Kč/měs.</button><button class="qaPayDisabled" disabled>PLUS – 1 190 Kč/rok</button></div></div>';
 document.querySelector('.tab:last-of-type')?.after(sec);
 const q=s=>sec.querySelector(s),status=q('#qaAccountStatus');
 tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e===sec));nav.querySelectorAll('button').forEach(e=>e.classList.toggle('active',e===tab));window.scrollTo({top:0,behavior:'smooth'})});
 let supa=null,auth=null;
 async function sessionInfo(){
  if(!supa)return;
  try{
   const r=await supa.auth.getSession();
   auth=r.data.session;
   q('#qaAuthForm').style.display=auth?'none':'block';
   q('#qaSignOutBox').style.display=auth?'block':'none';
   if(!auth){status.textContent='Nepřihlášený uživatel. Vytváření návrhů zdarma funguje bez účtu.';return;}
   status.textContent='Přihlášen: '+auth.user.email+'\nOvěřuji licence…';
   const res=await fetch(PROJECT+'/functions/v1/qa-template',{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLIC_KEY,'Authorization':'Bearer '+auth.access_token},body:JSON.stringify({action:'status'})});
   const j=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(j.error||'Nelze ověřit licence ('+res.status+')');
   let msg=j.plus?'PLUS aktivní do '+(j.plus_until||'obnovení'):j.christmas?'Vánoční balíček je aktivní':'Bez placené licence';
   status.textContent='Přihlášen: '+auth.user.email+'\n'+msg+(j.is_admin?'\nPřístup majitele ověřen.':'');
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
 q('#qaSignIn').onclick=async()=>{const email=q('#qaEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Zadejte platnou e-mailovou adresu.';return}if(!supa){status.textContent='Připojení zatím není hotové.';return}const b=q('#qaSignIn');b.disabled=true;try{const r=await supa.auth.signInWithOtp({email,options:{emailRedirectTo:'https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/'}});if(r.error)throw r.error;status.textContent='Pokud je adresa povolena, dorazí na ni přihlašovací odkaz. Zkontrolujte také spam.'}catch(e){status.textContent='Přihlášení: '+(e?.message||'Chyba')}finally{b.disabled=false}};
 q('#qaSignOut').onclick=async()=>{try{await supa?.auth.signOut()}catch(e){status.textContent=e?.message||'Chyba odhlášení'}await sessionInfo()};
 q('#qaRefresh').onclick=sessionInfo;
 startup();
})();
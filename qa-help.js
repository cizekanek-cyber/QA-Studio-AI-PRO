/* QA Studio AI PRO: embedded quickstart, plain-language user settings and AI readiness. */
(()=>{'use strict';
if(window.__qaGuideVersion)return;window.__qaGuideVersion=1;
const API='https://naxotlqvimewbfowxwmw.supabase.co';
const KEY='sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL';
const modes=[
 {id:'text',name:'Text / scénář',desc:'Popisky, scénáře a nápady. Po připojení AI bude používat textový model. Zatím vytvoř text ručně v editoru.',via:'OpenAI nebo Gemini'},
 {id:'image',name:'AI obrázek',desc:'Nové originální fotografie nebo grafiky podle zadání. Zatím lze vybrat hotový podklad nebo vložit vlastní obrázek.',via:'OpenAI nebo Google'},
 {id:'video',name:'AI video',desc:'Generování nových videozáběrů. Zatím je dostupné jen místní animování a krátký WebM export.',via:'Veo, Runway nebo Replicate'},
 {id:'voice',name:'Dabing / hlas',desc:'Budoucí namluvení textu. Zatím není externí hlasové generování aktivní.',via:'ElevenLabs nebo OpenAI'},
 {id:'music',name:'Hudba',desc:'Budoucí doplnění licencované hudby. Poskytovatel ještě není vybraný a připojený.',via:'Poskytovatel se připravuje'},
 {id:'lipsync',name:'Pohyb úst',desc:'Budoucí synchronizace postav podle hlasu. V současném editoru není živá AI synchronizace.',via:'Technologie se připravuje'}
];
function init(){
 const wrap=document.getElementById('qaUnifiedTools');
 const nav=document.querySelector('.nav');
 if(!wrap||!nav||!wrap.querySelector('.quTabs'))return false;
 if(document.getElementById('qaGuide'))return true;
 const style=document.createElement('style');style.textContent=
 '#qaUnifiedTools .qahSteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:12px 0;color:#eef2fc;font-size:12px}'+
 '#qaUnifiedTools .qahSteps span{border:1px solid #48547d;border-radius:9px;padding:9px;background:#19233b}'+
 '#qaUnifiedTools .qahGuide{margin:11px 0;border:1px solid #4b587d;border-radius:12px;padding:12px;background:#141e35;color:#e7edfc}'+
 '#qaUnifiedTools .qahGuide summary{cursor:pointer;font-weight:750;color:#fff;list-style-position:inside}'+
 '#qaUnifiedTools .qahGuide p{font-size:13px;margin:10px 0;color:#c9d6ea}'+
 '#qaUnifiedTools .qahGuide .qahActions{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}'+
 '#qaUnifiedTools .qahGuide button,#qaUnifiedTools .qahAI button{border:1px solid #6e5aac;border-radius:9px;padding:10px;background:#312558;color:white;cursor:pointer;font:inherit}'+
 '#qaUnifiedTools .qahGuide small{display:block;line-height:1.5;color:#b4c4df}'+
 '#qaUnifiedTools .qahAI{border:1px solid #526494;border-radius:12px;padding:15px;background:#111c34;margin:12px 0;color:#eef4ff}'+
 '#qaUnifiedTools .qahAI[hidden]{display:none!important}#qaUnifiedTools .qahAI h3{margin:0 0 8px}'+
 '#qaUnifiedTools .qahAI select{padding:10px;border-radius:9px;background:#111a2c;border:1px solid #647ca5;color:#fff;width:100%;max-width:400px}'+
 '#qaUnifiedTools .qahAI .qahInfo{padding:10px;margin:10px 0;border:1px solid #445578;background:#19233b;border-radius:10px;line-height:1.5}'+
 '#qaUnifiedTools .qahAI .qahInfo strong{color:#fff}#qaUnifiedTools .qahAI .qahStatus{font-size:12px;color:#bfd1ef;white-space:pre-wrap;margin:8px 0}'+
 '@media(max-width:500px){#qaUnifiedTools .qahSteps{grid-template-columns:1fr}}';
 document.head.append(style);
 const steps=document.createElement('div');steps.className='qahSteps';
 ['1  Vyber pozadí','2  Přidej postavu / objekt','3  Uprav a exportuj'].forEach(x=>{const el=document.createElement('span');el.textContent=x;steps.append(el)});
 const guide=document.createElement('details');guide.id='qaGuide';guide.className='qahGuide';
 guide.innerHTML='<summary>❔ Rychlý návod a nastavení – jak na to?</summary>'+
 '<p><strong>Začni během minuty:</strong> klikni na Pozadí, vyber scénu, potom na Průhledné objekty a vlož postavu. V „Úpravy a export“ změníš text, efekty, formát 9:16 pro TikTok, 1:1 nebo 16:9 a stáhneš PNG nebo video WebM.</p>'+
 '<div class="qahActions" id="qahActions"></div>'+
 '<p><strong>K čemu je co?</strong> Pozadí = prostředí za postavou. Průhledné objekty = samostatné PNG/WebP vrstvy. Lidé a tvorové = fotografie, ne vždy vyříznuté postavy. Funny šablony = hotové animované motivy, které lze přenést do scény.</p>'+
 '<p><strong>Cena a přístup:</strong> čtyři základní předlohy z každé kategorie jsou zdarma. PRO/VIP odemyká placené hotové šablony na dobu balíčku. Externí AI generování vyžaduje přidělené kredity a zatím není aktivní; za žádnou nezapnutou AI funkci se nic neodečítá.</p>'+
 '<p><strong>Ukládání:</strong> PNG je hotový obrázek, WebM krátké video podle podpory telefonu. Projekt JSON nyní ukládá parametry scény, ale nepřikládá vlastní nahrané fotografie. Uschovej si i své originální soubory.</p>'+
 '<small>U cizích fotografií a hudby ověř licenci a práva osob před zveřejněním nebo komerčním použitím. Pokud některá prémiová předloha zůstává zamčená, otevři Účet / PRO a ověř přihlášení. Pomoc si můžeš znovu zobrazit kdykoliv.</small>';
 const buttons=guide.querySelector('#qahActions');
 for(const [name,idx] of [['🏞️ Pozadí',0],['🐾 Objekty',1],['👽 Funny',3],['✏️ Úpravy',4]]){
  const b=document.createElement('button');b.type='button';b.textContent=name;
  b.onclick=()=>wrap.querySelectorAll('.quTabs button')[idx]?.click();
  buttons.append(b);
 }
 const priceBtn=document.createElement('button');priceBtn.type='button';priceBtn.textContent='💳 Ceník a kredity';
 priceBtn.onclick=()=>nav.querySelector('[data-tab="qaPlansPanel"]')?.click();buttons.append(priceBtn);
 const ai=document.createElement('div');ai.id='qaAiPanel';ai.className='qahAI';ai.hidden=true;
 ai.innerHTML='<h3>✨ AI asistenti – jaké AI k čemu?</h3>'+
 '<p>Vyber, co chceš vytvořit. Ukážeme, k čemu je vhodný daný poskytovatel a co už funguje. Nepřipojené funkce nelze objednat ani za ně zaplatit.</p>'+
 '<label for="qahTask">Co chceš vytvořit?</label><div><select id="qahTask"></select></div>'+
 '<div class="qahInfo" id="qahTaskInfo" role="status"></div>'+
 '<p><strong>Lokální editor</strong> funguje bez API kreditu: vlastní fotografie, PNG vrstvy, texty, animace a podporovaný export.</p>'+
 '<div class="qahActions"><button type="button" id="qahCheck">Zkontrolovat AI služby</button></div>'+
 '<p class="qahStatus" id="qahStatus">Placené externí AI služby zatím nejsou spuštěné.</p>';
 const select=ai.querySelector('#qahTask');
 modes.forEach(m=>select.add(new Option(m.name,m.id)));
 function describe(){const m=modes.find(x=>x.id===select.value)||modes[0];ai.querySelector('#qahTaskInfo').textContent=m.desc+' Doporučený typ služby: '+m.via+'. Stav: připravujeme.'}
 select.onchange=describe;select.value='image';describe();
 const start=wrap.querySelector('.quTabs');
 start.before(steps,guide);
 const aiBtn=document.createElement('button');aiBtn.type='button';aiBtn.textContent='✨ AI nástroje';aiBtn.setAttribute('aria-pressed','false');start.append(aiBtn);
 start.after(ai);
 const normal=Array.from(start.querySelectorAll('button')).filter(x=>x!==aiBtn);
 normal.forEach(btn=>btn.addEventListener('click',()=>{ai.hidden=true;aiBtn.setAttribute('aria-pressed','false')}));
 aiBtn.onclick=()=>{ai.hidden=!ai.hidden;aiBtn.setAttribute('aria-pressed',String(!ai.hidden));normal.forEach(x=>x.setAttribute('aria-pressed','false'));if(!ai.hidden)ai.scrollIntoView({block:'nearest',behavior:'smooth'})};
 async function refresh(){
  const out=ai.querySelector('#qahStatus'),btn=ai.querySelector('#qahCheck');btn.disabled=true;out.textContent='Zjišťuji bezpečný stav poskytovatelů…';
  try{
   const res=await fetch(API+'/functions/v1/qa-ai-gateway',{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify({action:'catalog'})});
   if(!res.ok)throw Error('Katalog není dostupný ('+res.status+')');
   const data=await res.json();
   out.textContent='Propojení: '+(data.ai_live?'aktivní':'zatím připravujeme')+'. Nabízené AI: '+(data.providers||[]).map(x=>x.name).join(', ')+'.\nNáklady: externí generování je vypnuté. Můžeš používat hotové scény a lokální úpravy.';
   try{
    const mod=await import('https://esm.sh/@supabase/supabase-js@2.56.0');
    const c=mod.createClient(API,KEY);
    const session=(await c.auth.getSession()).data.session;
    if(!session)return;
    const a=await fetch(API+'/functions/v1/qa-ai-gateway',{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({action:'status'})});
    if(!a.ok)return;
    const admin=await a.json();
    out.textContent+='\nNastavení správce: '+(admin.providers||[]).map(x=>x.name+': '+(x.key_configured?'klíč vložen':'bez API klíče')).join(' · ')+'. Žádné klíče se nezobrazují.';
   }catch{}
  }catch(e){out.textContent='Stav AI není dostupný: '+(e.message||e)+'. Lokální editor může dál fungovat.'}
  finally{btn.disabled=false}
 }
 ai.querySelector('#qahCheck').onclick=refresh;
 window.qaOpenQuickGuide=()=>{nav.querySelector('[data-tab="qaSceneLib"]')?.click();guide.open=true;guide.scrollIntoView({block:'nearest',behavior:'smooth'})};
 const home=document.getElementById('qaWelcome');
 const actions=home?.querySelector('.qwActions');
 if(actions&&!actions.querySelector('#qaHomeHelp')){const b=document.createElement('button');b.id='qaHomeHelp';b.type='button';b.className='qwSecondary';b.textContent='❔ Rychlý návod';b.onclick=window.qaOpenQuickGuide;actions.append(b)}
 return true;
}
let tries=0;const tick=()=>{if(init())return;if(++tries<45)setTimeout(tick,250)};tick();
})();
/* QA Studio AI PRO · indicative unified-credit passes. Real AI quoting remains backend-only. */
(()=>{'use strict';if(document.getElementById('qaPlansPanel'))return;
const nav=document.querySelector('.nav');if(!nav)return;
const packs=[
 {id:'qa_day',name:'Na 1 den',days:1,price:59,credits:70},
 {id:'qa_3days',name:'Na 3 dny',days:3,price:129,credits:150},
 {id:'qa_14days',name:'Na 14 dní',days:14,price:279,credits:370},
 {id:'qa_month',name:'Na 30 dní',days:30,price:449,credits:550},
 {id:'qa_3months',name:'Na 90 dní',days:90,price:1099,credits:1550},
 {id:'qa_year',name:'Na 365 dní',days:365,price:2990,credits:4500}
];
const units=[
 {name:'Text / scénář',value:2,unit:'krátký výstup'},
 {name:'AI obrázek – běžný',value:12,unit:'obrázek'},
 {name:'AI obrázek – HD',value:30,unit:'obrázek'},
 {name:'AI dabing',value:16,unit:'1 min'},
 {name:'AI hudba',value:60,unit:'30 s'},
 {name:'AI video – standard',value:160,unit:'5 s'},
 {name:'AI video – kvalitní',value:400,unit:'5 s'},
 {name:'Synchronizace úst',value:80,unit:'5 s'}
];
const fmt=n=>Number(n).toLocaleString('cs-CZ');
const css=document.createElement('style');css.textContent=`
#qaPlansPanel{font-family:system-ui,sans-serif;color:#fff;padding:12px;max-width:1000px;margin:auto}#qaPlansPanel *{box-sizing:border-box}
#qaPlansPanel .qap-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
#qaPlansPanel .qap-card,#qaPlansPanel .qap-box{background:#151e34;border:1px solid #465379;border-radius:16px;padding:17px;margin:12px 0}
#qaPlansPanel .qap-card.selected{border:2px solid #b78dff;background:#28214c}
#qaPlansPanel .qap-price{font-size:30px;font-weight:800;margin:8px 0}
#qaPlansPanel .qap-card button{width:100%;background:#5b3a9b;color:white;border:1px solid #a785d9;border-radius:10px;padding:9px;font:inherit;cursor:pointer}
#qaPlansPanel p,#qaPlansPanel small{color:#c4d1e5;line-height:1.6}
#qaPlansPanel .qap-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#qaPlansPanel select,#qaPlansPanel input{padding:10px;background:#0d172d;color:white;border:1px solid #657496;border-radius:8px;font:inherit}
#qaPlansPanel .qap-result{font-size:18px;font-weight:700;white-space:pre-wrap}
`;document.head.append(css);
const tab=document.createElement('button');tab.type='button';tab.dataset.tab='qaPlansPanel';tab.textContent='◈ AI kredity / ceník';nav.append(tab);
const sec=document.createElement('section');sec.id='qaPlansPanel';sec.className='tab';sec.innerHTML=`
<div class="qap-box"><h2>Jedna cena. Více AI modelů. Jeden společný kreditový rozpočet.</h2>
<p>Každý časový balíček otevře všechny hotové PRO/VIP šablony na uvedenou dobu a poskytne přidělené společné AI kredity pro text, obrázky, zvuk, hudbu, dabing, video a synchronizaci. V ceně je plánovaný náklad na externí AI. Bez příplatků za jednotlivé hotové šablony a bez samostatné faktury od dodavatele AI. Balíčky se automaticky neobnovují.</p>
<p><strong>Ceník je návrh pro spuštění; potvrzená cena je zatím jen 59 Kč za 1 den.</strong> Ostatní částky jsou navržené tak, aby delší období vycházelo levněji za den. Platby AI balíčků zatím nejsou zapnuté. Konkrétní spotřeba bude záviset na vybraném AI dodavateli, délce, kvalitě a serverové kalkulaci před potvrzením generování. Pokud externí AI nelze bezpečně nacenit, placené generování se nespustí.</p></div>
<div id="qapCards" class="qap-grid"></div>
<div class="qap-box"><h3>Co za kredity vznikne?</h3><p>Všechny funkce se hradí ze stejného balíčku. Následující výpočet je pouze demonstrační, nikoliv závazná cena externího modelu. Skutečný počet kreditů se ukáže před spuštěním generování.</p>
<div class="qap-row"><label>Balíček <select id="qapPack"></select></label><label>Typ výstupu <select id="qapUnit"></select></label></div>
<p class="qap-result" id="qapEstimate"></p>
<small>Např. deset vygenerovaných obrázků a jedno krátké video se odečtou z jediné peněženky. Před spuštěním budoucího AI generování musí server rezervovat kredity podle bezpečného odhadu maximální ceny a odmítnout operaci, pokud zůstatek nestačí. Při neúspěchu se vrácení kreditů bude řídit skutečně účtovanými náklady poskytovatele a zveřejněnými podmínkami. Funkční čerpání kreditů je zatím ve vývoji; z tohoto náhledu nelze objednat AI generování.</small></div>
<div class="qap-box"><h3>Můj kreditový účet</h3><p id="qapBalance" class="qap-result">Přihlas se pro zobrazení zůstatku.</p><button type="button" id="qapBalanceRefresh">Aktualizovat zůstatek</button><p class="qap-result" style="font-size:13px">Zákaznické nákupy a externí AI jsou do dokončení serverového propojení vypnuté, aby nevznikaly nechtěné náklady.</p></div>
<div class="qap-box"><h3>Šablony a kreativní nástroje</h3><p><strong>4 základní šablony v každé kategorii zdarma.</strong> Aktivní PRO nebo VIP zpřístupňuje všechny hotové šablony (včetně Funny Lab) bez dalších plateb za jednotlivé předlohy. Samotné generování externí AI není neomezené a řídí se kredity balíčku.</p><p>Vlastní kompozice, úpravy a lokální animace mohou fungovat bez spotřeby placených AI kreditů. Externí AI a její skutečné náklady musí být zahrnuté do jediné konečné ceny balíčku přes kreditovou kalkulaci, nikdy jako skrytý účet mimo aplikaci. Předplatné šablon, pokud existuje, je od kreditové peněženky oddělené.</p></div>`;
(document.querySelector('.tab')?.parentElement||nav.parentElement).append(sec);
const q=s=>sec.querySelector(s);const cards=q('#qapCards');
packs.forEach((p,i)=>{let c=document.createElement('div');c.className='qap-card'+(i===3?' selected':'');c.innerHTML='<strong>'+p.name+'</strong><div class="qap-price">'+fmt(p.price)+' Kč</div><div>Všechny PRO/VIP šablony + '+fmt(p.credits)+' AI kreditů</div><small>Platí '+p.days+' '+(p.days===1?'den':'dní')+' od aktivace, bez automatické obnovy. '+(p.days>1?'Průměr '+(p.price/p.days).toLocaleString('cs-CZ',{maximumFractionDigits:2})+' Kč/den.':'')+'</small><p><button type="button">Zobrazit spotřebu</button></p>';c.querySelector('button').onclick=()=>{q('#qapPack').value=p.id;cards.querySelectorAll('.qap-card').forEach(x=>x.classList.remove('selected'));c.classList.add('selected');estimate();};cards.append(c);q('#qapPack').add(new Option(p.name+' · '+fmt(p.price)+' Kč',p.id));});
units.forEach((m,i)=>q('#qapUnit').add(new Option(m.name+' / '+m.unit,m.value+'-'+i)));
q('#qapPack').value='qa_month';q('#qapUnit').value='12-1';
function estimate(){const p=packs.find(x=>x.id===q('#qapPack').value)||packs[3];const i=Number(q('#qapUnit').value.split('-')[1]);const u=units[i]||units[1];q('#qapEstimate').textContent='Orientačně: '+fmt(Math.floor(p.credits/u.value))+' × '+u.unit+' ('+fmt(u.value)+' kreditů za '+u.unit+').\nZůstatek: '+fmt(p.credits)+' kreditů na všechny typy výstupů.';}
q('#qapPack').onchange=()=>{estimate();cards.querySelectorAll('.qap-card').forEach((el,i)=>el.classList.toggle('selected',packs[i].id===q('#qapPack').value))};q('#qapUnit').onchange=estimate;estimate();
async function loadBalance(){
 const target=q('#qapBalance');target.textContent='Načítám stav na zabezpečeném serveru…';
 try{
  const m=await import('https://esm.sh/@supabase/supabase-js@2.56.0');
  const client=m.createClient('https://naxotlqvimewbfowxwmw.supabase.co','sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL');
  const session=(await client.auth.getSession()).data.session;
  if(!session){target.textContent='Nepřihlášený uživatel – otevři záložku Účet / PREMIUM.';return}
  const res=await fetch('https://naxotlqvimewbfowxwmw.supabase.co/functions/v1/qa-credits',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':'sb_publishable_F4L1g58JH7TtFbt9P8xQkg__C8g71oL'},body:JSON.stringify({action:'status'})});
  const j=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(j.error||('Server '+res.status));
  target.textContent='Aktivní kredity: '+Number(j.credits_available||0).toLocaleString('cs-CZ')+'. '+(j.generation_active?'Generování je dostupné.':'Externí AI generování zatím není aktivováno.');
 }catch(e){target.textContent='Zůstatek se nepodařilo načíst: '+(e.message||e)}
}
q('#qapBalanceRefresh').onclick=loadBalance;
tab.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===sec));nav.querySelectorAll('button').forEach(t=>t.classList.toggle('active',t===tab));window.scrollTo({top:0,behavior:'smooth'});loadBalance()};
})();
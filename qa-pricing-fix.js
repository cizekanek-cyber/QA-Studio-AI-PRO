/* QA Studio AI PRO: replace all public legacy pricing in the ORIGINAL editor, not only in add-on tabs. */
(()=>{'use strict';
const plans=[
 {id:'qa_day',name:'1 den',price:59,credits:70,period:'24 hodin'},
 {id:'qa_week',name:'7 dní',price:169,credits:200,period:'7 dní'},
 {id:'qa_14days',name:'14 dní',price:279,credits:370,period:'14 dní'},
 {id:'qa_month',name:'30 dní',price:449,credits:550,period:'30 dní'},
 {id:'qa_3months',name:'90 dní',price:1099,credits:1550,period:'90 dní'}
];
const fmt=n=>n.toLocaleString('cs-CZ');
function card(p){
 const d=document.createElement('div');d.className='price-card'+(p.id==='qa_month'?' feature':'');
 const title=document.createElement('div');title.className='price-label';title.textContent=p.name.toUpperCase();
 const price=document.createElement('div');price.className='price-value';price.textContent=fmt(p.price)+' Kč';
 const blurb=document.createElement('p');blurb.textContent=fmt(p.credits)+' společných kreditů pro všechny podporované AI funkce. Platnost '+p.period+'.';
 const status=document.createElement('div');status.className='price-state';status.textContent='Balíček připraven · prodej zatím vypnutý';
 d.append(title,price,blurb,status);return d;
}
function apply(){
 const target=document.getElementById('pricing');
 if(target && target.dataset.qaPricingVersion!=='4'){
  const panel=document.createElement('div');panel.className='panel';
  const title=document.createElement('h2');title.textContent='QA Studio AI PRO – společné AI kredity';
  const intro=document.createElement('p');intro.className='sub';intro.textContent='Jedna konečná cena včetně nákladů externích AI. Všechny druhy generování čerpají stejný kreditový rozpočet. Jednorázové balíčky bez automatické obnovy.';
  const grid=document.createElement('div');grid.className='pricing-grid';grid.style.gridTemplateColumns='repeat(auto-fit,minmax(180px,1fr))';
  plans.forEach(p=>grid.append(card(p)));
  const note=document.createElement('div');note.className='tip';note.textContent='Výsledné náklady každého externího AI generování budou odečteny v kreditech podle konkrétního modelu a nastavení. Externí AI se zákazníkovi nikdy neúčtuje zvlášť. Automatické generování a platby zůstanou vypnuté do dokončení bezpečného serverového čerpání a testování.';
  const action=document.createElement('button');action.type='button';action.className='btn primary';action.textContent='Zobrazit spotřebu kreditů';action.style.marginTop='16px';
  action.addEventListener('click',()=>document.querySelector('.nav button[data-tab="qaPlansPanel"]')?.click());
  panel.append(title,intro,grid,note,action);
  target.replaceChildren(panel);target.dataset.qaPricingVersion='4';
 }
 const elsewhere=document.querySelector('.qa-lib-prise');
 if(elsewhere&&!elsewhere.dataset.qaPricingVersion){
  const p=elsewhere.querySelector('p');
  if(p)p.textContent='Aktuální kreditové balíčky QA Studio AI PRO: 1 den za 59 Kč, 7 dní za 169 Kč, 14 dní za 279 Kč, 30 dní za 449 Kč a 90 dní za 1 099 Kč. V ceně jsou náklady externích AI, neplatí se zvlášť. Nákup a externí generování zatím nejsou aktivní.';
  const h=elsewhere.querySelector('h3');if(h)h.textContent='Jednotné AI kredity – připravujeme aktivaci';
  elsewhere.dataset.qaPricingVersion='4';
 }
}
apply();
window.addEventListener('load',apply,{once:true});
setTimeout(apply,400);
setTimeout(apply,1800);
})();
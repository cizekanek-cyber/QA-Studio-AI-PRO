/* QA Studio AI PRO: replace all public legacy pricing in the ORIGINAL editor, not only in add-on tabs. */
(()=>{'use strict';
const plans=[
 {id:'qa_day',name:'1 den',price:59,credits:70,period:'24 hodin'},
 {id:'qa_3days',name:'3 dny',price:129,credits:150,period:'72 hodin'},
 {id:'qa_14days',name:'14 dní',price:279,credits:370,period:'14 dní'},
 {id:'qa_month',name:'30 dní',price:449,credits:550,period:'30 dní'},
 {id:'qa_3months',name:'90 dní',price:1099,credits:1550,period:'90 dní'},
 {id:'qa_year',name:'365 dní',price:2990,credits:4500,period:'365 dní'}
];
const fmt=n=>n.toLocaleString('cs-CZ');
function card(p){
 const d=document.createElement('div');d.className='price-card'+(p.id==='qa_month'?' feature':'');
 const title=document.createElement('div');title.className='price-label';title.textContent=p.name.toUpperCase();
 const price=document.createElement('div');price.className='price-value';price.textContent=fmt(p.price)+' Kč';
 const blurb=document.createElement('p');blurb.textContent=fmt(p.credits)+' společných kreditů pro všechny podporované AI funkce. Platnost '+p.period+'.';
 const status=document.createElement('div');status.className='price-state';status.textContent='Návrh ceny · nákup zatím není aktivní';
 d.append(title,price,blurb,status);return d;
}
function apply(){
 const target=document.getElementById('pricing');
 if(target && target.dataset.qaPricingVersion!=='5'){
  const panel=document.createElement('div');panel.className='panel';
  const title=document.createElement('h2');title.textContent='QA Studio AI PRO – společné AI kredity';
  const intro=document.createElement('p');intro.className='sub';intro.textContent='Čtyři základní šablony v každé kategorii zdarma; placený časový balíček otevře všechny hotové PRO/VIP šablony. V ceně je společný rozpočet AI kreditů, bez účtu od externího poskytovatele. Jednorázové časové balíčky bez automatického prodlužování.';
  const grid=document.createElement('div');grid.className='pricing-grid';grid.style.gridTemplateColumns='repeat(auto-fit,minmax(165px,1fr))';
  plans.forEach(p=>grid.append(card(p)));
  const note=document.createElement('div');note.className='tip';note.textContent='Výsledné náklady každého externího AI generování budou odečteny v kreditech podle konkrétního modelu a nastavení. Externí AI se zákazníkovi nikdy neúčtuje zvlášť. Automatické generování a platby zůstanou vypnuté do dokončení bezpečného serverového čerpání a testování.';
  const action=document.createElement('button');action.type='button';action.className='btn primary';action.textContent='Zobrazit spotřebu kreditů';action.style.marginTop='16px';
  action.addEventListener('click',()=>document.querySelector('.nav button[data-tab="qaPlansPanel"]')?.click());
  panel.append(title,intro,grid,note,action);
  target.replaceChildren(panel);target.dataset.qaPricingVersion='5';
 }
 const elsewhere=document.querySelector('.qa-lib-prise');
 if(elsewhere&&!elsewhere.dataset.qaPricingVersion){
  const p=elsewhere.querySelector('p');
  if(p)p.textContent='Nový návrh časových balíčků QA Studio AI PRO: 1 den 59 Kč, 3 dny 129 Kč, 14 dní 279 Kč, 30 dní 449 Kč, 90 dní 1 099 Kč a 365 dní 2 990 Kč. Balíčky zpřístupní všechny hotové PRO/VIP šablony a obsahují kreditový rozpočet na AI bez dalších plateb externím poskytovatelům. Nákup a externí AI generování zatím nejsou aktivní.';
  const h=elsewhere.querySelector('h3');if(h)h.textContent='Jednotné AI kredity – připravujeme aktivaci';
  elsewhere.dataset.qaPricingVersion='5';
 }
}
apply();
window.addEventListener('load',apply,{once:true});
setTimeout(apply,400);
setTimeout(apply,1800);
})();
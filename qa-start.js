/* QA Studio AI PRO · visual homepage upgrade */
(function buildHome(){
'use strict';
if(document.getElementById('qaWelcome'))return;
const nav=document.querySelector('.nav');
if(!nav)return;
const root=document.querySelector('.tab')?.parentElement||nav.parentElement;
const photo=(id,w=800)=>'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w='+w+'&q=82';
const categories=[
['cars','Auta a supersporty','photo-1503376780353-7e6692767b70'],
['motorbikes','Motorky a skútry','photo-1558981806-ec527fa84c39'],
['living','Živí tvorové – předlohy','photo-1534528741775-53994a69daeb'],
['christmas','Vánoce a svátky','photo-1512389142860-9c449e58a543'],
['products','Produkty a reklama','photo-1541643600914-78b084683601'],
['homes','Domy a reality','photo-1600585154340-be6161a56a0c'],
['interiors','Interiéry','photo-1600607687920-4e2a09cf159d'],
['trucks','Kamiony a stroje','photo-1519003722824-194d4455a60c'],
['aircraft','Letadla','photo-1436491865332-7a61a109cc05'],
['boats','Lodě a jachty','photo-1544551763-46a013bb70d5'],
['fashion','Móda','photo-1483985988355-763728e1935b'],
['beauty','Kosmetika a beauty','photo-1596462502278-27bfdc403348'],
['food','Jídlo a gastro','photo-1546069901-ba9599a7e63c'],
['technology','Technologie a AI','photo-1518770660439-4636190af475'],
['sports','Sport a fitness','photo-1517649763962-0c623066013b'],
['flowers','Květiny','photo-1490750967868-88aa4486c946'],
['jewelry','Šperky a hodinky','photo-1611652022419-a9419f74343d'],
['office','Kanceláře a business','photo-1497366811353-6870744d04b2'],
['construction','Stavby a průmysl','photo-1504307651254-35680f356dfd'],
['travel','Cestování a hotely','photo-1488646953014-85cb44e25828'],
['art','Umění a design','photo-1541961017774-22349e4a1262'],
['gaming','Gaming','photo-1593305841991-05c297ba4575'],
['farm','Farma a venkov','photo-1500382017468-9049fed747ef'],
['winter','Zimní scény','photo-1457269449834-928af64c684d'],
['weather','Počasí a atmosféra','photo-1470071459604-3b5ec3a7fe05'],
['forest','Lesy','photo-1441974231531-c6227db76b6e'],
['mountain','Hory','photo-1464822759023-fed622ff2c3b'],
['sea','Moře a pláže','photo-1518837695005-2083093ee35b'],
['city','Města','photo-1519501025264-65ba15a82390'],
['space','Vesmír','photo-1419242902214-272b3f66ee7a'],
['fantasy','Fantasy krajiny','photo-1470770841072-f978cf4d019e'],
['film','Filmové efekty','photo-1500534623283-312aade485b7'],
['water','Voda a vodopády','photo-1433086966358-54859d0ed716'],
['architecture','Architektura','photo-1480714378408-67cf0d13bc1b']
];
const css=document.createElement('style');
css.textContent=`
#qaWelcome{font:14px/1.5 system-ui,Arial,sans-serif;color:#f1f4ff;max-width:1200px;padding:12px 15px 34px;margin:auto;text-align:left}
#qaWelcome *{box-sizing:border-box}#qaWelcome button{font:inherit;cursor:pointer}
#qaWelcome [hidden]{display:none!important}
#qaWelcome h1,#qaWelcome h2,#qaWelcome h3{line-height:1.16;letter-spacing:-.025em}
#qaWelcome .qwKicker{font-size:11px;font-weight:850;letter-spacing:.11em;color:#e9c988;margin:0 0 8px}
#qaWelcome .qwHero{border:1px solid #6a638b;min-height:310px;border-radius:22px;display:flex;align-items:end;position:relative;overflow:hidden;isolation:isolate;background:linear-gradient(110deg,#292244,#25344b)}
#qaWelcome .qwHero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:76% 18%;z-index:-2}
#qaWelcome .qwHero:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#080b19f7,#080b19d9 49%,#080b1950)}
#qaWelcome .qwHeroBody{padding:29px;max-width:670px}
#qaWelcome .qwHero h1{font-size:clamp(27px,5vw,47px);margin:0 0 10px}
#qaWelcome .qwHero p{max-width:510px;color:#e1e9f7;font-size:14px;margin:0 0 17px}
#qaWelcome .qwActions{display:flex;flex-wrap:wrap;gap:10px}
#qaWelcome .qwPrimary,#qaWelcome .qwSecondary,#qaWelcome .qwOutline{border-radius:11px;border:1px solid #e4cc91;background:#ebd19a;color:#171a2c;font-weight:800;padding:12px 17px}
#qaWelcome .qwSecondary,#qaWelcome .qwOutline{background:#242c4dcc;color:white;border-color:#8993b5}
#qaWelcome .qwPromos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin:12px 0 27px}
#qaWelcome .qwPromo{display:flex;justify-content:end;flex-direction:column;min-height:175px;padding:16px;position:relative;isolation:isolate;color:#fff;background:#263453;border:1px solid #555e80;border-radius:17px;overflow:hidden;text-align:left}
#qaWelcome .qwPromo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
#qaWelcome .qwPromo:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,#090e20f5,transparent)}
#qaWelcome .qwPromo small{color:#f7dca8;font-size:10px;letter-spacing:.1em;font-weight:750}
#qaWelcome .qwPromo strong{font-size:17px}
#qaWelcome .qwHeading{margin:0 0 12px}
#qaWelcome .qwHeading h2{font-size:clamp(22px,3vw,28px);margin:0}
#qaWelcome .qwHeading p{margin:5px 0 0;font-size:12px;color:#bed0e8}
#qaWelcome .qwFunctions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 30px}
#qaWelcome .qwFunction{min-width:0;padding:17px;background:#151f33;border:1px solid #46516e;border-radius:16px}
#qaWelcome .qwFunction h3{font-size:16px;margin:7px 0}
#qaWelcome .qwFunction .qwIcon{font-size:25px}
#qaWelcome .qwFunction p{font-size:12px;color:#bdcce2;line-height:1.6;min-height:43px}
#qaWelcome .qwFunction button,#qaWelcome .qwExtra button{border:1px solid #7888bb;color:#f7f7ff;background:#303b66;border-radius:10px;padding:10px 12px;font-size:12px;font-weight:700}
#qaWelcome .qwCategories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}
#qaWelcome .qwCategory{height:140px;padding:0;border:1px solid #4d587c;border-radius:15px;background:#18233a;position:relative;isolation:isolate;overflow:hidden;color:#fff;text-align:left}
#qaWelcome .qwCategory img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
#qaWelcome .qwCategory:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,#080d20f5,transparent 80%)}
#qaWelcome .qwCategory span{position:absolute;bottom:12px;left:12px;right:10px;font-weight:800;font-size:13px}
#qaWelcome .qwToggle{display:block;margin:14px auto 20px;min-width:220px}
#qaWelcome .qwExtra{display:flex;flex-wrap:wrap;gap:8px}
#qaWelcome .qwNote{font-size:12px;color:#bfcce0;margin-top:24px;padding:15px;background:#141c2c;border:1px solid #3b4b69;border-radius:13px;line-height:1.7}
#qaWelcome .qwError{font-size:12px;color:#ffc3bd;min-height:20px}
@media(max-width:850px){#qaWelcome .qwFunctions{grid-template-columns:repeat(2,minmax(0,1fr))}#qaWelcome .qwCategories{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:560px){#qaWelcome .qwHero img{object-position:76% center}#qaWelcome{padding:8px 10px 23px}#qaWelcome .qwHero{min-height:330px}#qaWelcome .qwHeroBody{padding:20px}#qaWelcome .qwHero:before{background:linear-gradient(0deg,#080b19fc,#080b1970)}#qaWelcome .qwPromos{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#qaWelcome .qwPromo{padding:12px;min-height:153px}#qaWelcome .qwPromo:last-child{grid-column:span 2;min-height:125px}#qaWelcome .qwFunction{padding:13px}#qaWelcome .qwFunction p{min-height:76px}#qaWelcome .qwCategories{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#qaWelcome .qwCategory{height:130px}}
`;
document.head.append(css);
const tab=document.createElement('button');tab.type='button';tab.dataset.tab='qaWelcome';tab.textContent='⌂ Úvod';nav.prepend(tab);
const section=document.createElement('section');section.id='qaWelcome';section.className='tab';
section.innerHTML=`
<section aria-label="Nejnovější upgrade">
<div class="qwHero"><img src="./assets/gallery-hero.webp?v=20261123-hd" alt="Reklamní módní fotografie na úvodu QA Studio" fetchpriority="high">
<div class="qwHeroBody"><div class="qwKicker">✦ NOVÝ UPGRADE · 38 REALISTICKÝCH FOTOPŘEDLOH</div>
<h1>Vytvářej poutavé fotky a profesionální reklamy.</h1>
<p>Objev 38 nových motivů ze skutečně dodané kolekce, od lidí se zvířaty až po fantasy postavy a módu. Každý obrázek otevřeš zvlášť a můžeš ho upravit v editoru.</p>
<div class="qwActions"><button class="qwPrimary" data-go="qaGalleryPanel">38 nových fotošablon</button><button class="qwSecondary" data-go="qaSceneLib">Otevřít editor</button><button id="qwBrowse" class="qwSecondary">Všechny kategorie</button></div>
</div></div><div class="qwPromos" id="qwPromos"></div></section>
<section aria-labelledby="qwToolsHeading"><div class="qwHeading"><div class="qwKicker">VŠECHNY FUNKCE</div><h2 id="qwToolsHeading">Co chceš vytvořit?</h2><p>Přímý vstup do editoru a všech dostupných nástrojů.</p></div>
<div class="qwFunctions">
<div class="qwFunction"><div class="qwIcon">🎬</div><h3>Realistické scény</h3><p>Fotografická pozadí, počasí, vrstvy a text přímo v editoru.</p><button data-go="qaSceneLib">Spustit editor</button></div>
<div class="qwFunction"><div class="qwIcon">🐾</div><h3>Samostatné PNG</h3><p>Lidé a zvířata bez pozadí, k opakovanému použití ve scénách.</p><button data-go="qaCutoutPanel">Otevřít objekty</button></div>
<div class="qwFunction"><div class="qwIcon">📹</div><h3>Obrázky a videa</h3><p>Export PNG a krátkých WebM videí podle podpory zařízení.</p><button data-go="qaSceneLib">Vytvořit výstup</button></div>
<div class="qwFunction"><div class="qwIcon">📲</div><h3>Sdílení</h3><p>Předání hotového souboru TikToku, Instagramu a dalším sítím.</p><button data-go="qaSocialPanel">Sdílet výtvor</button></div>
<div class="qwFunction"><div class="qwIcon">🔐</div><h3>Můj účet</h3><p>Přihlášení, správa přístupu a soukromé údaje vlastníka.</p><button data-go="qaAccountPanel">Přihlásit se</button></div>
<div class="qwFunction"><div class="qwIcon">💠</div><h3>Kredity a plány</h3><p>Přehled plánů. Placené AI generování zatím není spuštěné.</p><button data-go="qaPlansPanel">Zobrazit nabídku</button></div>
</div></section>
<section aria-labelledby="qwCatHeading"><div class="qwHeading" id="qwCatAnchor"><div class="qwKicker">VYBER SI MOTIV</div><h2 id="qwCatHeading">Kategorie a inspirace</h2><p>Od aut a nemovitostí po módu, reklamu, sport i fantasy.</p></div>
<div class="qwCategories" id="qwCategories"></div>
<button id="qwToggle" class="qwOutline qwToggle" aria-expanded="false">Zobrazit další kategorie</button>
<h3 style="font-size:17px;margin-bottom:10px">Další nástroje aplikace</h3><div class="qwExtra" id="qwExtra"></div>
<p id="qwError" class="qwError" role="status"></p>
<div class="qwNote"><strong>Šablony:</strong> V každé kategorii první 4 návrhy zdarma. Aktivní PRO nebo VIP otevírá celý katalog hotových šablon bez jednotlivých příplatků. AI generování může spotřebovávat společné kredity balíčku podle podmínek. <strong>Provoz a náklady:</strong> Hotové motivy a místní efekty nezadávají nové placené požadavky externí AI. Vlastní PNG se importují do telefonu. Placené generování a checkout se aktivují až po ověření nákladů a zabezpečení plateb.</div>
</section>
`;
root.append(section);
const q=s=>section.querySelector(s);
function goto(id){const b=nav.querySelector('button[data-tab="'+id+'"]');if(!b){q('#qwError').textContent='Tento nástroj se ještě nenačetl, obnov stránku a zkus to znovu.';return false}q('#qwError').textContent='';b.click();return true}
function openCategory(id){if(id==='living'){if(goto('qaGalleryPanel'))window.dispatchEvent(new CustomEvent('qa:open-gallery',{detail:{category:'Živí tvorové – předlohy'}}));return;}if(goto('qaSceneLib'))window.dispatchEvent(new CustomEvent('qa:open-category',{detail:{category:id}}))}
q('#qwBrowse').onclick=()=>q('#qwCatAnchor').scrollIntoView({behavior:'smooth',block:'start'});
section.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goto(b.dataset.go));
for(const [id,name,imgId,kicker] of [
 ['living','Živí tvorové – předlohy','photo-1514888286974-6c03e2ca1dba','PŘEDLOHY'],
 ['christmas','Vánoční grafika','photo-1512389142860-9c449e58a543','SEZÓNNÍ'],
 ['products','Reklamní obrázky','photo-1541643600914-78b084683601','PRO ZNAČKY']
]){
 const b=document.createElement('button');b.type='button';b.className='qwPromo';
 const img=document.createElement('img');img.src=photo(imgId,780);img.loading='lazy';img.alt='';img.onerror=()=>img.remove();
 const small=document.createElement('small');small.textContent=kicker;
 const strong=document.createElement('strong');strong.textContent=name;
 b.append(img,small,strong);b.onclick=()=>openCategory(id);q('#qwPromos').append(b);
}
const grid=q('#qwCategories');
categories.forEach(([id,name,imgId],i)=>{
 const b=document.createElement('button');b.type='button';b.className='qwCategory';b.dataset.category=id;if(i>=12)b.hidden=true;
 const img=document.createElement('img');img.loading='lazy';img.src=photo(imgId,460);img.alt='';img.onerror=()=>img.remove();
 const title=document.createElement('span');title.textContent=name;b.append(img,title);b.onclick=()=>openCategory(id);grid.append(b);
});
let showAll=false;
q('#qwToggle').textContent='Zobrazit všech '+categories.length+' kategorií';
q('#qwToggle').onclick=()=>{
 showAll=!showAll;grid.querySelectorAll('.qwCategory').forEach((b,i)=>b.hidden=!showAll&&i>=12);
 q('#qwToggle').textContent=showAll?'Zobrazit jen hlavní kategorie':'Zobrazit všech '+categories.length+' kategorií';
 q('#qwToggle').setAttribute('aria-expanded',String(showAll));
};
const core=new Set(['qaWelcome','qaSceneLib','qaCutoutPanel','qaSocialPanel','qaAccountPanel','qaPlansPanel']);
function arrangeNavigation(){
 for(const id of ['qaAccountPanel','qaPlansPanel','qaSocialPanel','qaCutoutPanel','qaSceneLib','qaWelcome']){
  const b=nav.querySelector('button[data-tab="'+id+'"]');if(b)nav.prepend(b);
 }
 const extras=q('#qwExtra');extras.replaceChildren();
 nav.querySelectorAll('button[data-tab]').forEach(src=>{
  if(core.has(src.dataset.tab)||src.hidden||src.style.display==='none')return;
  const b=document.createElement('button');b.type='button';b.textContent=src.textContent.trim()||src.dataset.tab;
  b.onclick=()=>goto(src.dataset.tab);extras.append(b);
 });
 if(!extras.children.length){const p=document.createElement('span');p.style.color='#aabbd2';p.style.fontSize='12px';p.textContent='Všechny dostupné nástroje jsou uvedené výše.';extras.append(p)}
}
tab.onclick=()=>{
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===section));
 nav.querySelectorAll('button').forEach(t=>t.classList.toggle('active',t===tab));
 window.scrollTo({top:0,behavior:'smooth'});
};
arrangeNavigation();
setTimeout(()=>{arrangeNavigation()},250);
})();

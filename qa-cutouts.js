/* QA Studio AI PRO — local reusable transparent cutout library. No paid AI calls. */
(()=>{
'use strict';
if(document.getElementById('qaCutoutPanel'))return;
const nav=document.querySelector('.nav');if(!nav)return;
const style=document.createElement('style');
style.textContent='.qaCutouts{box-sizing:border-box;font-family:system-ui,sans-serif;color:#edf3ff;max-width:1050px;margin:auto;padding:14px}.qaCutouts *{box-sizing:border-box}.qaCutouts .qac-box{background:#151d32;border:1px solid #465576;border-radius:15px;padding:17px;margin:10px 0}.qaCutouts .qac-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}.qaCutouts .qac-card{border:1px solid #485573;background:#202940;padding:8px;border-radius:13px;text-align:center;min-width:0}.qaCutouts .qac-card img{width:100%;height:108px;object-fit:contain;background:repeating-conic-gradient(#cbd2df 0% 25%,#eef1f6 0% 50%) 50%/18px 18px;border-radius:8px}.qaCutouts .qac-card b{display:block;font-size:11px;min-height:36px;padding:5px 0;line-height:1.25;overflow-wrap:anywhere}.qaCutouts button{border:1px solid #68599b;background:#463485;color:#fff;border-radius:9px;padding:9px 11px;font:inherit;cursor:pointer}.qaCutouts .qac-card button{width:100%;font-size:12px}.qaCutouts input,.qaCutouts select{background:#0e172a;border:1px solid #586587;color:#fff;border-radius:9px;padding:11px;font:inherit;max-width:100%}.qaCutouts .qac-tools{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:10px 0}.qaCutouts .qac-note{color:#bfcee5;font-size:13px;line-height:1.6}.qaCutouts #qacStatus{white-space:pre-wrap;color:#e6e3ff}.qaCutouts .qac-card .qac-hd{color:#ddc7fc;font-size:10px}';
document.head.append(style);
const tab=document.createElement('button');tab.dataset.tab='qaCutoutPanel';tab.type='button';tab.textContent='✂ Samostatné PNG';nav.append(tab);
const section=document.createElement('section');section.className='tab qaCutouts';section.id='qaCutoutPanel';
section.innerHTML='<div class="qac-box"><h2>Lidé, zvířata, auta a věci jako jednotlivé PNG</h2><p class="qac-note">Importuj jednotlivé PNG nebo ZIP knihovnu a opakovaně je vkládej do scén zdarma. Pro objekty bez pozadí používej průhledné PNG. V editoru můžeš každou položku samostatně přesouvat, měnit její velikost a kombinovat ji s dalšími.</p><label><strong>Jednorázově přidej ZIP knihovnu do tohoto zařízení</strong><br><input type="file" id="qacZip" accept=".zip,application/zip,application/x-zip-compressed" multiple></label><div class="qac-tools"><label>Uložit do kategorie <select id="qacImportCategory"><option value="zvirata">Zvířata</option><option value="lide">Lidé</option><option value="postavy">Fantasy postavy</option><option value="auta">Auta</option><option value="motorky">Motorky</option><option value="predmety">Věci a předměty</option><option value="technika">Technika a stroje</option><option value="produkty">Produkty</option><option value="bydleni">Domy a vybavení</option><option value="priroda">Příroda</option></select></label><label>Vložit jednotlivé PNG / WebP <input type="file" id="qacImages" accept="image/png,image/webp" multiple></label></div><p id="qacStatus" role="status">Zjišťuji knihovnu uloženou v telefonu…</p><p class="qac-note">ZIP obsahuje obrázky a manifest.json; import je zdarma, neplatíš kredity za další generování. Obrázky se ukládají lokálně do úložiště prohlížeče, nikoliv na náš server. Po vymazání dat prohlížeče je bude nutné nahrát znovu.</p></div><div class="qac-box"><div class="qac-tools"><select id="qacCategory"><option value="all">Všechny objekty</option><option value="zvirata">Zvířata</option><option value="lide">Lidé</option><option value="postavy">Fantasy postavy</option><option value="auta">Auta</option><option value="motorky">Motorky</option><option value="predmety">Věci a předměty</option><option value="technika">Technika a stroje</option><option value="produkty">Produkty</option><option value="bydleni">Domy a vybavení</option><option value="priroda">Příroda</option></select><input type="search" id="qacSearch" placeholder="Najdi zvíře nebo postavu…"><button id="qacMore" type="button">Další objekty</button></div><div class="qac-note" id="qacCount">Zatím žádné obrázky.</div><div id="qacGrid" class="qac-grid"></div></div>';
(document.querySelector('.tab')?.parentElement||nav.parentElement).append(section);
const q=s=>section.querySelector(s);
let items=[],visible=70,urls=[];
const libraryCategories=[["all","Všechny objekty","All objects","▦"],["zvirata","Zvířata","Animals","🐾"],["lide","Lidé","People","♟"],["postavy","Fantasy","Fantasy","✦"],["scifi","Mimozemšťané / Sci-fi","Aliens / Sci-fi","🛸"],["vanoce","Vánoce","Christmas","🎄"],["efekty","Speciální efekty","Special effects","⚡"],["stavby","Stavební technika","Construction machinery","▧"],["funny","Funny / Vtipné","Funny","☺"],["auta","Auta a vozidla","Vehicles","🚗"],["motorky","Motorky","Motorcycles","◉"],["technika","Technika","Technology","⚙"],["produkty","Produkty a luxus","Products & luxury","◇"],["predmety","Předměty","Objects","⬡"],["bydleni","Bydlení a architektura","Homes & architecture","⌂"],["priroda","Příroda a rostliny","Nature & plants","❧"],["jidlo","Jídlo","Food","✳"],["sport","Sport","Sports","●"]];
libraryCategories.push(...[["city","Města","Cities","✦"],["fashion","Móda","Fashion","✦"],["travel","Dovolená","Travel","✦"],["mountain","Hory","Mountains","✦"],["sea","Moře a pláže","Sea & beaches","✦"],["architecture","Architektura","Architecture","✦"],["winter","Zima","Winter","✦"],["weather","Počasí","Weather","✦"],["space","Vesmír","Space","✦"],["film","Filmové scény","Film scenes","✦"],["water","Voda","Water","✦"],["trucks","Kamiony","Trucks","✦"],["aircraft","Letadla","Aircraft","✦"],["boats","Lodě","Boats","✦"],["homes","Domy","Homes","✦"],["interiors","Interiéry","Interiors","✦"],["beauty","Kosmetika","Beauty","✦"],["flowers","Květiny","Flowers","✦"],["office","Kanceláře","Offices","✦"],["art","Umění","Art","✦"],["gaming","Gaming","Gaming","✦"],["farm","Farma","Farm","✦"]]);
const lang=()=>{try{return localStorage.getItem('qa-studio-language')==='cs'?'cs':'en'}catch{return 'en'}};
const categoryName=c=>c[lang()==='cs'?1:2];
const validCategory=x=>libraryCategories.some(c=>c[0]===x&&x!=='all');
const options=(all)=>libraryCategories.filter(c=>all||c[0]!=='all').map(c=>new Option(categoryName(c),c[0]));
function syncOptions(){for(const [id,all] of [['qacCategory',true],['qacImportCategory',false]]){const el=q('#'+id),old=el.value;el.replaceChildren(...options(all));if(Array.from(el.options).some(o=>o.value===old))el.value=old;}}
const boxes=section.querySelectorAll('.qac-box');const imports=document.createElement('details');imports.className='qac-import';const summary=document.createElement('summary');summary.id='qacImportSummary';imports.append(summary,boxes[0]);const shell=document.createElement('div');shell.className='qac-shell';const sidebar=document.createElement('aside');sidebar.className='qac-sidebar';sidebar.setAttribute('aria-label','Collections');const main=document.createElement('main');main.className='qac-main';const heading=document.createElement('h1');heading.id='qacPageTitle';const info=document.createElement('p');info.id='qacPageInfo';const empty=document.createElement('p');empty.id='qacEmpty';empty.className='qac-note';const back=document.createElement('button');back.type='button';back.id='qacBack';back.onclick=()=>nav.querySelector('[data-tab="qaSceneLib"]')?.click();const actions=document.createElement('div');actions.className='qac-actions';const add=document.createElement('button');add.type='button';add.id='qacAdd';add.onclick=()=>{imports.open=true;q('#qacZip').click()};const own=document.createElement('button');own.type='button';own.id='qacOwn';own.onclick=()=>{imports.open=true;const id=q('#qacCategory').value;if(id!=='all')q('#qacImportCategory').value=id;q('#qacImages').click()};const photos=document.createElement('button');photos.type='button';photos.id='qacPhotos';photos.onclick=()=>window.qaOpenPhotoLibrary?.();actions.append(add,own,photos,back);main.append(heading,info,actions,boxes[1],empty,imports);shell.append(sidebar,main);section.append(shell);syncOptions();
function selectCategory(id){if(id!=='all'&&!validCategory(id))return;q('#qacCategory').value=id;q('#qacSearch').value='';visible=70;render();heading.scrollIntoView({block:'start',behavior:'auto'});}
function renderSidebar(){sidebar.replaceChildren();const label=document.createElement('strong');label.textContent=lang()==='cs'?'KATEGORIE':'COLLECTIONS';sidebar.append(label);for(const c of libraryCategories){const b=document.createElement('button');b.type='button';b.dataset.category=c[0];b.setAttribute('aria-pressed',String(q('#qacCategory').value===c[0]));const n=items.filter(a=>c[0]==='all'||a.category===c[0]).length;b.textContent=c[3]+' '+categoryName(c);const count=document.createElement('span');count.textContent=String(n);b.append(count);b.onclick=()=>selectCategory(c[0]);sidebar.append(b)}}
window.qaCutoutCount=(id='all')=>items.filter(a=>id==='all'||a.category===id).length;
window.qaOpenAssetLibrary=(id='all')=>{tab.click();selectCategory(id)};
window.addEventListener('qa:language',()=>{syncOptions();render()});document.addEventListener('change',e=>{if(e.target?.id==='qaLanguagePicker'){syncOptions();render()}});

async function hostedAssets(){try{
 const base='./assets/cutouts/';
 const r=await fetch(base+'manifest.json',{cache:'no-cache'});if(!r.ok)return[];
 const m=await r.json();if(!Array.isArray(m.assets))return[];
 return m.assets.filter(x=>typeof x.id==='string'&&/^([a-z0-9]+-){1,2}[a-z0-9]+$/.test(x.id)&&validCategory(x.category)&&typeof x.file==='string'&&/^[a-z0-9/._-]+$/.test(x.file)&&!x.file.includes('..')).map(x=>({id:x.id,name:String(x.name||x.id),category:x.category,width:x.width,height:x.height,hd:!!x.hd,url:base+x.file}));
 }catch{return[]}}
const say=s=>q('#qacStatus').textContent=s;
function openDatabase(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(Error('Tento prohlížeč nemá místní databázi.'));return}
const req=indexedDB.open('qa-studio-cutouts-v1',1);
req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('assets'))req.result.createObjectStore('assets',{keyPath:'id'});};
req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Nelze otevřít databázi'));});}
async function allAssets(){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction('assets','readonly');const r=tx.objectStore('assets').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error);});}
async function storeAssets(batch){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');const store=tx.objectStore('assets');for(const a of batch)store.put(a);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error||Error('Nepodařilo se uložit obrázky'))};});}
function unzipStored(buffer){
 const data=new Uint8Array(buffer),v=new DataView(buffer);let eocd=-1;
 for(let i=data.length-22;i>=Math.max(0,data.length-65558);i--){if(v.getUint32(i,true)===0x06054b50){eocd=i;break;}}
 if(eocd<0)throw Error('Soubor není platný ZIP.');
 const count=v.getUint16(eocd+10,true),offset=v.getUint32(eocd+16,true);if(count>400)throw Error('ZIP obsahuje příliš mnoho položek.');
 const decoder=new TextDecoder();const files=new Map();let cur=offset;
 for(let j=0;j<count;j++){
  if(cur+46>data.length||v.getUint32(cur,true)!==0x02014b50)throw Error('Poškozený seznam ZIP.');
  const method=v.getUint16(cur+10,true),length=v.getUint32(cur+20,true),usize=v.getUint32(cur+24,true);
  const nameLen=v.getUint16(cur+28,true),extraLen=v.getUint16(cur+30,true),commentLen=v.getUint16(cur+32,true),local=v.getUint32(cur+42,true);
  const name=decoder.decode(data.slice(cur+46,cur+46+nameLen));cur+=46+nameLen+extraLen+commentLen;
  if(!name||name.includes('..')||name.startsWith('/')||name.endsWith('/'))continue;
  if(method!==0)throw Error('Tento import vyžaduje ZIP bez dodatečné komprese (použij připravený balíček QA Studio).');
  if(local+30>data.length||v.getUint32(local,true)!==0x04034b50)throw Error('Poškozený ZIP.');
  const start=local+30+v.getUint16(local+26,true)+v.getUint16(local+28,true);
  if(start+length>data.length||length!==usize||length>12*1024*1024)throw Error('Poškozený nebo příliš velký soubor v ZIP.');
  files.set(name,data.slice(start,start+length));
 }
 return files;
}
async function parseArchive(file){
 if(file.size>45*1024*1024)throw Error('ZIP překračuje limit 45 MB.');
 const files=unzipStored(await file.arrayBuffer());const manifestBytes=files.get('manifest.json');
 if(!manifestBytes)throw Error('Chybí manifest.json. Importuj připravený balíček QA Studio.');
 const manifest=JSON.parse(new TextDecoder().decode(manifestBytes));
 if(!Array.isArray(manifest.assets))throw Error('Neplatný seznam objektů.');
 const batch=[];
 for(const x of manifest.assets){
  if(typeof x.id!=='string'||!/^([a-z0-9]+-){1,2}[a-z0-9]+$/.test(x.id)||!validCategory(x.category))continue;
  const bytes=files.get(x.file);if(!bytes||bytes.length<50||bytes[0]!==137||bytes[1]!==80||bytes[2]!==78||bytes[3]!==71)continue;
  batch.push({id:x.id,name:String(x.name||x.id).slice(0,80),category:x.category,hd:!!x.hd,blob:new Blob([bytes],{type:'image/png'}),width:x.width,height:x.height});
 }
 if(!batch.length)throw Error('ZIP neobsahuje žádné podporované PNG obrázky.');
 await storeAssets(batch);return batch.length;
}
function normalized(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function render(){window.dispatchEvent(new Event('qa:catalog-updated'));
 for(const url of urls)URL.revokeObjectURL(url);urls=[];
 const type=q('#qacCategory').value,query=normalized(q('#qacSearch').value);
 const cs=lang()==='cs';renderSidebar();heading.textContent=categoryName(libraryCategories.find(c=>c[0]===type)||libraryCategories[0]);info.textContent=cs?'Samostatné průhledné objekty • kliknutím vložíš do editoru':'Individual transparent assets • click to insert into editor';summary.textContent=cs?'Přidat vlastní PNG nebo ZIP':'Import PNG or ZIP';back.textContent=cs?'Zpět do editoru':'Back to editor';add.textContent=cs?'Importovat ZIP knihovnu':'Import ZIP collection';own.textContent=cs?'Přidat vlastní PNG':'Add your PNG';photos.textContent=cs?'Fotografie a pozadí':'Photos & backgrounds';
 const filtered=items.filter(a=>(type==='all'||a.category===type)&&(normalized(a.name).includes(query)||a.id.includes(query)));
 q('#qacCount').textContent=cs?'Nalezeno '+filtered.length+' · zobrazeno '+Math.min(filtered.length,visible):'Found '+filtered.length+' · showing '+Math.min(filtered.length,visible);empty.hidden=filtered.length!==0;empty.textContent=cs?'V této kategorii zatím nejsou dostupné objekty. Můžeš přidat vlastní PNG.':'No available objects in this collection yet. You can import your own PNGs.';
 q('#qacMore').hidden=filtered.length<=visible;
 const grid=q('#qacGrid');grid.replaceChildren();
 for(const a of filtered.slice(0,visible)){
  const wrapper=document.createElement('div');wrapper.className='qac-card';
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt=a.name;if(a.url){img.src=a.url}else{const url=URL.createObjectURL(a.blob);urls.push(url);img.src=url}
  const title=document.createElement('b');title.textContent=a.name;
  const button=document.createElement('button');button.type='button';button.textContent='Vložit do scény';
  button.onclick=async()=>{const editor=document.querySelector('.nav button[data-tab="qaSceneLib"]');if(!editor){say('Editor scén zatím není načtený.');return}try{let blob=a.blob;if(!blob&&a.url){const r=await fetch(a.url);if(!r.ok)throw Error('PNG se nenačetlo');blob=await r.blob()}if(!(blob instanceof Blob))throw Error('PNG soubor není dostupný');window.dispatchEvent(new CustomEvent('qa:insert-cutout',{detail:{blob,name:a.name,id:a.id}}))}catch(e){say('Vložení se nepodařilo: '+e.message)}};
  const preview=document.createElement('button');preview.type='button';preview.textContent=cs?'Originální náhled':'Original preview';preview.onclick=()=>{const d=document.createElement('dialog');d.className='qa4KPreview';const top=document.createElement('div'),title=document.createElement('strong'),close=document.createElement('button'),note=document.createElement('p'),full=new Image();title.textContent=a.name;close.type='button';close.textContent='×';close.setAttribute('aria-label','Close preview');close.onclick=()=>d.close();top.append(title,close);full.alt=a.name;full.onload=()=>{const w=full.naturalWidth,h=full.naturalHeight;note.textContent=w+' × '+h+' px'+(Math.max(w,h)>=3840&&Math.min(w,h)>=2160?' · 4K':'')};full.onerror=()=>{note.textContent='Original unavailable'};const url=a.blob?URL.createObjectURL(a.blob):a.url;full.src=url;d.append(top,note,full);d.addEventListener('close',()=>{if(a.blob)URL.revokeObjectURL(url);d.remove()},{once:true});document.body.append(d);d.showModal()};img.style.cursor='pointer';img.title='Originální náhled / Original preview';img.addEventListener('click',()=>preview.click());img.addEventListener('error',()=>{button.disabled=true;img.removeAttribute('src');label.textContent=cs?'Soubor nedostupný':'File unavailable'});
  const label=document.createElement('span');label.className='qac-hd';const dims=()=>{const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return;label.textContent=w+' × '+h+' px'+(Math.max(w,h)>=3840&&Math.min(w,h)>=2160?' · 4K dimensions':'')};img.addEventListener('load',dims);if(img.complete)dims();button.textContent=cs?'Vložit do scény':'Insert into scene';wrapper.append(img,title,label,preview,button);grid.append(wrapper);
 }
}
async function load(){try{const [local,hosted]=await Promise.all([allAssets().catch(()=>[]),hostedAssets()]);const merged=new Map(hosted.map(x=>[x.id,x]));for(const x of local)merged.set(x.id,x);items=Array.from(merged.values()).sort((a,b)=>a.id.localeCompare(b.id));render();say(items.length?'Připraveno '+items.length+' samostatných objektů. Vyber kategorii a použij Vložit do scény.':'Knihovna nemá zatím předem nahrané PNG objekty. Přidej vlastní PNG po jednom, hromadně, nebo importuj ZIP.')}catch(e){say('Knihovnu nelze otevřít: '+e.message)}}
q('#qacZip').onchange=async()=>{const files=Array.from(q('#qacZip').files||[]);q('#qacZip').disabled=true;try{let count=0;for(const f of files){say('Načítám '+f.name+'…');count+=await parseArchive(f)}await load();say('Importováno '+count+' PNG · knihovna obsahuje '+items.length+' uložených objektů. Žádné AI kredity se neodečetly.')}catch(e){say('Import nebyl dokončen: '+e.message)}finally{q('#qacZip').disabled=false;q('#qacZip').value=''}};
q('#qacImages').onchange=async()=>{
 const input=q('#qacImages'),uploaded=Array.from(input.files||[]),cat=q('#qacImportCategory').value;
 if(!uploaded.length)return;
 input.disabled=true;try{
  const batch=[];
  for(const file of uploaded){
   if(!['image/png','image/webp'].includes(file.type)||file.size>12*1024*1024||file.size<40)continue;
   const id='local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
   batch.push({id,category:cat,name:file.name.replace(/\.[^.]+$/,'').slice(0,80),blob:file,hd:false});
  }
  if(!batch.length)throw Error('Vyber PNG nebo WebP soubory do 12 MB.');
  await storeAssets(batch);await load();q('#qacCategory').value=cat;render();
  say('Uloženo '+batch.length+' samostatných objektů do tohoto zařízení. Každý můžeš znovu použít bez AI kreditů.');
 }catch(e){say('Import obrázků se nepodařil: '+e.message)}
 finally{input.disabled=false;input.value=''}
};
q('#qacCategory').onchange=()=>{visible=70;render()};
q('#qacSearch').oninput=()=>{visible=70;render()};
q('#qacMore').onclick=()=>{visible+=70;render()};
tab.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===section));nav.querySelectorAll('button').forEach(t=>t.classList.toggle('active',t===tab));window.scrollTo({top:0,behavior:'smooth'})};
const peopleTab=document.createElement('button');peopleTab.type='button';peopleTab.dataset.tab='qaPeopleTab';peopleTab.textContent='👤 People';nav.insertBefore(peopleTab,tab);
const animalsTab=document.createElement('button');animalsTab.type='button';animalsTab.dataset.tab='qaAnimalsTab';animalsTab.textContent='🐾 Animals';nav.insertBefore(animalsTab,tab);
function showCategory(type,selected){
 q('#qacCategory').value=type;visible=70;render();tab.click();
 nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===selected));
}
peopleTab.onclick=()=>showCategory('lide',peopleTab);
animalsTab.onclick=()=>showCategory('zvirata',animalsTab);
const objectsTab=document.createElement('button');objectsTab.type='button';objectsTab.dataset.tab='qaObjectsTab';objectsTab.textContent='🚗 Věci a auta';nav.insertBefore(objectsTab,tab);objectsTab.onclick=()=>showCategory('auta',objectsTab);

load();
})();
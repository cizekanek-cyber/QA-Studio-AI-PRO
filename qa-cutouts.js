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
section.innerHTML='<div class="qac-box"><h2>Lidé, zvířata, auta a věci jako jednotlivé PNG</h2><p class="qac-note">Importuj jednotlivé PNG nebo ZIP knihovnu a opakovaně je vkládej do scén zdarma. Pro objekty bez pozadí používej průhledné PNG. V editoru můžeš každou položku samostatně přesouvat, měnit její velikost a kombinovat ji s dalšími.</p><label><strong>Jednorázově přidej ZIP knihovnu do tohoto zařízení</strong><br><input type="file" id="qacZip" accept=".zip,application/zip,application/x-zip-compressed" multiple></label><div class="qac-tools"><label>Uložit do kategorie <select id="qacImportCategory"><option value="zvirata">Zvířata</option><option value="lide">Lidé</option><option value="auta">Auta</option><option value="motorky">Motorky</option><option value="predmety">Věci a předměty</option><option value="technika">Technika a stroje</option><option value="produkty">Produkty</option><option value="bydleni">Domy a vybavení</option><option value="priroda">Příroda</option></select></label><label>Vložit jednotlivé PNG / WebP <input type="file" id="qacImages" accept="image/png,image/webp" multiple></label></div><p id="qacStatus" role="status">Zjišťuji knihovnu uloženou v telefonu…</p><p class="qac-note">ZIP obsahuje obrázky a manifest.json; import je zdarma, neplatíš kredity za další generování. Obrázky se ukládají lokálně do úložiště prohlížeče, nikoliv na náš server. Po vymazání dat prohlížeče je bude nutné nahrát znovu.</p></div><div class="qac-box"><div class="qac-tools"><select id="qacCategory"><option value="all">Všechny objekty</option><option value="zvirata">Zvířata</option><option value="lide">Lidé</option><option value="auta">Auta</option><option value="motorky">Motorky</option><option value="predmety">Věci a předměty</option><option value="technika">Technika a stroje</option><option value="produkty">Produkty</option><option value="bydleni">Domy a vybavení</option><option value="priroda">Příroda</option></select><input type="search" id="qacSearch" placeholder="Najdi zvíře nebo postavu…"><button id="qacMore" type="button">Další objekty</button></div><div class="qac-note" id="qacCount">Zatím žádné obrázky.</div><div id="qacGrid" class="qac-grid"></div></div>';
(document.querySelector('.tab')?.parentElement||nav.parentElement).append(section);
const q=s=>section.querySelector(s);
let items=[],visible=48,urls=[];
async function hostedAssets(){try{
 const base='./assets/cutouts/';
 const r=await fetch(base+'manifest.json',{cache:'force-cache'});if(!r.ok)return[];
 const m=await r.json();if(!Array.isArray(m.assets))return[];
 return m.assets.filter(x=>typeof x.id==='string'&&/^([a-z0-9]+-){1,2}[a-z0-9]+$/.test(x.id)&&['zvirata','lide','auta','motorky','predmety','technika','produkty','bydleni','priroda'].includes(x.category)&&typeof x.file==='string'&&/^[a-z0-9/._-]+$/.test(x.file)&&!x.file.includes('..')).map(x=>({id:x.id,name:String(x.name||x.id),category:x.category,hd:!!x.hd,url:base+x.file}));
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
  if(typeof x.id!=='string'||!/^([a-z0-9]+-){1,2}[a-z0-9]+$/.test(x.id)||!['zvirata','lide','auta','motorky','predmety','technika','produkty','bydleni','priroda'].includes(x.category))continue;
  const bytes=files.get(x.file);if(!bytes||bytes.length<50||bytes[0]!==137||bytes[1]!==80||bytes[2]!==78||bytes[3]!==71)continue;
  batch.push({id:x.id,name:String(x.name||x.id).slice(0,80),category:x.category,hd:!!x.hd,blob:new Blob([bytes],{type:'image/png'}),width:x.width,height:x.height});
 }
 if(!batch.length)throw Error('ZIP neobsahuje žádné podporované PNG obrázky.');
 await storeAssets(batch);return batch.length;
}
function normalized(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function render(){
 for(const url of urls)URL.revokeObjectURL(url);urls=[];
 const type=q('#qacCategory').value,query=normalized(q('#qacSearch').value);
 const filtered=items.filter(a=>(type==='all'||a.category===type)&&(normalized(a.name).includes(query)||a.id.includes(query)));
 q('#qacCount').textContent='Uloženo '+items.length+' objektů · nalezeno '+filtered.length+' · zobrazeno '+Math.min(filtered.length,visible)+'.';
 q('#qacMore').hidden=filtered.length<=visible;
 const grid=q('#qacGrid');grid.replaceChildren();
 for(const a of filtered.slice(0,visible)){
  const wrapper=document.createElement('div');wrapper.className='qac-card';
  const img=document.createElement('img');img.loading='lazy';img.alt=a.name;if(a.url){img.src=a.url}else{const url=URL.createObjectURL(a.blob);urls.push(url);img.src=url}
  const title=document.createElement('b');title.textContent=a.name;
  const button=document.createElement('button');button.type='button';button.textContent='Vložit do scény';
  button.onclick=async()=>{const editor=document.querySelector('.nav button[data-tab="qaSceneLib"]');if(!editor){say('Editor scén zatím není načtený.');return}try{let blob=a.blob;if(!blob&&a.url){const r=await fetch(a.url);if(!r.ok)throw Error('PNG se nenačetlo');blob=await r.blob()}if(!(blob instanceof Blob))throw Error('PNG soubor není dostupný');window.dispatchEvent(new CustomEvent('qa:insert-cutout',{detail:{blob,name:a.name,id:a.id}}))}catch(e){say('Vložení se nepodařilo: '+e.message)}};
  wrapper.append(img,title);if(a.hd){const label=document.createElement('span');label.className='qac-hd';label.textContent='HD předloha';wrapper.append(label)}wrapper.append(button);grid.append(wrapper);
 }
}
async function load(){try{const [local,hosted]=await Promise.all([allAssets(),hostedAssets()]);const merged=new Map(hosted.map(x=>[x.id,x]));for(const x of local)merged.set(x.id,x);items=Array.from(merged.values()).sort((a,b)=>a.id.localeCompare(b.id));render();say(items.length?'Připraveno '+items.length+' samostatných objektů. Vyber kategorii a použij Vložit do scény.':'Knihovna nemá zatím předem nahrané PNG objekty. Přidej vlastní PNG po jednom, hromadně, nebo importuj ZIP.')}catch(e){say('Knihovnu nelze otevřít: '+e.message)}}
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
q('#qacCategory').onchange=()=>{visible=48;render()};
q('#qacSearch').oninput=()=>{visible=48;render()};
q('#qacMore').onclick=()=>{visible+=48;render()};
tab.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===section));nav.querySelectorAll('button').forEach(t=>t.classList.toggle('active',t===tab));window.scrollTo({top:0,behavior:'smooth'})};
const peopleTab=document.createElement('button');peopleTab.type='button';peopleTab.dataset.tab='qaPeopleTab';peopleTab.textContent='👤 People';nav.insertBefore(peopleTab,tab);
const animalsTab=document.createElement('button');animalsTab.type='button';animalsTab.dataset.tab='qaAnimalsTab';animalsTab.textContent='🐾 Animals';nav.insertBefore(animalsTab,tab);
function showCategory(type,selected){
 q('#qacCategory').value=type;visible=48;render();tab.click();
 nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===selected));
}
peopleTab.onclick=()=>showCategory('lide',peopleTab);
animalsTab.onclick=()=>showCategory('zvirata',animalsTab);
const objectsTab=document.createElement('button');objectsTab.type='button';objectsTab.dataset.tab='qaObjectsTab';objectsTab.textContent='🚗 Věci a auta';nav.insertBefore(objectsTab,tab);objectsTab.onclick=()=>showCategory('auta',objectsTab);

load();
})();
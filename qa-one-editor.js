/* QA Studio AI PRO | One Editor UI: one scene canvas, inline asset libraries.
   Reuses existing rendering/exporting engines; unfinished AI generation remains disabled.
*/
(()=>{'use strict';
if(document.getElementById('qaUnifiedTools'))return;
function init(){
 const scene=document.getElementById('qaSceneLib');
 const nav=document.querySelector('.nav');
 const oldGallery=document.getElementById('qaGalleryPanel');
 const cutouts=document.getElementById('qaCutoutPanel');
 const funny=document.getElementById('qaFunnyPanel');
 const engineBtn=nav?.querySelector('[data-tab="qaSceneLib"]');
 const layout=scene?.querySelector('.qsl-layout');
 const gallery=scene?.querySelector('.qsl-gallery');
 const editor=scene?.querySelector('.qsl-editor');
 if(!scene||!nav||!layout||!gallery||!editor||!oldGallery||!cutouts||!funny||!engineBtn)return false;
 const oldEngineOpen=engineBtn.onclick;
 const style=document.createElement('style');style.textContent=`
 #qaSceneLib{max-width:1280px;margin:auto;padding:12px}
 #qaSceneLib .qsl-layout{display:flex!important;flex-direction:column!important;gap:12px!important}
 #qaSceneLib .qsl-editor{position:static!important;order:-1!important;width:100%!important}
 #qaSceneLib .qsl-gallery{order:2!important;min-width:0!important}
 #qaSceneLib #qaUnifiedTools{border:1px solid #665c9a;border-radius:18px;padding:15px;background:linear-gradient(125deg,#211b3b,#101c30);margin:4px 0 12px}
 #qaUnifiedTools h2{margin:0 0 7px;font-size:22px}
 #qaUnifiedTools p{margin:0 0 12px;color:#bfcbe0;font-size:13px}
 #qaUnifiedTools .quTabs{display:flex;gap:7px;flex-wrap:wrap}
 #qaUnifiedTools .quTabs button{border:1px solid #514f7c;border-radius:11px;padding:10px;background:#202b46;color:#fff;font:inherit;cursor:pointer}
 #qaUnifiedTools .quTabs button[aria-pressed="true"]{background:#62419b;border-color:#c09fff}
 #qaSceneLib [data-qu-drawer]{margin-top:12px}
 #qaSceneLib [data-qu-drawer][hidden]{display:none!important}
 #qaUnifiedTools .quHint{font-size:12px;color:#e4cda1;margin-top:11px}
 #qaSceneLib .qsl-layout .qsl-editor>canvas{max-height:60vh;object-fit:contain}
 #qaSceneLib .qsl-editor .qsl-row{gap:7px}
 #qaSceneLib .qsl-gallery{display:none}
 #qaSceneLib.qu-backgrounds .qsl-gallery{display:block}
 #qaSceneLib #qaCutoutPanel,#qaSceneLib #qaGalleryPanel,#qaSceneLib #qaFunnyPanel{max-width:100%!important;margin:0!important}
 #qaSceneLib #qaGalleryPanel .qagDetail{position:static}
 @media(max-width:600px){#qaSceneLib{padding:8px}#qaUnifiedTools .quTabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#qaUnifiedTools .quTabs button{font-size:12px;padding:10px 6px}#qaSceneLib .qsl-layout .qsl-editor>canvas{max-height:42vh}}
 `;document.head.append(style);
 const wrap=document.createElement('div');wrap.id='qaUnifiedTools';wrap.innerHTML=`<h2>🎬 Jeden editor pro všechno</h2><p>Vyber pozadí, přidej samostatnou průhlednou postavu nebo zvíře, uprav vrstvy a exportuj ze stejného plátna.</p><div class="quTabs" role="group" aria-label="Knihovna hlavního editoru"></div><div class="quHint" id="quHint"></div>`;
 scene.insertBefore(wrap,layout);
 const dock=document.createElement('div');dock.id='qaUnifiedDrawer';scene.append(dock);
 const targets={living:oldGallery,funny:funny};
 for(const [k,element] of Object.entries(targets)){const box=document.createElement('div');box.dataset.quDrawer=k;box.hidden=true;dock.append(box);element.classList.remove('tab');element.classList.remove('active');box.append(element)}
 const modes=[
 ['backgrounds','🏞️ Pozadí','Vyber čisté prostředí ze scén. U fotografických podkladů ověř, že neobsahují postavy.'],
 ['objects','🐾 Průhledné objekty','Skutečně průhledné PNG/WebP lze vložit jako samostatné vrstvy.'],
 ['living','🧑 Lidé a tvorové','Fotografické předlohy mohou mít vlastní původní pozadí. Nejde automaticky o vyříznuté PNG.'],
 ['funny','👽 Funny šablony','Vyber scénu a pomocí „Použít v editoru“ ji přenes na hlavní plátno. Import zatím spojuje motiv do jednoho obrázku.'],
 ['editor','✏️ Úpravy a export','Uprav obsah na plátně, přidej text, počasí, vlastní PNG a exportuj.']
 ];
 const tabs=wrap.querySelector('.quTabs');
 const quBtns={};
 for(const [key,text] of modes){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>open(key);b.setAttribute('aria-pressed','false');tabs.append(b);quBtns[key]=b;}
 function showEditor(){if(typeof oldEngineOpen==='function')oldEngineOpen.call(engineBtn);else{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===scene));nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===engineBtn))}}
 function open(mode){if(!quBtns[mode])mode='editor';if(mode==='objects'&&typeof window.qaOpenAssetLibrary==='function'){window.qaOpenAssetLibrary();return}showEditor();scene.classList.remove('qaFullPhotoLibrary');scene.classList.toggle('qu-backgrounds',mode==='backgrounds');for(const [k,d] of Object.entries(targets)){const panel=d.parentElement;panel.hidden=k!==mode;d.classList.toggle('active',k===mode)}for(const [k,b] of Object.entries(quBtns))b.setAttribute('aria-pressed',String(k===mode));wrap.querySelector('#quHint').textContent=modes.find(x=>x[0]===mode)[2];}
 window.qaOpenPhotoLibrary=()=>{open('backgrounds');scene.classList.add('qaFullPhotoLibrary');const first=scene.querySelector('#qslCategories button[data-cat="all"]');first?.click()};engineBtn.onclick=()=>open('backgrounds');engineBtn.textContent='🎬 Editor';
 const visibleTabs=new Set(['qaWelcome','qaSceneLib','saved','qaAccountPanel','qaPlansPanel','qaCutoutPanel','qaPromptPanel','qaExternalAi','qaSharedLibrary']);
 nav.querySelectorAll('button[data-tab]').forEach(b=>{if(!visibleTabs.has(b.dataset.tab)){b.hidden=true;b.style.display='none'}});
 const libraryButton=nav.querySelector('[data-tab="qaCutoutPanel"]');if(libraryButton){libraryButton.hidden=false;libraryButton.style.display='';libraryButton.textContent='▦ Knihovna PNG'}
 const saved=nav.querySelector('[data-tab="saved"]');if(saved)saved.textContent='📁 Moje projekty';
 const profile=nav.querySelector('[data-tab="qaAccountPanel"]');if(profile)profile.textContent='👤 Účet / PRO / VIP';

 for(const [tabId,mode] of [['qaGalleryPanel','living'],['qaFunnyPanel','funny'],['qaPeopleTab','objects'],['qaAnimalsTab','objects'],['qaObjectsTab','objects']]){const b=nav.querySelector('[data-tab="'+tabId+'"]');if(b){b.onclick=()=>open(mode);b.hidden=true;b.style.display='none'}}
 for(const id of ['qaGalleryPanel','qaFunnyPanel','qaPeopleTab','qaAnimalsTab','qaObjectsTab']){const b=nav.querySelector('[data-tab="'+id+'"]');if(b){b.hidden=true;b.style.display='none'}}
 // Legacy landing-page buttons may target former tabs; their handlers still work by opening a drawer.
 window.addEventListener('qa:open-funny',()=>{open('funny')});
 window.addEventListener('qa:open-gallery',()=>{open('living')});
 // The primary editor remains the only active scene canvas. Inner galleries are selectors, not editors.
 const head=scene.querySelector('.qsl-head h2');if(head)head.textContent='Profesionální editor obrázků a videí';
 const notes=scene.querySelector('.qsl-head .qsl-sub');if(notes)notes.textContent='Jedno plátno pro pozadí, postavy, objekty, text, efekty a export. První čtyři motivy v každé kategorii zdarma; zbytek s platnou licencí PRO / VIP.';
 // Do not override the landing screen when late-loaded modules initialize.
 if(scene.classList.contains('active')){open('backgrounds')}else{scene.classList.add('qu-backgrounds');quBtns.backgrounds.setAttribute('aria-pressed','true')}
 return true;
}
let tries=0;function tick(){if(init())return;if(++tries<24)setTimeout(tick,350);}tick();
})();
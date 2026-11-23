/* QA Studio AI PRO · social export · exports only user-created files */
(()=>{'use strict';
if(document.getElementById('qaSocialPanel'))return;
const nav=document.querySelector('.nav'); if(!nav)return;
const st=document.createElement('style');st.textContent=`
#qaSocialPanel{padding:12px;color:#f2f5ff;font-family:system-ui,sans-serif;max-width:970px;margin:auto}
#qaSocialPanel *{box-sizing:border-box}
#qaSocialPanel .qss-box{background:#141c31;border:1px solid #444f71;border-radius:18px;padding:20px;margin:12px 0}
#qaSocialPanel .qss-actions{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}
#qaSocialPanel button,#qaSocialPanel a.qss-link{border:1px solid #6f76a8;background:#292f54;color:white;padding:12px 14px;border-radius:11px;text-decoration:none;font:inherit;cursor:pointer;display:inline-block}
#qaSocialPanel .qss-primary{background:#5c3aab;border-color:#af85ec}
#qaSocialPanel .qss-muted{color:#bccbe5;font-size:13px;line-height:1.6}
#qaSocialPanel input,#qaSocialPanel textarea{display:block;width:100%;padding:12px;border-radius:10px;background:#0c1428;color:white;border:1px solid #616a86;font:inherit;margin:8px 0}
#qaSocialPanel #qssStatus{white-space:pre-wrap;background:#101b30;padding:12px;border-radius:10px}
`;document.head.append(st);
const tab=document.createElement('button');tab.type='button';tab.dataset.tab='qaSocialPanel';tab.textContent='↗ Sdílet / sociální sítě';nav.append(tab);
const sec=document.createElement('section');sec.className='tab';sec.id='qaSocialPanel';
sec.innerHTML=`<div class="qss-box"><h2>Publikování a sdílení</h2>
<p class="qss-muted">Hotový obrázek nebo video můžeš ze svého telefonu předat TikToku, Instagramu, Facebooku, YouTube a dalším aplikacím pomocí systémové nabídky Sdílet. Pro přímé automatické publikování je nutná autorizace účtu a schválená integrace dané sítě.</p>
<label for="qssFile">Vyber hotový export z telefonu (PNG, JPG, MP4, WebM)</label>
<input id="qssFile" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm">
<p class="qss-muted" id="qssFileInfo">Po exportu ze záložky „Unikátní šablony“ se poslední vytvořený soubor objeví i zde.</p>
<label for="qssCaption">Text příspěvku / hashtagy</label><textarea id="qssCaption" rows="3" maxlength="2000" placeholder="Popis videa a hashtagy…"></textarea>
<div class="qss-actions"><button class="qss-primary" id="qssShare">Sdílet soubor do aplikace</button><button id="qssDownload">Stáhnout poslední soubor</button><button id="qssCopy">Kopírovat popisek</button></div>
<p role="status" id="qssStatus">Připraveno. Nejdřív vytvoř video nebo vyber svůj soubor.</p></div>
<div class="qss-box"><h3>Otevřít sociální síť</h3>
<p class="qss-muted">Na mobilech nejdřív zkus tlačítko „Sdílet soubor do aplikace“. Webové odkazy otevřou příslušnou platformu, ale soubor samy neodešlou.</p>
<div class="qss-actions" id="qssLinks"></div></div>
<div class="qss-box"><h3>Hudba, Spotify a YouTube</h3>
<p class="qss-muted">Spotify slouží jako odkaz na skladbu, nikoli ke kopírování či vložení hudby do výstupního videa. YouTube lze použít pro přehrání odkazu a vlastní publikování. Pro hudební podklad používej vlastní nebo řádně licencovanou hudbu a AI zvuk, který dovoluje komerční využití.</p>
<div class="qss-actions"><a class="qss-link" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Spotify</a><a class="qss-link" href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer">YouTube Studio</a></div></div>`;
(document.querySelector('.tab')?.parentElement||nav.parentElement).append(sec);
const q=x=>sec.querySelector(x);let stored=null;
const status=msg=>q('#qssStatus').textContent=msg;
function saveFile(blob,name){stored={blob,name};q('#qssFileInfo').textContent='Připravený soubor: '+name+' ('+Math.ceil(blob.size/1024)+' kB)';}
window.addEventListener('qa:export-ready',e=>{let d=e.detail||{};if(d.blob instanceof Blob&&typeof d.name==='string')saveFile(d.blob,d.name);});
q('#qssFile').addEventListener('change',e=>{let f=e.target.files?.[0];if(!f)return;if(!/^(image\/(png|jpeg|webp)|video\/(mp4|webm))$/.test(f.type)){status('Nepodporovaný formát. Použij PNG, JPEG, WebP, MP4 nebo WebM.');return}if(f.size>250*1024*1024){status('Soubor je příliš velký pro předání z aplikace (limit 250 MB).');return}saveFile(f,f.name);status('Soubor byl vybrán.');});
q('#qssShare').onclick=()=>{if(!stored){status('Nejdřív vytvoř export nebo vyber existující soubor.');return}let f=new File([stored.blob],stored.name,{type:stored.blob.type||'application/octet-stream'});const payload={files:[f],title:'QA Studio AI PRO',text:q('#qssCaption').value};
if(typeof navigator.share!=='function'||navigator.canShare&&!navigator.canShare({files:[f]})){status('Tento prohlížeč neumí sdílet soubory přímo. Stáhni výstup a nahraj ho přes konkrétní aplikaci.');return}
navigator.share(payload).then(()=>status('Soubor byl předán systému sdílení. Dokončení publikace musíš potvrdit v cílové aplikaci.')).catch(e=>{if(e.name!=='AbortError')status('Sdílení se nezdařilo: '+e.message)});};
q('#qssDownload').onclick=()=>{if(!stored){status('Nejdřív vytvoř export nebo vyber soubor.');return}let u=URL.createObjectURL(stored.blob);let a=document.createElement('a');a.href=u;a.download=stored.name;sec.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)};
q('#qssCopy').onclick=async()=>{try{await navigator.clipboard.writeText(q('#qssCaption').value);status('Popisek zkopírován.')}catch{q('#qssCaption').focus();q('#qssCaption').select();status('Zkopíruj označený text pomocí telefonu.')}};
const links=[['TikTok','https://www.tiktok.com/upload'],['Instagram','https://www.instagram.com/'],['Facebook','https://www.facebook.com/'],['YouTube Shorts','https://studio.youtube.com/'],['Threads','https://www.threads.com/'],['Pinterest','https://www.pinterest.com/'],['X','https://x.com/compose/post']];
for(const [name,url] of links){const a=document.createElement('a');a.className='qss-link';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=name;q('#qssLinks').append(a)}
tab.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===sec));nav.querySelectorAll('button').forEach(t=>t.classList.toggle('active',t===tab));window.scrollTo({top:0,behavior:'smooth'})};
})();
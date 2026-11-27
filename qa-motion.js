/* QA Studio AI PRO — Motion Studio. Local camera motion, AI prompt handoff, and video import.
   No external inference, credentials, uploads, billing or fake AI generation. */
(()=>{'use strict';
const cs=()=>{try{return localStorage.getItem('qa-studio-language')==='cs'}catch{return false}};
const t=(a,b)=>cs()?a:b;
const presets={
 walk:'Natural anatomically correct walking, grounded steps, stable body proportions, natural head and tail movement where applicable.',
 talk:'Subtle natural facial motion and jaw movement, preserve identity and anatomy. Use the supplied dialogue for lip sync only if the selected video model supports audio.',
 natural:'Gentle breathing, realistic blinking where appropriate, restrained natural movement, physically plausible timing.',
 dance:'Coordinated natural body movement, physically plausible balance and consistent anatomy.',
 custom:'Follow the specific motion instructions.'
};
let tries=0;
function mount(){
 const dock=document.getElementById('qaUnifiedDrawer');
 if(!dock)return false;
 if(document.getElementById('qaMotionStudio'))return true;
 const section=document.createElement('section');section.id='qaMotionStudio';section.hidden=true;
 section.dataset.quDrawer='motion';
 const css=document.createElement('style');css.textContent=
 '#qaMotionStudio{padding:14px;background:#121b30;border:1px solid #665c9a;border-radius:16px;color:#fff}'+
 '#qaMotionStudio h2,#qaMotionStudio h3{margin:8px 0}#qaMotionStudio p{font-size:13px;color:#c7d0e4;line-height:1.5}'+
 '#qaMotionStudio .qmGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}'+
 '#qaMotionStudio label{display:grid;gap:5px;font-size:13px;margin:10px 0}#qaMotionStudio input,#qaMotionStudio select,#qaMotionStudio textarea{max-width:100%;width:100%;box-sizing:border-box;background:#202b46;color:white;border:1px solid #6b7194;border-radius:9px;padding:8px;font:inherit}'+
 '#qaMotionStudio input[type=range]{padding:0;accent-color:#bca0ff}#qaMotionStudio textarea{min-height:76px;resize:vertical}'+
 '#qaMotionStudio canvas,#qaMotionStudio video{display:block;width:100%;max-height:45vh;object-fit:contain;background:#080c15;border-radius:12px;aspect-ratio:auto}'+
 '#qaMotionStudio [hidden]{display:none!important}#qaMotionStudio .qmActions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}'+
 '#qaMotionStudio button,#qaMotionStudio a.qmLink{display:inline-block;padding:10px 12px;border:1px solid #8573ad;border-radius:10px;color:white;background:#352653;text-decoration:none;cursor:pointer;font:inherit}'+
 '#qaMotionStudio button:disabled{opacity:.45;cursor:not-allowed}#qaMotionStudio .qmStatus{min-height:22px;overflow-wrap:anywhere}';
 document.head.append(css);
 section.innerHTML='<h2 data-cs="🎬 AI Motion Studio" data-en="🎬 AI Motion Studio"></h2>'+
 '<p data-cs="Bezplatná příprava před AI generováním: vlož fotografii, nastav pohyb a dolaď zadání bez spotřeby AI kreditů. Lokální náhled animuje kameru, nikoli tělo. Přímé AI generování zatím není připojeno." data-en="Free preparation before AI generation: upload a photo, configure motion and refine the prompt without spending AI credits. Local preview animates the camera, not the subject; direct AI generation is not connected yet."></p>'+
 '<label><span data-cs="Vlastní fotografie (max. 20 MB)" data-en="Your photo (max. 20 MB)"></span><input id="qmPhoto" type="file" accept="image/png,image/jpeg,image/webp"></label>'+
 '<canvas id="qmCanvas" width="640" height="360" aria-label="Motion preview"></canvas>'+
 '<div class="qmGrid"><label><span data-cs="Typ AI pohybu" data-en="AI motion type"></span><select id="qmMode">'+
 '<option value="walk" data-cs="Realistická chůze" data-en="Realistic walking"></option><option value="talk" data-cs="Mluvení a mimika" data-en="Talking and expression"></option><option value="natural" data-cs="Přirozené oživení" data-en="Natural movement"></option><option value="dance" data-cs="Tanec" data-en="Dance"></option><option value="custom" data-cs="Vlastní pohyb" data-en="Custom motion"></option></select></label>'+
 '<label><span data-cs="Pohyb kamery (lokální náhled)" data-en="Camera motion (local preview)"></span><select id="qmCamera"><option value="still" data-cs="Bez pohybu" data-en="Static"></option><option value="in" data-cs="Přiblížení" data-en="Zoom in" selected></option><option value="out" data-cs="Oddálení" data-en="Zoom out"></option><option value="left" data-cs="Posun doleva" data-en="Pan left"></option><option value="right" data-cs="Posun doprava" data-en="Pan right"></option></select></label>'+
 '<label><span data-cs="Délka" data-en="Duration"></span><select id="qmDuration"><option value="5">5 s</option><option value="10" selected>10 s</option><option value="15">15 s</option></select></label>'+
 '<label><span data-cs="Intenzita" data-en="Intensity"></span><input id="qmStrength" type="range" min="0" max="100" value="60"><output id="qmStrengthValue">60%</output></label>'+
 '<label><span data-cs="Tempo pohybu" data-en="Movement speed"></span><select id="qmSpeed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div>'+
 '<label><span data-cs="Vlastní instrukce k pohybu (např. anglicky mluvící kočka)" data-en="Custom motion instructions (e.g. an English-speaking cat)"></span><textarea id="qmInstruction" maxlength="1200"></textarea></label>'+
 '<label><span data-cs="Volitelný dialog a styl hlasu – součást AI zadání" data-en="Optional dialogue and voice style — included in AI prompt"></span><textarea id="qmDialogue" maxlength="600"></textarea></label>'+
 '<div class="qmActions"><button type="button" id="qmPlay" disabled data-cs="▶ Lokální náhled kamery" data-en="▶ Local camera preview"></button><button type="button" id="qmStop" disabled data-cs="■ Zastavit" data-en="■ Stop"></button><button type="button" id="qmExport" disabled data-cs="Export pohybu kamery" data-en="Export camera motion"></button></div>'+
 '<h3 data-cs="Finální AI generování – ruční předání" data-en="Final AI generation — manual handoff"></h3>'+
 '<p data-cs="Zkopíruj zadání, otevři externí službu a nahraj do ní fotografii ručně. Služba může vyžadovat vlastní účet a platbu. Fotografie se automaticky nikam neposílá." data-en="Copy the prompt, open an external service and upload your photo manually. The service may require its own account and payment. Your photo is never uploaded automatically."></p>'+
 '<label><span data-cs="AI zadání (anglické instrukce + vlastní text)" data-en="AI prompt (English instructions + your text)"></span><textarea id="qmPrompt" readonly></textarea></label>'+
 '<div class="qmActions"><button id="qmCopy" type="button" data-cs="Kopírovat AI zadání" data-en="Copy AI prompt"></button><a class="qmLink" href="https://app.runwayml.com/" target="_blank" rel="noopener noreferrer">Runway ↗</a><a class="qmLink" href="https://klingai.com/" target="_blank" rel="noopener noreferrer">Kling ↗</a></div>'+
 '<h3 data-cs="Import hotového videa" data-en="Import completed video"></h3><label><span data-cs="Video z AI nebo vlastní soubor" data-en="AI video or your own file"></span><input id="qmVideoFile" type="file" accept="video/mp4,video/webm"></label><video id="qmVideo" controls playsinline hidden></video>'+
 '<p id="qmStatus" class="qmStatus" role="status" aria-live="polite"></p>';
 dock.append(section);
 const q=id=>section.querySelector('#'+id);
 const canvas=q('qmCanvas'),ctx=canvas.getContext('2d',{alpha:false});
 let photo=null,loading=0,frame=0,recording=false,videoURL=null,downloadURL=null;
 const status=(a,b)=>{q('qmStatus').textContent=t(a,b)};
 function settings(){return {duration:Number(q('qmDuration').value),strength:Number(q('qmStrength').value)/100,speed:Number(q('qmSpeed').value),camera:q('qmCamera').value}}
 function updatePrompt(){
  const s=settings();q('qmStrengthValue').textContent=Math.round(s.strength*100)+'%';
  const camera={still:'static camera',in:'smooth slow push-in',out:'smooth pull-back',left:'slow pan left',right:'slow pan right'}[s.camera];
  const extra=q('qmInstruction').value.trim(),dialogue=q('qmDialogue').value.trim();
  q('qmPrompt').value='Image-to-video. '+presets[q('qmMode').value]+' Preserve the original subject identity, fur/skin, eye color, proportions, lighting and background. No morphing, extra limbs, flickering or abrupt cuts. Target duration: '+s.duration+' seconds (if supported). Motion intensity: '+Math.round(s.strength*100)+'%. Movement pace: '+s.speed+'x. Camera: '+camera+'.'+(extra?' Additional instructions: '+extra:'')+(dialogue?' Dialogue / voice direction: '+dialogue:'');
 }
 function paint(target,c,img,elapsed,s){
  c.fillStyle='#080c15';c.fillRect(0,0,target.width,target.height);
  if(!img)return;
  const p=Math.min(1,Math.max(0,elapsed/s.duration*s.speed)),ease=p*p*(3-2*p),amount=.22*s.strength;
  let scale=1,shift=0;
  if(s.camera==='in')scale=1+amount*ease;
  if(s.camera==='out')scale=1+amount*(1-ease);
  if(s.camera==='left'||s.camera==='right'){scale=1+amount;shift=(ease-.5)*(s.camera==='left'?-1:1)}
  const base=Math.min(target.width/img.naturalWidth,target.height/img.naturalHeight);
  const w=img.naturalWidth*base*scale,h=img.naturalHeight*base*scale;
  const x=(target.width-w)/2+Math.max(0,w-target.width)*shift;
  c.drawImage(img,x,(target.height-h)/2,w,h);
 }
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;q('qmStop').disabled=true}
 function drawStill(){paint(canvas,ctx,photo,0,settings())}
 function controls(){q('qmPlay').disabled=!photo||recording;q('qmExport').disabled=!photo||recording||!canvas.captureStream||!window.MediaRecorder;q('qmPhoto').disabled=recording}
 function play(){if(!photo||recording)return;stop();const s=settings();const start=performance.now();q('qmStop').disabled=false;
  const tick=now=>{const elapsed=(now-start)/1000;paint(canvas,ctx,photo,elapsed,s);if(elapsed<s.duration&&!section.hidden)frame=requestAnimationFrame(tick);else stop()};frame=requestAnimationFrame(tick);
 }
 q('qmPhoto').onchange=()=>{
  const file=q('qmPhoto').files[0];if(!file)return;const sequence=++loading;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){status('Vyber JPG, PNG nebo WebP do 20 MB.','Choose JPG, PNG or WebP up to 20 MB.');return}
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);if(sequence!==loading)return;if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>40000000){status('Fotografie je příliš velká (max. 40 MP).','Photo is too large (max. 40 MP).');return}
   stop();photo=img;const scale=Math.min(1,1280/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(2,Math.floor(img.naturalWidth*scale/2)*2);canvas.height=Math.max(2,Math.floor(img.naturalHeight*scale/2)*2);drawStill();controls();status('Fotografie načtena lokálně.','Photo loaded locally.')};
  img.onerror=()=>{URL.revokeObjectURL(url);if(sequence===loading)status('Fotografii nelze otevřít.','Could not open photo.')};img.src=url;
 };
 for(const id of ['qmMode','qmCamera','qmDuration','qmStrength','qmSpeed','qmInstruction','qmDialogue'])q(id).addEventListener('input',()=>{updatePrompt();if(!recording){stop();drawStill()}});
 q('qmPlay').onclick=play;q('qmStop').onclick=stop;
 q('qmCopy').onclick=async()=>{try{await navigator.clipboard.writeText(q('qmPrompt').value);status('AI zadání zkopírováno.','AI prompt copied.')}catch{q('qmPrompt').focus();q('qmPrompt').select();status('Zadání označeno, zkopíruj jej ručně.','Prompt selected; copy it manually.')}};
 q('qmVideoFile').onchange=()=>{const f=q('qmVideoFile').files[0];if(!f)return;if(!['video/mp4','video/webm'].includes(f.type)){status('Vyber MP4 nebo WebM.','Choose MP4 or WebM.');return}if(videoURL)URL.revokeObjectURL(videoURL);videoURL=URL.createObjectURL(f);q('qmVideo').src=videoURL;q('qmVideo').hidden=false;status('Video načteno lokálně.','Video imported locally.')};
 q('qmVideo').onerror=()=>status('Tento prohlížeč neumí přehrát zvolený soubor.','This browser cannot play the selected file.');
 q('qmExport').onclick=async()=>{
  if(!photo||recording)return;stop();recording=true;controls();const s=settings(),img=photo;
  const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const c=out.getContext('2d',{alpha:false});
  let stream,rec,raf=0,timeout=0;
  try{
   paint(out,c,img,0,s);stream=out.captureStream(30);
   const types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];const mime=types.find(x=>MediaRecorder.isTypeSupported(x));
   rec=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
   const chunks=[];
   await new Promise((resolve,reject)=>{
    rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    rec.onerror=()=>reject(Error('Recorder error'));rec.onstop=resolve;
    timeout=setTimeout(()=>reject(Error('Recorder timeout')),(s.duration+8)*1000);
    rec.start();const start=performance.now();
    const step=now=>{const elapsed=(now-start)/1000;paint(out,c,img,elapsed,s);if(elapsed<s.duration)raf=requestAnimationFrame(step);else if(rec.state!=='inactive')rec.stop()};
    raf=requestAnimationFrame(step);status('Probíhá lokální export – ponech stránku otevřenou.','Local export in progress — keep this page open.');
   });
   if(!chunks.length)throw Error('Empty recording');
   const type=rec.mimeType||chunks[0].type||'video/webm';
   if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(new Blob(chunks,{type}));
   const a=document.createElement('a');a.href=downloadURL;a.download='qa-camera-motion.'+(type.includes('mp4')?'mp4':'webm');a.click();status('Lokální video kamery připraveno ke stažení.','Local camera video ready to download.');
  }catch(e){console.warn('Motion export:',e);status('Export selhal nebo jej prohlížeč nepodporuje.','Export failed or is not supported in this browser.')}
  finally{clearTimeout(timeout);cancelAnimationFrame(raf);if(rec&&rec.state!=='inactive')try{rec.stop()}catch{};stream?.getTracks().forEach(x=>x.stop());recording=false;controls()}
 };
 function translate(){for(const el of section.querySelectorAll('[data-cs][data-en]'))el.textContent=t(el.dataset.cs,el.dataset.en)}
 window.addEventListener('qa:language',translate);
 window.addEventListener('qa:motion-mode',e=>{section.hidden=e.detail!=='motion';if(section.hidden){stop();q('qmVideo').pause()}});
 window.addEventListener('pagehide',()=>{stop();if(videoURL)URL.revokeObjectURL(videoURL);if(downloadURL)URL.revokeObjectURL(downloadURL)});
 translate();updatePrompt();drawStill();controls();return true;
}
function tick(){if(!mount()&&++tries<40)setTimeout(tick,250)}tick();
})();

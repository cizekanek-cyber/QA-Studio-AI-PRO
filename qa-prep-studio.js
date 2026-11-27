/* Local preparation studio — no network requests, AI credits, billing or cloud upload. */
(()=>{'use strict';
const t=(cz,en)=>{try{return localStorage.getItem('qa-studio-language')==='cs'?cz:en}catch{return en}};
const tracks=['image','motion','voice','sound','effects','video'];
const names={image:['Obrázky','Images'],motion:['Animace','Motion'],voice:['Hlas','Voice'],sound:['Hudba a zvuk','Music & sound'],effects:['Efekty','Effects'],video:['Video','Video']};
const label=k=>t(...names[k]);
const MAX=120;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||0));
// Local pitch/tempo processing. Align overlapping speech segments to reduce
// phase cancellation and avoid the metallic sound of unaligned grains.
function voiceDSP(input,sourceRate,semitones,tempo,effect,amount,volume,extra={}){
 const rate=32000,pitch=2**(clamp(semitones,-12,12)/12),speed=clamp(tempo,.65,1.5),mix=clamp(amount,0,1),gain=clamp(volume,0,1.5);
 const n=Math.max(1,Math.min(rate*120,Math.ceil(input.length/sourceRate/speed*rate))),data=new Float32Array(n);
 function sample(at){const i=Math.floor(at);if(i<0||i>=input.length)return 0;return input[i]+((input[i+1]||0)-input[i])*(at-i)}
 if(Math.abs(pitch-speed)<.0001){for(let i=0;i<n;i++)data[i]=sample(i*speed*sourceRate/rate)}
 else{
  const sourceStep=sourceRate/rate*pitch,shiftedLength=Math.max(1,Math.ceil(input.length/sourceStep)),shifted=new Float32Array(shiftedLength);
  for(let i=0;i<shiftedLength;i++)shifted[i]=sample(i*sourceStep);
  const grain=1024,hop=256,radius=160,searchStep=8,weights=new Float32Array(n),window=new Float32Array(grain);
  for(let j=0;j<grain;j++)window[j]=.5-.5*Math.cos(2*Math.PI*(j+.5)/grain);
  const analysisHop=hop*speed/pitch;let previous=-1;
  for(let start=0,frame=0;start<n;start+=hop,frame++){
   let pos=Math.min(shiftedLength-1,Math.max(0,Math.round(frame*analysisHop)));
   if(previous>=0&&pos<shiftedLength-grain){
    let refEnergy=0;for(let j=0;j<grain-hop;j+=8){const x=shifted[previous+hop+j]||0;refEnergy+=x*x}
    if(refEnergy>1e-7){
     let best=-Infinity,bestPos=pos;
     const low=Math.max(0,previous+1,pos-radius),high=Math.min(shiftedLength-grain,pos+radius);
     for(let c=low;c<=high;c+=searchStep){
      let cross=0,power=0;for(let j=0;j<grain-hop;j+=8){const a=shifted[previous+hop+j]||0,b=shifted[c+j]||0;cross+=a*b;power+=b*b}
      const score=cross/Math.sqrt(refEnergy*power+1e-18)-.002*Math.abs(c-pos)/radius;
      if(score>best){best=score;bestPos=c}
     }
     const center=bestPos;
     for(let c=Math.max(low,center-searchStep+1);c<=Math.min(high,center+searchStep-1);c++){
      let cross=0,power=0;for(let j=0;j<grain-hop;j+=8){const a=shifted[previous+hop+j]||0,b=shifted[c+j]||0;cross+=a*b;power+=b*b}
      const score=cross/Math.sqrt(refEnergy*power+1e-18)-.002*Math.abs(c-pos)/radius;
      if(score>best){best=score;bestPos=c}
     }
     pos=bestPos;
    }
   }
   previous=pos;
   for(let j=0;j<grain&&start+j<n&&pos+j<shiftedLength;j++){const w=window[j];data[start+j]+=shifted[pos+j]*w;weights[start+j]+=w}
  }
  for(let i=0;i<n;i++)data[i]/=Math.max(weights[i],1e-9);
 }
 let lp=0,slow=0,bassState=0,trebleState=0,gate=1;const rev=Math.round(rate*.071);const delay=Math.round(rate*.18),long=Math.round(rate*.31),hist=new Float32Array(long+1);
 for(let i=0;i<n;i++){const x=data[i],t=i/rate;let y=x;lp+=.17*(x-lp);slow+=.015*(x-slow);
 switch(effect){
 case 'ghost':y=x*.65+(i>=delay?hist[(i-delay)%hist.length]*.5:0);break;
 case 'witch':y=x*(.78+.22*Math.sin(2*Math.PI*7*t));break;
 case 'robot':y=x*(.15+.85*Math.cos(2*Math.PI*75*t));break;
 case 'monster':y=Math.tanh(3*(.55*x+.85*slow));break;
 case 'radio':y=Math.tanh(2.8*(lp-slow))*.9;break;
 case 'distort':y=Math.tanh(5*x);break;
 case 'alien':y=x*(.4+.6*Math.sin(2*Math.PI*(32*t+2*Math.sin(2*Math.PI*3*t))));break;
 case 'echo':y=x*.75+(i>=delay?hist[(i-delay)%hist.length]*.45:0)+(i>=long?hist[(i-long)%hist.length]*.25:0);break;
 case 'space':y=x*.65+(i>=delay?hist[(i-delay)%hist.length]*.35*Math.cos(2*Math.PI*2*t):0)+(i>=long?hist[(i-long)%hist.length]*.28:0);break;
 case 'double':{const d=Math.round(rate*.028);y=.62*x+(i>=d?hist[(i-d)%hist.length]*.38:0);break}
 case 'fairy':{const d=Math.round(rate*(.022+.006*Math.sin(2*Math.PI*1.7*t)));y=.8*x+(i>=d?hist[(i-d)%hist.length]*.25:0);break}
 case 'flutter':y=x*(.62+.38*Math.sin(2*Math.PI*5.5*t));break;
 case 'bubbly':{const d=Math.round(rate*.018);y=x*(.76+.18*Math.sin(2*Math.PI*6*t))+(i>=d?hist[(i-d)%hist.length]*.18:0);break}
 case 'softrobot':y=x*(.72+.28*Math.cos(2*Math.PI*24*t));break;
 case 'gentle':y=.94*x+.06*lp;break;
 case 'warm':y=.90*x+.10*lp;break;
 case 'bright':y=x+.10*(x-lp);break;
 }
 let z=x*(1-mix)+y*mix;z+=clamp(extra.echo,0,1)*(i>=delay?hist[(i-delay)%hist.length]*.5:0)+clamp(extra.reverb,0,1)*(i>=rev?hist[(i-rev)%hist.length]*.35:0);bassState+=.025*(z-bassState);trebleState+=.4*(z-trebleState);z+=clamp(extra.bass,-1,1)*bassState+clamp(extra.treble,-1,1)*(z-trebleState);const threshold=clamp(extra.noise,0,1)*.025;gate+=.02*((Math.abs(z)<threshold?.12:1)-gate);z*=gate;const d=clamp(extra.drive,0,1);z=z*(1-d)+Math.tanh(4*z)*d;hist[i%hist.length]=x;data[i]=clamp(z*gain,-1,1)}
 return {data,rate,len:n/rate};
}

let tries=0;
function mount(){
 const dock=document.getElementById('qaUnifiedDrawer');if(!dock)return false;if(document.getElementById('qaPrepStudio'))return true;
 const root=document.createElement('section');root.id='qaPrepStudio';root.hidden=true;root.dataset.quDrawer='prep';
 const style=document.createElement('style');style.textContent='#qaPrepStudio{background:#121b30;border:1px solid #665c9a;border-radius:16px;padding:14px;color:#fff}#qaPrepStudio [hidden]{display:none!important}#qaPrepStudio h2,#qaPrepStudio h3{margin:8px 0}#qaPrepStudio p{font-size:13px;color:#c7d0e4;line-height:1.5}#qaPrepStudio label{display:grid;gap:4px;margin:8px 0;font-size:13px}#qaPrepStudio input,#qaPrepStudio select,#qaPrepStudio textarea{width:100%;min-width:0;box-sizing:border-box;background:#202b46;color:#fff;border:1px solid #6b7194;border-radius:8px;padding:8px;font:inherit}#qaPrepStudio textarea{min-height:70px}#qaPrepStudio input[type=range]{padding:0;accent-color:#aa8aff}#qaPrepStudio button{color:#fff;background:#352653;border:1px solid #8573ad;padding:9px 12px;border-radius:9px;font:inherit;cursor:pointer}#qaPrepStudio button:disabled{opacity:.4}#qaPrepStudio canvas,#qaPrepStudio video{display:block;width:100%;max-height:40vh;object-fit:contain;background:#080c15;border-radius:10px}#qaPrepStudio .qpGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:8px}#qaPrepStudio .qpActions{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0}#qaPrepStudio .qpLane{display:grid;grid-template-columns:92px 1fr;gap:5px;align-items:center;margin:4px 0;font-size:11px}#qaPrepStudio .qpRail{height:30px;background:#202b46;position:relative;border-radius:5px;overflow:hidden}#qaPrepStudio .qpBlock{position:absolute;top:3px;height:24px;border-radius:4px;color:white;font-size:10px;overflow:hidden;white-space:nowrap;padding:4px;box-sizing:border-box}#qaPrepStudio .qpClip{border:1px solid #465374;border-radius:10px;padding:8px;margin:6px 0}';
 document.head.append(style);dock.append(root);
 const tr=(a,b)=>' data-cs="'+a+'" data-en="'+b+'"';
 const span=(a,b)=>'<span'+tr(a,b)+'></span>';
 const btn=(id,a,b)=>'<button type="button" id="'+id+'"'+tr(a,b)+'></button>';
 const field=(a,b,html)=>'<label>'+span(a,b)+html+'</label>';
 const opts=xs=>xs.map(([v,a,b])=>'<option value="'+v+'"'+tr(a,b)+'></option>').join('');
 root.innerHTML='<h2 id="qpTitle"></h2><p'+tr('Lokální úpravy v ceně aktivní licence. Bez dalších AI kreditů.','Local editing included in your active license. No additional AI credits.')+'></p>'+
 '<section id="qpImage" hidden>'+field('Vlastní obrázek','Your image','<input id="qpImageFile" type="file" accept="image/png,image/jpeg,image/webp">')+
 '<canvas id="qpImageCanvas" width="640" height="360"></canvas><div class="qpGrid">'+
 field('Jas','Brightness','<input id="qpBright" type="range" min="40" max="160" value="100">')+field('Kontrast','Contrast','<input id="qpContrast" type="range" min="40" max="160" value="100">')+field('Sytost','Saturation','<input id="qpSat" type="range" min="0" max="200" value="100">')+
 field('Otočení','Rotation','<select id="qpRotate"><option>0</option><option>90</option><option>180</option><option>270</option></select>')+
 field('Formát','Aspect ratio','<select id="qpRatio">'+opts([['original','Originál','Original'],['16:9','16:9','16:9'],['9:16','9:16','9:16'],['1:1','1:1','1:1']])+'</select>')+'</div><div class="qpActions">'+btn('qpScene','Převzít plátno editoru','Use editor canvas')+btn('qpSaveImage','Uložit PNG','Save PNG')+btn('qpImageClip','Přidat obrázek na osu','Add image to timeline')+'</div></section>'+
 '<section id="qpSound" hidden>'+field('Vlastní zvuk nebo hudba','Your audio or music','<input id="qpAudioFile" type="file" accept="audio/*">')+
 '<div class="qpGrid">'+field('Lokální zvukový efekt','Local sound effect','<select id="qpTone">'+opts([['sine','Jemný tón','Soft tone'],['triangle','Trojúhelníkový tón','Triangle tone'],['noise','Šum','Noise']])+'</select>')+
 field('Frekvence (Hz)','Frequency (Hz)','<input id="qpHz" type="number" min="60" max="2000" value="440">')+
 field('Hlasitost (%)','Volume (%)','<input id="qpGain" type="range" min="0" max="100" value="50">')+
 field('Začátek zdroje (s)','Source offset (s)','<input id="qpOffset" type="number" min="0" max="120" step=".1" value="0">')+
 field('Délka (s)','Duration (s)','<input id="qpSoundLen" type="number" min=".2" max="30" step=".1" value="5">')+'</div><p id="qpAudioInfo"></p><div class="qpActions">'+btn('qpSoundPlay','Poslechnout zvuk','Preview sound')+btn('qpSoundStop','Zastavit zvuk','Stop sound')+btn('qpSoundSave','Uložit WAV','Save WAV')+btn('qpSoundClip','Přidat na osu','Add to timeline')+'</div></section>'+
 '<section id="qpVoice" hidden>'+field('Text pro dabing','Voiceover text','<textarea id="qpSpeech" maxlength="1500"></textarea>')+
 '<div class="qpGrid">'+field('Hlas zařízení','Device voice','<select id="qpVoiceChoice"></select>')+field('Tempo','Rate','<input id="qpRate" type="range" min=".5" max="2" step=".1" value="1">')+
 field('Výška hlasu','Pitch','<input id="qpPitch" type="range" min=".5" max="2" step=".1" value="1">')+field('Emoce a styl AI hlasu','AI voice emotion and style','<input id="qpEmotion" maxlength="200">')+'</div>'+
 '<p'+tr('Náhled používá hlas zařízení, nikoli AI klon nebo výsledný dabing. Vlastní namluvenou stopu lze vložit na časovou osu.','Preview uses a device voice, not an AI clone or final dubbing. Import your recorded voice onto the timeline.')+'></p><div class="qpActions">'+btn('qpSpeak','Poslechnout text','Preview speech')+btn('qpSpeechStop','Zastavit hlas','Stop speech')+'</div>'+
 field('Vlastní nahrávka hlasu','Your voice recording','<input id="qpVoiceFile" type="file" accept="audio/*">')+
 '<div class="qpActions">'+btn('qpVoiceRecord','● Nahrát mikrofon','● Record microphone')+btn('qpVoiceRecordStop','■ Ukončit nahrávku','■ Finish recording')+'</div><p id="qpRecordState" role="status"></p><h3'+tr('Změna hlasu a zábavné efekty','Voice changer and funny effects')+'></h3><p'+tr('Nahraj zvuk a vyber efekt. Výška a tempo mají samostatné ovladače. Úpravy jsou lokální a bez AI kreditů.','Import audio and choose an effect. Pitch and tempo have separate controls. Local editing uses no AI credits.')+'></p><p id="qpVoiceInfo"></p><div class="qpGrid">'+
 '<div id="qpVoiceTiles" class="qpGrid" style="grid-column:1/-1"></div><strong style="grid-column:1/-1"'+tr('Roztomilé a vtipné hlasy · posuň do strany','Cute and funny voices · swipe sideways')+'></strong><div id="qpVoiceMoreTiles" class="qpGrid" style="grid-column:1/-1"></div>'+field('Předvolba','Preset','<select id="qpVoicePreset">'+opts([['normal','Přirozený','Natural'],['cat','Kočičí','Cat'],['child','Dětský','Child'],['cute','Roztomilý vysoký','Cute high'],['chip','Veverka','Chipmunk'],['comic','Komický','Comic'],['kitten','Koťátko','Kitten'],['puppy','Štěňátko','Puppy'],['bunny','Zajíček','Bunny'],['hamster','Křeček','Hamster'],['duckling','Káčátko','Duckling'],['frog','Žabáček','Little frog'],['fairy','Víla','Fairy'],['goblin','Skřítek','Goblin'],['teddy','Plyšáček','Teddy bear'],['baby_dragon','Malý dráček','Baby dragon'],['cute_robot','Roztomilý robůtek','Cute robot'],['baby_alien','Mimozemské miminko','Baby alien']])+'</select>')+
 field('Výška nahrávky (půltóny)','Recording pitch (semitones)','<input id="qpVoiceShift" type="range" min="-12" max="12" step="1" value="0"><output id="qpVoiceShiftValue">0</output>')+
 field('Rychlost nahrávky','Recording tempo','<input id="qpVoiceTempo" type="range" min=".65" max="1.5" step=".05" value="1"><output id="qpVoiceTempoValue">1×</output>')+
 field('Intenzita efektu','Effect intensity','<input id="qpVoiceMix" type="range" min="0" max="100" value="70"><output id="qpVoiceMixValue">70%</output>')+
 field('Hlasitost nahrávky','Recording volume','<input id="qpVoiceVolume" type="range" min="0" max="150" value="100"><output id="qpVoiceVolumeValue">100%</output>')+
 '</div><details><summary'+tr('Další zvukové efekty','Additional audio effects')+'></summary><div class="qpGrid">'+[['Echo','Ozvěna','Echo',0],['Reverb','Dozvuk','Reverb',0],['Bass','Basy','Bass',-100],['Treble','Výšky','Treble',-100],['Noise','Potlačení tichého šumu','Noise gate',0],['Drive','Zkreslení','Distortion',0]].map(([id,a,b,min])=>field(a,b,'<input id="qpFx'+id+'" type="range" min="'+min+'" max="100" value="0"><output id="qpFx'+id+'Value">0%</output>')).join('')+'</div></details><p id="qpVoiceAllowance" role="status" aria-live="polite"></p><div class="qpActions">'+btn('qpVoiceOriginal','▶ Originál','▶ Original')+btn('qpVoicePreview','▶ Upravený hlas','▶ Edited voice')+btn('qpVoiceStop','■ Stop','■ Stop')+btn('qpVoiceReset','Obnovit','Reset')+btn('qpVoiceSave','Uložit WAV','Save WAV')+btn('qpVoiceClip','Přidat hlas na osu','Add voice to timeline')+'<button id="qpVoiceUpgrade" type="button" hidden'+tr('Zobrazit PRO / VIP','View PRO / VIP')+'></button></div></section>'+
 '<section id="qpVideo" hidden>'+field('Přidat vlastní video','Add your video','<input id="qpVideoFile" type="file" accept="video/mp4,video/webm">')+
 '<p'+tr('Na ose upravíš začátky, délky a hlasitost. Obrazová stopa nahoře má při překryvu přednost; audio stopy hrají společně.','Edit starts, lengths and volume on the timeline. The upper-priority visual clip wins overlaps; audio tracks play together.')+'></p></section>'+
 field('Zadání pro finální AI – styl, scéna a požadavky','Final AI instructions — style, scene and requirements','<textarea id="qpPrompt" maxlength="1500"></textarea>')+
 '<div class="qpActions">'+btn('qpCopy','Kopírovat AI zadání','Copy AI instructions')+btn('qpSpec','Uložit plán projektu JSON','Save project plan JSON')+'</div>'+
 '<h3'+tr('Společná časová osa','Shared timeline')+'></h3><p'+tr('Lokální náhled a střih; soubory zůstávají v tomto otevřeném editoru. JSON obsahuje plán, ne samotná média.','Local preview and trim; media stays in this open editor. JSON contains the plan, not the media.')+'></p>'+
 '<canvas id="qpPreview" width="640" height="360"></canvas><video id="qpPlayer" playsinline hidden></video>'+
 '<div class="qpActions">'+btn('qpPlay','▶ Přehrát osu','▶ Play timeline')+btn('qpPause','■ Zastavit','■ Stop')+'</div>'+
 '<label><span id="qpTime">0.0 / 30 s</span><input id="qpSeek" type="range" min="0" max="30" step=".1" value="0"></label><div id="qpLanes"></div><div id="qpClips"></div><p id="qpStatus" role="status" aria-live="polite"></p>';
 const q=id=>root.querySelector('#'+id);
 // Compact workspace: shared preview and timeline stay mounted while tools switch.
 const workspace=document.createElement('div');workspace.className='qpWorkspace';
 const stage=document.createElement('div');stage.className='qpStage';
 const tools=document.createElement('nav');tools.className='qpToolNav';
 const panel=document.createElement('div');panel.className='qpToolPanel';
 const timeline=document.createElement('div');timeline.className='qpTimeline';
 const prompt=document.createElement('details');prompt.className='qpProjectDetails';
 const summary=document.createElement('summary');summary.dataset.cs='AI zadání a plán';summary.dataset.en='AI instructions and plan';prompt.append(summary);
 const help=document.createElement('details');help.className='qpProjectDetails';const helpSummary=document.createElement('summary');helpSummary.dataset.cs='Nápověda';helpSummary.dataset.en='Help';help.append(helpSummary);
 for(const section of ['qpVoice','qpVideo'])for(const p of q(section).querySelectorAll('p[data-cs][data-en]'))help.append(p);
 const presetLabel=q('qpVoicePreset').parentElement;presetLabel.hidden=true;
 const speechDetails=document.createElement('details');const speechSummary=document.createElement('summary');speechSummary.dataset.cs='Text na řeč';speechSummary.dataset.en='Text to speech';speechDetails.append(speechSummary,q('qpSpeech').parentElement,q('qpVoiceChoice').parentElement.parentElement,q('qpSpeak').parentElement);q('qpVoice').append(speechDetails);
 const nodes=Array.from(root.children);const previewNode=q('qpPreview'),videoNode=q('qpPlayer');
 stage.append(previewNode,videoNode,q('qpPlay').parentElement,q('qpSeek').parentElement);
 for(const id of ['qpImage','qpSound','qpVoice','qpVideo'])panel.append(q(id));
 prompt.append(q('qpPrompt').parentElement,q('qpCopy').parentElement);
 const lanes=q('qpLanes'),clipList=q('qpClips');timeline.append(lanes);
 const clipDetails=document.createElement('details');const clipSummary=document.createElement('summary');clipSummary.dataset.cs='Střih a nastavení klipů';clipSummary.dataset.en='Trim and clip settings';clipDetails.append(clipSummary,clipList);timeline.append(clipDetails);
 const tabs=[['image','▧','Obrázky','Images'],['video','▶','Video','Video'],['voice','🎙','Hlas','Voice'],['sound','♫','Zvuk','Sound'],['motion','✦','Animace','Motion']];
 for(const [key,icon,cs,en] of tabs){const b=document.createElement('button');b.type='button';b.dataset.tool=key;b.dataset.cs=icon+' '+cs;b.dataset.en=icon+' '+en;b.onclick=()=>window.qaOpenEditorMode?.(key);tools.append(b)}
 workspace.append(stage,timeline,tools,panel,prompt,help,q('qpStatus'));root.replaceChildren(workspace);
 style.textContent+=`
 #qaPrepStudio{background:#0e1016;border-color:#806336;padding:8px;border-radius:12px}
 #qaPrepStudio .qpWorkspace{display:grid;gap:8px;min-width:0}
 #qaPrepStudio .qpStage{background:#08090c;border:1px solid #59472b;border-radius:10px;padding:6px}
 #qaPrepStudio .qpStage canvas,#qaPrepStudio .qpStage video{max-height:30vh;aspect-ratio:16/9}
 #qaPrepStudio .qpStage label{margin:2px 0}
 #qaPrepStudio .qpToolNav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;position:sticky;bottom:0;z-index:5;background:#111217;padding:5px 0}
 #qaPrepStudio .qpToolNav button{padding:8px 2px;font-size:11px;background:#1c1d24;border-color:#59472b}
 #qaPrepStudio .qpToolNav button[aria-pressed=true]{background:#49391f;color:#ffe0a0;border-color:#d1a85e}
 #qaPrepStudio .qpToolPanel{min-width:0;background:#15171e;border-radius:10px;padding:8px}
 #qaPrepStudio .qpToolPanel .qpGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
 #qaPrepStudio #qpVoiceTiles,#qaPrepStudio #qpVoiceMoreTiles{display:flex!important;overflow-x:auto;gap:5px;scroll-snap-type:x proximity;padding:3px 0} #qaPrepStudio #qpVoiceTiles button,#qaPrepStudio #qpVoiceMoreTiles button{font-size:12px;padding:8px;flex:0 0 auto;scroll-snap-align:start;white-space:nowrap}
 #qaPrepStudio .qpTimeline{background:#14151b;padding:6px;border-radius:8px}
 #qaPrepStudio .qpLane{grid-template-columns:76px 1fr}
 #qaPrepStudio .qpRail{height:24px}
 #qaPrepStudio .qpBlock{height:18px;padding:2px}
 #qaPrepStudio button{background:#252119;border-color:#8b7045;padding:7px 9px}
 #qaPrepStudio input,#qaPrepStudio select,#qaPrepStudio textarea{background:#202127;border-color:#635438;padding:6px}
 #qaPrepStudio details summary{cursor:pointer;color:#e8c88d;font-size:13px;padding:6px}
 #qaPrepStudio .qpActions{margin:4px 0;gap:5px}
 #qaPrepStudio label{margin:4px 0}
 #qaPrepStudio p{margin:4px 0}
 `;
const status=(a,b)=>{q('qpStatus').textContent=t(a,b)};
 let mode='image',image=null,sourceAudio=null,audioContext=null,soundNode=null,soundSeq=0,clips=[],nextId=1,frame=0,running=false,position=0,started=0,visualId=null,voiceList=[];
 const colors={image:'#7c3aed',motion:'#2563eb',voice:'#be185d',sound:'#047857',effects:'#b45309',video:'#0e7490'};
 const cv=q('qpImageCanvas'),cx=cv.getContext('2d'),preview=q('qpPreview'),px=preview.getContext('2d'),player=q('qpPlayer');
 function redraw(){if(!image)return;const rotate=Number(q('qpRotate').value),swap=rotate%180!==0;let w=swap?image.naturalHeight:image.naturalWidth,h=swap?image.naturalWidth:image.naturalHeight;let ratio=q('qpRatio').value;if(ratio!=='original'){const [a,b]=ratio.split(':').map(Number);if(w/h>a/b)w=h*a/b;else h=w*b/a}const s=Math.min(1,1920/Math.max(w,h));cv.width=Math.max(1,Math.round(w*s));cv.height=Math.max(1,Math.round(h*s));cx.save();cx.translate(cv.width/2,cv.height/2);cx.rotate(rotate*Math.PI/180);cx.filter='brightness('+q('qpBright').value+'%) contrast('+q('qpContrast').value+'%) saturate('+q('qpSat').value+'%)';const scale=Math.max(cv.width/(swap?image.naturalHeight:image.naturalWidth),cv.height/(swap?image.naturalWidth:image.naturalHeight));cx.drawImage(image,-image.naturalWidth*scale/2,-image.naturalHeight*scale/2,image.naturalWidth*scale,image.naturalHeight*scale);cx.restore()}
 let imgSeq=0;
 function loadImage(blob){const seq=++imgSeq,url=URL.createObjectURL(blob),im=new Image();im.onload=()=>{URL.revokeObjectURL(url);if(seq!==imgSeq)return;if(im.naturalWidth*im.naturalHeight>40000000){status('Obrázek je příliš velký.','Image too large.');return}image=im;redraw();status('Obrázek připraven.','Image ready.')};im.onerror=()=>{URL.revokeObjectURL(url);status('Obrázek nelze otevřít.','Cannot open image.')};im.src=url}
 q('qpImageFile').onchange=()=>{const f=q('qpImageFile').files[0];if(f&&f.size<=20*1024*1024&&/^image\/(png|jpeg|webp)$/.test(f.type))loadImage(f);else if(f)status('Použij PNG, JPG nebo WebP do 20 MB.','Use PNG, JPG or WebP up to 20 MB.')};
 q('qpScene').onclick=()=>{try{document.getElementById('qslCanvas').toBlob(b=>{if(b)loadImage(b);else status('Plátno nelze převzít.','Cannot read canvas.')},'image/png')}catch{status('Plátno nelze převzít.','Cannot read canvas.')}};
 for(const id of ['qpBright','qpContrast','qpSat','qpRotate','qpRatio'])q(id).oninput=redraw;
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 q('qpSaveImage').onclick=()=>{if(image)cv.toBlob(b=>{if(b)download(b,'qa-prepared-image.png')},'image/png')};
 q('qpImageClip').onclick=()=>{if(image)cv.toBlob(b=>{if(b)addFile('image',b,'Image.png')},'image/png')};
 function getAudio(){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Audio unavailable');return audioContext||(audioContext=new C())}
 q('qpAudioFile').onchange=async()=>{const f=q('qpAudioFile').files[0];if(!f)return;if(f.size>30*1024*1024){status('Zvuk max. 30 MB.','Audio max. 30 MB.');return}sourceAudio=null;try{const data=await getAudio().decodeAudioData(await f.arrayBuffer());sourceAudio=data;q('qpAudioInfo').textContent=f.name+' · '+data.duration.toFixed(1)+' s';q('qpOffset').value=0}catch{status('Zvuk nelze dekódovat.','Cannot decode audio.')}};
 function soundBuffer(){const rate=22050,len=clamp(q('qpSoundLen').value,.2,30),gain=clamp(q('qpGain').value,0,100)/100,offset=clamp(q('qpOffset').value,0,MAX),count=Math.ceil(len*rate),data=new Float32Array(count);const src=sourceAudio;const channels=src?Array.from({length:src.numberOfChannels},(_,i)=>src.getChannelData(i)):[];const hz=clamp(q('qpHz').value,60,2000),wave=q('qpTone').value;for(let i=0;i<count;i++){const time=i/rate;let v=0;if(src){const j=Math.floor((offset+time)*src.sampleRate);if(j<src.length)for(const c of channels)v+=c[j]/channels.length}else{const phase=time*hz*2*Math.PI;v=wave==='noise'?(Math.random()*2-1)*.35:wave==='triangle'?2/Math.PI*Math.asin(Math.sin(phase)):Math.sin(phase);v*=Math.min(1,time/.02,(len-time)/.02)}data[i]=v*gain}return {data,rate,len}}
 function wav(s){const b=new ArrayBuffer(44+s.data.length*2),v=new DataView(b);const str=(o,a)=>{for(let i=0;i<a.length;i++)v.setUint8(o+i,a.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,b.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,s.rate,true);v.setUint32(28,s.rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,s.data.length*2,true);for(let i=0;i<s.data.length;i++)v.setInt16(44+i*2,Math.round(clamp(s.data[i],-1,1)*32767),true);return new Blob([b],{type:'audio/wav'})}
 function stopSound(){soundSeq++;if(soundNode)try{soundNode.stop()}catch{}soundNode=null}
 q('qpSoundPlay').onclick=async()=>{stopSound();const seq=soundSeq;try{const ac=getAudio();await ac.resume();if(seq!==soundSeq)return;const s=soundBuffer(),b=ac.createBuffer(1,s.data.length,s.rate);b.copyToChannel(s.data,0);soundNode=ac.createBufferSource();soundNode.buffer=b;soundNode.connect(ac.destination);soundNode.start()}catch{status('Zvukový náhled není dostupný.','Audio preview unavailable.')}};
 q('qpSoundStop').onclick=stopSound;q('qpSoundSave').onclick=()=>download(wav(soundBuffer()),'qa-prepared-sound.wav');q('qpSoundClip').onclick=()=>{const s=soundBuffer();addFile(sourceAudio?'sound':'effects',wav(s),'Sound.wav',s.len)};
 function voices(){const sel=q('qpVoiceChoice'),old=sel.value;voiceList=(window.speechSynthesis?.getVoices()||[]).filter(v=>v.localService);sel.replaceChildren();for(let i=0;i<voiceList.length;i++){const o=document.createElement('option');o.value=i;o.textContent=voiceList[i].name+' · '+voiceList[i].lang;sel.append(o)}if(old&&Number(old)<voiceList.length)sel.value=old}
 function cancelVoice(){window.speechSynthesis?.cancel()}
 if(window.speechSynthesis){voices();window.speechSynthesis.addEventListener?.('voiceschanged',voices)}
 q('qpSpeak').onclick=()=>{if(!window.speechSynthesis||!window.SpeechSynthesisUtterance||!voiceList.length){status('Hlas zařízení není dostupný.','Device speech unavailable.');return}cancelVoice();const u=new SpeechSynthesisUtterance(q('qpSpeech').value);u.voice=voiceList[Number(q('qpVoiceChoice').value)]||null;if(u.voice)u.lang=u.voice.lang;u.rate=Number(q('qpRate').value);u.pitch=Number(q('qpPitch').value);speechSynthesis.speak(u)};
 q('qpSpeechStop').onclick=cancelVoice;
 const fileChange=(id,track)=>q(id).onchange=()=>{const f=q(id).files[0];if(f)addFile(track,f,f.name);q(id).value=''};
 let voiceInput=null,voiceLoad=0,voiceCache=null,voiceSaving=false,voiceRequestId=null,voiceAllowance=null,voiceStatusSeq=0;
 const presets={normal:[0,1,'none'],cat:[3,1,'gentle'],child:[3,1,'bright'],cute:[3,1.05,'warm'],chip:[6,1.1,'bright'],comic:[4,1.1,'warm'],kitten:[4,1,'gentle'],puppy:[3,1.05,'gentle'],bunny:[5,1.05,'warm'],hamster:[6,1.05,'bright'],duckling:[5,1.1,'bright'],frog:[2,1,'warm'],fairy:[4,.95,'bright'],goblin:[3,1.1,'gentle'],teddy:[1,.95,'warm'],baby_dragon:[2,1.05,'warm'],cute_robot:[4,1.05,'gentle'],baby_alien:[5,1,'bright']};
 const newPresetIds=new Set(['kitten','puppy','bunny','hamster','duckling','frog','fairy','goblin','teddy','baby_dragon','cute_robot','baby_alien']);
 const fxIds=['Echo','Reverb','Bass','Treble','Noise','Drive'];const icons={normal:'🎙️',cat:'🐱',child:'👶',cute:'💗',chip:'🐿️',comic:'😂',kitten:'🐱',puppy:'🐶',bunny:'🐰',hamster:'🐹',duckling:'🐥',frog:'🐸',fairy:'🧚',goblin:'🧝',teddy:'🧸',baby_dragon:'🐉',cute_robot:'🤖',baby_alien:'👽'};function voiceTiles(){const boxes=[q('qpVoiceTiles'),q('qpVoiceMoreTiles')],scroll=boxes.map(box=>box.scrollLeft);for(const box of boxes)box.replaceChildren();for(const o of q('qpVoicePreset').options){const b=document.createElement('button');b.type='button';b.textContent=(icons[o.value]||'🎵')+' '+o.textContent;b.setAttribute('aria-pressed',String(o.selected));if(o.selected)b.style.borderColor='#e5bf65';b.onclick=()=>{q('qpVoicePreset').value=o.value;choosePreset()};boxes[newPresetIds.has(o.value)?1:0].append(b)}boxes.forEach((box,i)=>{box.scrollLeft=scroll[i]})}
 function voiceSettings(){return {extra:Object.fromEntries(fxIds.map(id=>[id.toLowerCase(),Number(q('qpFx'+id).value)/100])),pitch:Number(q('qpVoiceShift').value),tempo:Number(q('qpVoiceTempo').value),effect:(presets[q('qpVoicePreset').value]||presets.normal)[2],amount:Number(q('qpVoiceMix').value)/100,volume:Number(q('qpVoiceVolume').value)/100}}
 function voiceLabels(){for(const [id,suffix] of [['Shift',''],['Tempo','×'],['Mix','%'],['Volume','%']])q('qpVoice'+id+'Value').textContent=q('qpVoice'+id).value+suffix;for(const id of ['Original','Preview','Stop','Save','Clip'])q('qpVoice'+id).disabled=!voiceInput||(id==='Save'&&voiceSaving)}
 for(const id of fxIds)q('qpFx'+id).oninput=()=>{voiceCache=null;q('qpFx'+id+'Value').textContent=q('qpFx'+id).value+'%'};
 function choosePreset(){stopSound();const [p,t]=presets[q('qpVoicePreset').value]||presets.normal;q('qpVoiceShift').value=p;q('qpVoiceTempo').value=t;q('qpVoiceMix').value=60;for(const id of fxIds){q('qpFx'+id).value=0;q('qpFx'+id+'Value').textContent='0%'}voiceCache=null;voiceLabels();voiceTiles()}
 q('qpVoicePreset').onchange=choosePreset;for(const id of ['Shift','Tempo','Mix','Volume'])q('qpVoice'+id).oninput=()=>{voiceCache=null;voiceLabels()};
 q('qpVoiceReset').onclick=()=>{stopSound();q('qpVoicePreset').value='normal';q('qpVoiceVolume').value=100;for(const id of fxIds){q('qpFx'+id).value=0;q('qpFx'+id).oninput()}choosePreset()};
 async function loadVoiceFile(file){if(!file)return;const seq=++voiceLoad;stopSound();voiceInput=null;voiceCache=null;voiceLabels();if(file.size>30*1024*1024){status('Maximální velikost je 30 MB.','Maximum file size is 30 MB.');return}try{const buffer=await getAudio().decodeAudioData(await file.arrayBuffer());if(seq!==voiceLoad)return;if(buffer.duration>60){status('Použij nahrávku do 60 sekund.','Use a recording up to 60 seconds.');return}const mono=new Float32Array(buffer.length);for(let c=0;c<buffer.numberOfChannels;c++){const channel=buffer.getChannelData(c);for(let i=0;i<mono.length;i++)mono[i]+=channel[i]/buffer.numberOfChannels}voiceInput={data:mono,rate:buffer.sampleRate,len:buffer.duration};q('qpVoiceInfo').textContent=file.name+' · '+buffer.duration.toFixed(1)+' s';voiceLabels();status('Hlas připraven k úpravě.','Voice ready to edit.')}catch{if(seq===voiceLoad)status('Nahrávku nelze otevřít.','Cannot open recording.')}}
 q('qpVoiceFile').onchange=()=>loadVoiceFile(q('qpVoiceFile').files[0]);
 let recorder=null,micStream=null,micTimer=0,micRequest=false;
 q('qpVoiceRecordStop').disabled=true;
 function finishRecording(discard=false){clearTimeout(micTimer);if(recorder&&recorder.state!=='inactive'){if(discard)recorder.onstop=()=>{};try{recorder.stop()}catch{}}micStream?.getTracks().forEach(x=>x.stop());micStream=null;q('qpVoiceRecord').disabled=false;q('qpVoiceRecordStop').disabled=true}
 q('qpVoiceRecord').onclick=async()=>{if(micRequest||recorder?.state==='recording')return;if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('Mikrofon není v tomto prohlížeči dostupný.','Microphone unavailable in this browser.');return}micRequest=true;q('qpVoiceRecord').disabled=true;stop();stopSound();cancelVoice();try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(root.hidden||mode!=='voice'){stream.getTracks().forEach(x=>x.stop());q('qpVoiceRecord').disabled=false;return}micStream=stream;const type=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(x=>MediaRecorder.isTypeSupported(x));recorder=type?new MediaRecorder(stream,{mimeType:type}):new MediaRecorder(stream);const rec=recorder,chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});q('qpRecordState').textContent=t('Nahrávka dokončena.','Recording finished.');if(blob.size)void loadVoiceFile(new File([blob],'Microphone recording',{type:blob.type}))};rec.onerror=()=>{finishRecording(true);status('Nahrávání selhalo.','Recording failed.')};rec.start(250);q('qpVoiceRecordStop').disabled=false;q('qpRecordState').textContent=t('Nahrávám… max. 55 sekund.','Recording… max. 55 seconds.');micTimer=setTimeout(()=>finishRecording(),55000)}catch{finishRecording(true);status('Mikrofon není povolen nebo dostupný.','Microphone permission denied or unavailable.')}finally{micRequest=false}};
 q('qpVoiceRecordStop').onclick=()=>finishRecording();
 function processedVoice(){if(!voiceInput)return null;if(!voiceCache){const v=voiceSettings();voiceCache=voiceDSP(voiceInput.data,voiceInput.rate,v.pitch,v.tempo,v.effect,v.amount,v.volume,v.extra)}return voiceCache}
 async function listenVoice(original){if(!voiceInput)return;stop();stopSound();cancelVoice();const seq=soundSeq;try{const ac=getAudio();await ac.resume();if(seq!==soundSeq)return;const s=original?voiceInput:processedVoice();if(!s)return;const b=ac.createBuffer(1,s.data.length,s.rate);b.copyToChannel(s.data,0);soundNode=ac.createBufferSource();soundNode.buffer=b;soundNode.connect(ac.destination);soundNode.start()}catch{status('Náhled hlasu není dostupný.','Voice preview unavailable.')}}
 q('qpVoiceOriginal').onclick=()=>listenVoice(true);q('qpVoicePreview').onclick=()=>listenVoice(false);q('qpVoiceStop').onclick=stopSound;
 function showVoiceAllowance(info){voiceAllowance=info;const el=q('qpVoiceAllowance');q('qpVoiceUpgrade').hidden=!(info&&!info.allowed&&info.sales_active);if(!info){el.textContent=t('Stav stažení se nepodařilo ověřit.','Download access could not be checked.');return}if(info.unlimited)el.textContent=t('Aktivní přístup: stažení hlasů bez limitu.','Active access: unlimited voice downloads.');else if(!info.sales_active)el.textContent=t('Zkušební provoz: '+info.remaining+' ze 3 zkušebních stažení zbývá. Další jsou zatím zdarma; PRO/VIP se připravuje.','Beta: '+info.remaining+' of 3 trial downloads remain. Further downloads are currently free; PRO/VIP is not yet available.');else if(info.remaining>0)el.textContent=t('Zbývá '+info.remaining+' ze 3 bezplatných stažení. Potom je potřeba PRO nebo VIP.','You have '+info.remaining+' of 3 free downloads left. After that, PRO or VIP is required.');else el.textContent=t('Tři bezplatná stažení jsou vyčerpána. Pro další stažení aktivuj PRO nebo VIP.','Three free downloads have been used. Activate PRO or VIP to download again.')}
 async function refreshVoiceAllowance(){const seq=++voiceStatusSeq;try{const info=await window.QAVoiceAccess.status();if(seq===voiceStatusSeq)showVoiceAllowance(info)}catch{if(seq===voiceStatusSeq)showVoiceAllowance(null)}}
 function nextVoiceRequestId(){if(window.crypto?.randomUUID)return window.crypto.randomUUID();if(!window.crypto?.getRandomValues)throw Error('secure_random_unavailable');const b=window.crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}
 q('qpVoiceSave').onclick=async()=>{if(voiceSaving||!voiceInput)return;voiceSaving=true;voiceStatusSeq++;voiceLabels();try{const s=processedVoice();if(!s)return;const blob=wav(s);voiceRequestId=voiceRequestId||nextVoiceRequestId();let info;try{info=await window.QAVoiceAccess.consume(voiceRequestId)}catch(e){if(await window.qaCheckEditorAccess?.()===true)info={allowed:true,unlimited:true,remaining:null,sales_active:false};else throw e}voiceRequestId=null;showVoiceAllowance(info);if(info.allowed)download(blob,'qa-edited-voice.wav');else status('Bezplatná stažení jsou vyčerpána.','Free downloads have been used.')}catch(e){status(e?.code==='authentication_required'?'Pro uložení se přihlas.':'Stažení nelze nyní ověřit. Zkus to znovu.','Unable to verify download. Please try again.')}finally{voiceSaving=false;voiceLabels()}};
 q('qpVoiceUpgrade').onclick=()=>document.querySelector('.nav [data-tab="qaPlansPanel"]')?.click();
 q('qpVoiceClip').onclick=()=>{const s=processedVoice();if(s)addFile('voice',wav(s),'Edited voice.wav',s.len)};
 voiceLabels();fileChange('qpVideoFile','video');
 function duration(){return Math.min(MAX,Math.max(30,...clips.map(c=>c.start+c.len)))}
 function addFile(track,file,name,known){
  if(clips.length>=24||file.size>60*1024*1024){status('Max. 24 klipů a 60 MB na soubor.','Max 24 clips and 60 MB per file.');return}
  const isImg=track==='image',isVideo=track==='video'||track==='motion';
  if(!(isImg?file.type.startsWith('image/'):isVideo?file.type.startsWith('video/'):file.type.startsWith('audio/'))){status('Nepodporovaný typ souboru.','Unsupported file type.');return}
  const url=URL.createObjectURL(file),el=isImg?new Image():document.createElement(isVideo?'video':'audio');const clip={id:nextId++,track,name,url,el,start:0,len:5,offset:0,volume:1,source:5,ready:false};clips.push(clip);
  const ready=()=>{if(!clips.includes(clip))return;const d=isImg?MAX:known||el.duration;if(!Number.isFinite(d)||d<=0){remove(clip.id);status('Délku souboru nelze načíst.','Cannot read media duration.');return}clip.source=d;clip.len=Math.min(isImg?5:d,30);clip.ready=true;render()};
  if(isImg)el.onload=ready;else{el.preload='metadata';el.playsInline=true;el.onloadedmetadata=ready}
  el.onerror=()=>{remove(clip.id);status('Médium nelze otevřít.','Cannot open media.')};el.src=url;render();
 }
 window.addEventListener('qa:motion-import',e=>{if(e.detail?.file)addFile('motion',e.detail.file,e.detail.file.name||'Motion.webm',e.detail.duration)});
 function remove(id){stop();const c=clips.find(x=>x.id===id);if(!c)return;c.el.pause?.();URL.revokeObjectURL(c.url);clips=clips.filter(x=>x!==c);render()}
 function render(){const d=duration();q('qpSeek').max=d;position=Math.min(position,d);q('qpSeek').value=position;clock();const lanes=q('qpLanes');lanes.replaceChildren();for(const track of tracks){const lane=document.createElement('div');lane.className='qpLane';const title=document.createElement('span');title.textContent=label(track);const rail=document.createElement('div');rail.className='qpRail';for(const c of clips.filter(x=>x.track===track)){const b=document.createElement('div');b.className='qpBlock';b.style.cssText='left:'+c.start/d*100+'%;width:'+c.len/d*100+'%;background:'+colors[track];b.textContent=c.name;rail.append(b)}lane.append(title,rail);lanes.append(lane)}
  const list=q('qpClips');list.replaceChildren();for(const c of clips){const item=document.createElement('div');item.className='qpClip';const title=document.createElement('strong');title.textContent=label(c.track)+' · '+c.name;item.append(title);const grid=document.createElement('div');grid.className='qpGrid';for(const [key,a,b,min,max,step] of [['start','Start na ose (s)','Timeline start (s)',0,MAX-.2,.1],['offset','Začátek zdroje (s)','Source start (s)',0,Math.max(0,c.source-.2),.1],['len','Délka (s)','Length (s)',.2,Math.min(MAX,c.source),.1],['volume','Hlasitost','Volume',0,1,.1]]){if(c.track==='image'&&['offset','volume'].includes(key))continue;const l=document.createElement('label');l.textContent=t(a,b);const inp=document.createElement('input');inp.type='number';inp.min=min;inp.max=max;inp.step=step;inp.value=Number(c[key].toFixed(2));inp.disabled=!c.ready;inp.onchange=()=>{stop();c[key]=clamp(inp.value,min,max);c.len=Math.max(.2,Math.min(c.len,MAX-c.start,c.source-c.offset));render()};l.append(inp);grid.append(l)}const del=document.createElement('button');del.type='button';del.textContent=t('Odebrat','Remove');del.onclick=()=>remove(c.id);item.append(grid,del);list.append(item)}
 }
 function clock(){q('qpTime').textContent=position.toFixed(1)+' / '+duration().toFixed(0)+' s';q('qpSeek').value=position}
 function paintImage(im){px.fillStyle='#080c15';px.fillRect(0,0,preview.width,preview.height);if(im){const s=Math.min(preview.width/im.naturalWidth,preview.height/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;px.drawImage(im,(preview.width-w)/2,(preview.height-h)/2,w,h)}}
 function mediaAt(c,time,play){const target=c.offset+time-c.start;if(Math.abs(c.el.currentTime-target)>.45||!play)try{c.el.currentTime=target}catch{}c.el.volume=c.volume;if(play&&c.el.paused)c.el.play().catch(()=>{});if(!play)c.el.pause()}
 function sync(play){const active=clips.filter(c=>c.ready&&position>=c.start&&position<c.start+c.len);const visual=active.filter(c=>['image','motion','video'].includes(c.track)).sort((a,b)=>tracks.indexOf(b.track)-tracks.indexOf(a.track)||b.id-a.id)[0];for(const c of clips){if(c.track==='image')continue;if(active.includes(c)&&['voice','sound','effects'].includes(c.track))mediaAt(c,position,play);else c.el.pause?.()}
  if(visual&&visual.track!=='image'){preview.hidden=true;player.hidden=false;if(visualId!==visual.id){player.src=visual.url;visualId=visual.id}const target=visual.offset+position-visual.start;if(Math.abs(player.currentTime-target)>.45||!play)try{player.currentTime=target}catch{}player.volume=visual.volume;if(play&&player.paused)player.play().catch(()=>{});if(!play)player.pause()}else{player.pause();player.hidden=true;preview.hidden=false;visualId=null;paintImage(visual?.el)}clock()
 }
 function stop(){running=false;cancelAnimationFrame(frame);player.pause();for(const c of clips)c.el.pause?.()}
 q('qpPlay').onclick=()=>{stop();stopSound();cancelVoice();if(position>=duration())position=0;started=performance.now()-position*1000;running=true;sync(true);const tick=now=>{if(!running)return;position=Math.min(duration(),(now-started)/1000);sync(true);if(position>=duration()||root.hidden){stop();return}frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)};
 q('qpPause').onclick=stop;q('qpSeek').oninput=()=>{stop();position=Number(q('qpSeek').value);sync(false)};
 function plan(){return {version:1,mode,prompt:q('qpPrompt').value,voice:{text:q('qpSpeech').value,style:q('qpEmotion').value,rate:Number(q('qpRate').value),pitch:Number(q('qpPitch').value),recordingEffects:voiceSettings()},clips:clips.map(({track,name,start,len,offset,volume})=>({track,name,start,len,offset,volume})),note:'Preparation only; source files not included; no AI generation or billing.'}}
 q('qpSpec').onclick=()=>download(new Blob([JSON.stringify(plan(),null,2)],{type:'application/json'}),'qa-project-plan.json');
 q('qpCopy').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(plan(),null,2));status('Zadání zkopírováno.','Instructions copied.')}catch{status('Kopírování není dostupné, ulož JSON.','Clipboard unavailable; save JSON.')}};
 function translate(){for(const el of root.querySelectorAll('[data-cs][data-en]'))el.textContent=t(el.dataset.cs,el.dataset.en);voiceTiles();if(voiceAllowance)showVoiceAllowance(voiceAllowance);for(const b of tools.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.tool===mode));render()}
 window.addEventListener('qa:language',translate);
 window.addEventListener('qa:motion-mode',e=>{finishRecording();stop();stopSound();cancelVoice();if(['image','sound','voice','video'].includes(e.detail)){mode=e.detail;root.hidden=false;for(const k of ['Image','Sound','Voice','Video'])q('qp'+k).hidden=k.toLowerCase()!==mode;translate();if(mode==='voice')void refreshVoiceAllowance();if(!root.getBoundingClientRect().height||root.getBoundingClientRect().top<0)root.scrollIntoView({behavior:'smooth',block:'start'})}else root.hidden=true});
 window.addEventListener('pagehide',()=>{finishRecording(true);stop();stopSound();cancelVoice()});
 translate();paintImage(null);const current=document.getElementById('qaSceneLib')?.dataset.qaEditorMode;if(['image','sound','voice','video'].includes(current))window.dispatchEvent(new CustomEvent('qa:motion-mode',{detail:current}));return true
}
function tick(){if(!mount()&&++tries<40)setTimeout(tick,250)}tick();
})();

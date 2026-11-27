'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const file=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Every first-party JS module parses',()=>{
  const list=['qa-auth-core.js','qa-login.js','qa-account.js','qa-landing.js','qa-start.js','qa-plans.js','qa-animals.js','qa-cutouts.js','qa-funny.js','qa-gallery.js','qa-help.js','qa-i18n.js','qa-one-editor.js','qa-motion.js','qa-pricing-fix.js','qa-social.js','qa-external-ai.js','qa-shared-library.js','sw.js'];
  for(const name of list)assert.doesNotThrow(()=>new vm.Script(file(name),{filename:name}),name);
});

test('All browser files use one active publishable key, not a secret key',()=>{
  const auth=file('qa-auth-core.js'),account=file('qa-account.js'),plans=file('qa-plans.js');
  const extract=s=>[...s.matchAll(/sb_publishable_[A-Za-z0-9_]+/g)].map(m=>m[0]);
  const keys=[...extract(auth),...extract(account),...extract(plans)];
  assert(keys.length>=3);
  assert.equal(new Set(keys).size,1,'Conflicting publishable keys will break login');
  for(const s of [auth,account,plans,file('qa-login.js')]){
    assert.doesNotMatch(s,/sk_live_[A-Za-z0-9]{10}|sb_secret_[A-Za-z0-9]+|service_role\s*[:=]\s*['"][A-Za-z0-9]/);
  }
});

test('Landing, login, account, worker and manifest are linked',()=>{
  const paths=['index.html','login.html','sw.js','manifest.webmanifest'];
  for(const p of paths)assert(fs.existsSync(path.join(root,p)),p);
  assert.match(file('qa-landing.js'),/login\.html/);
  assert.match(file('login.html'),/qa-auth-core\.js/);
  assert.match(file('login.html'),/qa-login\.js/);
  assert.match(file('index.html'),/qa-auth-core\.js/);
  assert.match(file('sw.js'),/'\.\/qa-auth-core\.js'/);
  assert.match(file('qa-plans.js'),/test_only|Testovací|testovací/i);
  assert.match(file('qa-login.js'),/SERVER_LIMIT_PAUSE/);
  const manifest=JSON.parse(file('manifest.webmanifest'));
  assert(manifest.name||manifest.short_name);
});

function clientWithMock(responder,hash=''){
  const calls=[],memory=new Map();
  const loc=new URL('https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/login.html');
  const location={href:loc.href,origin:loc.origin,pathname:loc.pathname,search:'',hash};
  const store={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  const fetch=async(url,opts={})=>{
    calls.push({url:String(url),method:opts.method||'GET',headers:opts.headers||{},body:opts.body||''});
    const {status=200,body={},headers={}}=await responder(new URL(url),opts);
    return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json',...headers}});
  };
  const replaced=[];
  const scope={window:{},location,localStorage:store,history:{replaceState(...args){replaced.push(args)}},fetch,URL,URLSearchParams,AbortController,setTimeout,clearTimeout,Date,console};
  vm.runInNewContext(file('qa-auth-core.js'),scope,{timeout:3000});
  return {auth:scope.window.QAAuthCore.createClient().auth,calls,memory,replaced,scope};
}
const user={id:'test-customer',email:'customer@example.org'};
const session={access_token:'access-test-12345',refresh_token:'refresh-test-12345',expires_in:3600,user};
const ok=(body={})=>({status:200,body});

test('Password login persists server-issued session and validates /user',async()=>{
  const t=clientWithMock(async(url)=>{
    if(url.pathname.endsWith('/token'))return ok(session);
    if(url.pathname.endsWith('/user'))return ok(user);
    throw Error('Unexpected auth request '+url.pathname);
  });
  const login=await t.auth.signInWithPassword({email:user.email,password:'example-only-password'});
  assert.equal(login.error,null);
  assert.equal(login.data.session.access_token,session.access_token);
  const check=await t.auth.getUser();
  assert.equal(check.data.user.id,user.id);
  assert(t.calls.some(c=>c.url.includes('/auth/v1/token?grant_type=password')));
  assert(t.calls.some(c=>c.url.includes('/auth/v1/user')&&c.headers.Authorization==='Bearer '+session.access_token));
  assert(t.memory.has('sb-naxotlqvimewbfowxwmw-auth-token'));
});

test('Invalid password is rejected; no session granted',async()=>{
  const t=clientWithMock(async()=>({status:400,body:{code:'invalid_credentials',msg:'Invalid login credentials'}}));
  const result=await t.auth.signInWithPassword({email:user.email,password:'not-the-password'});
  assert.equal(result.error.code,'invalid_credentials');
  assert.equal(result.data.session,null);
  assert.equal(t.memory.has('sb-naxotlqvimewbfowxwmw-auth-token'),false);
});

test('Email rate limit is surfaced, not bypassed',async()=>{
  const t=clientWithMock(async()=>({status:429,body:{code:'over_email_send_rate_limit',msg:'email rate limit exceeded'},headers:{'retry-after':'60'}}));
  const result=await t.auth.resetPasswordForEmail(user.email,{redirectTo:'https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/login.html'});
  assert.equal(result.error.status,429);
  assert.equal(result.error.code,'over_email_send_rate_limit');
});

test('Unsafe OAuth redirect is blocked',async()=>{
  const t=clientWithMock(async()=>ok());
  const result=await t.auth.signInWithOAuth({provider:'google',options:{redirectTo:'https://malicious.invalid/login',skipBrowserRedirect:true}});
  assert.equal(result.error.code,'unsafe_redirect');
  assert.equal(t.calls.length,0);
});

test('Recovery tokens become a session only after Supabase verification',async()=>{
  const t=clientWithMock(async(url,opts)=>{
    if(url.pathname.endsWith('/verify')){assert.equal(opts.method,'POST');return ok(session)}
    if(url.pathname.endsWith('/user')){if(opts.method==='PUT')return ok(user);return ok(user)}
    throw Error('Unexpected auth request '+url.pathname);
  });
  const verified=await t.auth.verifyOtp({token_hash:'example-test-token-hash',type:'recovery'});
  assert.equal(verified.error,null);
  const changed=await t.auth.updateUser({password:'example-stronger-password'});
  assert.equal(changed.error,null);
  assert.equal(changed.data.user.id,user.id);
  assert(t.calls.some(c=>c.url.endsWith('/auth/v1/user')&&c.method==='PUT'));
});


test('Email sign-in accurately distinguishes code email from Sign in link',()=>{
 const html=file('login.html'),login=file('qa-login.js');
 assert.match(html,/registerHint/);
 assert.match(login,/by\('codeType'\)\.value='signup'/);
 assert.match(login,/Sign in.*neobsahuje kód/);
 for(const fileName of ['supabase/email-templates/confirm-signup.html','supabase/email-templates/magic-link.html','supabase/email-templates/reset-password.html']){
  const template=file(fileName);
  assert.match(template,/\{\{ \.Token \}\}/);
  assert.doesNotMatch(template,/\{\{ \.ConfirmationURL \}\}/);
 }
});

test('PNG library has dedicated collection navigation and measured dimensions',()=>{const lib=file('qa-cutouts.js');assert.match(lib,/visible=70/);assert.match(lib,/qaOpenAssetLibrary/);assert.match(lib,/img.naturalWidth/);assert.match(lib,/img.naturalHeight/);assert.match(lib,/scifi/);assert.match(lib,/vanoce/);assert.match(lib,/efekty/);assert.match(file('qa-one-editor.js'),/targets=\{living:oldGallery,funny:funny\}/);assert.match(file('qa-design.css'),/qac-sidebar/)});

test('Full library exposes import actions and transitions to photos',()=>{const lib=file('qa-cutouts.js');assert.match(lib,/qacAdd/);assert.match(lib,/qacOwn/);assert.match(lib,/allAssets\(\)\.catch/);assert.match(file('qa-one-editor.js'),/window\.qaOpenPhotoLibrary/);assert.match(file('qa-landing.js'),/qaOpenTemplateCategory/)});

test('Reference dashboard contains responsive sidebar, tools and plan rail',()=>{const s=file('qa-landing.js');for(const token of ['qaHomeSidebar','qaHomeRail','qaHomeTool','qaHomeCollectionSearch','qaHomeFeatured'])assert(s.includes(token));assert.match(file('qa-design.css'),/qaHomeShell/);assert.match(s,/window\.qaOpenExternalAi\?\.\(kind\)/);const ai=file('qa-external-ai.js');assert.match(ai,/mount\('qaExternalAi','AI'\)/);assert.match(ai,/window\.qaOpenExternalAi=/);assert.match(ai,/noopener noreferrer/);assert.match(file('index.html'),/await loadModule\(ext\)/)});

test('Dashboard boot is ordered and beta redirects to the same release',()=>{const html=file('index.html');assert.match(html,/await loadModule\(landing\)/);assert.match(html,/await loadModule\(uni\)/);assert.match(html,/qaHomeShell/);assert.match(file('beta/index.html'),/location.replace\(target.href\)/);assert.match(file('sw.js'),/fetch\(req,\{cache:'no-cache'\}\)/)});

test('Modern shell removes legacy chrome and mobile menu is accessible',()=>{assert.match(file('qa-landing.js'),/qaModernShell/);assert.match(file('qa-landing.js'),/qaMobileMenu/);assert.match(file('qa-design.css'),/body\.qaModernShell>\.wrap>\.hero/);assert.match(file('qa-design.css'),/qaMenuExpanded/)});


test('Reference artwork, current cache and mobile dock ship together',()=>{const s=file('qa-landing.js');assert.match(s,/reference-fantasy\.webp/);assert(fs.existsSync(path.join(root,'assets/reference-fantasy.webp')));assert.match(s,/document\.body\.append\(mobile\)/);assert.match(file('qa-design.css'),/body>\.qaMobileDock/);const html=file('index.html'),beta=file('beta/index.html'),worker=file('sw.js');const css=html.match(/qa-design\.css\?v=([\w-]+)/);assert(css);assert(beta.includes('qa-design.css?v='+css[1]));const shared=html.match(/qa-shared-library\.js\?v=([\w-]+)/);assert(shared);assert(worker.includes("const VERSION='qa-shell-"+shared[1]+"'"));assert.match(worker,/'\.\/qa-shared-library\.js'/);assert.match(worker,/'\.\/qa-external-ai\.js'/);assert.match(worker,/key!==VERSION\)await caches\.delete\(key\)/)});


test('Home routes collections to the shared library and preserves separate background and PNG filters',()=>{const s=file('qa-landing.js'),lib=file('qa-shared-library.js'),html=file('index.html');assert.match(s,/window\.qaOpenTemplateCategory=id=>/);assert.match(s,/id==='backgrounds'\)\{window\.qaOpenSharedLibrary\?\.\('all','photos'\)/);assert.match(s,/window\.qaOpenSharedLibrary\?\.\(categoryMap\[id\]\|\|id\)/);assert.match(s,/qaOpenAssetLibrary/);assert.match(lib,/window\.qaOpenSharedLibrary=/);assert.match(lib,/\['cutouts','Průhledné objekty'/);assert.match(lib,/\['photos','Scény a pozadí'/);assert.match(lib,/kind:q\('qsKind'\)\.value/);assert.match(lib,/x\.kind==='cutouts'/);assert.match(lib,/qslBgUpload/);assert.match(html,/await loadModule\(lib\)/);assert(html.indexOf('await loadModule(lib)')<html.indexOf('await loadModule(landing)'));assert.match(file('qa-gallery.js'),/qaPortraitCatalog=\(\)=>\[\]/);assert.match(file('qa-animals.js'),/window\.qaPhotoCatalog/)});


test('Old category artwork is removed',()=>{for(const p of ['assets/gallery-animals.webp','assets/gallery-fantasy.webp','assets/qa-reference-covers.webp'])assert(!fs.existsSync(path.join(root,p)));assert.doesNotMatch(file('qa-landing.js'),/qaExactCategoryCover/)});


test('4K catalogue checks both source dimensions and offers full image preview',()=>{const a=file('qa-animals.js');assert.match(a,/Math\.max\(Number\(w\)\|\|0,Number\(h\)\|\|0\)>=3840/);assert.match(a,/!is4K\(img.width,img.height\)/);assert.match(a,/count4K\(cat.id\)>=50/);assert.match(a,/img.naturalWidth/);assert.match(a,/t.photoFull\|\|photoUrl/);assert.match(a,/Math\.min\(Number\(w\)\|\|0,Number\(h\)\|\|0\)>=2160/);assert.match(file('qa-one-editor.js'),/window\.qaOpenPhotoLibrary=/);assert.match(file('qa-cutouts.js'),/Original preview/);const lib=file('qa-shared-library.js');assert.match(lib,/resized\(img,3840,/);assert.match(lib,/original_width:img\.width,original_height:img\.height/);assert.match(lib,/x\.original_width/);assert.match(lib,/Upscaled files/)});

test('Motion Studio is mounted in the editor and uses honest local preview and manual AI handoff',()=>{const s=file('qa-motion.js'),u=file('qa-one-editor.js'),html=file('index.html');assert.match(u,/window\.qaOpenMotionStudio=/);assert.match(u,/qa:motion-mode/);assert.match(s,/captureStream\(30\)/);assert.match(s,/createObjectURL\(file\)/);assert.match(s,/direct AI generation is not connected yet/);assert.match(s,/noopener noreferrer/);assert.doesNotMatch(s,/\bfetch\s*\(/);assert(html.indexOf('await loadModule(uni)')<html.indexOf('await loadModule(motion)'));assert.match(file('sw.js'),/'\.\/qa-motion\.js'/)});

'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const text=name=>fs.readFileSync(path.join(dist,name),'utf8');
test('Cloudflare output has all static entrypoints, app modules and media',()=>{
  for(const name of ['index.html','index-1.html','login.html','licenses.html','manifest.webmanifest','sw.js','qa-auth-core.js','qa-login.js','qa-account.js','qa-landing.js','qa-plans.js','assets/qa-hero-campaign.webp','_headers','_redirects']){
    assert(fs.statSync(path.join(dist,name)).isFile(),'Missing '+name);
  }
});
test('Only static deploy assets leave the repository',()=>{
  for(const secret of ['.github','tests','scripts','.env','LAUNCH_READINESS.md','CLOUDFLARE_SETUP.md']){
    assert.equal(fs.existsSync(path.join(dist,secret)),false,secret+' should not be published');
  }
});
test('PWA works on either root or repository subpath',()=>{
  const manifest=JSON.parse(text('manifest.webmanifest'));
  for(const field of ['id','start_url','scope'])assert.equal(manifest[field],'./',field);
  assert.match(text('index.html'),/serviceWorker\.register\('\.\/sw\.js',\{scope:'\.\/'\}\)/);
  const sw=text('sw.js');
  assert.match(sw,/SCOPE_PATH=new URL\(self\.registration\.scope\)\.pathname/);
  assert.doesNotMatch(sw,/url\.pathname\.startsWith\('\/QA-Studio-AI-PRO\/'\)/);
});
test('Customer login is direct and always shares verified public key',()=>{
  assert.match(text('login.html'),/qa-auth-core\.js/);
  assert.match(text('index.html'),/qa-auth-core\.js/);
  const core=text('qa-auth-core.js');
  const account=text('qa-account.js');
  assert.match(core,/sb_publishable_[A-Za-z0-9_]+/);
  const k=core.match(/sb_publishable_[A-Za-z0-9_]+/)[0];
  assert(account.includes(k),'account and direct login must use the same publishable key');
});
test('Security and friendly routes are configured for Pages',()=>{
  assert.match(text('_headers'),/X-Content-Type-Options: nosniff/);
  assert.match(text('_headers'),/X-Frame-Options: SAMEORIGIN/);
  assert.match(text('_redirects'),/^\/register \/login\.html 302/m);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const ids = [1,2,3,4].map(n => '00000000-0000-4000-8000-00000000000' + n);
const freeRights = checkout_live => ({is_admin:false, editor_active:false, checkout_live});

function ledger() {
  let used = 0;
  const receipts = new Set();
  return {
    readUsed:async()=>used,
    claim:async id=>{
      if(receipts.has(id)) return {allowed:true,remaining:3-used};
      if(used===3) return {allowed:false,remaining:0};
      receipts.add(id); used++; return {allowed:true,remaining:3-used};
    },
  };
}
async function policy() {
  return (await import(pathToFileURL(path.join(root,'supabase/functions/qa-voice-access/policy.mjs')))).voiceAccess;
}

test('three free exports are counted once, then access requires a paid plan', async () => {
  const decide = await policy(), db = ledger(), rights = freeRights(true);
  for(let i=0;i<3;i++){
    const result = await decide({action:'consume',requestId:ids[i],rights,...db});
    assert.equal(result.allowed,true);
    assert.equal(result.remaining,2-i);
  }
  assert.equal((await decide({action:'consume',requestId:ids[2],rights,...db})).allowed,true,'a retry is idempotent');
  assert.deepEqual(await decide({action:'consume',requestId:ids[3],rights,...db}),
    {allowed:false,unlimited:false,remaining:0,sales_active:true,beta_free:false});
});

test('during beta, users are not locked out while sales are disabled', async () => {
  const decide = await policy(), db = ledger(), rights = freeRights(false);
  for(let i=0;i<4;i++) assert.equal((await decide({action:'consume',requestId:ids[i],rights,...db})).allowed,true);
  const state = await decide({action:'status',rights,...db});
  assert.equal(state.remaining,0);
  assert.equal(state.beta_free,true);
  assert.equal(state.sales_active,false);
});

test('active paid users and the owner do not spend the free allowance', async () => {
  const decide=await policy();
  for(const rights of [{is_admin:true,editor_active:false,checkout_live:false},{is_admin:false,editor_active:true,checkout_live:true}]){
    const never=async()=>{throw new Error('must not debit a paid account')};
    const result=await decide({action:'consume',rights,readUsed:never,claim:never});
    assert.equal(result.allowed,true);
    assert.equal(result.unlimited,true);
  }
});

test('invalid requests and inconsistent account data fail closed', async () => {
  const decide=await policy(), db=ledger(), rights=freeRights(true);
  await assert.rejects(()=>decide({action:'consume',requestId:'bad',rights,...db}),/invalid_request_id/);
  await assert.rejects(()=>decide({action:'status',rights,readUsed:async()=>4}),/invalid_usage/);
});

test('the client sends only an authenticated account request, never voice audio', async () => {
  const calls=[], sandbox={window:{QAAuthCore:{project:'https://project.example',publishableKey:'public',
    createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'token'}}})}})}},
    fetch:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({allowed:true,unlimited:false,remaining:2})}}};
  vm.runInNewContext(source('qa-voice-access.js'),sandbox);
  const result=await sandbox.window.QAVoiceAccess.consume(ids[0]);
  assert.equal(result.remaining,2);
  assert.equal(calls[0].options.headers.Authorization,'Bearer token');
  assert.deepEqual(JSON.parse(calls[0].options.body),{action:'consume',request_id:ids[0]});
  assert.equal(Object.keys(JSON.parse(calls[0].options.body)).length,2);
});

test('voice saving respects the server decision and preserves retry IDs', async () => {
  const line=source('qa-prep-studio.js').split('\n').find(x=>x.includes("q('qpVoiceSave').onclick=async"));
  assert(line);
  async function setup(results,paid=false){
    const button={}, calls=[], downloads=[], messages=[];
    const ctx={window:{QAVoiceAccess:{consume:async id=>{calls.push(id);const next=results.shift();if(next instanceof Error)throw next;return next}},qaCheckEditorAccess:async()=>paid},
      q:()=>button,voiceLabels:()=>{},processedVoice:()=>({data:'local'}),wav:()=>({type:'audio/wav'}),
      nextVoiceRequestId:()=>ids[0],download:(blob,name)=>downloads.push(name),showVoiceAllowance:()=>{},status:(a,b)=>messages.push([a,b])};
    vm.runInNewContext('let voiceSaving=false,voiceInput={},voiceStatusSeq=0,voiceRequestId=null;'+line,ctx);
    return {button,calls,downloads,messages};
  }
  const blocked=await setup([{allowed:false,unlimited:false,remaining:0,sales_active:true}]);
  await blocked.button.onclick(); assert.equal(blocked.downloads.length,0);
  const retry=await setup([new Error('network'),{allowed:true,unlimited:false,remaining:2,sales_active:true}]);
  await retry.button.onclick(); await retry.button.onclick();
  assert.deepEqual(retry.calls,[ids[0],ids[0]]);
  assert.deepEqual(retry.downloads,['qa-edited-voice.wav']);
  const owner=await setup([new Error('service')],true);
  await owner.button.onclick(); assert.equal(owner.downloads.length,1);
});

test('a signed-in free user can enter Voice while other studio tools keep their access check', async () => {
  const s=source('qa-one-editor.js');
  const start=s.indexOf('async function open(mode)');
  const finish=s.indexOf('\n window.qaOpenEditorMode=',start);
  assert(start>=0 && finish>start);
  const hint={textContent:''}, navClicks=[], dispatched=[];
  const button=()=>({setAttribute(){}});
  const quBtns={voice:button(),sound:button()};
  const scene={dataset:{},classList:{remove(){},toggle(){}}};
  const ctx={quBtns,wrap:{querySelector:()=>hint},nav:{querySelector:selector=>({click:()=>navClicks.push(selector)})},
    showEditor:()=>{},scene,targets:{},modes:[['voice','','Voice'],['sound','','Sound']],
    window:{QAVoiceAccess:{status:async()=>({allowed:true})},qaCheckEditorAccess:async()=>false,dispatchEvent:e=>dispatched.push(e.detail)},
    document:{getElementById:()=>({scrollIntoView(){}})},CustomEvent:function(_name,opt){this.detail=opt.detail}};
  vm.runInNewContext('let accessRequest=0;'+s.slice(start,finish)+';this.open=open;',ctx);
  await ctx.open('voice');
  assert.deepEqual(dispatched,['voice']);
  await ctx.open('sound');
  assert.deepEqual(dispatched,['voice']);
  assert.deepEqual(navClicks,['[data-tab="qaPlansPanel"]']);
});

test('the server validates the account before reading entitlement or the quota', async () => {
  const decide=await policy();
  const entry=source('supabase/functions/qa-voice-access/index.ts').replace(/^import .*;\n/gm,'');
  let handler, checkedUser=0, paidChecks=0, used=0;
  const client={auth:{getUser:async token=>{checkedUser++;return token==='valid'?{data:{user:{id:'user-a'}},error:null}:{data:{user:null},error:{}}}},
    from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{used},error:null})})})}),
    rpc:async()=>({data:[{allowed:true,remaining:--used}],error:null})};
  const ctx={Deno:{env:{get:key=>({SUPABASE_URL:'https://project.example',SUPABASE_SERVICE_ROLE_KEY:'server-only',SITE_URL:'https://app.example'}[key]||'')},serve:fn=>{handler=fn}},
    createClient:()=>client,voiceAccess:decide,URL,Request,Response,Set,console,
    fetch:async()=>{paidChecks++;return {ok:true,json:async()=>({is_admin:false,editor_active:false,checkout_live:false})}}};
  vm.runInNewContext(entry,ctx);
  let response=await handler(new Request('https://project.example/functions/v1/qa-voice-access',{method:'POST',headers:{apikey:'public'},body:JSON.stringify({action:'status'})}));
  assert.equal(response.status,401);
  assert.equal(checkedUser,0); assert.equal(paidChecks,0);
  response=await handler(new Request('https://project.example/functions/v1/qa-voice-access',{method:'POST',headers:{apikey:'public',Authorization:'Bearer invalid'},body:JSON.stringify({action:'status'})}));
  assert.equal(response.status,401); assert.equal(paidChecks,0);
  response=await handler(new Request('https://project.example/functions/v1/qa-voice-access',{method:'POST',headers:{apikey:'public',Authorization:'Bearer valid',Origin:'https://app.example'},body:JSON.stringify({action:'status'})}));
  assert.equal(response.status,200);
  assert.equal((await response.json()).remaining,3);
  assert.equal(response.headers.get('access-control-allow-origin'),'https://app.example');
  assert.equal(paidChecks,1);
});

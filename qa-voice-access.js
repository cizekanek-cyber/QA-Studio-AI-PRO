/* Account-based voice download status. Audio never leaves the local editor. */
(()=>{
'use strict';
if(window.QAVoiceAccess)return;
async function request(action,requestId){
 const client=window.QAAuthCore?.createClient();
 const session=(await client?.auth.getSession())?.data?.session;
 if(!session?.access_token){const error=new Error('authentication_required');error.code='authentication_required';throw error}
 const response=await fetch(window.QAAuthCore.project+'/functions/v1/qa-voice-access',{
  method:'POST',headers:{'Content-Type':'application/json',apikey:window.QAAuthCore.publishableKey,Authorization:'Bearer '+session.access_token},
  body:JSON.stringify({action,...(requestId?{request_id:requestId}:{})}),cache:'no-store'
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){const error=new Error(data.error||'voice_access_unavailable');error.code=response.status===401?'authentication_required':data.error||'voice_access_unavailable';throw error}
 if(typeof data.allowed!=='boolean'||typeof data.unlimited!=='boolean')throw new Error('voice_access_unavailable');
 return data;
}
window.QAVoiceAccess={status:()=>request('status'),consume:id=>request('consume',id)};
})();

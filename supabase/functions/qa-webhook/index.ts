import {db,stripe} from '../_shared/qa.ts';
function toHex(u:Uint8Array){return Array.from(u,b=>b.toString(16).padStart(2,'0')).join('')}
function equal(a:string,b:string){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
async function verify(body:string,sig:string,key:string){const parts=sig.split(',');const t=parts.find(x=>x.trim().startsWith('t='))?.trim().slice(2);const signatures=parts.filter(x=>x.trim().startsWith('v1=')).map(x=>x.trim().slice(3));if(!t||!/^\d+$/.test(t)||Math.abs(Date.now()/1000-Number(t))>300||!signatures.length)return false;const h=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);const d=await crypto.subtle.sign('HMAC',h,new TextEncoder().encode(t+'.'+body));return signatures.some(s=>equal(s,toHex(new Uint8Array(d))))}
function iso(n:unknown){const x=Number(n);return Number.isFinite(x)&&x>0?new Date(x*1000).toISOString():null}
function subscriptionId(obj:any){return typeof obj.subscription==='string'?obj.subscription:typeof obj.parent?.subscription_details?.subscription==='string'?obj.parent.subscription_details.subscription:null}
async function saveSubscription(supa:any,obj:any,uid:string,plan:string){if(!['plus_month','plus_year'].includes(plan))return;const end=obj.current_period_end||obj.items?.data?.[0]?.current_period_end;const {error}=await supa.from('qa_subscriptions').upsert({stripe_subscription_id:obj.id,user_id:uid,plan,stripe_customer_id:typeof obj.customer==='string'?obj.customer:null,status:obj.status||'incomplete',period_end:iso(end),updated_at:new Date().toISOString()},{onConflict:'stripe_subscription_id'});if(error)throw error;}
async function updateFromStripe(supa:any,id:string,uid?:string,plan?:string){let sub:any;try{sub=await stripe('subscriptions/'+encodeURIComponent(id));}catch(e){console.error('Subscription retrieval failed',id);throw e;}
 const {data:stored,error}=await supa.from('qa_subscriptions').select('user_id,plan').eq('stripe_subscription_id',id).maybeSingle();if(error)throw error;
 const userId=sub.metadata?.user_id||uid||stored?.user_id,packageName=sub.metadata?.plan||plan||stored?.plan;
 if(userId&&packageName)await saveSubscription(supa,sub,userId,packageName);
 return {uid:userId,plan:packageName};
}
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 const secret=Deno.env.get('STRIPE_WEBHOOK_SECRET');if(!secret)return new Response('Not configured',{status:503});
 const raw=await req.text();if(raw.length>2_000_000)return new Response('Too large',{status:413});
 if(!await verify(raw,req.headers.get('stripe-signature')||'',secret))return new Response('Invalid signature',{status:400});
 let event:any;try{event=JSON.parse(raw)}catch{return new Response('Malformed JSON',{status:400})}
 const supa=db();
 try{
  const {data:existing,error:lookupError}=await supa.from('qa_webhook_events').select('event_id').eq('event_id',event.id).maybeSingle();
  if(lookupError)throw lookupError;if(existing)return new Response('Already handled',{status:200});
  const o=event.data?.object||{};
  if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){
   const uid=o.client_reference_id||o.metadata?.user_id,plan=o.metadata?.plan;
   if(uid&&plan==='christmas'&&o.mode==='payment'&&o.payment_status==='paid'){
    const {error}=await supa.from('qa_purchases').upsert({stripe_session_id:o.id,user_id:uid,plan:'christmas',stripe_customer_id:typeof o.customer==='string'?o.customer:null,payment_intent_id:typeof o.payment_intent==='string'?o.payment_intent:null,amount_czk:o.currency==='czk'?Number(o.amount_total||0):0,refunded:false},{onConflict:'stripe_session_id'});
    if(error)throw error;
    if(o.currency==='czk'&&Number(o.amount_total)>0){const {error:e}=await supa.from('qa_transactions').upsert({stripe_event_source:'checkout:'+o.id,user_id:uid,plan:'christmas',amount_czk:Number(o.amount_total)},{onConflict:'stripe_event_source'});if(e)throw e;}
   }
   if(uid&&['plus_month','plus_year'].includes(plan)&&o.mode==='subscription'&&typeof o.subscription==='string')await updateFromStripe(supa,o.subscription,uid,plan);
  }
  if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)&&typeof o.id==='string'){
   if(event.type==='customer.subscription.deleted'){
    const {data:old}=await supa.from('qa_subscriptions').select('user_id,plan').eq('stripe_subscription_id',o.id).maybeSingle();
    const uid=o.metadata?.user_id||old?.user_id,plan=o.metadata?.plan||old?.plan;
    if(uid&&plan)await saveSubscription(supa,{...o,status:'canceled'},uid,plan);
   } else await updateFromStripe(supa,o.id,o.metadata?.user_id,o.metadata?.plan);
  }
  if(['invoice.paid','invoice.payment_succeeded'].includes(event.type)&&o.currency==='czk'&&Number(o.amount_paid)>0){
   const id=subscriptionId(o);if(id){const {uid,plan}=await updateFromStripe(supa,id);if(uid&&plan){const {error}=await supa.from('qa_transactions').upsert({stripe_event_source:'invoice:'+o.id,user_id:uid,plan,amount_czk:Number(o.amount_paid)},{onConflict:'stripe_event_source'});if(error)throw error;}}
  }
  if(event.type==='charge.refunded'&&o.refunded===true&&typeof o.payment_intent==='string'){
   const {error}=await supa.from('qa_purchases').update({refunded:true}).eq('payment_intent_id',o.payment_intent);
   if(error)throw error;
  }
  const {error:done}=await supa.from('qa_webhook_events').insert({event_id:event.id});
  if(done&&done.code!=='23505')throw done;
  return new Response('ok',{status:200});
 }catch(e){console.error('Webhook processing failed',e);return new Response('Retry later',{status:500})}
});

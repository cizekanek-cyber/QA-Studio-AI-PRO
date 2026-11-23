import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
export const SITE_URL=Deno.env.get('SITE_URL')||'https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/';
const siteOrigin=new URL(SITE_URL).origin;
export function headers(req:Request){return {'Access-Control-Allow-Origin':siteOrigin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'};}
export function json(req:Request,obj:unknown,status=200){return new Response(JSON.stringify(obj),{status,headers:{...headers(req),'content-type':'application/json;charset=utf-8'}});}
export function preflight(req:Request){return new Response(null,{status:204,headers:headers(req)});}
export function db(){const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)throw Error('Server configuration missing');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export async function userFrom(req:Request){const bearer=req.headers.get('authorization')||'';const token=bearer.match(/^Bearer\s+(.+)$/i)?.[1];if(!token)throw Error('Přihlášení je vyžadováno');const supa=db();const {data,error}=await supa.auth.getUser(token);if(error||!data?.user)throw Error('Neplatné přihlášení');return {user:data.user,db:supa};}
export function isOwner(id:string){const owner=Deno.env.get('ADMIN_USER_ID');return !!owner&&owner===id;}
export function respondError(req:Request,e:unknown){const message=e instanceof Error?e.message:'Unknown error';console.error('QA Server error:',message);const known=/^(Přihlášení|Neplatné přihlášení|Neplatný plán|Neplatná šablona|Nemáte|Přístup|Chybí|Prodej|Licence|Předplatné)/.test(message);return json(req,{error:known?message:'Operace se nezdařila. Kontaktujte podporu.'},known?400:500);}
export async function stripe(path:string,body?:URLSearchParams){const sk=Deno.env.get('STRIPE_SECRET_KEY');if(!sk)throw Error('Server configuration missing');const res=await fetch('https://api.stripe.com/v1/'+path,{method:body?'POST':'GET',headers:{'Authorization':'Bearer '+sk,...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body:body?.toString()});const data=await res.json();if(!res.ok)throw Error('Stripe API call failed '+res.status);return data;}
export function assetPlan(path:string):'christmas'|'plus'{const specs:[RegExp,number,'christmas'|'plus'][]=[
 [/^christmas\/CHRISTMAS_(\d{3})\.jpg$/,36,'christmas'],
 [/^luxury\/QA-REAL-(\d{3})\.jpg$/,200,'plus'],
 [/^fantasy\/FANTASY_(\d{3})\.jpg$/,200,'plus'],
 [/^cats\/CAT_(\d{3})\.jpg$/,55,'plus'],
 [/^prompts\/SCENE_(\d{3})\.txt$/,800,'plus'],
 [/^prompts\/ANIMAL_(\d{3})\.txt$/,200,'plus']
 ];for(const [re,max,plan] of specs){const m=path.match(re);if(m&&Number(m[1])>=1&&Number(m[1])<=max)return plan;}throw Error('Neplatná šablona');}
export async function entitlement(supa:ReturnType<typeof db>,id:string){const [{data:p,error:ep},{data:s,error:es}]=await Promise.all([supa.from('qa_purchases').select('plan,refunded').eq('user_id',id),supa.from('qa_subscriptions').select('status,period_end').eq('user_id',id)]);if(ep||es)throw Error('Unable to read entitlement');const now=Date.now();const valid=(s||[]).filter((x:any)=>['active','trialing'].includes(x.status)&&x.period_end&&new Date(x.period_end).getTime()>now);return {plus:valid.length>0,plus_until:valid.map((x:any)=>x.period_end).sort().at(-1)||null,christmas:(p||[]).some((x:any)=>x.plan==='christmas'&&!x.refunded),is_admin:isOwner(id)};}

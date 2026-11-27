import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.2';
import { voiceAccess } from './policy.mjs';

const projectUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const siteUrl = Deno.env.get('SITE_URL') || 'https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/';
const trustedOrigins = new Set([
  new URL(siteUrl).origin,
  'https://cizekanek-cyber.github.io',
  'https://qastudioaipro.com',
  'https://www.qastudioaipro.com',
]);

function headers(req) {
  const origin = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': trustedOrigins.has(origin) ? origin : new URL(siteUrl).origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, {status:204, headers:headers(req)});
  if (req.method !== 'POST') return new Response(JSON.stringify({error:'method_not_allowed'}), {status:405, headers:headers(req)});
  try {
    const publicKey = req.headers.get('apikey') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (!projectUrl || !serviceKey || !publicKey) throw new Error('configuration');
    const token = (req.headers.get('Authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return new Response(JSON.stringify({error:'authentication_required'}), {status:401, headers:headers(req)});
    const db = createClient(projectUrl, serviceKey, {auth:{persistSession:false, autoRefreshToken:false}});
    const {data:auth, error:authError} = await db.auth.getUser(token);
    if (authError || !auth?.user) return new Response(JSON.stringify({error:'authentication_required'}), {status:401, headers:headers(req)});
    const body = await req.json().catch(() => ({}));
    if (!['status','consume'].includes(body.action)) {
      return new Response(JSON.stringify({error:'invalid_action'}), {status:400, headers:headers(req)});
    }
    // Reuse the existing server-verified PRO/VIP and checkout status.
    const check = await fetch(projectUrl + '/functions/v1/qa-editor-checkout', {
      method:'POST', headers:{Authorization:'Bearer ' + token, apikey:publicKey, 'Content-Type':'application/json'},
      body:JSON.stringify({action:'status'}),
    });
    if (!check.ok) throw new Error('entitlement_unavailable');
    const rights = await check.json();
    if (!rights || typeof rights.is_admin !== 'boolean' || typeof rights.editor_active !== 'boolean' || typeof rights.checkout_live !== 'boolean') {
      throw new Error('entitlement_unavailable');
    }
    const result = await voiceAccess({
      action:body.action,
      requestId:body.request_id,
      rights,
      readUsed:async () => {
        const {data,error} = await db.from('qa_voice_trial_counts').select('used').eq('user_id',auth.user.id).maybeSingle();
        if (error) throw error;
        return data?.used ?? 0;
      },
      claim:async (requestId) => {
        const {data,error} = await db.rpc('qa_voice_trial_claim',{p_user_id:auth.user.id,p_request_id:requestId});
        if (error || !Array.isArray(data) || data.length !== 1) throw new Error('quota_unavailable');
        return data[0];
      },
    });
    return new Response(JSON.stringify(result), {status:200, headers:headers(req)});
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'invalid_request_id') return new Response(JSON.stringify({error:message}), {status:400, headers:headers(req)});
    console.error('Voice access check failed');
    return new Response(JSON.stringify({error:'voice_access_unavailable'}), {status:503, headers:headers(req)});
  }
});

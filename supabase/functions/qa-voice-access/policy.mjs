const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FREE_LIMIT = 3;

// The server is the source of truth for account identity, paid status and usage.
export async function voiceAccess({action, requestId, rights, readUsed, claim}) {
  if (!['status', 'consume'].includes(action)) throw new Error('invalid_action');
  const paid = rights.is_admin === true || rights.editor_active === true;
  const salesActive = rights.checkout_live === true;
  if (paid) return {allowed:true, unlimited:true, remaining:null, sales_active:salesActive, beta_free:false};
  if (action === 'status') {
    const used = await readUsed();
    if (!Number.isInteger(used) || used < 0 || used > FREE_LIMIT) throw new Error('invalid_usage');
    return {allowed:used < FREE_LIMIT || !salesActive, unlimited:false, remaining:FREE_LIMIT-used,
      sales_active:salesActive, beta_free:used >= FREE_LIMIT && !salesActive};
  }
  if (typeof requestId !== 'string' || !UUID.test(requestId)) throw new Error('invalid_request_id');
  const result = await claim(requestId);
  if (typeof result?.allowed !== 'boolean' || !Number.isInteger(result?.remaining) ||
      result.remaining < 0 || result.remaining > FREE_LIMIT) throw new Error('invalid_usage');
  if (result.allowed) return {allowed:true, unlimited:false, remaining:result.remaining, sales_active:salesActive, beta_free:false};
  return {allowed:!salesActive, unlimited:false, remaining:0, sales_active:salesActive, beta_free:!salesActive};
}

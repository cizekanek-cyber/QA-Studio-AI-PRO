# QA Studio AI PRO — zprovoznění plateb (testovací režim)

> **Stav: kód připraven, nikoli veřejně zprovozněná pokladna.** Neodemykejte prémiový obsah pouze podle parametru \`?payment=success\` — rozhoduje serverové ověření licence.

## Ověřené Stripe produkty

Účet \`QA Fusion Direction\` (TEST mode):
- \`STRIPE_PRICE_CHRISTMAS=price_1UeuyKBqpgdO6kHXVdcbmu0e\` — 99 Kč jednorázově
- \`STRIPE_PRICE_PLUS_MONTH=price_1UeuygBqpgdO6kHXIuKTEQqt\` — 129 Kč/měsíc
- \`STRIPE_PRICE_PLUS_YEAR=price_1UeuyjBqpgdO6kHXej54mPhP\` — 1 190 Kč/rok

V ostrém režimu budou později jiné Price ID. **Nikdy nemíchejte testovací a ostré klíče.**

## Bezpečné nasazení

1. Připojte vlastní Supabase projekt s Auth, Postgres a Storage. GitHub Pages nepodporuje bezpečné uložení tajných Stripe klíčů.
2. V SQL Editoru aplikujte postupně migrace ve složce \`supabase/migrations\`.
3. Ověřte, že bucket \`qa-premium\` je soukromý (public=false) a neexistují RLS policies dovolující přístup klientům přímo.
4. Nastavte Supabase Auth (OTP e-mailem), Site URL a redirect: \`https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/\`. Zajistěte doručování přihlašovacích e-mailů a ochranu proti zneužití.
5. Nastavte **Supabase Edge Function secrets**, nikdy je nedávejte do GitHubu ani HTML:

   - \`SUPABASE_URL\` — URL projektu
   - \`SUPABASE_SERVICE_ROLE_KEY\` — serverový klíč (nikdy do klienta)
   - \`STRIPE_SECRET_KEY\` — testovací \`sk_test_...\`
   - \`STRIPE_WEBHOOK_SECRET\` — testovací \`whsec_...\` z webhook endpointu
   - \`STRIPE_PRICE_CHRISTMAS\`, \`STRIPE_PRICE_PLUS_MONTH\`, \`STRIPE_PRICE_PLUS_YEAR\` — výše ověřené testovací Price ID
   - \`SITE_URL=https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/\`
   - \`ADMIN_USER_ID\` — skutečné **Supabase auth user UUID** majitele, nikoli GitHub ID

6. Deploy Edge Functions \`qa-checkout\`, \`qa-template\`, \`qa-billing\`, \`qa-admin\` a \`qa-webhook\`. Každá user function kontroluje Supabase bearer token sama; webhook kontroluje podpis Stripe. V \`config.toml\` je proto \`verify_jwt=false\`.
7. V Stripe TEST mode založte webhook endpoint \`https://<project>.supabase.co/functions/v1/qa-webhook\`. Přihlaste minimálně:
   - \`checkout.session.completed\`, \`checkout.session.async_payment_succeeded\`
   - \`customer.subscription.created\`, \`customer.subscription.updated\`, \`customer.subscription.deleted\`
   - \`invoice.paid\`, \`charge.refunded\`
8. Nahrajte **prémiové originály** do *private* storage na stejnou cestu, kterou požaduje katalog, například \`christmas/CHRISTMAS_001.jpg\`. V žádném případě je neumisťujte na veřejný GitHub.
9. Do veřejného \`index.html\` patří pouze \`window.QA_CONFIG.supabaseUrl\` a veřejný publishable/anon key. Stripe secret a service role nikdy ne.
10. Otestujte přihlášení, tři typy testovacích plateb, testovací webhook, změnu stavu licence, přístup k souborům a refund, správu předplatného a soukromý přehled majitele.

## Akceptační podmínky před ostrým spuštěním

- Před zaplacením musí prémiový soubor vracet 403, po zaplacení krátkodobý signed URL.
- Vánoční nákup zpřístupní pouze Vánoce; Plus zpřístupní prémiovou knihovnu po dobu platného předplatného.
- Po plném refundu jednorázového nákupu se přístup odebere.
- Uživatel bez majitelského UUID nesmí získat údaje o tržbách.
- Pokus o falešný webhook musí skončit HTTP 400.
- Doplnit a zveřejnit obchodní podmínky, GDPR, kontakt provozovatele, pravidla vracení digitálního obsahu, popisy předplatného, cenu a identitu prodávajícího.
- Ověřit Stripe účet, způsob vyplácení a daňové povinnosti, včetně případné DPH u přeshraničního prodeje digitálních služeb (neplátce DPH neznamená automaticky nulovou povinnost ve všech zemích).
- Nenasazovat live Checkout bez úspěšného ostrého end-to-end testu.

## Technická poznámka

Klientské volání serveru: \`POST /functions/v1/qa-template\` s \`{action:'status'}\` nebo \`{action:'asset',path:'christmas/CHRISTMAS_001.jpg'}\`.
Checkout: \`POST /functions/v1/qa-checkout\` s \`{plan:'christmas'|'plus_month'|'plus_year'}\`.
Portal: \`qa-billing\`; soukromé statistiky: \`qa-admin\`.
Každá funkce musí dostat token uživatele v \`Authorization: Bearer <token>\` a \`apikey\` s veřejným Supabase klíčem.

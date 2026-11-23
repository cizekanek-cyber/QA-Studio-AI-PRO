# QA Studio AI PRO — Bezpečné uvedení plateb do provozu

**Stav:** Vývojová větev s připraveným backendovým kódem. **Není nasazeno** a **není povolené inkaso**. Nikdy neslučujte s produkcí pouze podle přítomnosti zdrojových souborů.

## 1) Stripe QA Fusion Direction — testovací ceny ověřené 23. 11. 2026

| Tarif | Price ID v sandboxu | Cena |
|---|---|---|
| Vánoce / christmas | \`price_1UeuyKBqpgdO6kHXVdcbmu0e\` | CZK 99.00, jednorázově |
| Plus / plus_month | \`price_1UeuygBqpgdO6kHXIuKTEQqt\` | CZK 129.00 měsíčně |
| Plus / plus_year | \`price_1UeuyjBqpgdO6kHXej54mPhP\` | CZK 1,190.00 ročně |

Ostré Stripe ceny **nejsou vytvořené**. Pouze testovací Price ID nebudou fungovat s live API klíčem.

## 2) Vytvoření backend projektu — dosud chybí

Supabase je autorizované, ale zatím nebyl nalezen žádný projekt. Vytvořte projekt v oprávněné organizaci (před vytvořením vždy zkontrolujte případné náklady) v EU regionu.

V projektu:
- aplikujte migrace \`supabase/migrations/20261123_qa_billing.sql\` a \`20261123_qa_refunds.sql\`;
- zkontrolujte RLS i revokaci klientských oprávnění k transakcím;
- nastavte \`qa-premium\` jako **private** bucket; originály nikdy neposílejte na public GitHub;
- Auth: email OTP, správná produkční Site URL a povolená Redirect URL, ochrana proti spamu, provozní SMTP;
- přidejte serverová tajemství **pouze** do Supabase Edge Functions.

### Serverové secrets (NE do repozitáře)
\`\`\`
STRIPE_SECRET_KEY=sk_test_... 
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CHRISTMAS=price_1UeuyKBqpgdO6kHXVdcbmu0e
STRIPE_PRICE_PLUS_MONTH=price_1UeuygBqpgdO6kHXIuKTEQqt
STRIPE_PRICE_PLUS_YEAR=price_1UeuyjBqpgdO6kHXej54mPhP
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_USER_ID=<owner-supabase-auth-uuid>
SITE_URL=https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/
\`\`\`
Cizí projekt, vlastní bankovní účet jiného subjektu nebo identity bez ověření nepoužívat. Neplátcovství DPH samo o sobě neřeší všechny daňové povinnosti při prodeji digitálních služeb do zahraničí.

## 3) Edge Functions

Deploy:
- \`qa-checkout\`: založení Stripe Checkout session až po ověřeném přihlášení a plánu;
- \`qa-webhook\`: surové tělo Stripe události, HMAC podpis, zpracování nákupu a změn předplatného;
- \`qa-template\`: licence a expirační podepsané odkazy na soukromé originály;
- \`qa-billing\`: Stripe customer portal pouze pro majitele předplatného;
- \`qa-admin\`: soukromé souhrnné údaje pro \`ADMIN_USER_ID\`.

**Důležité:** \`verify_jwt=false\` se používá pro webhook a pro funkce, které uvnitř používají Supabase Auth \`getUser\`. Ochranné ověření uživatele je v kódu Edge Function, nikoli jen v prohlížeči.

Stripe webhook endpoint:
\`\`\`
https://<project>.supabase.co/functions/v1/qa-webhook
\`\`\`
Události:
\`checkout.session.completed\`,
\`checkout.session.async_payment_succeeded\`,
\`customer.subscription.created\`,
\`customer.subscription.updated\`,
\`customer.subscription.deleted\`,
\`invoice.paid\`,
\`charge.refunded\`.
Podpisový secret pochází ze stejného Stripe prostředí (test / live) jako daný webhook.

## 4) Frontend

Připravený mobilní frontend z místního balíčku \`QA_Studio_GITHUB_PUBLIC_v2.zip\` je zatím **demo**. Po vytvoření Supabase projektu je třeba do **veřejné části pouze** \`window.QA_CONFIG.supabaseUrl\` a \`supabaseAnonKey\` vložit jeho URL a **publishable** klíč, žádný serverový klíč.

Pak nasadit skutečný \`index.html\` do GitHub Pages. Zkontrolovat kompatibilitu s již existující aplikací na \`main\` a zachovat dosavadní zvířecí šablony. Není vhodné dát oba \`index.html\` a \`index-1.html\` bez správné směrovací logiky.

## 5) Povinné integrační testy před spuštěním

1. Zákazník bez licence se nedostane k žádnému placenému souboru ani přes přímou Storage URL.
2. E-mailové přihlášení a odhlášení z telefonu funguje.
3. Checkout 99 Kč v **test mode** vede ke zpracovanému webhooku a licenci Vánoce.
4. Checkout 129 Kč / měsíc aktivuje Plus; 1 190 Kč / rok také.
5. Nezaplacená, zrušená či vypršená licence se nedá použít; duplicitní webhook nezpůsobí duplicitní platbu.
6. Plné vrácení vánočního nákupu deaktivuje licenci. U předplatného se stav řídí posledním stavem ve Stripe.
7. Cizí uživatel nevidí majitelovy statistiky ani platby a nemůže měnit cenu / plán v URL.
8. Uživatel může spravovat a zrušit předplatné přes zákaznický portál.
9. Souhlas s obchodními podmínkami, digitálním obsahem, ochrana soukromí a informace o podnikateli jsou dokončené.
10. Až poté vytvořit **live** produkty a ceny ve Stripe, nahradit serverové testovací secrets živými a samostatně ověřit produkční webhook.

**Stav této větve není pokyn k přijímání plateb.**

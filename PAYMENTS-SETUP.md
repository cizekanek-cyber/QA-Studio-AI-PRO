# QA Studio AI PRO — testovací platební integrace

Stav: **vývojová větev, platby ještě nejsou aktivní na veřejném webu**.

## Ověřené ceny Stripe (TEST MODE, CZK)

| Tarif | Stripe test Price ID | Cena |
|---|---|---|
| Vánoční PREMIUM | `price_1UeuyKBqpgdO6kHXVdcbmu0e` | 99 Kč jednorázově |
| Plus měsíčně | `price_1UeuygBqpgdO6kHXIuKTEQqt` | 129 Kč / měsíc |
| Plus ročně | `price_1UeuyjBqpgdO6kHXej54mPhP` | 1 190 Kč / rok |

Účet: QA Fusion Direction, identifikátor Stripe `acct_1UepFKBqpgdO6kHX`.

## Bezpečnostní pravidla

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` a `SUPABASE_SERVICE_ROLE_KEY` patří **pouze do serverových secrets**.
- Přístup ke knihovně povolí server až po ověření webhooku Stripe a aktivní licence. Ne po návratu na URL „success“.
- Prémiové originály ukládat do *private* bucketu, ne do veřejného repozitáře.
- Statistiky tržeb vracet jen autentizovanému majiteli.
- Produkty v ostrém režimu, webové platební odkazy a přepnutí na živé klíče se provede až po funkčním end-to-end testu a ověření provozovatele.

## Další závislost

Pro skutečné nasazení je potřeba propojený **Supabase projekt**, jeho `project URL` a veřejný `anon` klíč (ne tajný service role). Doporučená struktura: Supabase Auth, PostgreSQL s RLS, Edge Functions, Storage private bucket, Stripe Checkout + webhook.

Webová aplikace: https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/

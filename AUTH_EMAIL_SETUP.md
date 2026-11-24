# QA Studio AI PRO — oprava e-mailových kódů (produkční nastavení)

**Zjištěný problém 24. 11. 2026:** Poslední nový účet se úspěšně zaregistroval a e-mail byl serverem potvrzen, ale následné opakované GET /verify vracely `403: Email link is invalid or has expired`. Současná šablona posílá jednorázové tlačítko **Sign in**, ne číselný kód. Odkaz může být vyčerpán při náhledu e-mailu nebo přesměrovat na nefunkční doménu. **Účet znovu neregistrovat.** Ověřený uživatel se může přihlásit heslem z registrace na funkční adrese.

## Nezbytné nastavení proveditelné jen správcem Supabase
Přímá správa e-mailových šablon: https://supabase.com/dashboard/project/naxotlqvimewbfowxwmw/auth/templates

V projektu Supabase otevři **Authentication → Email Templates** a postupně nahraď těla TĚCHTO TŘÍ šablon obsahem připravených souborů:
- **Confirm signup**: `supabase/email-templates/confirm-signup.html`
- **Magic Link / Magic link or OTP**: `supabase/email-templates/magic-link.html`
- **Reset Password**: `supabase/email-templates/reset-password.html`

Nastav jednoduchý předmět e-mailů, například `QA Studio – ověřovací kód`. Každý soubor používá oficiální proměnnou **`{{ .Token }}`**, ze které Supabase vloží **6místný kód**. V e-mailu není žádný jednorázový ověřovací odkaz, který by mohl automatický skener spotřebovat. Odkaz na login je obyčejná statická stránka bez tokenu, může se otevřít opakovaně.

NEMĚŇ v souborech tvar `{{ .Token }}`. Nezveřejňuj žádné skutečné kódy ani přihlašovací tokeny.

### Který kód kam patří v aplikaci
- Registrace: vyber **Registraci** (ověření `type: signup`).
- E-mailové přihlášení: vyber **Přihlášení** (ověření `type: email`).
- Obnova hesla: vyber **Obnovu hesla** (ověření `type: recovery`), následně nastav nové heslo.

### URL Configuration
https://supabase.com/dashboard/project/naxotlqvimewbfowxwmw/auth/url-configuration

Dokud doména `qa-studio-ai-pro.pages.dev` nebo `qastudioaipro.com` hlásí **522**, používej pro ověření a přihlášení záložní adresu:
`https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/login.html`

Zkontroluj **Site URL** a přidej do **Redirect URLs** přesně tuto funkční login adresu. Pro vlastní doménu přidej URL teprve poté, co hostování funguje. Nikdy nepřesměrovávej zákazníky na localhost nebo na Cloudflare host bez dokončeného nasazení.

### Odesílání e-mailů
Vlastní SMTP musí být nastavené a otestované pro veřejný provoz. Samotná změna šablon NEZVYŠUJE bezplatný limit odesílání Supabase. Při chybě `429 over_email_send_rate_limit` není vhodné opakovaně vyžadovat kód.

### Testovací postup
1. Použij jednu e-mailovou adresu, která **nemá** potvrzený účet; vytvoř nové testovací přihlášení heslem.
2. Potvrď, že nový e-mail obsahuje **6 číslic** a žádné ověřovací tlačítko, které by spotřebovalo token.
3. Na stránce `login.html` zadej e-mail, vyber „Registrace“, zadej kód a ověř.
4. Odhlas a přihlas se heslem; ověř, že se uživatel dostane do studia.
5. Ověř reset hesla a přihlášení číselným kódem, vždy jen **jednou**, abys nepřekročil SMTP limit.
6. Před ostrým prodejem musí fungovat celý proces také na finální doméně Cloudflare a v mobilním prohlížeči.

**Status:** Tyto šablony jsou v GitHub repozitáři připravené; aktivace vyžaduje administrátorské uložení v Supabase. GitHub Pages i Cloudflare samotné neumí nastavit autentizační e-maily za Supabase.

Oficiální dokumentace: https://supabase.com/docs/guides/auth/auth-email-templates

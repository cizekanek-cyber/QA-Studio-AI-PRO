# QA Studio AI PRO

![QA Studio AI PRO — creative studio](assets/qa-hero-campaign.webp)

**One creative workspace. More possibilities.**  
*Jedno kreativní studio. Více možností.*

![Status: Public beta](https://img.shields.io/badge/Status-Public%20beta-202940)
![Platform: Web and mobile](https://img.shields.io/badge/Platform-Web%20%26%20Mobile-d4af37)

[Open the beta / Otevřít beta verzi](https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/beta/) · [Account / Účet](https://cizekanek-cyber.github.io/QA-Studio-AI-PRO/login.html) · [Project feedback / Zpětná vazba](https://github.com/cizekanek-cyber/QA-Studio-AI-PRO/issues)

---

## English

QA Studio AI PRO is a mobile-friendly creative workspace designed to bring image, video, audio and AI-assisted creation together in one interface. The goal is to make professional creative workflows accessible to independent creators and small businesses.

### Explore the beta

| Area | Current status |
| --- | --- |
| Creative editor | Public beta |
| Template gallery | Beta browsing; original collections in production |
| Account access | Sign-in and recovery implemented; production email verification pending |
| PRO passes and credits | Plan catalogue; customer purchases not enabled |
| External AI generation | Planned; disabled until provider and billing validation |

### Creative direction

- Photography, nature, landscapes and seasonal scenes
- Realistic animals, people and fantasy characters
- Transparent PNG objects for creative compositions
- Video, voice, animation and lip-sync workflows (planned)
- A unified workspace for multiple AI providers (planned)
- Original 4K collections: target of 50 distinct assets per category, not current inventory

![Creative gallery preview](assets/gallery-hero.webp)

*Illustrative gallery artwork; not a statement of available downloadable inventory.*

### Our approach

One transparent customer price for paid AI workflows is the intended model, including provider costs. Customer billing and external inference will only be enabled after security, payment and end-to-end tests pass. The beta should not be treated as a production paid service.

---

## Česky

QA Studio AI PRO je kreativní aplikace pro web a mobilní zařízení. Naším cílem je spojit tvorbu obrázků, videa, zvuku a práci s umělou inteligencí do jednoho přehledného prostředí.

### Co připravujeme

- Jednotný kreativní editor a tematické knihovny.
- Realistické fotografie, zvířata, fantasy postavy a samostatné objekty na průhledném pozadí.
- Originální šablony ve 4K kvalitě; cílově 50 unikátních položek na kategorii.
- Animace, dabing, synchronizaci rtů a propojení více AI nástrojů.
- Placené přístupy PRO s transparentní cenou.

**Aktuální stav:** veřejná beta. Produkční přihlašování, ověřování e-mailů, placené funkce a externí generování vyžadují dokončení a ověření. Ne všechny plánované funkce jsou dostupné.

---

## Development & release / Vývoj a vydání

- [Release checklist / Kontrola připravenosti](LAUNCH_READINESS.md)
- [Original asset production / Tvorba šablon](ASSET_PRODUCTION.md)
- [Hosting setup / Nastavení hostingu](CLOUDFLARE_SETUP.md)

Automated development checks:

```sh
node --test tests/qa-release.test.cjs
node scripts/build-cloudflare.cjs
node --test tests/qa-cloudflare.test.cjs
```

Automated checks do not replace real mobile-device, authentication or live-payment verification.

---

**QA Studio AI PRO** · Create. Edit. Connect.

Developed by [cizekanek-cyber](https://github.com/cizekanek-cyber).

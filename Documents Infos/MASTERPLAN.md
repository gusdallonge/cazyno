# MASTERPLAN CAZYNO — De A à Z

---

## 0. ÉTAT ACTUEL (ce qui est fait)

| Composant | Statut | Détail |
|---|---|---|
| Frontend React + Vite + Tailwind | 60% | 18 pages, composants UI, thème dark |
| Backend Fastify + PostgreSQL | 40% | Auth JWT, CRUD profils/rounds/tickets |
| Jeux Originals (maison) | 70% | Dice, Blackjack, Plinko, Crash, Roulette, PulseBomb, ChickenDrop |
| PWA | ✅ | manifest.json + service worker |
| Cloudflare Turnstile | ✅ | Anti-bot sur login/signup |
| Howler.js (sons) | ✅ | Sons synthétisés cross-browser |
| i18n | 10% | FR seulement, structure basique |
| Paiements | ❌ | Rien de connecté |
| SEO | ❌ | Aucune page publique |
| Mailing | ❌ | Placeholder uniquement |
| Admin avancé | ❌ | Basique seulement |
| Licence Curaçao | ❌ | Pas encore demandée |
| VPS | ❌ | Pas encore commandé |

---

## 1. INFRASTRUCTURE & HÉBERGEMENT

### 1.1 VPS — UltaHost Curaçao

| Élément | Choix | Coût |
|---|---|---|
| Serveur | Ulta-X2 dédié (6 cores Xeon, 32GB DDR4, 512GB SSD) | 110$/mois |
| OS | Ubuntu 24.04 LTS | 0$ |
| Reverse proxy | Caddy (auto-SSL) | 0$ |
| DB | PostgreSQL 16 natif (pas Docker) | 0$ |
| Backend | Node.js 22 LTS + Fastify | 0$ |
| Frontend | Build statique servi par Caddy | 0$ |
| Monitoring | Uptime Kuma + htop | 0$ |

**Config serveur :**
```
Caddy
├── cazyno.com → /var/www/cazyno (frontend static)
├── api.cazyno.com → localhost:3001 (Fastify backend)
└── admin.cazyno.com → localhost:3001 (même backend, route guard)
```

### 1.2 DNS & CDN — Cloudflare

| Service | Détail | Coût |
|---|---|---|
| DNS | Cloudflare (proxied) | 0$ |
| CDN | Cache assets statiques mondial | 0$ |
| DDoS | Protection L3/L4/L7 incluse | 0$ |
| WAF | Règles anti-bot de base | 0$ |
| Turnstile | Captcha invisible login/signup | 0$ |
| Bot Management | Fingerprinting avancé | 0$ (free tier) |

### 1.3 Domaine

| Domaine | Registrar | Coût |
|---|---|---|
| cazyno.com ou cazyno.gg | Cloudflare Registrar | 10-15$/an |

---

## 2. LICENCE & LÉGALITÉ — Curaçao (LOK 2024)

### 2.1 Nouvelle réglementation LOK (en vigueur depuis 24/12/2024)

Le système de "master license + sub-license" est terminé. Nouveau régime :

| Élément | Détail |
|---|---|
| Autorité | Curaçao Gaming Authority (CGA) |
| Type de licence | B2C (opérateur direct) |
| Frais de dossier | €4 592 (non remboursable) |
| Frais annuels | €47 450/an (€24 490 trésor + €22 960 CGA) |
| Entité locale | Obligatoire — société NV ou BV à Curaçao |
| Employés locaux | Minimum 3 employés permanents sur l'île |
| Directeur local | Obligatoire — au moins 1 directeur résident |
| Délai | ~8 semaines par phase (2-3 mois total) |
| AML/KYC | Politique complète obligatoire |
| RNG | Certification obligatoire (iTech Labs, GLI, BMM) |
| Serveurs | Physiquement à Curaçao (✅ UltaHost) |

### 2.2 Documents requis

- [ ] Articles of Association / Certificate of Incorporation
- [ ] Passeports + justificatifs de domicile de tous les bénéficiaires/directeurs
- [ ] États financiers / preuve de fonds
- [ ] Business plan complet (plateforme, jeux, marchés cibles)
- [ ] Politique AML/KYC complète
- [ ] Documentation compliance interne
- [ ] Certification RNG (iTech Labs ~$5000-15000)
- [ ] Audit de sécurité technique

### 2.3 Budget licence

| Poste | Coût estimé |
|---|---|
| Frais de dossier CGA | €4 592 |
| Licence annuelle | €47 450 |
| Entité juridique Curaçao (NV) | €3 000 - €5 000 |
| Avocat/consultant gaming | €10 000 - €20 000 |
| Certification RNG | €5 000 - €15 000 |
| Audit sécurité | €3 000 - €8 000 |
| **Total lancement licence** | **€73 000 - €100 000** |

### 2.4 Pages légales obligatoires à créer

- [ ] `/terms` — Conditions Générales d'Utilisation
- [ ] `/privacy` — Politique de Confidentialité (RGPD-like)
- [ ] `/responsible-gambling` — Jeu Responsable (auto-exclusion, limites)
- [ ] `/aml-policy` — Politique Anti-Blanchiment
- [ ] `/kyc` — Processus de Vérification d'Identité
- [ ] `/fairness` — Provably Fair / Certification RNG
- [ ] `/about` — À propos + numéro de licence
- [ ] `/complaints` — Procédure de réclamation

---

## 3. JEUX — Originals (maison) + Providers (licence)

### 3.1 Jeux Originals (Provably Fair — déjà buildés ou à builder)

Nos propres jeux, 0% commission provider, marge maximale.

| Jeu | Statut | House Edge | Action |
|---|---|---|---|
| Dice | ✅ Fait | 2% | Migrer le RNG côté serveur |
| Blackjack | ✅ Fait | 1.5% | Migrer le RNG côté serveur |
| Plinko | ✅ Fait | 1-3% | Migrer le RNG côté serveur |
| Crash | ✅ Fait | 3-4% | Migrer le RNG côté serveur |
| Roulette | ✅ Fait | 2.7% | Migrer le RNG côté serveur |
| PulseBomb | ✅ Fait | 3% | Migrer le RNG côté serveur |
| ChickenDrop | ✅ Fait | Variable | Migrer le RNG côté serveur |
| **Mines** | ❌ À créer | 2-3% | Grille 5x5, cliquer sans toucher les mines |
| **Limbo** | ❌ À créer | 1% | Target multiplier, crash ou win |
| **Keno** | ❌ À créer | 3-5% | Grille 40 numéros, sélection |
| **Tower** | ❌ À créer | 2-4% | Monter les étages en évitant les pièges |
| **Wheel** | ❌ À créer | 2-5% | Roue de la fortune avec segments |
| **HiLo** | ❌ À créer | 2% | Carte suivante plus haute ou basse |
| **Coinflip** | ❌ À créer | 1% | Pile ou face simple |
| **Video Poker** | ❌ À créer | 1-3% | Jacks or Better, Deuces Wild |

**CRITIQUE : Tout le RNG doit être migré côté serveur** (actuellement côté client = triché possible). Implémentation Provably Fair avec HMAC-SHA256 (server seed + client seed + nonce).

### 3.2 Jeux Providers (licence via Aggregator)

Pour avoir des slots, live casino, etc. avec de vrais graphismes professionnels.

**Recommandation : passer par un Game Aggregator** — un seul contrat, une seule API, accès à des milliers de jeux.

| Aggregator | Jeux disponibles | Modèle prix | Avantage |
|---|---|---|---|
| **SoftSwiss** | 30 000+ jeux, 200+ providers | Revenue share GGR 10-15% | Le plus complet |
| **SoftGamings** | 15 000+ jeux, 100+ providers | Revenue share GGR | Bon pour les startups |
| **Celesta Tech** | 7 500+ jeux, 100+ studios | Revenue share GGR | Plus abordable |
| **St8.io** | 10 000+ jeux | Revenue share GGR | API moderne |

**Providers inclus via aggregator :**

| Provider | Type | Jeux populaires |
|---|---|---|
| **Pragmatic Play** | Slots + Live | Gates of Olympus, Sweet Bonanza, Mega Dice |
| **Evolution** | Live Casino | Lightning Roulette, Crazy Time, Dream Catcher |
| **NetEnt** | Slots | Starburst, Gonzo's Quest, Dead or Alive |
| **Play'n GO** | Slots | Book of Dead, Reactoonz |
| **Hacksaw Gaming** | Slots | Wanted Dead or Wild, Chaos Crew |
| **Push Gaming** | Slots | Jammin' Jars, Fat Rabbit |
| **Nolimit City** | Slots | Mental, San Quentin |
| **Red Tiger** | Slots | Gonzo's Gold, Dragon's Fire |
| **BGaming** | Crypto slots | Provably fair, crypto-native |

**Budget aggregator :** pas de coût fixe — revenue share sur le GGR (10-15%). Tu ne paies que quand tu gagnes.

**Setup fee typique :** €5 000 - €15 000 one-time.

### 3.3 Intégration technique

```
Frontend (React)
  └→ API /games/play/:gameId
        └→ Backend vérifie auth + solde
              └→ Aggregator API (SoftSwiss/SoftGamings)
                    └→ Provider (Pragmatic, Evolution...)
                          └→ Game URL en iframe ou popup
```

Le backend gère les callbacks de l'aggregator (bet, win, refund) pour mettre à jour le solde du joueur en temps réel.

---

## 4. PAIEMENTS — Crypto + CB (sans Stripe)

### 4.1 Crypto natif (wallets directs)

| Crypto | Réseau | Confirmation | Action |
|---|---|---|---|
| Bitcoin (BTC) | Bitcoin | ~10 min | Adresse de dépôt par user |
| Ethereum (ETH) | Ethereum/L2 | ~1 min | Smart contract ou adresse |
| USDT | Tron (TRC-20) | ~3 sec | Le plus utilisé en gambling |
| USDC | Ethereum/Polygon | ~1 min | Stablecoin alternatif |
| Solana (SOL) | Solana | ~0.4 sec | Rapide, fees quasi nulles |
| Litecoin (LTC) | Litecoin | ~2.5 min | Alternative BTC rapide |

**Implémentation :** HD wallet (hierarchical deterministic) — chaque joueur reçoit une adresse unique dérivée d'un master seed. Le backend surveille les transactions entrantes via un node ou un service comme BlockCypher / Alchemy.

### 4.2 MoonPay — Fiat → Crypto intégré

Permet aux joueurs d'acheter du crypto directement sur la plateforme avec leur CB, sans quitter le site.

| Élément | Détail |
|---|---|
| Widget | Iframe ou SDK JavaScript |
| Méthodes | Visa, Mastercard, Apple Pay, Google Pay, virement |
| Cryptos | BTC, ETH, USDT, SOL, 80+ |
| Frais | 3.5-4.5% (payé par le joueur) |
| KYC | Géré par MoonPay (pas par nous) |
| Disponibilité | 160+ pays |
| API | `dev.moonpay.com` |
| Intégration | 2-3 jours |

### 4.3 Swapped — Crypto swap

| Élément | Détail |
|---|---|
| Fonction | Échange crypto-to-crypto on-platform |
| Exemple | Joueur a du BTC, veut jouer en USDT → swap instantané |
| Frais | 0.5-1% |
| API | Widget intégré |

### 4.4 Retraits

| Méthode | Délai | Min/Max |
|---|---|---|
| Crypto direct | < 10 min (objectif Rainbet) | Min $10 / Max selon VIP |
| Hot wallet | Pour les retraits courants (auto) | Jusqu'à $5000 |
| Cold wallet | Pour les gros montants (manuel) | > $5000, vérification admin |

### 4.5 Budget paiements

| Poste | Coût |
|---|---|
| MoonPay setup | Gratuit (revenue share sur leurs frais) |
| Node crypto monitoring (Alchemy) | $0-49$/mois selon volume |
| Hot wallet initial (liquidité) | $5 000 - $20 000 en crypto |
| **Total** | **$5 000 - $20 000 initial** |

---

## 5. REDESIGN COMPLET — Basé sur l'analyse concurrentielle

### 5.1 Layout cible (standard Stake)

```
┌──────────────────────────────────────────────────────────────────┐
│ TOP BAR 56px sticky                                              │
│ [Logo] [Casino | Sports] [Search] ........ [Wallet] [Profil]    │
├──────────┬──────────────────────────────────────────┬────────────┤
│ SIDEBAR  │ CONTENT (flex-grow)                      │ CHAT       │
│ 240px    │                                          │ 280px      │
│ collapse │ Hero: Daily Race + jackpot               │ dismissible│
│ → 60px   │ Trending Now (live player counts)        │            │
│          │ New Releases                              │ Live wins  │
│ Favoris  │ Originals                                │ Rain/Tips  │
│ Originals│ Live Casino                              │            │
│ Live     │ Last Played (perso)                      │            │
│ Slots    │ Slots by Provider                        │            │
│ Table    │                                          │            │
│ ──────── │ Grille 5-6 cols, cards 3:4 portrait      │            │
│ Promos   │ Hover: Play + Demo + RTP + joueurs       │            │
│ VIP Club │                                          │            │
│ ──────── │                                          │            │
│ Support  │                                          │            │
│ ──────── │                                          │            │
│ VIP bar  │                                          │            │
└──────────┴──────────────────────────────────────────┴────────────┘
```

### 5.2 Design System

| Élément | Choix | Raison |
|---|---|---|
| BG | `#0d1117` / `#161b22` | Style Rainbet, le plus moderne |
| Accent primaire | `#00FF66` (vert néon) | Déjà en place, signature Cazyno |
| Accent secondaire | `#6e40f5` (violet) | Pour les bonus/VIP |
| Font | **Geist** ou **DM Sans** | Différenciateur vs Inter (tout le monde) |
| Cards | Ratio 3:4, border-radius 16px | Standard du secteur |
| Animations | Framer Motion (déjà installé) | Transitions fluides |

### 5.3 Filtres du lobby (différenciateurs)

- [ ] Recherche prédictive (3 frappes max)
- [ ] Par provider
- [ ] Par popularité (live player count)
- [ ] **Par volatilité** (Low/Med/High) — **GAP #2 personne ne le fait**
- [ ] Par RTP
- [ ] Favoris
- [ ] Demo mode
- [ ] Boosted RTP section (à la Gamdom)

### 5.4 Mobile (Bottom Nav 4 tabs)

```
┌─────────────────────────────────────┐
│ [Browse] [Casino] [Sports] [Profil] │
└─────────────────────────────────────┘
```

- Grille 4 jeux par ligne (pas 2)
- Sidebar = overlay full-screen
- Wallet 1-tap toujours visible top-right

---

## 6. SYSTÈME VIP — 24 micro-paliers (modèle Gamdom)

### 6.1 Structure

| Tier | Paliers | XP requis (wagered) | Rakeback | Bonus level-up |
|---|---|---|---|---|
| Bronze | 1, 2, 3 | 0 / 5K / 15K | 5% | $5 / $15 / $30 |
| Silver | 1, 2, 3 | 30K / 60K / 100K | 7% | $50 / $80 / $120 |
| Gold | 1, 2, 3 | 200K / 400K / 700K | 10% | $200 / $350 / $500 |
| Platinum | 1, 2, 3 | 1M / 2M / 3.5M | 12% | $800 / $1.2K / $2K |
| Diamond | 1, 2, 3 | 5M / 8M / 12M | 15% | $3K / $5K / $8K |
| Emerald | 1, 2, 3 | 18M / 25M / 35M | 18% | $12K / $18K / $25K |
| Ruby | 1, 2, 3 | 50M / 75M / 100M | 20% | $35K / $50K / $70K |
| Obsidian | 1, 2, 3 | 150M / 250M / 500M | 25%+ | Bespoke, VIP host dédié |

- **Accès VIP dès l'inscription** (Bronze 1 automatique)
- **Rakeback instantané visible dans le header** (compteur temps réel)
- **Welcome rakeback 50% sur 7 jours** sans wagering
- **VIP host dédié** à partir de Platinum 2
- **VIP progress bar** dans la sidebar

### 6.2 Bonus system

| Bonus | Détail |
|---|---|
| Welcome | 50% rakeback 7 jours, sans wagering |
| KYC Bonus | $10 automatique après vérification |
| Daily Reward | Rewards Calendar (connexion quotidienne) |
| Daily Race | Pool quotidien auto-tracking, sans opt-in |
| Weekly Raffle | Tirage hebdo parmi les joueurs actifs |
| Cashback | 10% à vie sur les pertes nettes |
| Reload | Bonus quotidien pour Platinum+ |

---

## 7. AUTH & ONBOARDING

### 7.1 Méthodes de connexion

| Méthode | Priorité | Impact conversion |
|---|---|---|
| Email + mot de passe | ✅ Fait | Base |
| **Google SSO** | ❌ À faire | +18% conversion |
| **Telegram SSO** | ❌ À faire | +12% (audience crypto) |
| Discord SSO | ❌ Optionnel | Communauté gaming |
| Apple SSO | ❌ Optionnel | iOS users |
| **Demo sans compte** | ❌ À faire | +12% signup post-demo |

### 7.2 Onboarding Wizard (GAP #1 — personne ne le fait)

```
Étape 1: "Quel type de joueur es-tu ?"
  → Slots / Table Games / Crash & Originals / Sports / Tout

Étape 2: "Ton budget par session ?"
  → Fun ($10-50) / Regular ($50-200) / High Roller ($200+)

Étape 3: "Comment tu veux déposer ?"
  → J'ai déjà du crypto → adresse wallet
  → Carte bancaire → MoonPay intégré
  → Je veux d'abord essayer → Mode demo
```

→ Lobby personnalisé selon les réponses

### 7.3 KYC

- No-KYC jusqu'au premier retrait (+30% signups)
- KYC obligatoire pour retrait > $2000
- Vérification via Sumsub ou Onfido ($0.5-2 par vérif)
- KYC Bonus $10 pour encourager la vérification

---

## 8. LANGUES — 7 langues

| Langue | Code | Marché cible |
|---|---|---|
| Anglais | `en` | Monde entier |
| Français | `fr` | France, Afrique francophone, Canada |
| Russe | `ru` | Russie, CIS |
| Espagnol | `es` | Amérique latine, Espagne |
| Portugais | `pt` | Brésil, Portugal |
| Chinois simplifié | `zh` | Chine, Asie |
| Arabe | `ar` | MENA (RTL layout nécessaire) |

**Implémentation :**
- Fichiers JSON par langue dans `src/locales/{lang}.json`
- Hook `useLang()` déjà existant — étendre avec i18next
- Détection auto de la langue du navigateur
- Sélecteur de langue dans le header (déjà le composant)
- **RTL** : Tailwind `dir="rtl"` pour l'arabe

**Coût traduction :** ~$0.05-0.10/mot × ~5000 mots × 6 langues = **$1 500 - $3 000** (ou IA + relecture humaine pour moins cher)

---

## 9. SEO — Pages géolocalisées

### 9.1 Structure

```
/                           → Landing page publique (pas de login requis)
/casino                     → Lobby jeux
/casino/slots               → Catégorie slots
/casino/live                → Catégorie live
/games/:slug                → Page jeu individuelle (SEO + demo)
/city/:country/:city        → Pages géolocalisées
/blog/:slug                 → Articles SEO
/promotions                 → Page promos publique
```

### 9.2 Pages villes (SEO programmatique)

Génération automatique de pages pour chaque ville ciblée :

```
/city/fr/paris          → "Casino en ligne Paris - Jouez sur Cazyno"
/city/fr/marseille      → "Casino en ligne Marseille - Jouez sur Cazyno"
/city/br/sao-paulo      → "Cassino online São Paulo - Jogue no Cazyno"
/city/ru/moscow         → "Онлайн казино Москва - Играйте на Cazyno"
```

**Implémentation :**
- Base de données de villes (CSV avec 500-5000 villes)
- Template par langue avec variables (ville, pays, devise locale)
- Sitemap XML dynamique
- Schema.org LocalBusiness + GamingService markup
- Méta tags Open Graph par page
- Contenu unique par ville (IA-generated, ~200-300 mots)

### 9.3 SEO technique

- [ ] `robots.txt`
- [ ] `sitemap.xml` dynamique
- [ ] Meta tags par page (title, description, OG, Twitter)
- [ ] Schema.org structured data
- [ ] Canonical URLs
- [ ] Hreflang tags (7 langues)
- [ ] Core Web Vitals optimisé (Vite = rapide)
- [ ] SSR ou pré-rendering pour les pages publiques (Vite SSG plugin)

---

## 10. MAILING PROACTIF

### 10.1 Provider — Resend

| Élément | Détail |
|---|---|
| Provider | Resend.com |
| Free tier | 100 emails/jour, 3000/mois |
| Pro | $20/mois pour 50K emails |
| API | Simple, moderne, déjà prévu dans le backend |

### 10.2 Emails transactionnels

| Email | Trigger | Priorité |
|---|---|---|
| Welcome | Inscription | P0 |
| Email verification | Inscription | P0 |
| Dépôt confirmé | Blockchain confirmation | P0 |
| Retrait en cours | Demande de retrait | P0 |
| Retrait envoyé | Retrait processé | P0 |
| KYC requis | Premier retrait > $2000 | P0 |
| Level up VIP | Nouveau palier atteint | P1 |
| Daily reward disponible | Chaque jour si non claim | P1 |
| Inactivité 3 jours | Pas de login depuis 3j | P1 |
| Inactivité 7 jours | Pas de login depuis 7j + bonus retour | P1 |
| Gros win | Win > $500 (social proof email) | P2 |
| Promo hebdo | Chaque lundi | P2 |
| Newsletter | Bi-mensuelle | P2 |

### 10.3 Backend — Cron jobs

```
server/
  jobs/
    dailyRewards.js      # Vérifie les daily rewards non réclamés → email
    inactivityCheck.js    # Users inactifs 3j/7j → email de retour
    weeklyPromo.js        # Email promo hebdo à tous les users opt-in
    vipLevelCheck.js      # Vérifie les level-ups → email + notification
```

Utiliser `node-cron` ou un simple `setInterval` dans le serveur Fastify.

---

## 11. ADMIN DASHBOARD — Ultra sécurisé

### 11.1 Sécurité

| Mesure | Détail |
|---|---|
| URL séparée | `admin.cazyno.com` (pas /admin) |
| 2FA | TOTP (Google Authenticator) obligatoire |
| IP whitelist | Seules certaines IPs peuvent accéder |
| Rate limiting | 5 tentatives max puis lockout 15min |
| Audit log | Chaque action admin logguée (qui, quoi, quand) |
| Rôles | Super Admin / Admin / Support / Finance |
| Session | Expire après 30 min d'inactivité |

### 11.2 Modules du dashboard

| Module | Fonctionnalités |
|---|---|
| **Dashboard** | Revenue temps réel, users actifs, GGR, dépôts/retraits du jour, alertes |
| **Users** | Recherche, profil détaillé, ajuster solde, ban, freeze, notes, KYC status, historique complet |
| **Finance** | Dépôts/retraits en attente, approuver/rejeter, balance hot/cold wallet, P&L par jour/semaine/mois |
| **Jeux** | Stats par jeu (GGR, RTP effectif, sessions), big wins, suspicions de triche |
| **Support** | Tickets en temps réel, répondre, escalader, SLA tracking |
| **Marketing** | Envoyer emails, créer promos, gérer Daily Race, configurer bonus |
| **Affiliés** | Liste affiliés, commissions, paiements, stats par affilié |
| **VIP** | Liste VIP, progression, attribuer VIP host, bonus manuels |
| **Sécurité** | Audit log, IP suspectes, multi-comptes détection, 2FA management |
| **SEO** | Gérer les pages villes, voir les stats crawl, générer du contenu |
| **Config** | House edge par jeu, limites de mise, limites de retrait, maintenance mode |

---

## 12. IA — ClawdBot + Intégrations

### 12.1 ClawdBot sur Telegram

Bot Telegram connecté au VPS pour :

| Commande | Action |
|---|---|
| `/status` | Stats serveur (CPU, RAM, users actifs, revenue du jour) |
| `/users` | Nombre d'inscrits, actifs 24h, nouveaux aujourd'hui |
| `/revenue` | GGR du jour, dépôts, retraits, P&L |
| `/alert` | Configurer des alertes (gros win, serveur down, retrait > $X) |
| `/ban @email` | Ban un joueur |
| `/freeze @email` | Freeze les retraits |
| `/promo create` | Créer une promo rapide |
| `/deploy` | Trigger un redéploiement du frontend |
| `/fix "description"` | Crée un ticket de bug et peut proposer un fix via Claude API |
| `/logs` | Dernières erreurs serveur |

**Stack :** Node.js + grammy (Telegram bot framework) + Anthropic Claude API

### 12.2 IA dans la plateforme

| Feature | Usage |
|---|---|
| **Support chatbot** | ✅ Déjà fait (Claude Haiku) |
| **Recommandations jeux** | "Parce que vous jouez à Plinko..." — GAP #4 |
| **Détection fraude** | Patterns de jeu anormaux, multi-comptes, bot detection |
| **Contenu SEO** | Génération de texte pour les pages villes/blog |
| **Traduction** | Assistance traduction des 7 langues |
| **Admin assistant** | Résumé des incidents, suggestions d'action dans le dashboard |

---

## 12B. PROGRAMME AFFILIÉ — Modèle Stake (NGR)

### Modèle de commission : % du Net Gaming Revenue (NGR)

**Identique à Stake.** On ne paie PAS sur le volume misé, on paie sur le profit net réel du casino sur chaque joueur référé.

### Calcul du NGR

```
NGR = Total misé par le joueur - Total gagné par le joueur - Bonus donnés
```

**Exemple concret :**
- Joueur dépose 100€, mise 500€ au total (recycling gains/pertes), finit avec 60€ de solde
- NGR = 100€ (déposé) - 60€ (solde restant) = **40€ de profit casino**
- Commission affilié à 15% = **6€**

**Si le joueur gagne plus qu'il ne dépose :**
- Joueur dépose 100€, retire 150€
- NGR = 100€ - 150€ = **-50€** (négatif)
- Commission = **0€** (pas de negative carry, le compteur ne descend pas en dessous de 0)

### Grille de commissions

| Niveau | Joueurs actifs référés | Commission NGR | Conditions |
|---|---|---|---|
| **Starter** | 1-10 | **15%** | Par défaut à l'inscription |
| **Bronze** | 11-50 | **20%** | Automatique |
| **Silver** | 51-200 | **25%** | Automatique |
| **Gold** | 200+ | **30%** | Automatique |
| **VIP** | Sur demande | **30-45%** | Négocié, pour les gros affiliés/influenceurs |

> **Note :** Notre base à 15% est plus généreuse que Stake (10% de base). C'est un avantage concurrentiel pour attirer les affiliés au lancement.

### House Edge par jeu (impacte le NGR)

Chaque jeu a un house edge différent qui détermine le NGR théorique :

| Jeu | House Edge | NGR théorique sur 1000€ misés |
|---|---|---|
| Dice | 2% | 20€ |
| Blackjack | 1.5% | 15€ |
| Roulette | 2.7% | 27€ |
| Crash | 3-4% | 30-40€ |
| Plinko | 1-3% | 10-30€ |
| Sports Bets | 3% (fixe) | 30€ |
| Slots (providers) | 3-5% | 30-50€ |

### Règles importantes

1. **Commissions à vie** — tant que le joueur référé joue, l'affilié touche sa commission. Un affilié qui ramène un joueur actif est récompensé indéfiniment.
2. **Commission créditée directement dans le solde de jeu** — PAS de paiement séparé en USDT ou autre. Les commissions tombent automatiquement dans le solde du joueur-affilié. L'objectif : il rejoue avec ses commissions, ce qui génère du volume supplémentaire pour le casino. S'il veut retirer, il peut (c'est son solde normal), mais la friction naturelle fait qu'il rejouera une partie.
3. **Pas de solde affilié séparé** — tout est dans le même wallet. L'affilié voit ses commissions arriver dans son solde comme n'importe quel gain. Pas de page de retrait spéciale, pas de minimum de commission. Ça tombe, c'est jouable immédiatement.
4. **Pas de negative carry** — si un joueur gagne gros un mois, le compteur NGR ne descend pas en négatif pour les mois suivants
5. **Tracking par lien unique** — chaque affilié a un code/lien de referral
6. **Dashboard affilié** — stats en temps réel : joueurs actifs, NGR, commissions gagnées, historique
7. **Sub-affiliés** — possibilité de gagner 5% sur les commissions des affiliés que tu recrutes (niveau 2)

> **Stratégie clé :** En créditant les commissions directement dans le solde de jeu, on crée une boucle vertueuse : l'affilié ramène des joueurs → il gagne des commissions → il rejoue ses commissions → le casino gagne sur ses mises → cycle continu. Le retrait reste possible mais la majorité rejouera naturellement.

### Anti-fraude affilié

- Détection multi-comptes (même IP, même device fingerprint)
- Vérification que les joueurs sont réels (pas de bots)
- Minimum de 3 dépôts par joueur pour valider la commission
- Audit mensuel automatique

### Comparaison avec la concurrence

| Plateforme | Base | Max | Modèle | Negative carry |
|---|---|---|---|---|
| **Cazyno** | **15%** | **45%** | **NGR** | **Non** |
| Stake | 10% | 45% | NGR | Non |
| Gamdom | 10% | 40% | NGR | Oui (!) |
| Rainbet | 15% | 35% | NGR | Non |

> Notre avantage : base plus élevée que Stake, pas de negative carry comme Gamdom, et sub-affiliés en bonus.

---

## 13. FEATURES SOCIALES

| Feature | Priorité | Implémentation |
|---|---|---|
| **Live win ticker** | P0 | Bande défilante sous le top bar (WebSocket) |
| **Chat dismissible** | P1 | Panel droit 280px, toggle on/off |
| **Rain/Tips** | P2 | Joueurs envoient des tips dans le chat |
| **Slot Battles** | P3 | Défi PvP sur un même slot |
| **Leaderboards** | P1 | Weekly/monthly, prize pool visible |

---

## 14. RESPONSIBLE GAMBLING

Obligatoire pour la licence + bon pour l'image.

| Feature | Détail |
|---|---|
| Limites de dépôt | Jour/semaine/mois, configurables par le joueur |
| Limites de mise | Max bet par jeu |
| Limites de perte | Stop-loss automatique |
| Auto-exclusion | 1 semaine / 1 mois / 6 mois / permanent |
| Session timer | Rappel après 1h de jeu |
| **Bankroll manager** | GAP #3 — outil budget intégré, unique sur le marché |
| Reality check | Popup toutes les heures avec bilan session |
| Liens d'aide | GamCare, BeGambleAware, etc. |

---

## 15. TIMELINE

### Phase 1 — Fondations (Semaines 1-3)
*Infrastructure + Légal + Design System*

| Tâche | Semaine | Qui |
|---|---|---|
| Commander VPS UltaHost Curaçao | S1 | Toi |
| Acheter domaine + config Cloudflare | S1 | Toi |
| Setup VPS (PostgreSQL, Node, Caddy) | S1 | Dev (Claude) |
| Lancer le processus licence Curaçao | S1 | Avocat |
| Design system complet (couleurs, fonts, composants) | S1-2 | Dev (Claude) |
| Redesign layout (sidebar + topbar + lobby) | S2-3 | Dev (Claude) |
| i18n setup 7 langues (structure + EN + FR) | S2 | Dev (Claude) |
| Pages légales (terms, privacy, AML, KYC) | S3 | Dev + Avocat |

### Phase 2 — Core Features (Semaines 4-8)
*Auth + Paiements + Jeux + VIP*

| Tâche | Semaine | Qui |
|---|---|---|
| Google SSO + Telegram SSO | S4 | Dev (Claude) |
| Onboarding wizard 3 étapes | S4 | Dev (Claude) |
| Intégration MoonPay (fiat → crypto) | S4-5 | Dev (Claude) |
| Crypto wallets natifs (BTC, ETH, USDT, SOL) | S5-6 | Dev (Claude) |
| Système de retrait automatisé | S5-6 | Dev (Claude) |
| RNG serveur-side pour tous les Originals | S5-7 | Dev (Claude) |
| Créer 5 nouveaux Originals (Mines, Limbo, Keno, Tower, Coinflip) | S6-8 | Dev (Claude) |
| VIP 24 paliers + rakeback temps réel | S6-7 | Dev (Claude) |
| Rewards Calendar + Daily Race | S7-8 | Dev (Claude) |
| Demo mode (jouer sans compte) | S7 | Dev (Claude) |

### Phase 3 — Polish & Launch Prep (Semaines 9-12)
*Admin + Mailing + SEO + Sécurité*

| Tâche | Semaine | Qui |
|---|---|---|
| Admin dashboard ultra complet + 2FA | S9-10 | Dev (Claude) |
| Système mailing Resend (tous les emails) | S9 | Dev (Claude) |
| SEO : pages villes (500+ pages) | S10-11 | Dev (Claude) + IA |
| SEO : sitemap, schema.org, meta tags | S10 | Dev (Claude) |
| Traductions 5 langues restantes (RU, ES, PT, ZH, AR) | S10-11 | IA + Traducteurs |
| RTL support (arabe) | S11 | Dev (Claude) |
| ClawdBot Telegram | S11 | Dev (Claude) |
| Responsible gambling features | S11-12 | Dev (Claude) |
| Live win ticker + chat | S12 | Dev (Claude) |
| Tests de charge + sécurité | S12 | Dev (Claude) |
| **SOFT LAUNCH (beta privée)** | **S12** | **Toi** |

### Phase 4 — Scale (Mois 4-6)
*Aggregator + Marketing + Optimisation*

| Tâche | Mois | Qui |
|---|---|---|
| Contrat Game Aggregator (SoftSwiss/SoftGamings) | M4 | Toi + Dev |
| Intégration 5000+ jeux providers | M4-5 | Dev (Claude) |
| Filtre volatilité dans le lobby | M4 | Dev (Claude) |
| Recommandations IA personnalisées | M4 | Dev (Claude) |
| Programme affilié complet | M4 | Dev (Claude) |
| Bankroll manager intégré | M5 | Dev (Claude) |
| Stats personnelles détaillées | M5 | Dev (Claude) |
| Sports betting (optionnel) | M5-6 | Dev + Provider |
| Slot Battles PvP | M6 | Dev (Claude) |
| **PUBLIC LAUNCH** | **M4-5** | **Toi** |

---

## 16. BUDGET TOTAL

### Coûts one-time

| Poste | Coût estimé |
|---|---|
| Licence Curaçao (dossier + 1ère année) | €73 000 - €100 000 |
| Certification RNG | €5 000 - €15 000 |
| Entité juridique + avocat | €13 000 - €25 000 |
| Game Aggregator setup fee | €5 000 - €15 000 |
| Hot wallet (liquidité crypto) | €5 000 - €20 000 |
| Traductions (6 langues) | €1 500 - €3 000 |
| Design assets (logo, icônes PWA) | €500 - €2 000 |
| KYC provider setup (Sumsub) | €0 - €1 000 |
| **Total one-time** | **€103 000 - €181 000** |

### Coûts mensuels récurrents

| Poste | Coût/mois |
|---|---|
| VPS UltaHost Ulta-X2 dédié | $110 |
| Domaine | ~$1 |
| Cloudflare | $0 |
| Resend (emails) | $0-20 |
| Anthropic API (chatbot + IA) | $5-50 |
| KYC vérifications (Sumsub) | Variable ($0.5-2/vérif) |
| Game Aggregator | 10-15% du GGR |
| Licence annuelle CGA (€47 450 / 12) | ~€3 954/mois |
| **Total fixe mensuel (hors GGR share)** | **~$4 100/mois** |

### Coûts dev

| Approche | Coût |
|---|---|
| **Claude Code (toi + moi)** | $0-200/mois (API usage) |
| Freelance review/audit sécurité | €2 000 - €5 000 (one-time) |

---

## 17. CHECKLIST COMPLÈTE — TODO

### Infrastructure
- [ ] Commander VPS UltaHost Curaçao Ulta-X2
- [ ] Acheter domaine sur Cloudflare Registrar
- [ ] Configurer DNS Cloudflare (proxied)
- [ ] Setup VPS : Ubuntu + PostgreSQL + Node.js + Caddy
- [ ] Déployer le backend Fastify
- [ ] Déployer le frontend (npm run build)
- [ ] SSL via Caddy (automatique)
- [ ] Configurer les backups PostgreSQL (pg_dump quotidien)
- [ ] Configurer UFW firewall (ports 80, 443, 22)
- [ ] Installer Fail2ban
- [ ] Installer Uptime Kuma (monitoring)

### Légal
- [ ] Engager un avocat gaming Curaçao
- [ ] Créer l'entité juridique (NV) à Curaçao
- [ ] Rédiger le business plan pour la CGA
- [ ] Préparer la politique AML/KYC
- [ ] Soumettre la demande de licence B2C
- [ ] Certification RNG (iTech Labs)
- [ ] Audit de sécurité technique
- [ ] Rédiger les CGU, Privacy Policy, Responsible Gambling
- [ ] Employer 3 personnes à Curaçao

### Frontend — Redesign
- [ ] Nouveau design system (couleurs, fonts, spacings)
- [ ] Layout sidebar 240px collapsible
- [ ] Top bar sticky avec search, wallet, profil
- [ ] Game lobby avec grille 5-6 colonnes
- [ ] Game cards 3:4 avec hover (Play + Demo + RTP + joueurs)
- [ ] Live player counts sur chaque card
- [ ] Filtres : provider, popularité, volatilité, RTP, favoris
- [ ] Recherche prédictive
- [ ] Demo mode (jouer sans compte)
- [ ] Boosted RTP section
- [ ] Bottom nav mobile 4 tabs
- [ ] Grille 4 jeux par ligne mobile
- [ ] Live win ticker (bande défilante)
- [ ] Chat dismissible 280px
- [ ] Landing page publique (SEO)

### Frontend — Auth & Onboarding
- [ ] Google SSO (OAuth 2.0)
- [ ] Telegram SSO
- [ ] Onboarding wizard 3 étapes
- [ ] Demo sans inscription
- [ ] No-KYC jusqu'au premier retrait
- [ ] KYC flow (Sumsub widget)

### Frontend — VIP & Bonus
- [ ] 24 micro-paliers VIP
- [ ] VIP progress bar dans la sidebar
- [ ] Rakeback instantané dans le header
- [ ] Welcome rakeback 50% / 7 jours
- [ ] Rewards Calendar quotidien
- [ ] Daily Race auto-tracking
- [ ] KYC Bonus $10

### Frontend — Langues
- [ ] Setup i18next avec 7 langues
- [ ] Fichiers de traduction EN, FR, RU, ES, PT, ZH, AR
- [ ] RTL layout pour l'arabe
- [ ] Sélecteur de langue dans le header
- [ ] Détection auto de la langue navigateur

### Backend — Sécurité
- [ ] RNG côté serveur (HMAC-SHA256 provably fair)
- [ ] Rate limiting sur toutes les routes
- [ ] Input validation (Zod ou Ajv)
- [ ] Helmet headers (security HTTP headers)
- [ ] CORS strict en production
- [ ] Audit log (chaque action admin)
- [ ] Anti-multicompte (fingerprint + IP)
- [ ] 2FA admin (TOTP)

### Backend — Paiements
- [ ] HD wallet generation (BTC, ETH, USDT, SOL, LTC)
- [ ] Monitoring blockchain (dépôts entrants)
- [ ] MoonPay widget intégration
- [ ] Swapped crypto swap
- [ ] Système de retrait auto (hot wallet)
- [ ] Retrait manuel pour gros montants (cold wallet)
- [ ] Historique transactions complet

### Backend — Jeux
- [ ] Migrer RNG côté serveur pour les 7 Originals existants
- [ ] Créer Mines
- [ ] Créer Limbo
- [ ] Créer Keno
- [ ] Créer Tower
- [ ] Créer Coinflip
- [ ] Créer HiLo
- [ ] Créer Wheel
- [ ] Créer Video Poker
- [ ] Intégration Game Aggregator (SoftSwiss ou SoftGamings)
- [ ] Callback handler (bet/win/refund)

### Backend — Mailing
- [ ] Intégrer Resend
- [ ] Email welcome
- [ ] Email vérification
- [ ] Email dépôt confirmé
- [ ] Email retrait
- [ ] Email level-up VIP
- [ ] Email inactivité (3j, 7j)
- [ ] Email promo hebdo
- [ ] Cron jobs (daily rewards, inactivity, promos)

### Admin Dashboard
- [ ] Dashboard temps réel (revenue, users, GGR)
- [ ] Module users complet
- [ ] Module finance (dépôts/retraits)
- [ ] Module jeux (stats, RTP effectif)
- [ ] Module support (tickets)
- [ ] Module marketing (promos, emails)
- [ ] Module affiliés
- [ ] Module VIP
- [ ] Module sécurité (audit log, IP)
- [ ] Module SEO (pages villes)
- [ ] Module config (house edge, limites)
- [ ] 2FA obligatoire
- [ ] IP whitelist
- [ ] Rôles (Super Admin, Admin, Support, Finance)

### SEO
- [ ] Landing page publique
- [ ] Pages villes géolocalisées (500+)
- [ ] Template par langue
- [ ] Sitemap XML dynamique
- [ ] robots.txt
- [ ] Schema.org structured data
- [ ] Open Graph + Twitter Cards
- [ ] Hreflang tags
- [ ] Blog (optionnel)

### IA — ClawdBot
- [ ] Bot Telegram (grammy + Claude API)
- [ ] Commandes : /status, /revenue, /users, /ban, /freeze, /deploy
- [ ] Alertes automatiques (gros win, serveur down)
- [ ] /fix pour proposer des corrections de code

### Responsible Gambling
- [ ] Limites de dépôt (jour/semaine/mois)
- [ ] Limites de mise
- [ ] Stop-loss
- [ ] Auto-exclusion
- [ ] Session timer + reality check
- [ ] Bankroll manager intégré
- [ ] Liens d'aide (GamCare, etc.)

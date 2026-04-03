# CAZYNO

Online crypto casino platform — Provably Fair, instant withdrawals, 16+ original games.

## Stack

- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Fastify + PostgreSQL
- **Auth** : JWT + Magic Code (Resend)
- **RNG** : Provably Fair (HMAC-SHA256)
- **i18n** : 7 languages (FR, EN, RU, ES, PT, ZH, AR)

## Games

Crash, Roulette, Blackjack, Plinko, Dice, Mines, Limbo, Pulse Bomb, Chicken Drop, Trader, Keno, Tower, Coinflip, HiLo, Wheel, Video Poker

## Setup

```bash
# Frontend
npm install
npm run dev

# Backend
cd server
npm install
cp .env.example .env  # configure your DB + API keys
npm run dev
```

## Environment Variables (server/.env)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/cazyno
JWT_SECRET=your-secret
RESEND_API_KEY=your-resend-key
PORT=3001
HOST=0.0.0.0
```

## Deploy

- **Frontend** : Caddy (static files from dist/) or Vercel
- **Backend** : pm2 + Caddy reverse proxy
- **DB** : PostgreSQL 17
- **DNS** : Cloudflare

## License

Proprietary. All rights reserved.

# BTC Trading Bot Dashboard

Public dashboard for a self-learning crypto trading bot powered by Claude AI.

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials (same as bot)
npm run dev
```

## Deploy on Railway

1. Push to GitHub
2. Railway > New Project > Deploy from GitHub
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Railway auto-deploys on push

## Stack

- Next.js 14 (App Router)
- Tailwind CSS (dark theme)
- Recharts (equity curve)
- Supabase Realtime (live updates)

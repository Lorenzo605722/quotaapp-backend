# 🗄️ Setup Database Gratuito (Neon.tech)

## Step 1: Crea Account Neon (2 minuti)

1. Vai su [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (puoi usare GitHub per login veloce)
3. Conferma email

## Step 2: Crea Database (1 minuto)

1. Click "Create Project"
2. Nome: `quotaapp-db` (o quello che vuoi)
3. Region: Scegli la più vicina (es: Europe)
4. Click "Create Project"

## Step 3: Copia Connection String

Dopo aver creato il progetto, vedrai la **Connection String**:

```
postgresql://username:password@ep-xxx-123.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Step 4: Aggiorna .env

Apri il file `.env` in `quotaapp-backend` e sostituisci:

```env
DATABASE_URL="la-tua-connection-string-di-neon"
```

**Esempio:**
```env
DATABASE_URL="postgresql://lollus:AbC123xyz@ep-cool-dream-123456.eu-central-1.aws.neon.tech/quotaapp?sslmode=require"
```

## Step 5: Esegui Migrations (automatico)

Io eseguirò:
```bash
npx prisma migrate dev --name init
```

Questo creerà tutte le tabelle nel database!

## ✅ Fatto!

Database pronto per essere usato. Totale tempo: ~3-4 minuti.

---

## 🆓 Free Tier Neon.tech

- **Storage**: 512 MB (sufficiente per migliaia di utenti)
- **Compute**: Sempre attivo
- **Costo**: €0 per sempre
- **Upgrade**: Quando serve (tipo €10-20/mese per produzione seria)

---

## 🔄 Alternative (se Neon non funziona)

1. **Supabase** - [supabase.com](https://supabase.com) (PostgreSQL free tier)
2. **Railway** - [railway.app](https://railway.app) (PostgreSQL $5/mo)
3. **Vercel Postgres** - Integrato con deploy Vercel ($0.25/GB)

Usa quella che preferisci, il risultato è lo stesso!

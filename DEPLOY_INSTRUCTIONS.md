# 🚀 Deploy Instructions - Step by Step

## ✅ Fatto Automaticamente:
- Repository Git inizializzato
- Codice committato (38 files)

## 📝 Step Manuali (5 minuti):

### 1. Crea Repository GitHub (2 min)

1. Vai su [https://github.com/new](https://github.com/new)
2. **Repository name**: `quotaapp-backend` (o quello che vuoi)
3. **Description**: "Backend API for QuotaApp"
4. **Visibility**: Private (consigliato) o Public
5. ❌ **NON** checkare "Initialize with README" (già presente)
6. Click "Create repository"

### 2. Push su GitHub (1 min)

Dopo aver creato il repo, vedrai delle istruzioni. Usa queste:

```bash
git remote add origin https://github.com/TUO_USERNAME/quotaapp-backend.git
git branch -M main
git push -u origin main
```

Esegui questi comandi nel terminale dentro `quotaapp-backend`.

### 3. Deploy su Vercel (2 min)

1. Vai su [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import il repository `quotaapp-backend`
4. **Framework Preset**: Next.js (dovrebbe auto-detectare)
5. Click "Deploy"

⏳ **Attendi 2-3 minuti per il deploy**

### 4. Configura Environment Variables

**IMPORTANTE**: Il deploy fallirà la prima volta perché manca `DATABASE_URL`.

Dopo il primo deploy:

1. Vai su Vercel Dashboard → Il tuo progetto
2. "Settings" → "Environment Variables"
3. Aggiungi:
   - **Name**: `DATABASE_URL`
   - **Value**: La tua connection string di Neon (copia da `.env`)
   - **Name**: `JWT_SECRET`
   - **Value**: `your-super-secret-key-production` (o usa un random generator)
4. Click "Save"
5. "Deployments" → Click sui 3 puntini del deploy → "Redeploy"

### 5. Test API Pubbliche

Dopo il redeploy, Vercel ti darà un URL tipo:
```
https://quotaapp-backend.vercel.app
```

Testa:
```bash
curl https://quotaapp-backend.vercel.app/api/auth/register
```

✅ **SE FUNZIONA**: Vedi un errore 400 (normale, mancano i dati) o 201 (success)
❌ **SE NON FUNZIONA**: Vedi un 500 o deployment error

---

## 🎉 Deploy Completato!

Il tuo backend è LIVE su Vercel con:
- ✅ Database connesso (Neon)
- ✅ API pubbliche accessibili
- ✅ HTTPS automatico
- ✅ Auto-scaling
- ✅ Zero costi (free tier)

**URL Finale**: `https://quotaapp-backend.vercel.app`

Usa questo URL nell'app React Native! 🚀

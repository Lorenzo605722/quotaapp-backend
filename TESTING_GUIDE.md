# 🧪 Test API Backend

## Server Locale
```
http://localhost:3000
```

## Test Rapido con cURL/PowerShell

### 1. Register Utente
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Risposta Attesa:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "emailVerified": false
  }
}
```

**❗ SALVA IL TOKEN** - Lo userai per le prossime richieste!

---

### 2. Create Milestone
```powershell
$token = "IL_TUO_TOKEN_QUI"

$body = @{
    title = "Comprare una macchina"
    description = "Risparmiare per auto nuova"
    targetDate = "2024-12-31"
    category = "Personale"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/milestones" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body
```

---

### 3. Get Milestones
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/milestones" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }
```

---

### 4. Create Expense
```powershell
$body = @{
    amount = 50.00
    description = "Benzina"
    date = "2024-02-03"
    category = "Trasporti"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/expenses" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body
```

---

### 5. Dashboard Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/stats" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $token" }
```

---

## ✅ Se Tutto Funziona

Vedrai risposte JSON senza errori. Il backend è PRONTO! 🎉

---

## 🔥 Test con Browser (Alternativa)

Apri: http://localhost:3000/api/health (se creo endpoint health)

O usa **Postman**/**Insomnia** per test più visual!

---

## 📊 Verifica Database

Vedi i dati inseriti:
```bash
npx prisma studio
```

Si apre un'interfaccia web su `http://localhost:5555` dove puoi vedere tutte le tabelle e i dati!

# QuotaApp Backend API

Backend RESTful per QuotaApp - Sistema di gestione milestone, spese, calendario e mood tracking.

## 🚀 Stack Tecnologico

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## 📦 Setup Locale

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura Database
Crea un database PostgreSQL (consigliato: [Neon.tech](https://neon.tech) free tier)

Aggiorna `.env`:
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="your-secret-key-change-in-production"
```

### 3. Esegui Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Genera Prisma Client
```bash
npx prisma generate
```

### 5. Avvia Server
```bash
npm run dev
```

Server disponibile su: `http://localhost:3000`

---

## 📚 API Endpoints

### Auth

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}

Response: 201 Created
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Milestones

#### List Milestones
```http
GET /api/milestones
Authorization: Bearer {token}

Response: 200 OK
{
  "milestones": [
    {
      "id": "...",
      "title": "Buy a car",
      "description": "Save for new car",
      "targetDate": "2024-12-31T00:00:00.000Z",
      "category": "Personal",
      "status": "active",
      "totalExpenses": 5000,
      "expenseCount": 10,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Create Milestone
```http
POST /api/milestones
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Buy a car",
  "description": "Save for new car",
  "targetDate": "2024-12-31",
  "category": "Personal",
  "status": "active"
}

Response: 201 Created
```

#### Get Milestone
```http
GET /api/milestones/{id}
Authorization: Bearer {token}
```

#### Update Milestone
```http
PUT /api/milestones/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated title",
  "status": "completed"
}
```

#### Delete Milestone
```http
DELETE /api/milestones/{id}
Authorization: Bearer {token}
```

---

### Expenses

#### List Expenses
```http
GET /api/expenses?milestoneId={id}&category={cat}&startDate={date}&endDate={date}
Authorization: Bearer {token}

Response: 200 OK
{
  "expenses": [ ... ],
  "total": 5000,
  "count": 10
}
```

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.50,
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "category": "Food",
  "milestoneId": "..." // optional
}
```

#### Get Expense
```http
GET /api/expenses/{id}
Authorization: Bearer {token}
```

#### Update Expense
```http
PUT /api/expenses/{id}
Authorization: Bearer {token}
```

#### Delete Expense
```http
DELETE /api/expenses/{id}
Authorization: Bearer {token}
```

---

### Calendar

#### Get Month Entries
```http
GET /api/calendar?month=2024-01
Authorization: Bearer {token}

Response: 200 OK
{
  "entries": [
    {
      "id": "...",
      "date": "2024-01-15T00:00:00.000Z",
      "notes": "Important meeting",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Create/Update Entry
```http
POST /api/calendar
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "notes": "Important meeting"
}
```

---

### Mood Tracking

#### Get Mood History
```http
GET /api/mood?days=30
Authorization: Bearer {token}

Response: 200 OK
{
  "entries": [ ... ],
  "average": 7.5,
  "count": 30
}
```

#### Log Mood
```http
POST /api/mood
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "score": 8,
  "emotionalInsight": "Feeling productive today"
}
```

---

### Dashboard

#### Get Stats
```http
GET /api/dashboard/stats
Authorization: Bearer {token}

Response: 200 OK
{
  "milestones": {
    "active": 5,
    "completed": 2,
    "total": 7
  },
  "expenses": {
    "total": 15000,
    "currentMonth": 2500,
    "byCategory": {
      "Food": 800,
      "Transport": 500,
      "Shopping": 1200
    }
  },
  "mood": {
    "average": 7.5,
    "last7Days": [ ... ]
  },
  "salary": {
    "monthly": 3000,
    "remaining": 500
  }
}
```

---

## 🔐 Autenticazione

Tutte le API (tranne `/api/auth/*`) richiedono autenticazione JWT.

### Header Richiesto:
```
Authorization: Bearer {your_jwt_token}
```

### Ottenere il Token:
1. Register con `/api/auth/register`
2. Login con `/api/auth/login`
3. Usa il `token` ricevuto nelle richieste successive

---

## 🧪 Testing con Postman/Insomnia

1. Importa le richieste sopra
2. Register un nuovo utente
3. Copia il token dalla response
4. Aggiungi l'header `Authorization: Bearer {token}` alle altre richieste
5. Testa tutti gli endpoints!

---

## 🚢 Deploy su Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables on Vercel dashboard
DATABASE_URL=...
JWT_SECRET=...
```

---

## 📝 Database Schema

Vedi `prisma/schema.prisma` per lo schema completo.

**Tabelle:**
- `users` - Utenti e autenticazione
- `milestones` - Obiettivi/traguardi
- `expenses` - Spese
- `calendar_entries` - Voci calendario
- `mood_entries` - Tracking mood giornaliero
- `salary_info` - Informazioni stipendio

---

## 🛠️ Comandi Utili

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Prisma Studio (DB GUI)
npx prisma studio

# Create migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

---

## 📧 Email Service (TODO)

Email verification non ancora implementata. Integrazione consigliata:
- [Resend](https://resend.com) - 3000 email/mese gratis
- [SendGrid](https://sendgrid.com) - Free tier disponibile

---

## 🔒 Sicurezza

- ✅ Password hasate con bcrypt (10 rounds)
- ✅ JWT tokens con expiration (30 giorni)
- ✅ Validation input con Zod
- ✅ CORS configurato
- ✅ Rate limiting (TODO: implementare con Upstash)

---

## 📱 Integrazione React Native

```typescript
// Example API call from React Native
const API_URL = 'http://your-backend-url.vercel.app';

const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  // Store data.token in AsyncStorage
  return data;
};
```

---

## 🐛 Troubleshooting

### Database connection errors
- Verifica DATABASE_URL in `.env`
- Controlla che il database sia accessibile
- Esegui `npx prisma generate`

### CORS errors
- Verifica che il middleware CORS sia attivo
- Controlla l'origin nelle richieste

### JWT errors
- Verifica JWT_SECRET in `.env`
- Controlla che il token sia valido e non scaduto

---

## 📄 License

MIT

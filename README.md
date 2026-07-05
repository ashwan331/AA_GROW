# 🌱 AA_GROW – AI Agriculture Growth Assistant

A full-stack web application for smart farming: plant disease detection, fertilizer recommendations, smart irrigation, crop marketplace, and AI chat assistant.

---

## 🏗 Technology Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS |
| Backend    | Node.js, Express.js               |
| Database   | MySQL 8 (via MySQL Workbench)     |
| Auth       | JWT (jsonwebtoken) + bcrypt       |
| AI (opt.)  | Google Gemini 1.5-flash           |

---

## 📁 Project Structure

```
AA_GROW/
├── backend/
│   ├── package.json
│   ├── .env.example          ← copy to .env and fill in values
│   └── src/
│       ├── server.js          ← Express entry point
│       ├── config/
│       │   └── db.js          ← MySQL pool
│       ├── middleware/
│       │   └── auth.js        ← JWT requireAuth middleware
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── dashboard.controller.js
│       │   ├── disease.controller.js
│       │   ├── fertilizer.controller.js
│       │   ├── marketplace.controller.js
│       │   ├── irrigation.controller.js
│       │   └── ai.controller.js
│       └── routes/
│           ├── auth.routes.js
│           ├── dashboard.routes.js
│           ├── disease.routes.js
│           ├── fertilizer.routes.js
│           ├── market.routes.js
│           ├── irrigation.routes.js
│           └── ai.routes.js
│
├── frontend_patches/          ← Drop these into aa-groww/frontend/src/
│   ├── AuthContext.tsx        → frontend/src/context/AuthContext.tsx
│   ├── Auth.tsx               → frontend/src/pages/Auth.tsx
│   └── .env                   → frontend/.env
│
└── database/
    └── aa_grow.sql            ← Full schema + seed data
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8 (MySQL Workbench or CLI)
- VS Code

---

### Step 1 – Database Setup

1. Open **MySQL Workbench** and connect to your local MySQL server.
2. Open a new Query tab, then run:
   ```sql
   SOURCE /path/to/AA_GROW/database/aa_grow.sql;
   ```
   Or via CLI:
   ```bash
   mysql -u root -p < database/aa_grow.sql
   ```
3. This creates the `aa_grow` database with all tables and seed data.

---

### Step 2 – Backend Setup

```bash
# Navigate into the backend folder
cd AA_GROW/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=aa_grow
JWT_SECRET=aa_grow_super_secret_key_change_me
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=            # optional – leave blank for mock AI
```

Start the backend:
```bash
npm run dev      # development (auto-restart)
# or
npm start        # production
```

You should see:
```
✅  MySQL connected successfully to database: aa_grow
🌱  AA_GROW API running on http://localhost:5000
```

Test the health endpoint: http://localhost:5000/api/health

---

### Step 3 – Frontend Patches

Your existing frontend uses Firebase tokens. Apply these 3 file replacements to switch to JWT:

```bash
# Copy updated AuthContext (JWT-based)
cp AA_GROW/frontend_patches/AuthContext.tsx  aa-groww/frontend/src/context/AuthContext.tsx

# Copy updated Auth page (email/password form → backend)
cp AA_GROW/frontend_patches/Auth.tsx         aa-groww/frontend/src/pages/Auth.tsx

# Copy frontend .env (sets API base URL)
cp AA_GROW/frontend_patches/.env             aa-groww/frontend/.env
```

Then start the frontend:
```bash
cd aa-groww/frontend
npm install
npm run dev
```

Open http://localhost:5173

---

### Step 4 – Login with Demo Credentials

| Email                  | Password    | Role   |
|------------------------|-------------|--------|
| farmer@example.com     | password123 | FARMER |
| priya@example.com      | password123 | FARMER |
| renter@example.com     | password123 | RENTER |
| buyer@example.com      | password123 | BUYER  |

---

## 📡 API Reference

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Auth  `/api/auth`
| Method | Path                | Auth | Description           |
|--------|---------------------|------|-----------------------|
| POST   | /register           | ❌   | Register new user     |
| POST   | /login              | ❌   | Login, returns JWT    |
| POST   | /verify-otp         | ❌   | Verify OTP code       |
| POST   | /resend-otp         | ❌   | Resend OTP            |
| GET    | /me                 | ✅   | Get current user      |
| PUT    | /profile            | ✅   | Update profile        |
| PUT    | /change-password    | ✅   | Change password       |

### Dashboard  `/api/dashboard`
| Method | Path      | Auth | Description                  |
|--------|-----------|------|------------------------------|
| GET    | /summary  | ✅   | Stats, charts, recent activity |
| GET    | /export   | ✅   | Download PDF farm report     |

### Disease Detection  `/api/disease`
| Method | Path       | Auth | Description                    |
|--------|------------|------|--------------------------------|
| POST   | /          | ✅   | Analyse base64 image           |
| GET    | /history   | ✅   | Get user's scan history        |
| DELETE | /:id       | ✅   | Delete a scan                  |

**POST /api/disease body:**
```json
{
  "base64Image": "data:image/jpeg;base64,...",
  "crop_type": "Tomato"
}
```

### Fertilizer  `/api/fertilizer`
| Method | Path       | Auth | Description                    |
|--------|------------|------|--------------------------------|
| POST   | /          | ✅   | Get recommendation + save      |
| GET    | /history   | ✅   | Past recommendations           |
| DELETE | /:id       | ✅   | Delete recommendation          |

**POST /api/fertilizer body:**
```json
{
  "crop_name": "Wheat",
  "soil_type": "Loamy",
  "nitrogen": 30,
  "phosphorus": 20,
  "potassium": 10
}
```

### Marketplace  `/api/market`
| Method | Path           | Auth | Description              |
|--------|----------------|------|--------------------------|
| GET    | /crops         | ❌   | Browse all crop listings |
| GET    | /crops/mine    | ✅   | My listings              |
| GET    | /crops/:id     | ❌   | Single listing detail    |
| POST   | /crops         | ✅   | Create listing           |
| PUT    | /crops/:id     | ✅   | Edit listing             |
| DELETE | /crops/:id     | ✅   | Soft-delete listing      |
| GET    | /rentals       | ❌   | Browse equipment         |
| POST   | /rentals       | ✅   | List equipment for rent  |

### Irrigation  `/api/irrigation`
| Method | Path              | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | /soil             | ✅   | Latest soil reading      |
| POST   | /soil             | ✅   | Record soil data         |
| POST   | /trigger          | ✅   | Trigger irrigation       |
| GET    | /logs             | ✅   | Irrigation history       |
| GET    | /weather-advisory | ✅   | Weather + advice         |

### AI Chat  `/api/ai`
| Method | Path                   | Auth | Description           |
|--------|------------------------|------|-----------------------|
| POST   | /chat                  | ✅   | Chat with AA_GROW AI  |
| GET    | /chat/history          | ✅   | Chat history          |
| GET    | /notifications         | ✅   | User notifications    |
| PUT    | /notifications/:id/read| ✅   | Mark notification read|

---

## 🤖 AI Integration (Optional)

To enable real Gemini AI responses:
1. Get an API key from https://aistudio.google.com
2. Add to your `.env`: `GEMINI_API_KEY=your_key_here`
3. Restart the backend

Without a key, the app uses smart mock responses — fully functional for development and demos.

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 7 days
- Input validation on all endpoints
- CORS restricted to configured frontend URL
- SQL injection prevented via parameterised queries (mysql2/promise)

---

## 🐛 Troubleshooting

**MySQL connection refused:**
- Ensure MySQL service is running: `net start mysql` (Windows) or `sudo systemctl start mysql` (Linux)
- Double-check `DB_PASSWORD` in your `.env`

**CORS error in browser:**
- Verify `FRONTEND_URL` in backend `.env` matches your Vite dev server URL (usually `http://localhost:5173`)

**401 Unauthorized:**
- Token may have expired. Log out and log in again.
- Ensure `Authorization: Bearer <token>` header is being sent.

**Port already in use:**
- Change `PORT=5001` in `.env` and update `VITE_API_URL=http://localhost:5001` in frontend `.env`

---

*Built with ❤️ for Indian farmers – AA_GROW AI Agriculture Growth Assistant*

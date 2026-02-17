# 🚀 Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB running (localhost:27017)

## Installation (5 Minutes)

### 1️⃣ Install Backend
```bash
cd backend
npm install
```

### 2️⃣ Configure Environment
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

The default configuration works for local development.

### 3️⃣ Seed Database
```bash
npm run seed
```

**Demo Credentials Created:**
- Manager: manager@loanrecovery.com / manager123
- Admin: admin@loanrecovery.com / admin123

### 4️⃣ Install Frontend
```bash
cd ../frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Server runs on: http://localhost:5000

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ App runs on: http://localhost:5173

## First Time Usage

1. **Open Browser**: Navigate to http://localhost:5173
2. **Login**: Use manager@loanrecovery.com / manager123
3. **Upload Data**: 
   - Click "Upload Borrower Data"
   - Use sample file or create an XLSX with columns: Customer Name, Loan ID, Phone Number, Loan Amount, Due Date, Last Payment Date, Overdue Days
4. **Start AI Calls**: Click "Start AI Calling"
5. **View Results**: 
   - Check Borrower Directory
   - Read Call History transcripts
   - Review Behavior Analysis

## Troubleshooting

**MongoDB not running?**
```bash
# Start MongoDB service
net start MongoDB
```

**Port 5000 in use?**
```bash
# Change PORT in backend/.env
PORT=5001
```

**Dependencies issues?**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Project Structure
```
Project/
├── backend/          ← Express API
│   ├── server.js     ← Start here
│   └── .env          ← Configuration
└── frontend/         ← React App
    └── src/
        └── pages/    ← Main UI
```

## Key Features to Test

✅ **Authentication** - Login/Register
✅ **File Upload** - XLSX parsing
✅ **AI Calling** - Simulated conversations
✅ **Risk Analysis** - NLP-based scoring
✅ **Dashboards** - Real-time statistics

---

**Need Help?** Check the full [README.md](file:///c:/Users/suhas/Desktop/Project/README.md) for detailed documentation.

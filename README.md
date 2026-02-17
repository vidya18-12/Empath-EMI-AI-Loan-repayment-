# AI-Powered Loan Recovery & Customer Behaviour Analysis System

An enterprise-grade web application that automates loan recovery follow-ups using AI agents, analyzes customer behavior, and provides actionable insights for banking and finance institutions.

![System Architecture](https://img.shields.io/badge/Stack-MERN-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

### Manager Dashboard
- 📊 **Real-time Statistics** - Track total borrowers, overdue accounts, call completion rates, and high-risk customers
- 📁 **XLSX Upload** - Bulk upload borrower data via Excel files
- 📈 **Visual Analytics** - Interactive charts showing risk distribution and trends
- 🎯 **Quick Actions** - One-click AI call initiation

### AI Agent System
- 🤖 **Automated Calling** - Simulated AI voice agent that contacts overdue borrowers
- 💬 **Natural Conversations** - Context-aware dialogue flow with empathetic responses
- 🔄 **Smart Retry Logic** - Automatic retry for failed call attempts (up to 2 retries)
- 📝 **Transcript Generation** - Detailed call transcripts for every conversation

### Customer Behavior Analysis
- 🧠 **NLP-Powered Analysis** - Sentiment analysis using Natural.js library
- 🎯 **Risk Classification** - Categorizes customers into: WILL_PAY, MAY_PAY, RISKY, WILL_NOT_PAY, NO_RESPONSE
- 📊 **Risk Scoring** - 0-100 score based on multiple factors (sentiment, willingness, commitment, call pickup rate)
- 💡 **AI Recommendations** - Actionable suggestions (payment reminder, follow-up, field visit, legal notice)

### Call Management
- 📞 **Call History** - Complete log of all AI-initiated calls
- 📋 **Transcript Viewer** - Read full conversation transcripts
- 🔍 **Advanced Filtering** - Filter by status, borrower, date range
- ⏱️ **Call Metadata** - Duration, pickup time, customer sentiment

---

## 🏗️ System Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   React.js      │◄─────►│  Node.js/Express │◄─────►│    MongoDB      │
│   Frontend      │ REST  │     Backend      │       │    Database     │
│  (Vite + TW)    │  API  │   (JWT Auth)     │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │   AI Services    │
                          ├──────────────────┤
                          │ • Call Simulator │
                          │ • NLP Analyzer   │
                          │ • Risk Classifier│
                          └──────────────────┘
```

---

## 📋 Prerequisites

- **Node.js** v16+ and npm
- **MongoDB** v5+ (local or Atlas)
- Modern web browser (Chrome, Firefox, Edge)

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
cd c:\Users\suhas\Desktop\Project
# Repository already in place
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file:**
```bash
copy .env.example .env
```

**Edit `.env` with your configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/loan-recovery
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
MAX_RETRY_ATTEMPTS=2
CALL_SIMULATION_DELAY=3000
ENABLE_SCHEDULER=true
```

**Seed the database:**
```bash
npm run seed
```

This creates:
- **Admin**: admin@loanrecovery.com / admin123
- **Manager**: manager@loanrecovery.com / manager123
- 5 sample overdue borrowers

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on: **http://localhost:5000**

### Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 📖 Usage Guide

### Step 1: Login
1. Open **http://localhost:5173**
2. Login with demo credentials:
   - Email: `manager@loanrecovery.com`
   - Password: `manager123`

### Step 2: Upload Borrower Data
1. Go to **Dashboard**
2. Click **"Upload Borrower Data"**
3. Select the sample XLSX file from `backend/sample_data.xlsx`
4. Click **"Upload File"**

**XLSX Format:**
| Customer Name | Loan ID | Phone Number | Loan Amount | Due Date | Last Payment Date | Overdue Days |
|---------------|---------|--------------|-------------|----------|-------------------|--------------|
| John Doe      | LN001   | 9876543210   | 50000       | 1/15/2024| 9/15/2024         | 35           |

### Step 3: Start AI Calling
1. Click **"Start AI Calling"** button on Dashboard
2. The system will automatically:
   - Fetch all overdue borrowers
   - Simulate AI calls with realistic conversations
   - Analyze customer responses
   - Generate risk scores and recommendations
3. Monitor progress in real-time

### Step 4: View Results
- **Borrower Directory**: See all borrowers with risk levels
- **Call History**: Read full conversation transcripts
- **Behavior Analysis**: Review AI insights and recommendations

---

## 🗂️ Project Structure

```
Project/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # User authentication
│   │   ├── borrowerController.js    # Borrower CRUD operations
│   │   ├── agentController.js       # AI agent operations
│   │   ├── callController.js        # Call history
│   │   └── analysisController.js    # Behavior analysis
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── errorHandler.js          # Global error handling
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Borrower.js              # Borrower schema
│   │   ├── CallRecord.js            # Call records
│   │   └── BehaviorAnalysis.js      # Analysis results
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── borrowers.js             # Borrower routes
│   │   ├── agent.js                 # AI agent routes
│   │   ├── calls.js                 # Call routes
│   │   └── analysis.js              # Analysis routes
│   ├── services/
│   │   ├── aiAgent.js               # AI agent orchestrator
│   │   ├── callSimulator.js         # Call simulation engine
│   │   └── nlpAnalyzer.js           # NLP & risk scoring
│   ├── scripts/
│   │   └── seed.js                  # Database seeding
│   ├── server.js                    # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx           # Main layout with sidebar
    │   │   └── PrivateRoute.jsx     # Protected route wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx      # Authentication context
    │   ├── pages/
    │   │   ├── Login.jsx            # Login page
    │   │   ├── Register.jsx         # Registration page
    │   │   ├── Dashboard.jsx        # Main dashboard
    │   │   ├── BorrowerDirectory.jsx # Borrower list
    │   │   ├── CallHistory.jsx      # Call records
    │   │   └── BehaviorAnalysis.jsx # AI insights
    │   ├── utils/
    │   │   └── axios.js             # API client with interceptors
    │   ├── App.jsx                  # Main app component
    │   ├── main.jsx                 # React entry point
    │   └── index.css                # Global styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔧 API Documentation

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/me` - Get current user

### Borrowers
- `POST /api/borrowers/upload` - Upload XLSX file
- `GET /api/borrowers` - Get all borrowers
- `GET /api/borrowers/stats` - Get dashboard statistics
- `GET /api/borrowers/:id` - Get single borrower

### AI Agent
- `POST /api/agent/start` - Start AI calling process
- `GET /api/agent/queue` - View pending calls
- `GET /api/agent/status/:borrowerId` - Check call status

### Call Records
- `GET /api/calls` - Get call history
- `GET /api/calls/:id` - Get call with transcript

### Behavior Analysis
- `GET /api/analysis` - Get all analyses
- `GET /api/analysis/borrower/:borrowerId` - Get customer behavior

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🧪 Testing the System

### Test Scenario 1: Complete Workflow
1. Upload sample borrowers
2. Start AI calling
3. Wait 30 seconds for processing
4. View call transcripts
5. Review behavior analysis

### Test Scenario 2: Different Risk Levels
The system generates varied customer personas:
- **Cooperative** (Will Pay) - 80+ risk score
- **Struggling** (May Pay) - 50-79 risk score
- **Evasive** (Risky) - 30-49 risk score
- **Aggressive** (Will Not Pay) - 0-29 risk score

---

## 🎯 AI Conversation Flow

```
AI: Hello [Name], this is calling from SecureBank. I hope you're doing well.
Customer: [Response based on persona]

AI: I'm calling regarding your loan account [LoanID] which has an outstanding amount...
Customer: [Reason for non-payment]

AI: I understand. When do you expect to make the payment?
Customer: [Commitment or excuse]

AI: Thank you for your time. We'll follow up accordingly.
```

---

## 📊 Risk Scoring Algorithm

Risk score is calculated based on:
1. **Call Pickup Rate** (30%) - Whether customer answered
2. **Sentiment Score** (25%) - Positive/Neutral/Negative tone
3. **Willingness to Pay** (25%) - High/Moderate/Low intent
4. **Payment Commitment** (20%) - Specific date provided

**Additional Penalties:**
- Overdue > 30 days: -10 points
- Overdue > 60 days: -10 points
- Evasive pattern: -15 points

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Input validation
- ✅ XSS protection (React)
- ✅ CORS enabled

---

## 🚀 Deployment (Production)

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve 'dist' folder with nginx or any static server
```

**Environment Variables for Production:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Use MongoDB Atlas for cloud database
- Configure proper CORS origins

---

## 📝 Future Enhancements

- [ ] Real voice AI integration (Twilio, Deepgram, ElevenLabs)
- [ ] SMS/WhatsApp notifications
- [ ] Payment gateway integration
- [ ] Advanced ML models for prediction
- [ ] Multi-language support
- [ ] Mobile app for field agents
- [ ] Video call option
- [ ] Email campaign integration

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/db
```

### Port Already in Use
```bash
# Change PORT in .env file or kill existing process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Errors
- Ensure backend is running on port 5000
- Frontend proxy is configured in `vite.config.js`

---

## 👥 Team & Support

**Built for**: Banking & Financial Institutions
**Use Cases**: Loan Recovery, EMI Collection, Credit Card Follow-ups

---

## 📜 License

MIT License - Feel free to use for commercial or personal projects.

---

## 🎉 Acknowledgments

- **Natural.js** for NLP capabilities
- **Recharts** for beautiful data visualization
- **TailwindCSS** for modern UI design
- **MongoDB** for flexible data storage

---

**Made with ❤️ for enterprise loan recovery automation**

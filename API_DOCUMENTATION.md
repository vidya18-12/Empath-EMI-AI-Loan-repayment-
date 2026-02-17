# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "manager"  // optional, defaults to "manager"
}

Response: 201 Created
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "manager@loanrecovery.com",
  "password": "manager123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

---

## Borrowers

### Upload XLSX File
```http
POST /borrowers/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
  file: [XLSX file]

Response: 201 Created
{
  "success": true,
  "count": 5,
  "data": [ ... borrowers ... ],
  "errors": []  // optional, parsing errors if any
}
```

### Get All Borrowers
```http
GET /borrowers?status=overdue&risk=RISKY&search=John&page=1&limit=50
Authorization: Bearer {token}

Query Parameters:
  - status: "overdue" | null
  - risk: "WILL_PAY" | "MAY_PAY" | "RISKY" | "WILL_NOT_PAY" | "NO_RESPONSE"
  - search: string (searches name & loan ID)
  - page: number (default: 1)
  - limit: number (default: 50)

Response: 200 OK
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "...",
      "customerName": "Rajesh Kumar",
      "loanId": "LN2024001",
      "phoneNumber": "9876543210",
      "loanAmount": 50000,
      "dueDate": "2024-11-15",
      "lastPaymentDate": "2024-09-15",
      "overdueDays": 35,
      "isOverdue": true,
      "callStatus": "completed",
      "riskLevel": "MAY_PAY",
      "uploadedBy": { ... },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Get Single Borrower
```http
GET /borrowers/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { ... borrower object ... }
}
```

### Update Borrower
```http
PUT /borrowers/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "callStatus": "completed",
  "riskLevel": "WILL_PAY"
}

Response: 200 OK
{
  "success": true,
  "data": { ... updated borrower ... }
}
```

### Get Dashboard Statistics
```http
GET /borrowers/stats
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "totalBorrowers": 50,
    "overdueBorrowers": 35,
    "callsCompleted": 20,
    "callsNotAnswered": 15,
    "highRiskCount": 10,
    "riskDistribution": [
      { "_id": "WILL_PAY", "count": 8 },
      { "_id": "MAY_PAY", "count": 12 },
      { "_id": "RISKY", "count": 7 },
      { "_id": "WILL_NOT_PAY", "count": 3 },
      { "_id": "NO_RESPONSE", "count": 5 }
    ],
    "callStatusDistribution": [
      { "_id": "completed", "count": 20 },
      { "_id": "not_answered", "count": 15 },
      { "_id": "pending", "count": 15 }
    ]
  }
}
```

---

## AI Agent

### Start AI Calling Process
```http
POST /agent/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "borrowerIds": [
    "674a1b2c3d4e5f6g7h8i9j0k",
    "674a1b2c3d4e5f6g7h8i9j0l"
  ]
}

Response: 200 OK
{
  "success": true,
  "message": "AI calling process started for 2 borrower(s)",
  "count": 2
}

Note: Process runs in background. Check call status via /agent/status/:borrowerId
```

### Get Call Queue
```http
GET /agent/queue
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "customerName": "Rajesh Kumar",
      "loanId": "LN2024001",
      "phoneNumber": "9876543210",
      "overdueDays": 35,
      "callStatus": "pending"
    }
  ]
}
```

### Get Borrower Call Status
```http
GET /agent/status/:borrowerId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "borrowerId": "...",
    "customerName": "Rajesh Kumar",
    "callStatus": "completed",
    "riskLevel": "MAY_PAY"
  }
}
```

---

## Call Records

### Get Call History
```http
GET /calls?status=completed&borrowerId=xxx&page=1&limit=20
Authorization: Bearer {token}

Query Parameters:
  - status: "completed" | "not_answered" | "switched_off" | "no_response"
  - borrowerId: string
  - page: number
  - limit: number

Response: 200 OK
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "...",
      "borrower": {
        "customerName": "Rajesh Kumar",
        "loanId": "LN2024001",
        "phoneNumber": "9876543210"
      },
      "attemptNumber": 1,
      "status": "completed",
      "transcript": "AI: Hello Rajesh Kumar...",
      "duration": 120,
      "callTimestamp": "2024-12-21T05:30:00Z",
      "metadata": {
        "pickupTime": 4,
        "hangupReason": "normal",
        "customerSentiment": "positive",
        "paymentCommitment": "next Monday"
      }
    }
  ]
}
```

### Get Single Call Record
```http
GET /calls/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    ... call record with full transcript and borrower details ...
  }
}
```

---

## Behavior Analysis

### Get All Analyses
```http
GET /analysis?classification=RISKY&page=1&limit=20
Authorization: Bearer {token}

Query Parameters:
  - classification: "WILL_PAY" | "MAY_PAY" | "RISKY" | "WILL_NOT_PAY" | "NO_RESPONSE"
  - page: number
  - limit: number

Response: 200 OK
{
  "success": true,
  "count": 10,
  "total": 30,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "...",
      "borrower": { ... borrower details ... },
      "callRecord": { ... call details ... },
      "classification": "MAY_PAY",
      "riskScore": 65,
      "sentimentScore": 0.3,
      "aiSummary": "Customer responded with neutral tone. Shows moderate willingness to pay...",
      "keyFindings": [
        "Payment commitment: next Monday",
        "Financial difficulty mentioned"
      ],
      "recommendation": "follow_up",
      "analysisDetails": {
        "willingnessToPay": "moderate",
        "paymentCommitment": "Yes",
        "excusePattern": "financial",
        "toneAnalysis": "neutral"
      },
      "analyzedAt": "2024-12-21T05:30:00Z"
    }
  ]
}
```

### Get Analysis for Specific Borrower
```http
GET /analysis/borrower/:borrowerId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    ... complete analysis with borrower, callrecord, and all AI insights ...
  }
}

Response: 404 Not Found (if no analysis exists)
{
  "success": false,
  "error": "No behavior analysis found for this borrower"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "User role 'manager' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Data Models

### Borrower
```typescript
{
  _id: ObjectId;
  customerName: string;
  loanId: string;  // unique
  phoneNumber: string;  // 10 digits
  loanAmount: number;
  dueDate: Date;
  lastPaymentDate?: Date;
  overdueDays: number;
  isOverdue: boolean;
  callStatus: "pending" | "in_progress" | "completed" | "not_answered";
  riskLevel: "WILL_PAY" | "MAY_PAY" | "RISKY" | "WILL_NOT_PAY" | "NO_RESPONSE" | "PENDING";
  uploadedBy: ObjectId;  // ref: User
  createdAt: Date;
  updatedAt: Date;
}
```

### CallRecord
```typescript
{
  _id: ObjectId;
  borrower: ObjectId;  // ref: Borrower
  attemptNumber: number;
  status: "completed" | "not_answered" | "switched_off" | "no_response" | "busy";
  transcript: string;
  duration: number;  // seconds
  callTimestamp: Date;
  metadata: {
    pickupTime?: number;
    hangupReason?: string;
    customerSentiment?: string;
    paymentCommitment?: string;
  };
}
```

### BehaviorAnalysis
```typescript
{
  _id: ObjectId;
  borrower: ObjectId;  // ref: Borrower
  callRecord: ObjectId;  // ref: CallRecord
  classification: "WILL_PAY" | "MAY_PAY" | "RISKY" | "WILL_NOT_PAY" | "NO_RESPONSE";
  riskScore: number;  // 0-100
  sentimentScore: number;  // -1 to 1
  aiSummary: string;
  keyFindings: string[];
  recommendation: "follow_up" | "legal_notice" | "field_visit" | "payment_reminder" | "no_action";
  analysisDetails: {
    willingnessToPay: string;
    paymentCommitment: string;
    excusePattern: string;
    toneAnalysis: string;
  };
  analyzedAt: Date;
}
```

---

## Rate Limiting
Not implemented in current version. For production, add rate limiting middleware.

## Pagination
Default: 20-50 items per page
Max: 100 items per page

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@loanrecovery.com","password":"manager123"}'

# Get Borrowers
curl http://localhost:5000/api/borrowers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Start AI Calls
curl -X POST http://localhost:5000/api/agent/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"borrowerIds":["BORROWER_ID_1","BORROWER_ID_2"]}'
```

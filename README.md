# NIBSS API Documentation

A Node.js/Express backend that integrates with the NIBSS (NibssByPhoenix) external API to handle fintech onboarding, KYC verification, account management, and interbank fund transfers.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **External API:** NibssByPhoenix (`https://nibssbyphoenix.onrender.com`)
- **Auth:** JWT (Bearer Token)

---

## Environment Variables

Create a `.env` file in the root of your project:

```env
PORT=4040
MONGO_URI=your_mongodb_connection_string
NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
NIBSS_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start server
nodemon server.js
```

Server runs on `http://localhost:4040`

---

## Base URL

```
http://localhost:4040/api/nibss
```

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Call **Fintech Login** first to get the token. The Postman collection auto-saves it to `{{token}}`.

---

## Recommended Flow

```
1. Register Fintech
2. Fintech Login        ← saves token automatically
3. Create BVN or NIN
4. Validate BVN or NIN
5. Create User          ← saves accountNumber automatically
6. Name Enquiry
7. Get Account Balance
8. Initiate Transfer    ← saves transactionId automatically
9. Get Transaction Status
```

---

## Endpoints

### 1. Register Fintech
Onboards a new fintech on the NIBSS platform.

**POST** `/api/nibss/register`

**Request Body:**
```json
{
  "name": "DOL Bank",
  "email": "yourmail@gmail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fintech registered successfully",
  "data": { ... }
}
```

---

### 2. Fintech Login
Authenticates the fintech and returns a JWT token. Token is auto-saved in the Postman collection.

**POST** `/api/nibss/fintechLogin`

**Request Body:** _(none required — credentials are loaded from `.env`)_
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Fintech authenticated successfully",
  "data": {
    "token": "eyJ...",
    "fintech": {
      "name": "DOL Bank",
      "email": "yourmail@gmail.com",
      "bankCode": "188",
      "bankName": "DOL Bank"
    }
  }
}
```

---

### 3. Create BVN
Generates a random 11-digit BVN and registers it on NIBSS.

**POST** `/api/nibss/createBVN`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1992-05-17",
  "phone": "08012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "BVN created successfully",
  "data": { ... }
}
```

> Copy the `bvn` from the response and use it in Create User and Validate BVN.

---

### 4. Create NIN
Generates a random 11-digit NIN and registers it on NIBSS.

**POST** `/api/nibss/createNIN`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1992-05-17",
  "phone": "08012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "NIN created successfully",
  "data": { ... }
}
```

---

### 5. Validate BVN
Validates a BVN against the NIBSS database. Requires Bearer token.

**POST** `/api/nibss/validateBVN`

**Request Body:**
```json
{
  "bvn": "12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "message": "BVN is valid",
  "data": {
    "bvn": "12345678901",
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1992-05-17",
    "phone": "08012345678"
  }
}
```

---

### 6. Validate NIN
Validates a NIN against the NIBSS database. Requires Bearer token.

**POST** `/api/nibss/validateNIN`

**Request Body:**
```json
{
  "nin": "12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "message": "NIN is valid",
  "data": {
    "nin": "12345678901",
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1992-05-17"
  }
}
```

---

### 7. Create User
Creates a bank account on NIBSS using a verified BVN or NIN. Account number is auto-saved in the Postman collection.

**POST** `/api/nibss/createUser`

**Request Body:**
```json
{
  "kycType": "BVN",
  "kycID": "12345678901",
  "dob": "1992-05-17"
}
```

> `kycType` must be either `BVN` or `NIN`.

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "kycType": "BVN",
    "kycID": "12345678901",
    "nibssResponse": {
      "account": {
        "accountNumber": "1084071287",
        "accountName": "John Doe",
        "bankCode": "188",
        "bankName": "DOL Bank",
        "balance": 15000
      }
    }
  }
}
```

---

### 8. Name Enquiry
Looks up an account name using an account number. Requires Bearer token.

**GET** `/api/nibss/name-enquiry/:accountNumber`

**URL Parameter:** `accountNumber` — uses `{{accountNumber}}` from collection variables.

**Response:**
```json
{
  "success": true,
  "message": "Name enquiry successful",
  "data": {
    "accountNumber": "1084071287",
    "accountName": "John Doe",
    "bankName": "DOL Bank"
  }
}
```

---

### 9. Get All Accounts
Returns all bank accounts registered under your fintech. Requires Bearer token.

**GET** `/api/nibss/accounts`

**Response:**
```json
{
  "success": true,
  "message": "Accounts fetched successfully",
  "data": [
    {
      "accountNumber": "1084071287",
      "accountName": "John Doe",
      "balance": 500000
    }
  ]
}
```

---

### 10. Get Account Balance
Returns the balance of a specific account. Requires Bearer token.

**GET** `/api/nibss/account/balance/:accountNumber`

**URL Parameter:** `accountNumber` — uses `{{accountNumber}}` from collection variables.

**Response:**
```json
{
  "success": true,
  "message": "Account balance fetched successfully",
  "data": {
    "accountNumber": "1084071287",
    "balance": 500000
  }
}
```

---

### 11. Initiate Transfer
Initiates an interbank fund transfer between two accounts. Validates sender identity, performs name enquiry on both accounts, checks balance, then routes through NIBSS. Transaction ID is auto-saved in the Postman collection.

**POST** `/api/nibss/transfer`

**Request Body:**
```json
{
  "from": "1084071287",
  "to": "1087207670",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transaction": {
      "transactionId": "TX1776340463722",
      "from": "1084071287",
      "to": "1087207670",
      "amount": 5000,
      "status": "SUCCESS"
    },
    "sender": {
      "accountNumber": "1084071287",
      "accountName": "John Doe",
      "bankName": "DOL Bank"
    },
    "recipient": {
      "accountNumber": "1087207670",
      "accountName": "Jane Smith",
      "bankName": "Access Bank"
    }
  }
}
```

**Error (Insufficient Funds):**
```json
{
  "success": false,
  "message": "Insufficient funds, transfer not initiated",
  "data": {
    "availableBalance": 1000,
    "requiredAmount": 5000
  }
}
```

---

### 12. Get Transaction Status
Queries the status of a previously initiated transfer using its Transaction ID.

**GET** `/api/nibss/transaction/:transactionId`

**URL Parameter:** `transactionId` — uses `{{transactionId}}` from collection variables.

**Response:**
```json
{
  "success": true,
  "message": "Transaction status fetched successfully",
  "data": {
    "transactionId": "TX1776340463722",
    "status": "SUCCESS",
    "amount": 5000,
    "from": "1084071287",
    "to": "1087207670",
    "timestamp": "2026-06-13T20:08:34.352Z"
  }
}
```

---

## Postman Collection Variables

| Variable | Description | Auto-populated |
|---|---|---|
| `baseURL` | Local server URL (`http://localhost:4040`) | No — set once |
| `token` | Bearer token for authenticated requests | Yes — after Fintech Login |
| `accountNumber` | Sender account number | Yes — after Create User |
| `transactionId` | Transaction ID for status queries | Yes — after Initiate Transfer |

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

| Status Code | Meaning |
|---|---|
| 400 | Bad request / validation failed / insufficient funds |
| 404 | Resource not found |
| 409 | Duplicate record |
| 500 | Internal server error |

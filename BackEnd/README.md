# PDF2Sheet Auto - Backend API System

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [License](#license)
- [Contact](#contact)

---

## Introduction
**PDF2Sheet Auto** is a powerful Node.js backend designed to extract data from invoices (PDFs) and convert it into a structured format. It features secure JWT-based authentication, Google OAuth integration, and automated email services via the Resend API.

---

## Features
- **Multi-Auth System**: Supports traditional email/password login and Google OAuth 2.0.
- **Secure Password Reset**: Facility to send secure password reset links through the Resend API.
- **PDF Extraction Logic**: A Node.js-based extraction system that parses invoice documents.
- **JWT Protection**: Private routes (such as history and profile) are protected using JWT tokens.
- **Keep-Alive Optimized**: Optimized for Render and Cron-job.org to ensure the server remains active on free tiers.
- **MongoDB Integration**: A robust database setup for storing user profiles and invoice history.
- **Vendor Auto-Mapping**: Learns vendor structure and auto-fills future invoices.

---

## Technologies Used
- **Node.js & Express**: Core backend framework.
- **MongoDB & Mongoose**: Database and object modeling.
- **Passport.js**: For Google OAuth integration.
- **JWT (JSON Web Token)**: For session and security management.
- **Resend API**: High-speed transactional emails (an alternative to Gmail SMTP).
- **Bcrypt.js**: For secure password hashing.
- **Multer** : File Upload Handling.

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Resend API Key
- Google Cloud OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RAJATKUMARSINGH527/PDF2Sheet_Auto_Invoice_Extraction_System.git
cd BackEnd
```
2. **Install dependencies**
```bash
npm install
```
## Environment Variables

Create a .env file in the root directory and add the following keys:

```text
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
RESEND_API_KEY=re_your_api_key
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
Frontend_URL=http://localhost:5173
Frontend_Deployed_URL=https://pdf-2-sheet-auto-invoice-extraction.vercel.app
VITE_API_BASE_URL=https://pdf2sheet-auto-invoice-extraction-system.onrender.com
```
## Running the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```
Your server will start at: `👉 http://localhost:5000`

## Project Structure

```text
BackEnd/
├─ config/
│  ├─ db.js                  # Database connection (MongoDB)
│  └─ passport.js            # Google OAuth strategy configuration
├─ middlewares/
│  ├─ auth.js                # JWT verification & protected route guard
│  └─ errorHandler.js         # Centralized error management
├─ models/
│  ├─ User.js                 # User profile & auth schema
│  ├─ Invoice.js              # Extracted invoice data schema
│  └─ Vendor.js               # Vendor details & identification schema
├─ routes/
│  ├─ auth.js                 # Login, Signup, & OAuth endpoints
│  ├─ invoices.js             # Invoice retrieval & history routes
│  ├─ upload.js               # File upload & processing trigger
│  └─ vendor.js               # Vendor management & list routes
├─ services/
│  ├─ email.js                # Resend API integration for emails
│  ├─ extractor.js            # AI/Logic based data extraction
│  ├─ googleSheets.js         # Google Sheets API sync logic
│  └─ pdfService.js           # PDF parsing and buffer handling
├─ .env                       # Environment secrets
├─ server.js                  # Main application entry point
├─ package.json               # Dependencies and scripts
├─ vercel.json                # Vercel deployment configuration
└─ README.md                  # Project documentation
```
## Authentication Flow
1. **User Registration/Login**: Users can register or log in using email/password or Google OAuth.
2. **JWT Token Generation**: Upon successful authentication, a JWT token is generated and sent to the client.
3. **Protected Routes**: Subsequent requests to protected routes must include the JWT token for verification.
4. **Traditional**: User signup/login -> Bcrypt hashing -> JWT generation.
5. **Google OAuth**: Passport strategy -> Google verification -> Session/JWT creation.
6. **Password Reset**: User requests reset -> Resend sends unique token link -> User updates password.

## 🛠️API Endpoints – PDF2Sheet Auto
**🔹 Authentication Routes (/auth)**

| Method | Endpoint                      | Description                          | Request Body / Params                                  | Auth Required |
| ------ | ----------------------------- | ------------------------------------ | ------------------------------------------------------ | ------------- |
| POST   | `/auth/register`              | Register a new user account          | `{ "name": "...", "email": "...", "password": "..." }` | No            |
| POST   | `/auth/login`                 | Login with email and password        | `{ "email": "...", "password": "..." }`                | No            |
| GET    | `/auth/google`                | Initiate Google OAuth 2.0 flow       | N/A                                                    | No            |
| POST   | `/auth/forgot-password`       | Request password reset via Resend    | `{ "email": "..." }`                                   | No            |
| POST   | `/auth/reset-password/:token` | Update password using reset token    | `{ "password": "..." }`                                | No            |
| POST   | `/auth/update-settings`       | Update user profile/account settings | `{ "name": "...", "email": "..." }`                    | Yes (JWT)     |

**🔹 Upload & Extraction Routes (/upload)**
| Method | Endpoint       | Description                          | Request Body                 | Auth Required |
| ------ | -------------- | ------------------------------------ | ---------------------------- | ------------- |
| POST   | `/upload/`     | Upload PDF & trigger auto-extraction | `FormData (key: pdf)`        | Yes (JWT)     |
| POST   | `/upload/save` | Save extracted invoice data to DB    | `{ "invoiceData": { ... } }` | Yes (JWT)     |

**🔹 Invoice & Vendor Routes (/invoices, /vendor)**
| Method | Endpoint            | Description                        | Request Body | Auth Required |
| ------ | ------------------- | ---------------------------------- | ------------ | ------------- |
| GET    | `/invoices/history` | Fetch all processed invoices       | N/A          | Yes (JWT)     |
| GET    | `/invoices/:id`     | Get details of a single invoice    | N/A          | Yes (JWT)     |
| DELETE | `/invoices/:id`     | Remove an invoice record           | N/A          | Yes (JWT)     |
| POST   | `/vendor/save`      | Save vendor mapping                | N/A          | Yes (JWT)     |

---

## Deployment
The project is deployed on Render and monitored by Cron-job.org to prevent the server from entering sleep mode on the free tier.

## License
This project is licensed under the MIT License.

## Contact

*Developer*: Rajat Kumar Singh
- Email: [rajatkumarsingh257@example.com](mailto:rajatkumarsingh257@example.com)  
- GitHub: [RAJATKUMARSINGH527](https://github.com/RAJATKUMARSINGH527)  
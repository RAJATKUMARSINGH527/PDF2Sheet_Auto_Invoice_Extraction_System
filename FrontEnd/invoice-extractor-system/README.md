# PDF2Sheet Auto  
### Modern Invoice Extraction System (Frontend)

## 🚀 Introduction

**PDF2Sheet Auto** is a modern, intuitive, and responsive React-based web application that allows users to upload invoice PDFs and automatically extract structured data from them.  
The primary goal of this project is to **eliminate manual data entry** and significantly improve business productivity through automation.

This frontend works seamlessly with a MERN-based backend to provide a complete **end-to-end invoice processing system**.

---

## ✨ Key Features

- **Smart Invoice Upload**  
  Drag-and-drop interface to easily upload PDF invoices.

- **Real-time Data Extraction Preview**  
  Instantly view extracted fields like invoice number, date, amount, vendor, etc.

- **Dual Authentication System**  
  Secure login using:
  - Email & Password (JWT)
  - Google OAuth

- **Invoice History Dashboard**  
  View all previously processed invoices in a clean tabular format.

- **Vendor Mapping System**  
  Auto-detect vendors and apply saved field mappings.

- **Fully Responsive UI**  
  Built with TailwindCSS for a modern, mobile-first experience.

---

## 🛠 Tech Stack

### Frontend
- React 18  
- Vite  
- TailwindCSS  
- React Router v6  
- Axios  

### Authentication
- JWT (Token-based authentication)  
- Google OAuth  
- LocalStorage for session handling  

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+  
- npm or yarn  
- Deployed Backend API URL  

---

### Installation

Clone the repository:

```bash
git clone https://github.com/RAJATKUMARSING527/PDF2Sheet-Auto-Frontend.git
cd PDF2Sheet-Auto-Frontend
```

## Install dependencies:
```bash
npm install
```

## Create a .env file in root:
```text
VITE_API_BASE_URL=https://pdf2sheet-auto-invoice-extraction-system.onrender.com
```

## Run the project:

```bash
npm run dev
```

## App will start at:
```bash
http://localhost:5173
```

## 📁 Project Structure
```text
src/
 ├─ components/      # Reusable UI components
 ├─ pages/           # Pages (Login, Signup, Dashboard, History)
 ├─ context/         # AuthContext (Global state)
 ├─ utils/           # API config & helpers
 ├─ App.jsx          # Routing setup
 └─ main.jsx         # Application entry point
```

## 🔐 Authentication Flow

- **Grant Access**: Upon successful login, the application receives a JWT token.

- **Persistence**: The token is securely stored in the browser's LocalStorage.

- **Authorization**: Every outgoing API request is injected with an Authorization: Bearer <token> header.

- **Session Guard**: If the token is invalid or expired, the user is automatically redirected to the login page.

## 🔗 API Integration

| Module   | Method | Endpoint          | Description                                   |
|----------|--------|-------------------|-----------------------------------------------|
| Invoices | POST   | /upload           | Initiates the AI extraction process.          |
| Invoices | GET    | /history          | Retrieves all historical invoice records.     |
| Auth     | POST   | /login            | Traditional user authentication.              |
| Auth     | POST   | /register         | Register User for the first time.             |
| Auth     | POST   | /forgot-password  | Initiates password recovery flow.             |
| Profile  | GET    | /profile          | Fetches authenticated user settings.          |
| Profile  | POST   | /update-settings  | Update User Details.                          |

## 📌 Use Case

PDF2Sheet Auto is ideal for:
- Accountants
- Finance teams
- Small businesses
- SaaS platforms handling invoices
It converts unstructured PDFs into structured spreadsheet-ready data with almost zero manual work.

## 👨‍💻 Developer

- Rajat Kumar Singh - Full Stack Developer (MERN)
- Email: [rajatkumarsingh257@example.com](mailto:rajatkumarsingh257@example.com)  
- GitHub: [RAJATKUMARSINGH527](https://github.com/RAJATKUMARSINGH527)  

## ⭐ Final Note

PDF2Sheet Auto is built as a production-grade MERN project, focusing on:

- Clean architecture
- Real-world use cases
- Scalable backend integration
- Modern frontend UX

This project can easily be extended into a full SaaS product.
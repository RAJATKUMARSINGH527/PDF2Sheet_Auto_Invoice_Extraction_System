# 🚀 PDF2Sheet Auto: AI-Powered Invoice Automation

> **Transforming raw PDF invoices into structured Google Sheets data with AI-driven precision.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![Deployment: Render](https://img.shields.io/badge/Deployment-Render-brightgreen.svg)](https://render.com)

**PDF2Sheet Auto** is a professional full-stack MERN application engineered to eliminate the manual burden of financial data entry. By leveraging intelligent PDF parsing and the Google Sheets API, it allows users to upload invoices and synchronize extracted data directly to their personal spreadsheets in seconds.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Technical Stack](#-technical-stack)
- [Getting Started](#-getting-started)
- [AI & Extraction Logic](#-ai--extraction-logic)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [Deployment Links](#-deployment-links)
- [Video Presentation](#-video-presentation)
- [License](#-license)
- [Contact & Support](#-contact--support)
- [Acknowledgements](#-acknowledgements)


---

## 🏗 System Architecture

The application is built on a modular MERN architecture, ensuring scalability and a smooth user experience.

- **Frontend**: A responsive React 18 dashboard featuring a side-by-side PDF viewer and column mapping interface.
- **Backend**: A robust Node.js/Express server that orchestrates AI extraction logic and Google Sheets API v4 integration.
- **Database**: MongoDB Atlas manages user profiles, invoice processing history, and vendor mapping templates.

---

## 🌟 Key Features

- **Real-time AI Extraction**: Instantly identifies and pulls Invoice numbers, Dates, Totals, and Vendor names from uploaded PDFs.
- **Smart Vendor Mapping**: The system intelligently learns and remembers how you prefer your data structured for different recurring vendors.
- **Multi-Tenant Sync**: Every user connects their own unique Google Sheet via a Spreadsheet ID for personalized data management.
- **Enterprise-Grade Security**: Secured with JWT-based authentication and high-speed transactional emails via the Resend API.

---

## 🛠 Technical Stack

| Layer        | Technologies                                         |
| :----------- | :--------------------------------------------------- |
| **Frontend** | React 18, TailwindCSS, Axios, React Router v6        |
| **Backend**  | Node.js, Express, Passport.js (Google OAuth), JWT    |
| **Database** | MongoDB Atlas, Mongoose                              |
| **Services** | Resend API (Email), Google Sheets API v4, PDF-Parser |

---

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/RAJATKUMARSINGH527/PDF2Sheet_Auto_Invoice_Extraction_System.git
cd PDF2Sheet_Auto_Invoice_Extraction_System
```

2. **Backend Setup**
```bash
   cd BackEnd
   npm install

  # Configure your .env (Refer to BackEnd/README.md)
  npm start
```

3. **Frontend Setup**
```bash
cd ../FrontEnd
npm install
# Configure your .env (Refer to FrontEnd/README.md)
npm run dev
```

4. **Access the Dashboard**
    Open your browser and navigate to`http://localhost:5173` to access the PDF2Sheet Auto dashboard.

## 🤖 AI & Extraction Logic
The AI-powered extraction engine is the heart of PDF2Sheet Auto.
The core engine utilizes advanced PDF parsing libraries to intelligently scan document buffers. The extraction logic is optimized to recognize diverse invoice layouts, ensuring that financial data is captured accurately despite varying vendor formats.
The system employs machine learning techniques to improve extraction accuracy over time, adapting to user corrections and preferences for different vendors.

## 🤝 Contributing

1. Fork the Project.

2. Create your Feature Branch (git checkout -b feature/AmazingFeature).

3. Commit your Changes (git commit -m 'Add some AmazingFeature').

4. Push to the Branch (git push origin feature/AmazingFeature).

5. Open a Pull Request.

## 📄 Documentation

Detailed documentation for both frontend and backend components can be found in their respective README files within the `frontend` and `backend` directories.

## 🌍 Deployment Links

Frontend (Vercel): Live App *(https://pdf-2-sheet-auto-invoice-extraction.vercel.app/)* 

Backend (Render): Live API *(https://pdf2sheet-auto-invoice-extraction-system.onrender.com)* 


## 📹 Video Presentation

🎥 Watch the project demo here: Google Drive Link *([https://drive.google.com/drive/folders/1Gd93ch_Zgfd7XiPbXOqnorz1NJjSyv4q?usp=drive_link](https://drive.google.com/drive/folders/1VqEGOY6YQf94ecIUGjPB2NsEYGzei-tO?usp=drive_link))* 

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact & Support
**Project Lead**: Rajat Kumar Singh
- Email: [rajatkumarsingh257@gmail.com](mailto:rajatkumarsingh257@gmail.com)  
- GitHub: [RAJATKUMARSINGH527](https://github.com/RAJATKUMARSINGH527)  

## 🙏 Acknowledgements

- Thanks to the open-source community for libraries and tools that made this project possible.
- Inspired by the need to streamline financial workflows and reduce manual data entry errors.

---

© 2026 PDF2Sheet Auto. All rights reserved. Built with ❤️ for the Developer Community.

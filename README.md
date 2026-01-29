# 🚀 PDF2Sheet Auto: AI-Powered Invoice Automation

PDF2Sheet Auto is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to automate the tedious process of data entry. It uses AI to read PDF invoices, extract key financial data, and sync it directly to a user's specific Google Spreadsheet.

## 🛠️ System Architecture
- **Frontend**: React 18 dashboard with a side-by-side PDF viewer and column mapping interface.
- **Backend**: Node.js/Express server utilizing AI extraction logic and Google Sheets API v4.
- **Database**: MongoDB Atlas for storing user profiles, invoice history, and vendor mapping templates.

## 🌟 Key Features
- **Real-time Extraction**: Instantly pulls Invoice #, Date, Total, and Vendor from PDFs.
- **Smart Mapping**: Learns how you want your data structured for different vendors.
- **Multi-Tenant Sync**: Every user connects their own Google Sheet via a unique Spreadsheet ID.
- **Security**: JWT-based authentication and secure handling of Google OAuth tokens.

## 🚀 Installation & Setup

1. **Clone the Repo**
   ```bash
   git clone [https://github.com/RAJATKUMARSINGH527/PDF2Sheet_Auto_Invoice_Extraction_System.git](https://github.com/RAJATKUMARSINGH527/PDF2Sheet_Auto_Invoice_Extraction_System.git)
   cd PDF2Sheet_Auto_Invoice_Extraction_System
   ```
2. **Backend Setup**
    ```bash
    cd BackEnd
    npm install
    # Create .env (see Backend README for variables)
    npm run server
    ```
3. **Frontend Setup**
    ```bash
    cd ../FrontEnd
    npm install
    # Create .env (see Frontend README for variables)
    npm run dev
    ```
4. **Access the Dashboard**
    Open your browser and navigate to `http://localhost:5000` to access the PDF2Sheet Auto dashboard.

## 🤖 AI Integration
The backend leverages OpenAI's GPT-4 API to intelligently parse invoice PDFs. The AI model is fine-tuned to recognize common invoice formats and extract relevant fields with high accuracy.

## 📄 Documentation
Detailed documentation for both frontend and backend components can be found in their respective README files within the `frontend` and `backend` directories.

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your enhancements or bug fixes.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements
- Thanks to the open-source community for libraries and tools that made this project possible.
- Inspired by the need to streamline financial workflows and reduce manual data entry errors.

---
© 2026 PDF2Sheet Auto. All rights reserved.

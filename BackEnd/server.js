require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Initialize App
const app = express();

// 1. Database Connection with Debugging
connectDB();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://pdf-2-sheet-auto-invoice-extraction.vercel.app"
    ];
    console.log("CORS Origin Check:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. STATIC FILE SERVING: Forces PDFs to open IN-BROWSER
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Content-Type", "application/pdf");
  next();
}, express.static(path.join(__dirname, "uploads")));


// 4. Beautiful Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `\x1b[36m[${req.method}]\x1b[0m ${req.url} - \x1b[32m${res.statusCode}\x1b[0m (${duration}ms)`
    );
  });
  next();
});

// 5. Routes
app.use("/auth", require("./routes/auth")); 
app.use("/upload", require("./routes/upload"));
app.use("/vendor", require("./routes/vendor"));
app.use("/invoices", require("./routes/invoices"));

// 6. Root Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "PDF2Sheet Auto API is purring like a kitten 🐱",
    timestamp: new Date()
  });
});

// 7. Global Error Handler 
app.use((err, req, res, next) => {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 8. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("\n========================================");
  console.log(`🚀 \x1b[1mPDF2Sheet Auto Server\x1b[0m`);
  console.log(`📡 \x1b[34mPort:\x1b[0m ${PORT}`);
  console.log(`🔗 \x1b[34mURL:\x1b[0m http://localhost:${PORT}`);
  console.log("========================================\n");
});
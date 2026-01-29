require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const connectDB = require("./config/db");

// Import Passport Config
require("./config/passport"); 

const app = express();

// 1. Database Connection
connectDB();

// 2. Middleware Stack
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}
)); // Temporary: Allow all origins

// 3. Optimized CORS Configuration
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://pdf-2-sheet-auto-invoice-extraction.vercel.app"
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allows requests with no origin (like mobile apps, curl, or server-side redirects)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log("\x1b[31m[CORS Blocked]\x1b[0m:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

// 4. Static File Serving (PDFs)
// Added Access-Control-Allow-Origin to ensure PDF viewers on Vercel can read the files
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  next();
}, express.static(path.join(__dirname, "uploads")));

// 5. Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
    console.log(
      `\x1b[36m[${req.method}]\x1b[0m ${req.url} - ${statusColor}${res.statusCode}\x1b[0m (${duration}ms)`
    );
  });
  next();
});

// 6. Routes
app.use("/auth", require("./routes/auth")); 
app.use("/upload", require("./routes/upload"));
app.use("/vendor", require("./routes/vendor"));
app.use("/invoices", require("./routes/invoices"));


// Add this right before app.listen
if (app._router || app.router) {
  const stack = app._router ? app._router.stack : app.router.stack;
  console.log("\n--- Registered Routes ---");
  stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`[Root] ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    } else if (r.name === 'router') {
      // This handles routes imported via app.use("/auth", ...)
      r.handle.stack.forEach((s) => {
        if (s.route) {
          // We manually add the prefix here for clarity in the console
          console.log(`[Nested] ${Object.keys(s.route.methods).join(',').toUpperCase()} /auth${s.route.path}`);
        }
      });
    }
  });
  console.log("------------------------\n");
}


// 7. Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    instance: process.env.NODE_ENV || "development",
    message: "PDF2Sheet Auto API is purring like a kitten 🐱"
  });
});

// 8. Global Error Handler 
app.use((err, req, res, next) => {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("\n========================================");
  console.log(`🚀 \x1b[1mPDF2Sheet Auto Server Ready\x1b[0m`);
  console.log(`📡 \x1b[34mPort:\x1b[0m ${PORT}`);
  console.log(`🔗 \x1b[34mURL:\x1b[0m http://localhost:${PORT}`);
  console.log("========================================\n");
});
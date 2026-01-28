const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  // 1. LINK TO USER
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, // MUST BE TRUE to prevent anonymous uploads
    index: true 
  },
  
  senderEmail: { type: String, required: true, lowercase: true, trim: true },
  
  // Changed default to match what the frontend expects
  vendor: { type: String, default: "Auto-Detected" }, 
  invoiceNo: { type: String, default: "N/A" },
  date: { type: String, default: "N/A" },
  
  // 2. DATA CONSISTENCY
  total: { type: String, default: "0.00" }, 
  confidence: { type: Number, default: 0 },
  rawText: { type: String },
  filePath: { type: String, required: true },
  
  // 3. ENHANCED STATUS
  status: { 
    type: String, 
    enum: ["pending", "processed", "flagged"], 
    default: "pending" 
  },
  
  // 4. MAPPING FLAG
  needsMapping: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now }
});

// Optimization for Dashboard Performance
invoiceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
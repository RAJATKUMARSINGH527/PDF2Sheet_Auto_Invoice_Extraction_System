const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  // 1. LINK TO USER
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  
  senderEmail: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  
  // Changed to reflect actual extraction results
  vendor: { 
    type: String, 
    default: "Unknown Vendor" 
  }, 
  
  invoiceNo: { 
    type: String, 
    default: "N/A" 
  },
  
  date: { 
    type: String, 
    default: "N/A" 
  },
  
  // 2. FIX: Store as Number for mathematical operations in Reports/Dashboard
  total: { 
    type: Number, 
    default: 0 
  }, 
  
  confidence: { 
    type: Number, 
    default: 0 
  },
  
  rawText: { 
    type: String 
  },
  
  filePath: { 
    type: String, 
    required: true 
  },
  
  // 3. ENHANCED STATUS
  status: { 
    type: String, 
    enum: ["pending", "processed", "flagged"], 
    default: "pending" 
  },
  
  // 4. MAPPING FLAG
  needsMapping: { 
    type: Boolean, 
    default: true 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
},{ timestamps: true });

// Compound Index: Optimizes fetching "Recent Invoices" for a specific user
invoiceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
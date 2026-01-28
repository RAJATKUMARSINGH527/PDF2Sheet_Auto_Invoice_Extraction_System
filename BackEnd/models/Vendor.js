const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  // 1. LINK TO USER (Crucial for multi-tenant support)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // 2. VENDOR IDENTIFICATION
  senderEmail: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true 
  },
  
  vendorName: { 
    type: String, 
    default: "Auto-Detected Vendor" 
  },

  // 3. MAPPING LOGIC (Key-Value pairs for Google Sheets columns)
  mapping: {
    invoiceNo: { type: String, default: "Invoice Number" },
    date: { type: String, default: "Date" },
    total: { type: String, default: "Total" },
    vendor: { type: String, default: "Vendor" }
  },

  // 4. METADATA
  version: { type: Number, default: 1 },
  lastUpdated: { type: Date, default: Date.now }
});

// 5. COMPOUND INDEX
// This ensures a user can have unique mappings for different vendors,
// and multiple users can have their own private mappings for the SAME vendor email.
vendorSchema.index({ userId: 1, senderEmail: 1 }, { unique: true });

module.exports = mongoose.model("Vendor", vendorSchema);
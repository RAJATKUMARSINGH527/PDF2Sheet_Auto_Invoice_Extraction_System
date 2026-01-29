const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  spreadsheetId: { 
    type: String, 
    default: "" 
  }
}, { 
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Hash password before saving
// FIX: Removed 'next' argument. Async hooks handle completion automatically.
userSchema.pre("save", async function () {
  // 1. Only hash if password field is actually modified
  // This ensures name/spreadsheet updates don't trigger re-hashing
  if (!this.isModified("password")) {
    return; 
  }
  
  try {
    console.log(`[MODEL] Hashing password for: ${this.email}`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // In async pre-save, returning is equivalent to calling next()
  } catch (err) {
    console.error("[MODEL ERROR] Hashing failed:", err.message);
    throw err; // Throwing here will stop the save and hit your route's catch block
  }
});

module.exports = mongoose.model("User", userSchema);
const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// --- 1. GET PROFILE ---
router.get("/profile", auth, async (req, res) => {
  try {
    // Safety check for middleware user object
    const userId = req.user?.id || req.user?.user?.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// --- 2. UPDATE SETTINGS (Independent Name & SpreadsheetID Update) ---
router.post("/update-settings", auth, async (req, res) => {
  try {
    const { spreadsheetId, name } = req.body;
    
    // Safety check: Extract ID regardless of middleware structure
    const userId = req.user?.id || req.user?.user?.id;
    
    console.log(`[BACKEND] Update request for ID: ${userId}`);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // Independent Logic: Update only if field is provided in the request
    if (name !== undefined) {
      user.name = name.trim();
    }
    
    // spreadsheetId can be an empty string, so we check for undefined
    if (spreadsheetId !== undefined) {
      user.spreadsheetId = spreadsheetId.trim();
    }

    // Save triggers the password middleware check in models/User.js
    await user.save();

    console.log(`[BACKEND] Successfully updated: ${user.email}`);

    // Return the full updated user object to sync Frontend LocalStorage
    res.json({ 
      success: true, 
      name: user.name, 
      spreadsheetId: user.spreadsheetId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        spreadsheetId: user.spreadsheetId
      }
    });
  } catch (err) {
    console.error("[BACKEND ERROR]:", err.message);
    res.status(500).json({ success: false, error: "Database update failed" });
  }
});

// --- 3. REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ error: "User already exists" });

    user = new User({ name: name.trim(), email: normalizedEmail, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET_KEY, 
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, spreadsheetId: "" }
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- 4. LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET_KEY, 
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        spreadsheetId: user.spreadsheetId 
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
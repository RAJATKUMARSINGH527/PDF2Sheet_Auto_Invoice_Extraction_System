const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const passport = require("passport"); 

// --- 1. GOOGLE OAUTH ROUTES ---

/**
 * Initiates the Google OAuth flow.
 * Redirects the user to Google's consent screen.
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * The callback route Google redirects to after user authorization.
 * This fixes the 404 error by providing a matching endpoint for your Google Console settings.
 */
router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    try {
      // Generate a JWT for the authenticated user
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: "1d" }
      );

      // Determine the redirect target based on the environment
      const frontendURL = process.env.NODE_ENV === "production" 
        ? process.env.Frontend_Deployed_URL 
        : process.env.Frontend_URL;

      // Send the token back to the frontend via query parameters
      res.redirect(`${frontendURL}/login?token=${token}`);
    } catch (err) {
      console.error("OAuth Callback Error:", err);
      res.redirect(`${process.env.Frontend_URL}/login?error=auth_failed`);
    }
  }
);

// --- 2. GET PROFILE ---
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.user?.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// --- 3. UPDATE SETTINGS ---
router.post("/update-settings", auth, async (req, res) => {
  try {
    const { spreadsheetId, name } = req.body;
    const userId = req.user?.id || req.user?.user?.id;
    
    console.log(`[BACKEND] Update request for ID: ${userId}`);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (name !== undefined) user.name = name.trim();
    if (spreadsheetId !== undefined) user.spreadsheetId = spreadsheetId.trim();

    await user.save();
    console.log(`[BACKEND] Successfully updated: ${user.email}`);

    res.json({ 
      success: true, 
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

// --- 4. REGISTER ROUTE ---
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, spreadsheetId: "" }
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- 5. LOGIN ROUTE ---
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

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
const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const passport = require("passport");

// --- Helper for Beautiful Logs ---
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  auth: (msg) => console.log(`\x1b[35m[AUTH]\x1b[0m ${msg}`)
};

// --- 1. GOOGLE OAUTH ROUTES ---

router.get("/google", (req, res, next) => {
  log.auth("Redirecting user to Google Consent Screen...");
  next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    try {
      log.success(`Google Auth Successful for: ${req.user.email}`);
      
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: "1d" }
      );

      const frontendURL = process.env.NODE_ENV === "production" 
        ? process.env.Frontend_Deployed_URL 
        : process.env.Frontend_URL;

      log.info(`Handing off JWT to Frontend: ${frontendURL}`);
      res.redirect(`${frontendURL}/login?token=${token}`);
    } catch (err) {
      log.error(`OAuth Callback Logic Failed: ${err.message}`);
      res.redirect(`${process.env.Frontend_URL}/login?error=auth_failed`);
    }
  }
);

// --- 2. GET PROFILE ---
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.user?.id;
    log.info(`Fetching profile for UserID: ${userId}`);

    const user = await User.findById(userId).select("-password");
    if (!user) {
      log.warn(`Profile fetch failed: User ${userId} not found in DB`);
      return res.status(404).json({ error: "User not found" });
    }

    log.success(`Profile dispatched for: ${user.email}`);
    res.json(user);
  } catch (err) {
    log.error(`Profile Route Error: ${err.message}`);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// --- 3. UPDATE SETTINGS ---
router.post("/update-settings", auth, async (req, res) => {
  try {
    const { spreadsheetId, name } = req.body;
    const userId = req.user?.id || req.user?.user?.id;
    
    log.info(`Attempting settings update for UserID: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      log.warn(`Update failed: User ${userId} does not exist`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (spreadsheetId !== undefined) user.spreadsheetId = spreadsheetId.trim();

    await user.save();
    log.success(`Settings updated successfully for: ${user.email}`);

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
    log.error(`Settings Update Error: ${err.message}`);
    res.status(500).json({ success: false, error: "Database update failed" });
  }
});

// --- 4. REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    log.info(`New Registration Attempt: ${email}`);

    if (!name || !email || !password) {
      log.warn("Registration rejected: Missing required fields");
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      log.warn(`Registration rejected: Email ${normalizedEmail} already exists`);
      return res.status(400).json({ error: "User already exists" });
    }

    user = new User({ name: name.trim(), email: normalizedEmail, password });
    await user.save();

    log.success(`New user created: ${normalizedEmail}`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, spreadsheetId: "" }
    });
  } catch (err) {
    log.error(`Registration Error: ${err.message}`);
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- 5. LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    log.info(`Login attempt for: ${email}`);

    if (!email || !password) {
      log.warn("Login rejected: Missing credentials");
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      log.warn(`Login failed: No user found with email ${email}`);
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      log.warn(`Login failed: Incorrect password for ${email}`);
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    log.success(`User logged in: ${user.email}`);

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
    log.error(`Login Route Error: ${err.message}`);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
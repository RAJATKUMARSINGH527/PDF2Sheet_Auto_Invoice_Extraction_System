// const router = require("express").Router();
// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const auth = require("../middleware/auth");
// const passport = require("passport");

// // --- Helper for Beautiful Logs ---
// const log = {
//   info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
//   success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
//   warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
//   error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
//   auth: (msg) => console.log(`\x1b[35m[AUTH]\x1b[0m ${msg}`)
// };

// // --- 1. GOOGLE OAUTH ROUTES ---

// router.get("/google", (req, res, next) => {
//   log.auth("Redirecting user to Google Consent Screen...");
//   next();
// }, passport.authenticate("google", { scope: ["profile", "email"] }));

// router.get("/google/callback", 
//   passport.authenticate("google", { session: false, failureRedirect: "/login" }),
//   (req, res) => {
//     try {
//       log.success(`Google Auth Successful for: ${req.user.email}`);
      
//       const token = jwt.sign(
//         { id: req.user._id }, 
//         process.env.JWT_SECRET_KEY, 
//         { expiresIn: "1d" }
//       );

//       const frontendURL = process.env.NODE_ENV === "production" 
//         ? process.env.Frontend_Deployed_URL 
//         : process.env.Frontend_URL;

//       log.info(`Handing off JWT to Frontend: ${frontendURL}`);
//       res.redirect(`${frontendURL}/login?token=${token}`);
//     } catch (err) {
//       log.error(`OAuth Callback Logic Failed: ${err.message}`);
//       res.redirect(`${process.env.Frontend_URL}/login?error=auth_failed`);
//     }
//   }
// );

// // --- 2. GET PROFILE ---
// router.get("/profile", auth, async (req, res) => {
//   try {
//     const userId = req.user?.id || req.user?.user?.id;
//     log.info(`Fetching profile for UserID: ${userId}`);

//     const user = await User.findById(userId).select("-password");
//     if (!user) {
//       log.warn(`Profile fetch failed: User ${userId} not found in DB`);
//       return res.status(404).json({ error: "User not found" });
//     }

//     log.success(`Profile dispatched for: ${user.email}`);
//     res.json(user);
//   } catch (err) {
//     log.error(`Profile Route Error: ${err.message}`);
//     res.status(500).json({ error: "Server error fetching profile" });
//   }
// });

// // --- 3. UPDATE SETTINGS ---
// router.post("/update-settings", auth, async (req, res) => {
//   try {
//     const { spreadsheetId, name } = req.body;
//     const userId = req.user?.id || req.user?.user?.id;
    
//     log.info(`Attempting settings update for UserID: ${userId}`);

//     const user = await User.findById(userId);
//     if (!user) {
//       log.warn(`Update failed: User ${userId} does not exist`);
//       return res.status(404).json({ success: false, error: "User not found" });
//     }

//     if (name !== undefined) user.name = name.trim();
//     if (spreadsheetId !== undefined) user.spreadsheetId = spreadsheetId.trim();

//     await user.save();
//     log.success(`Settings updated successfully for: ${user.email}`);

//     res.json({ 
//       success: true, 
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         spreadsheetId: user.spreadsheetId
//       }
//     });
//   } catch (err) {
//     log.error(`Settings Update Error: ${err.message}`);
//     res.status(500).json({ success: false, error: "Database update failed" });
//   }
// });

// // --- 4. REGISTER ROUTE ---
// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     log.info(`New Registration Attempt: ${email}`);

//     if (!name || !email || !password) {
//       log.warn("Registration rejected: Missing required fields");
//       return res.status(400).json({ error: "Please enter all fields" });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     let user = await User.findOne({ email: normalizedEmail });
    
//     if (user) {
//       log.warn(`Registration rejected: Email ${normalizedEmail} already exists`);
//       return res.status(400).json({ error: "User already exists" });
//     }

//     user = new User({ name: name.trim(), email: normalizedEmail, password });
//     await user.save();

//     log.success(`New user created: ${normalizedEmail}`);

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
//     res.status(201).json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email, spreadsheetId: "" }
//     });
//   } catch (err) {
//     log.error(`Registration Error: ${err.message}`);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// // --- 5. LOGIN ROUTE ---
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     log.info(`Login attempt for: ${email}`);

//     if (!email || !password) {
//       log.warn("Login rejected: Missing credentials");
//       return res.status(400).json({ error: "Please enter all fields" });
//     }

//     const user = await User.findOne({ email: email.toLowerCase().trim() });
//     if (!user) {
//       log.warn(`Login failed: No user found with email ${email}`);
//       return res.status(400).json({ error: "Invalid Credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       log.warn(`Login failed: Incorrect password for ${email}`);
//       return res.status(400).json({ error: "Invalid Credentials" });
//     }

//     log.success(`User logged in: ${user.email}`);

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
//     res.json({
//       token,
//       user: { 
//         id: user._id, 
//         name: user.name, 
//         email: user.email,
//         spreadsheetId: user.spreadsheetId 
//       }
//     });
//   } catch (err) {
//     log.error(`Login Route Error: ${err.message}`);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// module.exports = router;

const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const passport = require("passport");

// --- Enhanced Log Helper ---
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  auth: (msg, details = "") => console.log(`\x1b[35m[AUTH]\x1b[0m ${msg} \x1b[90m${details}\x1b[0m`)
};

// --- 1. GOOGLE OAUTH ROUTES ---
router.get("/google", (req, res, next) => {
  log.auth("Inbound Google Login request detected.");
  next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    try {
      log.success(`Passport strategy matched user: ${req.user.email}`);
      
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: "1d" }
      );

      const frontendURL = process.env.NODE_ENV === "production" 
        ? process.env.Frontend_Deployed_URL 
        : process.env.Frontend_URL;

      log.auth("OAuth Handshake Complete.", `Generating JWT for UID: ${req.user._id}`);
      res.redirect(`${frontendURL}/login?token=${token}`);
    } catch (err) {
      log.error(`Critical OAuth Callback Error: ${err.message}`);
      res.redirect(`${process.env.Frontend_URL}/login?error=auth_failed`);
    }
  }
);

// --- 2. GET PROFILE ---
router.get("/profile", auth, async (req, res) => {
  try {
    // Debug exactly what the 'auth' middleware passed down
    log.auth("Profile Access Attempt.", `Decoded Token Payload: ${JSON.stringify(req.user)}`);

    const userId = req.user?.id || req.user?.user?.id;
    if (!userId) {
      log.warn("Profile Route: Middleware passed, but UserID is missing in req.user");
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await await User.findById(userId).select("-password");
    if (!user) {
      log.warn(`Profile Fetch Error: ID ${userId} exists in token but not in MongoDB.`);
      return res.status(404).json({ error: "User no longer exists" });
    }

    log.success(`Profile found and dispatched: ${user.email}`);
    res.json(user);
  } catch (err) {
    log.error(`Fatal Profile Route Error: ${err.stack}`);
    res.status(500).json({ error: "Internal Server Error during profile fetch" });
  }
});

// --- 3. UPDATE SETTINGS (The 401/404 Hotspot) ---
router.post("/update-settings", auth, async (req, res) => {
  try {
    log.info(`Update-Settings Triggered. Headers: ${req.headers.authorization ? 'Found' : 'MISSING'}`);
    log.info(`Request Body: ${JSON.stringify(req.body)}`);

    const { spreadsheetId, name } = req.body;
    const userId = req.user?.id || req.user?.user?.id;
    
    if (!userId) {
      log.error("Update-Settings: Authorized via middleware, but UserID extraction failed.");
      return res.status(401).json({ error: "Authentication data corrupted" });
    }

    const user = await User.findById(userId);
    if (!user) {
      log.warn(`Settings update failed: User ID ${userId} not found.`);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (spreadsheetId !== undefined) user.spreadsheetId = spreadsheetId.trim();

    await user.save();
    log.success(`Database sync complete for: ${user.email}`);

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
    log.error(`Settings Update Exception: ${err.message}`);
    res.status(500).json({ success: false, error: "Server failed to save settings" });
  }
});

// --- 4. REGISTER ---
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    log.info(`Registration Start: ${email}`);

    if (!name || !email || !password) {
      log.warn(`Registration missing fields: ${JSON.stringify(req.body)}`);
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      log.warn(`Registration Conflict: User ${normalizedEmail} already in DB`);
      return res.status(400).json({ error: "User already exists" });
    }

    user = new User({ name: name.trim(), email: normalizedEmail, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
    log.success(`New Account Created: ${normalizedEmail} (ID: ${user._id})`);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, spreadsheetId: "" }
    });
  } catch (err) {
    log.error(`Registration Logic Crash: ${err.stack}`);
    res.status(500).json({ error: "Registration failed on server" });
  }
});

// --- 5. LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    log.info(`Traditional Login Attempt: ${email}`);

    if (!email || !password) {
      log.warn("Login Request missing credentials");
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      log.warn(`Login Fail: No account with email ${email}`);
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      log.warn(`Login Fail: Password mismatch for ${email}`);
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
    log.success(`Session Generated: ${user.email}`);

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
    log.error(`Login Logic Crash: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error during Login" });
  }
});

module.exports = router;
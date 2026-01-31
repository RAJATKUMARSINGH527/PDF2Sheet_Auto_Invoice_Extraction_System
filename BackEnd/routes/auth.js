const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const passport = require("passport");
const nodemailer = require("nodemailer");
// --- Resend Email Service ---
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Enhanced Log Helper ---
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  auth: (msg, details = "") => console.log(`\x1b[35m[AUTH]\x1b[0m ${msg} \x1b[90m${details}\x1b[0m`)
};

// // --- Nodemailer Transporter ---
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // Gmail App Password
//   },
// });

// --- Modern Email Template Helper ---
function getModernEmailTemplate(url, name) {
  return `
    <div style="background-color: #f8fafc; padding: 50px 20px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <div style="background: #4f46e5; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">PDF2Sheet Auto</h1>
        </div>
        <div style="padding: 40px; color: #1e293b;">
          <h2 style="font-size: 20px; margin-bottom: 16px;">Hi ${name},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #64748b;">
            We received a request to reset your password. Click the button below to set a new one.
          </p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${url}" style="background-color: #4f46e5; color: white; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">
            Link expires in <b>15 minutes</b>. If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;
}

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

// --- 5. FORGOT PASSWORD ---
// router.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email: email.toLowerCase().trim() });
//     if (!user) return res.status(404).json({ error: "No account found with this email" });

//     const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
//     const frontendURL = process.env.NODE_ENV === "production" ? process.env.Frontend_Deployed_URL : process.env.Frontend_URL;
//     const resetUrl = `${frontendURL}/reset-password/${resetToken}`;

//     const mailOptions = {
//       from: `"PDF2Sheet Auto" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "🔒 Reset Your Password",
//       html: getModernEmailTemplate(resetUrl, user.name || "User"),
//     };

//     await transporter.sendMail(mailOptions);
//     log.success(`Reset link dispatched to: ${email}`);
//     res.json({ message: "Reset link sent to your email" });
//   } catch (err) {
//     log.error(`Forgot Pwd Error: ${err.message}`);
//     res.status(500).json({ error: "Failed to send email" });
//   }
// });

// --- FORGOT PASSWORD ROUTE ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
    const frontendURL = process.env.NODE_ENV === "production" ? process.env.Frontend_Deployed_URL : process.env.Frontend_URL;
    const resetUrl = `${frontendURL}/reset-password/${resetToken}`;

    // Gmail/SMTP ki jagah Resend API use karein
    const { data, error } = await resend.emails.send({
      from: 'PDF2Sheet <onboarding@resend.dev>', // Shuruat mein yahi use karein
      to: email,
      subject: '🔒 Reset Your Password',
      html: getModernEmailTemplate(resetUrl, user.name || "User"),
    });

    if (error) {
      log.error(`Resend Error: ${error.message}`);
      return res.status(500).json({ error: "Email delivery failed" });
    }

    log.success(`Reset link sent via Resend to: ${email}`);
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    log.error(`Forgot Pwd Exception: ${err.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

// --- 6. RESET PASSWORD ---
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "Invalid token or user not found" });

    user.password = password;
    
    await user.save();
    log.success(`Password reset successful for: ${user.email}`);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    log.error(`Reset Pwd Error: ${err.message}`);
    res.status(400).json({ error: "Link expired or invalid" });
  }
});

module.exports = router;
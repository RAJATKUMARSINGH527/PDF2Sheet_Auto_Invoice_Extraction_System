const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    // Normalize email to lowercase to prevent duplicates with different casing
    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = new User({ name, email: normalizedEmail, password });
    await user.save();

    // Ensure this variable name matches exactly in your .env and Login route
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    console.log(`\x1b[32m[AUTH]\x1b[0m User registered: ${normalizedEmail}`);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error(`\x1b[31m[AUTH ERROR]\x1b[0m ${err.message}`);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    // IMPORTANT: compare the plain text password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET_KEY, // MUST MATCH REGISTER ROUTE
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
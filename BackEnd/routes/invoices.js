const router = require("express").Router();
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

// @route   GET /invoices/history
// @desc    Get all invoices for the logged-in user
router.get("/history", auth, async (req, res) => {
  try {
    // Find invoices where the 'user' field matches the logged-in user's ID
    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Show newest first
      .limit(10);
    
    res.json(invoices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
// const router = require("express").Router();
// const Invoice = require("../models/Invoice");
// const auth = require("../middleware/auth");

// // @route   GET /invoices/history
// // @desc    Get all invoices for the logged-in user
// router.get("/history", auth, async (req, res) => {
//   try {
//     // Find invoices where the 'user' field matches the logged-in user's ID
//     const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
//     res.json(invoices);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });


// module.exports = router;

const router = require("express").Router();
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

// @route    GET /api/invoices/history
// @desc     Sari invoices nikalne ke liye (Sorted by latest)
router.get("/history", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("❌ History Fetch Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route    DELETE /api/invoices/:id
// @desc     Invoice delete karne ke liye (Database + Physical File)
router.delete("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });

    if (!invoice) {
      return res.status(404).json({ success: false, msg: "Invoice not found" });
    }

    // 1. Physical PDF file ko server se delete karna (Optional but Recommended)
    if (invoice.filePath) {
      const absolutePath = path.join(__dirname, "..", invoice.filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log("✔ Physical file deleted");
      }
    }

    // 2. Database se record delete karna
    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ success: true, msg: "Invoice deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error during deletion" });
  }
});

module.exports = router;
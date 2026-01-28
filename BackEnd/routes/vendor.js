const router = require("express").Router();
const Vendor = require("../models/Vendor");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

router.post("/save", auth, async (req, res) => {
  try {
    const { email, vendorName, mapping } = req.body;

    if (!email || !mapping) {
      return res.status(400).json({
        success: false,
        msg: "Email and mapping are required"
      });
    }

    const senderEmail = email.trim().toLowerCase();
    const userId = req.user.id;

    // 1️⃣ Save or update vendor template
    const vendor = await Vendor.findOneAndUpdate(
      { userId, senderEmail },
      {
        vendorName: vendorName || "Auto-Detected Vendor",
        mapping,
        $inc: { version: 1 },
        lastUpdated: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // 2️⃣ 🔥 AUTO-UPGRADE ALL PREVIOUS INVOICES
    const updateResult = await Invoice.updateMany(
      {
        userId,
        senderEmail,
        vendor: { $in: ["Auto-Detected", "Auto-Detected Vendor"] }
      },
      {
        $set: {
          vendor: vendor.vendorName,
          confidence: 1,
          needsMapping: false
        }
      }
    );

    console.log(
      `✔ Vendor synced for ${senderEmail} | Updated invoices: ${updateResult.modifiedCount}`
    );

    res.json({
      success: true,
      msg: "Vendor template saved & invoices auto-updated",
      data: {
        vendor,
        invoicesUpdated: updateResult.modifiedCount
      }
    });

  } catch (error) {
    console.error("❌ [VENDOR SAVE ERROR]", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to save vendor configuration"
    });
  }
});

module.exports = router;

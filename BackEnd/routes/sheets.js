const router = require("express").Router();
const auth = require("../middleware/auth");
const { appendInvoice } = require("../services/googleSheets");

router.post("/sync", auth, async (req, res) => {
  try {
    const { spreadsheetId, extractedData, columnMapping, email, vendorName } = req.body;

    const dataForSheets = {
      ...extractedData,
      senderEmail: email,
      vendor: vendorName
    };

    await appendInvoice(spreadsheetId, dataForSheets, columnMapping);

    res.json({ success: true, msg: "Synced to Google Sheets!" });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
});

module.exports = router;
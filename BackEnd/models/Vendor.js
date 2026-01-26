const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  senderEmail: String,
  vendorName: String,
  mapping: {
    invoiceNo: String,
    date: String,
    total: String
  },
  version: { type: Number, default: 1 }
});

module.exports = mongoose.model("Vendor", vendorSchema);

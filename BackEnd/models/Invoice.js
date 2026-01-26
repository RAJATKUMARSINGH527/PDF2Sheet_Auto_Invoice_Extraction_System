const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  senderEmail: String,
  vendor: String,
  invoiceNo: String,
  date: String,
  total: Number,
  confidence: Number,
  rawText: String
});

module.exports = mongoose.model("Invoice", invoiceSchema);

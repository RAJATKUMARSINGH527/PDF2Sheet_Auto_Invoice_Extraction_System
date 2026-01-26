const router = require("express").Router();
const Vendor = require("../models/Vendor");

router.post("/save", async (req,res)=>{
  const { email, vendorName, mapping } = req.body;

  const existing = await Vendor.findOne({ senderEmail: email });

  if(existing){
    existing.mapping = mapping;
    existing.version++;
    await existing.save();
  } else {
    await Vendor.create({ senderEmail: email, vendorName, mapping });
  }

  res.json({ success:true });
});

module.exports = router;

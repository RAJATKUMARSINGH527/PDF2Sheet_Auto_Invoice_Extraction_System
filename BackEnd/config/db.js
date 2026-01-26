const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Mongo Error", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

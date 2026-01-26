// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const passport = require("passport");
// const session = require("express-session");
// const connectDB = require("./db");

// const app = express();
// connectDB();

// app.use(cors({
//   origin:"http://localhost:5173",
//   credentials:true
// }));

// app.use(express.json());

// app.use(session({
//   secret:"pdf2sheet_secret",
//   resave:false,
//   saveUninitialized:false
// }));

// require("./services/passport");

// app.use(passport.initialize());
// app.use(passport.session());

// app.use("/upload", require("./routes/upload"));
// app.use("/vendor", require("./routes/vendor"));

// app.get("/auth/google",
//   passport.authenticate("google", {
//     scope:["profile","email","https://www.googleapis.com/auth/spreadsheets"]
//   })
// );

// app.get("/auth/google/callback",
//   passport.authenticate("google",{ failureRedirect:"/login" }),
//   (req,res)=>{
//     req.session.refreshToken = req.user.refreshToken;
//     res.redirect("http://localhost:5173/dashboard");
//   }
// );

// app.get("/", (req,res)=> res.send("PDF2Sheet Auto API running"));

// app.listen(process.env.PORT, ()=>{
//   console.log("Server running on port " + process.env.PORT);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));

app.use(express.json());

app.use("/upload", require("./routes/upload"));
app.use("/vendor", require("./routes/vendor"));

app.get("/", (req,res)=>{
  res.send("PDF2Sheet Auto API running");
});

app.listen(process.env.PORT, ()=>{
  console.log("Server running on port " + process.env.PORT);
});

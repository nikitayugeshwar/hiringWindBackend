const express = require("express");
const app = express();
// const { connectRedis } = require("./config/redis");
// const autoCache = require("./middleware/autoCache");
require("dotenv").config();
const multer = require("multer");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/db");
const userRoute = require("./routes/userRoute");
const interviewRoute = require("./routes/interviewRoute");
const companyRoute = require("./routes/companyRoute");
const jobRoutes = require("./routes/jobRoutes");
const appliedJobRoute = require("./routes/appliedJobRoute");
connectDb();

// connectRedis();
const cors = require("cors");

// CORS has to run before any route so every response carries the headers.
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(autoCache);

app.get("/api/check", (req, res) => {
  res.send("check is visible");
});
app.get("/", (req, res) => {
  res.send("backend is live");
});
app.use("/api/user", userRoute);
app.use("/api/interview", interviewRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoutes);
app.use("/api/appliedJob", appliedJobRoute);

app.use((req, res) => {
  res.status(404).json({ message: "route not found", success: false });
});

// Upload rejections (size limit, wrong mime type) would otherwise surface as
// an HTML 500 that the frontend cannot read.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Resume must be 5MB or smaller"
          : err.message,
      success: false,
    });
  }

  console.error(err);
  return res.status(500).json({
    message: err.message || "something went wrong",
    success: false,
  });
});

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

module.exports = app;

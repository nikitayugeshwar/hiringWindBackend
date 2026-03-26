const express = require("express");
const app = express();
// const { connectRedis } = require("./config/redis");
// const autoCache = require("./middleware/autoCache");
require("dotenv").config();
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

app.get("/api/check", (req, res) => {
  res.send("check is visible");
});
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
// app.use(autoCache);
app.get("/", (req, res) => {
  res.send("backend is live");
});
app.use("/api/user", userRoute);
app.use("/api/interview", interviewRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoutes);
app.use("/api/appliedJob", appliedJobRoute);

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

module.exports = app;

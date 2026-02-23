const express = require("express");
const app = express();

require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectDb = require("./config/db");
const userRoute = require("./routes/userRoute");
const interviewRoute = require("./routes/interviewRoute");
connectDb();
const cors = require("cors");

// app.get("/", (req, res) => {
//   res.send("Page is visible");
// });
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use("/api/user", userRoute);
app.use("/api/interview", interviewRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

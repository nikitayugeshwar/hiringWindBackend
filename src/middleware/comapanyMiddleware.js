const jwt = require("jsonwebtoken");

exports.companyMiddleware = (req, res, next) => {
  console.log("req.cookies", req.cookies);
  const companyToken = req.cookies?.companyToken;
  console.log("companyToken", companyToken);
  if (!companyToken) {
    return res.status(401).json({ message: "access denied OR no token" });
  }
  console.log("abc");
  try {
    const decode = jwt.verify(companyToken, process.env.JWT_SECRET);
    console.log("decode", decode);
    req.company = decode;
    next();
  } catch (error) {
    res.status(500).json({ message: "invalid or expire token" });
  }
};

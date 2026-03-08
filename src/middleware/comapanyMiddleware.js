const jwt = require("jsonwebtoken");

exports.companyMiddleware = (req, res, next) => {
  const companyToken = req.cookies?.companyToken;

  if (!companyToken) {
    return res.status(401).json({ message: "access denied OR no token" });
  }

  try {
    const decode = jwt.verify(companyToken, process.env.JWT_SECRET);

    req.company = decode;
    next();
  } catch (error) {
    res.status(500).json({ message: "invalid or expire token" });
  }
};

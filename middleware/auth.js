const jwt = require("jsonwebtoken");
//const keys = require("../keys/index");

exports.tokenMiddleware = async function(req, res, next) {
  const token = req.header("authToken") || req.cookies.authToken;
  if (!token) return res.status(401).json({ message: "Auth Error" });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(500).send({ message: "Invalid Token" });
  }
};

exports.isAdminMiddleware = async function(req, res, next) {
  if (req.user.role === "admin") next();
  else return res.status(403).json({ message: "User role is not admin" });
};

exports.isTeacherMiddleware = async function(req, res, next) {
  if (req.user.role === "teacher") next();
  else return res.status(403).json({ message: "User role is not teacher" });
};

exports.isAdminOrTeacherMiddleware = async function(req, res, next) {
  if (req.user.role === "admin" || req.user.role === "teacher") next();
  else return res.status(403).json({ message: "User role is not admin or teacher" });
};
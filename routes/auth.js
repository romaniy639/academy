/* eslint-disable prettier/prettier */
const { Router } = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { tokenMiddleware } = require("../middleware/auth");
const regEmail = require("../emails/registration");
const resEmail = require("../emails/reset");
const User = require("../models/user");
const Loc = require("../models/language")
//const keys = require("../keys");
const {isAdminOrTeacherMiddleware} = require("../middleware/auth");
const {
  loginRules,
  registerRules,
  changePasswordRules,
  resetRules,
  setPasswordRules
} = require("../utils/validators");

const router = new Router();
const transporter = nodemailer.createTransport(sendgrid({ auth: { api_key: process.env.SENDGRID_API_KEY } }));

router.post("/register", tokenMiddleware, isAdminOrTeacherMiddleware, registerRules, async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (req.user.role === "admin" || req.user.role === "teacher") {
      const user = new User({
        name: username,
        password: (await bcrypt.hash(password, 10)).toString(),
        email,
        role: req.user.role === "admin" ? "teacher" : "student"
      });
      await user.save();
      await transporter.sendMail(regEmail(username, email, password));
      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (e) {
    next(e);
  }
});

router.post("/login", loginRules, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    const token = jwt.sign({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, process.env.SECRET_TOKEN, { expiresIn: "24h" });
    res.status(200).json({ token, message: "Authentication successful!" });
  } catch (e) {
    next(e);
  }
});

router.delete("/logout", tokenMiddleware, async (req, res) => {
  res.clearCookie("authToken").status(200).json({ message: "Session deleted..." });
});

router.put("/reset", resetRules, (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) return res.status(422).json({ message: "Oops! Something went wrong..." });
      const user = await User.findOneAndUpdate({
        email: req.body.email
      }, {
        resetToken: buffer.toString("hex"),
        resetTokenExp: Date.now() + 3600000
      });
      await transporter.sendMail(resEmail(req.body.email, buffer.toString("hex")));
      res.status(200).json({
        user: {
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (e) {
    next(e);
  }
});

router.get("/password/:token", async (req, res) => {
  try {
    if (!req.params.token) return res.redirect("/login");

    const user = await User.findOne({ resetToken: req.params.token, resetTokenExp: { $gt: Date.now() } });
    if (!user) {
      return res.status(404).json({ message: "User not found..." });
    } else {
      return res.status(200).json({ userId: user._id });
    }
  } catch (e) {
    next(e);
  }
});

router.put("/password/:token", setPasswordRules, async (req, res) => {
  try {
    await User.findOneAndUpdate({
      _id: req.body.userId,
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }
    }, {
      password: await bcrypt.hash(req.body.password, 10),
      $unset: { resetToken: "", resetTokenExp: "" }
    });
    res.status(200).json({ message: "Password has been updated" });
  } catch (e) {
    next(e);
  }
});

router.get("/profile", tokenMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.get("/notifications", tokenMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  let notifications = [];
  for (let notice of user.notification) {
    if (notice.expiredTime >= Date.now()) {
      notifications.push(notice)
    }
  }
  await User.findByIdAndUpdate(req.user.id, {notification: notifications})
  res.status(200).json({
    notifications 
  });
});

router.put("/profile", tokenMiddleware, changePasswordRules, async (req, res) => {
  try {
    const oldUserPassword = (await User.findById(req.user.id)).password;
    if (await bcrypt.compare(req.body.oldPassword, oldUserPassword)) {
      await User.findByIdAndUpdate(req.user.id, { password: (await bcrypt.hash(req.body.newPassword, 10)).toString() });
      const user = await User.findById(req.user.id);
      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(422).json({ message: "Invalid old password..." });
    }
  } catch (e) {
    next(e);
  }
});

router.get("/get_language", tokenMiddleware, async (req, res) => {
  try { 
    let language;
    const data = await Loc.find();
    if (req.body.language === "EN") {
      language = data[0].dictionary;
    } else {
      language = data[1].dictionary;
    }
    res.status(200).json({
      dictionary: language
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
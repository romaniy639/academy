const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const keys = require("./keys");
const authRouter = require("./routes/auth");
const groupRouter = require("./routes/group");
const scheduleRouter = require("./routes/schedule");

const PORT = 5000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Custom-Header, authToken"
  );
  res.header("Access-Control-Expose-Headers", "authToken");
  res.set("Content-Type", "application/json");
  next();
});
app.use(cookieParser());

app.use("/", authRouter);
app.use("/schedule", scheduleRouter);
app.use("/groups", groupRouter);

app.use(function(req, res) {
  res.status(404).json({ message: "Page not found" });
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message });
});

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    app.listen(PORT, () => {
      console.log("Server has been started...");
    });
  } catch (e) {
    console.log(e);
  }
}

start();

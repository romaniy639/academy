const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const keys = require("./keys");
const authRouter = require("./routes/auth");
const groupRouter = require("./routes/group");
const scheduleRouter = require("./routes/schedule");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET || keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Expose-Headers", "authToken");
  res.set("Content-Type", "application/json");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, X-Custom-Header, authToken"
  );
  next();
});
app.use(cookieParser());

app.use("/", authRouter);
app.use("/schedules", scheduleRouter);
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
    await mongoose.connect(MONGODB_URI || keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    app.listen(PORT, () => {
      console.log(`Server has been started on port ${PORT} ...`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();

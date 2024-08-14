const express = require("express");
const app = express();
var cors = require("cors");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/sweply");
var db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once("open", function (callback) {
  console.log("connection succeeded");
});

app.get("/", function (req, res) {
  res.send("home");
});

app.post("/login", async function (req, res) {
  console.log(req.body);
  const { username, password } = req.body;
  let userFOund;
  const user = db.collection("userTable").findOne({ username: username });
  if (user) {
    const isCorrect = password === user.password;
    if (isCorrect) {
      try {
        token = jwt.sign(
          {
            userID: userFOund,
            username: username,
          },
          "thisisasecretkey",
          { expiresIn: "1h" }
        );
      } catch (err) {
        console.log(err);
      }
      res.status(200).json({
        success: true,
        data: {
          userID: userFOund,
          username: username,
          token: token,
        },
      });
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Wrong password",
      });
    }
  }
});

app.post("/signup", function (req, res) {
  const { username, email, password } = req.body;
  const data = { username, email, password };
  let token;
  let newUserID;
  db.collection("userTable").insertOne(data, function (err, col) {
    if (err) throw err;
    console.log("saved", col.insertedId);
    newUserID = col.insertedId;
  });
  try {
    token = jwt.sign(
      {
        userID: newUserID,
        email: email,
      },
      "thisisasecretkey",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
  }
  console.log(req.body);

  res.status(200).json({
    success: true,
    data: {
      userID: newUserID,
      email: email,
      token: token,
    },
  });
});

app.get("/productlist", async function (req, res) {
  let doc = await db.collection("ProductTable").find({}).toArray();
  console.log(doc);

  res.status(200).json({
    success: true,
    data: doc,
  });
});

app.listen(8000, () => {
  console.log("Server started");
});

const express = require("express");
const app = express();
const cmpression = require("compression");
var path = require("path");
app.use(cmpression());
const Middleware = require("../Middleware/Middleware");
const Route = require("../Routes/Routes");
const Cors = require("cors");
const { encrypt, decrypt } = require("../Util/Encrypt");
//CORS
var whitelist = [
  "https://webdokter.herokuapp.com",
  "http://localhost:3000",
  "https://api-dokter.herokuapp.com",
];

app.use(Cors());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  // res.setHeader(
  //   "Access-Control-Allow-Origin",
  //   "https://webdokter.herokuapp.com"
  // );
  const origin = req.headers.origin;
  if (whitelist.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

//Make body readable
var multer = require("multer");
var forms = multer();
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//Add middleware
// app.use(Middleware);

//Add Routes
Route(app);

app.get("/", (req, res) => {
  let a = encrypt("Oke");
  res.send(decrypt(a));
});
// var multer = require("multer");
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });
// var upload = multer({ storage: storage });
// app.post("/", upload.single("uploaded_file"), function (req, res) {
//   // req.file is the name of your file in the form above, here 'uploaded_file'
//   // req.body will hold the text fields, if there were any
//   res.send(req.file);
// });

module.exports = app;

const jwt = require("jsonwebtoken");
var key = "85838781494488976149270763900171";

function generate(username, role) {
  return jwt.sign(
    { username: username, role: role, project: "AplikasiDokter" },
    key
  );
}

function verify(req, res, next) {
  try {
    let token = req.headers.authorization;
    var decoded = jwt.verify(token, key);
    if (decoded.project == "AplikasiDokter") {
      next();
    } else {
      res.status(401).json({ status: false, message: "Token is not valid" });
    }
  } catch (err) {
    res.status(401).json({ status: false, message: "Token is not valid" });
  }
}

module.exports = {
  generate: generate,
  verify: verify,
};

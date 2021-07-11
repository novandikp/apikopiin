const crypto = require("crypto");
const algorithm = "aes-256-cbc";
var key = "64236048446209138083932519690585";
var iv = "4434897326173192";

function encrypt(text = "") {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

module.exports = {
  encrypt: encrypt,
};

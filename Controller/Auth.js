var express = require("express")
var router = express.Router()
var koneksi = require("../Util/Database")
const { generate } = require("../Util/JWT")
const { encrypt } = require("../Util/Encrypt")
const validate = require("../Validation/RegisterValidation")
const handlerInput = require("../Util/ValidationHandler")

//REGISTER
router.post("/register", validate(), handlerInput, async function (req, res) {
  let sql = `INSERT INTO public.users(
    username, nama_lengkap, password, email, no_telp)
   VALUES ( $1, $2, $3, $4, $5) RETURNING ID;`
  let data = [
    req.body.username,
    req.body.nama_lengkap,
    encrypt(req.body.password),
    req.body.email,
    req.body.no_telp,
  ]

  try {
    let user = await koneksi.one(sql, data)
    req.body.id = user.id
    let token = generate(req.body.username)
    res.status(200).json({
      status: true,
      data: req.body,
      token: token,
    })
  } catch (e) {
    res.status(406).json({
      status: false,
    })
  }
})
//CHECK EMAIL
router.post("/email", async function (req, res, next) {
  let sql = `SELECT * FROM users where email=$1 AND id!=$2`
  let data = [req.body.email, req.body.id]
  let result = await koneksi.any(sql, data)
  if (result.length == 0) {
    res.json({
      status: true,
      message: "Email belum terdaftar",
    })
  } else {
    res.status(404).json({
      status: false,
      errorMessage: "Email sudah terdaftar",
    })
  }
  //
})
//LOGIN
router.post("/login", async function (req, res, next) {
  let sql = `SELECT * FROM users where (email=$1 or username=$1) and password=$2`
  let data = [req.body.username, encrypt(req.body.password)]

  try {
    let result = await koneksi.any(sql, data)
    // console.log(result)
    if (result.length > 0) {
      let id_user = result[0].id
      let id_merchant = result[0].id_merchant
      let dataLogUser = await koneksi.query(
        `SELECT * FROM user_log WHERE id_user=${id_user} and deviceid='${req.body.deviceid}'`
      )
      let dataLogMerchant = await koneksi.query(
        `SELECT * FROM merchant_log WHERE id_merchant=${id_merchant} and deviceid='${req.body.deviceid}'`
      )
      // console.log(dataLog)
      if (!dataLogUser.length) {
        // Insert log baru
        await koneksi.none(
          "INSERT INTO user_log(id_user,deviceid,tgllogin) VALUES($1,$2,NOW())",
          [id_user, req.body.deviceid]
        )
      } else {
        // Update log
        await koneksi.none(
          `UPDATE user_log SET flaglogin=1, tgllogin=NOW() WHERE id_user=${id_user}`
        )
      }
      // Log merchang
      if (!dataLogMerchant.length) {
        await koneksi.none(
          "INSERT INTO merchant_log(id_merchant,deviceid,tgllogin) VALUES($1,$2,NOW())",
          [id_merchant, req.body.deviceid]
        )
      } else {
        await koneksi.none(
          `UPDATE merchant_log SET flaglogin=1, tgllogin=NOW() WHERE id_merchant=${id_merchant}`
        )
      }

      let token = generate(result[0].username, result[0].roles)
      res.json({
        status: true,
        token: token,
        data: result[0],
      })
    } else {
      res.status(404).json({
        status: false,
        errorMessage:
          "Username atau Password tidak ditemukan. Harap periksa kembali data yang anda inputkan.",
      })
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({
      status: false,
      errorMessage: "Terjadi kesalahan saat login.",
    })
  }

  //
})

// Logout
router.post("/logout", async function (req, res, next) {
  const { id_user, id_merchant, deviceid } = req.body
  console.log({ id_user, id_merchant, deviceid })
  try {
    await koneksi.none(
      `UPDATE user_log SET flaglogin=0 WHERE id_user=${id_user} AND deviceid='${deviceid}'`
    )
    if (id_merchant) {
      await koneksi.none(
        `UPDATE merchant_log SET flaglogin=0 WHERE id_merchant=${id_merchant} AND deviceid='${deviceid}'`
      )
    }

    res.json({
      status: true,
      message: "Berhasil",
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      status: false,
      errorMessage: JSON.stringify(e),
    })
  }

  //
})

module.exports = router

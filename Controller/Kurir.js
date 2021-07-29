var express = require("express")
const db = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(`SELECT kodekurir, kurir from kurir`)
  res.status(200).json({
    status: true,
    data: data,
  })
})

router.get("/shop/:id", async function (req, res) {
  let id = req.params.id
  let data = await koneksi.query(
    `SELECT kurirtoko.id, id_merchant, kurirtoko.kodekurir, kurir.kurir from kurirtoko inner join kurir on kurir.kodekurir = kurirtoko.kodekurir  where id_merchant=$1`,
    [id]
  )

  let header = await koneksi.one(
    `select nama_toko,alamat_toko from merchant where id = $1`,
    [id]
  )

  header["kurir"] = data
  res.status(200).json({
    status: true,
    data: header,
  })
})

router.post("/", async function (req, res) {
  if ((req.body.kodekurir ? req.body.kodekurir.length : [].length) > 0) {
    try {
      let sql = "delete from kurirtoko where id_merchant = $1"
      await db.none(sql, [req.body.id_merchant])
      req.body.kodekurir.forEach((kurir) => {
        db.none(
          "INSERT INTO kurirtoko (id_merchant,kodekurir) VALUES ($1,$2)",
          [req.body.id_merchant, kurir]
        )
      })
      res.status(200).json({
        status: true,
      })
    } catch (e) {
      res.status(404).json({
        status: false,
      })
    }
  } else {
    res.status(204).json({
      status: false,
    })
  }
})

module.exports = router

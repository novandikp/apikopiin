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
    `SELECT kurirtoko.id, id_merchant, kurirtoko.kodekurir, kurir.kurir, nama_toko from kurirtoko inner join kurir on kurir.kodekurir = kurirtoko.kodekurir inner join merchant on merchant.id = kurirtoko.id_merchant where id_merchant=$1`,
    [id]
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

router.post("/", async function (req, res) {
  if (req.body.kodekurir.length > 0) {
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

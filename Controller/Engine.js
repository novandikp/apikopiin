var express = require("express")
const db = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")

router.post("/kurirtoko", async function (req, res) {
  let dataToko = await db.query(
    `SELECT id FROM merchant where id not in (select id_merchant from kurirtoko)`
  )
  for (let i = 0; i < dataToko.length; i++) {
    const toko = dataToko[i]
    await // Insert Data Kurir
    db.none(
      "INSERT INTO kurirtoko(id_merchant,kodekurir) VALUES( $1, $2), ( $1, $3), ( $1, $4), ( $1, $5)",
      [toko.id, "gojek", "grab", "sicepat", "wahana"]
    )
  }

  res.status(200).send({
    status: true,
    message: 'Berhasil Engine data Kurir toko',
  })
})

module.exports = router
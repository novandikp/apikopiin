var express = require("express")
var router = express.Router()
var koneksi = require("../Util/Database")

router.get("/saldo/user/:id", async function (req, res) {
  let data = await koneksi.one(
    `SELECT COALESCE(sum(debit-kredit),0) as saldo from jurnal_detail where uid=$1 and userver =1`,
    [req.params.id]
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})
router.get("/saldo/merchant/:id", async function (req, res) {
  let data = await koneksi.one(
    `SELECT COALESCE(sum(debit-kredit),0) as saldo from jurnal_detail where uid=$1 and userver =2`,
    [req.params.id]
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

module.exports = router

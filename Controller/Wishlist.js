var express = require("express")
var router = express.Router()
var koneksi = require("../Util/Database")
const handlerInput = require("../Util/ValidationHandler")
const validate = require("../Validation/WishlistValidation")

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT wishlist.id, id_user, id_barang, tgl_wishlist,  id_merchant, id_kategori, nama, deskripsi, harga, berat, stok,  users.username, penjual.username as usermame_penjual, penjual.nama_toko FROM wishlist
    INNER join users on wishlist.id_user = users.id
    INNER join barang on wishlist.id_barang = barang.id
    INNER join users as penjual on wishlist.id_user = penjual.id`
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

//GET BY ID
router.get("/:id", async function (req, res, next) {
  let id = req.params.id
  let cari = ""
  if (req.query.cari) {
    cari = req.query.cari
  }

  let order = "nama"
  if (req.query.orderby) {
    order = req.query.orderby
  }

  let limit = "10"
  let offset = "0"
  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.offset) {
    offset = req.query.offset
  }

  let data = await koneksi.query(
    `SELECT wishlist.id, id_user, COALESCE(rating,0) as rating, COALESCE(terjual,0)as terjual, tgl_wishlist, nama, deskripsi,harga,foto_barang,stok, kota from wishlist inner join barang on barang.id = wishlist.id_barang inner join merchant on merchant.id = barang.id_merchant LEFT join (SELECT id_barang, ROUND(avg(rating),1) as rating from order_detail inner join ulasan  on ulasan.id_order_detail = order_detail.id GROUP by id_barang) T on T.id_barang = barang.id     LEFT join (SELECT id_barang, sum(jumlah) as terjual from order_detail inner join orders  on orders.id = order_detail.id_order where status >= 7  GROUP by id_barang) B on B.id_barang =barang.id
     where wishlist.id_user = $1  and (nama ILIKE '%${cari}%' OR 
     deskripsi  ILIKE '%${cari}%') ORDER BY ` +
      order +
      ` limit ${limit} offset ${offset}`,
    [id]
  )

  res.status(200).json({
    status: true,
    data: data,
  })
})

//INSERT
router.post("/", function (req, res) {
  let sql

  if (req.body.liked.toString() == "true") {
    sql =
      "INSERT INTO wishlist  (id_barang,id_user,tgl_wishlist) values ($1,$2,now())"
  } else {
    sql = "DELETE FROM wishlist  where id_barang = $1 and id_user=$2"
  }
  console.log(sql)
  koneksi
    .none(sql, [req.body.id_barang, req.body.id_user])
    .then((data) => {
      res.status(200).json({
        status: true,
      })
    })
    .catch((e) => {
      console.warn(e)
      res.status(404).json({
        status: false,
        errorMessage: e,
      })
    })
})

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id
  let sql = `DELETE FROM wishlist WHERE id=$1`
  let data = [id]
  koneksi.any(sql, data)
  res.status(200).json({
    status: true,
    data: exists[0],
  }) //
})
module.exports = router

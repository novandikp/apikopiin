var express = require("express")
const db = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")

//Semua toko
router.get("/", async function (req, res) {
  let data = []
  let cari = ""
  if (req.query.cari) {
    cari = req.query.cari
  }

  let limit = "10"
  let offset = "0"
  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.offset) {
    offset = req.query.offset
  }

  let jenis = ""
  if (req.query.jenis) {
    jenis = " AND id_jenis=" + req.query.jenis
  }

  let order = "nama_toko"
  if (req.query.orderby) {
    order = req.query.orderby
  }

  // if (req.query.lat && req.query.long || true) {}
  try {
    data = await koneksi.query(
      `SELECT merchant.id,nama_toko, jenis_toko.jenis ,provinsi, kota, kecamatan,kodepos, alamat_toko, foto_merchant,
      ( 3959 * acos( cos( radians($1) ) * cos( radians( lat_toko) ) * cos( radians( long_toko ) - radians($2) ) + sin( radians($1) ) * sin( radians( lat_toko ) ) ) ) AS distance 
      from merchant inner join jenis_toko on jenis_toko.id = merchant.id_jenis 
        where (nama_toko ilike '%${cari}%' or
        alamat_toko ilike '%${cari}%') ${jenis}
        order by  ${order}
        limit ${limit} offset ${offset}
        `,
      [req.query.lat, req.query.long]
    )

    res.status(200).json({
      status: true,
      data: data,
    })
  } catch (e) {
    res.status(500).json({
      status: false,
      data: data,
      errorMessage: e.message,
    })
  }
})

//Detail toko
router.get("/:id", async function (req, res) {
  let id = req.params.id
  let sql = `SELECT merchant.id,nama_toko,foto_merchant, no_telp, id_jenis as jenis_toko, idprovinsi, idkota, jenis_toko.jenis, provinsi,
  kota, kecamatan,kodepos , alamat_toko,lat_toko, long_toko,alamat_map ,T.jumlahbeli, T.rating, T.jumlahulasan
  from merchant inner join users on users.id_merchant = merchant.id inner join jenis_toko on jenis_toko.id = merchant.id_jenis cross join
(SELECT count(order_detail.id) as jumlahbeli,avg(rating) as rating,COUNT(ulasan.id) as jumlahulasan from order_detail inner join barang on order_detail.id_barang = barang.id inner join orders on order_detail.id_order=orders.id inner join ulasan on order_detail.id = ulasan.id_order_detail
 where barang.id_merchant = ${id} and orders.status = '7' ) T where id_merchant= ${id}
`
  let data = await db.one(sql)
  if (!data.rating) {
    data.rating = 0
  } else {
    data.rating = Number.parseFloat(data.rating).toFixed(1)
  }

  res.status(200).send({
    status: true,
    data: data,
  })
})

module.exports = router

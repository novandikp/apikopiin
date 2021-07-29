const e = require("express")
var express = require("express")
const { query } = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")
const handlerInput = require("../Util/ValidationHandler")
const validate = require("../Validation/BarangValidation")

//Ambil semua barang
router.get("/", async function (req, res) {
  let cari = ""
  if (req.query.cari) {
    cari = req.query.cari
  }

  let order = "nama"
  if (req.query.orderby) {
    order = req.query.orderby
  }
  let sort = "ASC"
  if (req.query.sort) {
    sort = req.query.sort
  }

  let rating = 0
  if (req.query.rating) {
    rating = parseInt(req.query.rating)
  }
  let limit = "10"
  let offset = "0"
  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.offset) {
    offset = req.query.offset
  }

  let kategori = ""
  if (req.query.kategori) {
    kategori = "AND id_kategori = " + req.query.kategori
  }

  console.log("")
  let data = await koneksi.query(
    `SELECT barang.id, foto_barang, id_merchant, id_kategori, nama, barang.deskripsi, barang.harga, berat, stok,  nama_toko, jenis_toko.jenis, COALESCE(T.rating,0) as rating ,COALESCE(B.terjual,0) as terjual
    from barang  inner join merchant ON barang.id_merchant = merchant.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON merchant.id_jenis = jenis_toko.id LEFT join (SELECT id_barang, ROUND(avg(rating),1) as rating from order_detail inner join ulasan  on ulasan.id_order_detail = order_detail.id GROUP by id_barang) T on T.id_barang = barang.id
    LEFT join (SELECT id_barang, sum(jumlah) as terjual from order_detail inner join orders  on orders.id = order_detail.id_order where status >= 7  GROUP by id_barang) B on B.id_barang =barang.id
    where COALESCE(T.rating,0) >= ${rating} ${kategori}  and (nama ILIKE '%${cari}%' OR 
    deskripsi  ILIKE '%${cari}%' OR
    nama_toko  ILIKE '%${cari}%') ORDER BY ` +
      order +
      ` ${sort} limit ${limit} offset ${offset}`
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

//Barang PER TOKO
router.get("/shop/:id", async function (req, res) {
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
  let id = req.params.id
  let data = await koneksi.query(
    `SELECT barang.id, foto_barang, id_merchant, id_kategori, nama, barang.deskripsi, barang.harga, berat, stok,  nama_toko, jenis_toko.jenis, COALESCE(T.rating,0) as rating ,COALESCE(B.terjual,0) as terjual
    from barang  inner join merchant ON barang.id_merchant = merchant.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON merchant.id_jenis = jenis_toko.id LEFT join (SELECT id_barang, ROUND(avg(rating),1) as rating from order_detail inner join ulasan  on ulasan.id_order_detail = order_detail.id GROUP by id_barang) T on T.id_barang = barang.id
    LEFT join (SELECT id_barang, sum(jumlah) as terjual from order_detail inner join orders  on orders.id = order_detail.id_order where status >= 7  GROUP by id_barang) B on B.id_barang =barang.id where id_merchant=$1 and (
      nama ILIKE '%${cari}%' OR 
      deskripsi  ILIKE '%${cari}%' 
    )  limit ${limit} offset ${offset}`,
    [id]
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

//Barang PER ID
router.get("/:id", async function (req, res, next) {
  let id = req.params.id

  let data = await koneksi.query(
    `SELECT barang.id, id_merchant, id_kategori, foto_barang,foto_merchant, nama, barang.deskripsi, barang.harga, berat, stok,  nama_toko, jenis_toko.jenis, COALESCE(T.rating,0) as rating 
    from barang  inner join merchant ON barang.id_merchant = merchant.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON merchant.id_jenis = jenis_toko.id LEFT join (SELECT id_barang, ROUND(avg(rating),1) as rating from order_detail inner join ulasan  on ulasan.id_order_detail = order_detail.id GROUP by id_barang) T on T.id_barang = barang.id where barang.id = $1`,
    [id]
  )

  let user = "0"
  if (req.query.iduser) {
    user = req.query.iduser
  }

  let wishlist = await koneksi.one(
    "select count(id) from wishlist where id_barang = $1 and id_user=$2",
    [id, user]
  )
  let varian = await koneksi.query(
    `select id, nama_varian  from varian where id_barang = $1`,
    [id]
  )

  if (data.length == 1) {
    let terkaitsql = `SELECT barang.id, foto_barang, id_merchant, id_kategori, nama, barang.deskripsi, barang.harga, berat, stok,  nama_toko, jenis_toko.jenis, COALESCE(T.rating,0) as rating 
    from barang  inner join merchant ON barang.id_merchant = merchant.id inner join kategori ON barang.id_kategori = kategori.id inner join jenis_toko ON merchant.id_jenis = jenis_toko.id LEFT join (SELECT id_barang, ROUND(avg(rating),1) as rating from order_detail inner join ulasan  on ulasan.id_order_detail = order_detail.id GROUP by id_barang) T on T.id_barang = barang.id where barang.id != ${id} and  barang.id_kategori = $1 LIMIT 10`
    let barangterkait = await koneksi.query(terkaitsql, [data[0].id_kategori])
    data[0].varian = varian
    data[0].wishlist = wishlist.count
    data[0].terkait = barangterkait
    res.status(200).json({
      status: true,
      data: data[0],
    })
  } else {
    res.status(204).json({
      status: false,
      data: [],
    })
  }
})

//INSERT
router.post("/", validate(), handlerInput, async function (req, res) {
  let sql = `INSERT INTO public.barang(
     id_merchant, id_kategori, nama, deskripsi, harga, berat, stok)
    VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING id`
  let data = [
    req.body.id_merchant,
    req.body.id_kategori,
    req.body.nama,
    req.body.deskripsi,
    req.body.harga,
    req.body.berat,
    req.body.stok,
  ]
  koneksi
    .one(sql, data)
    .then((barang) => {
      let idbarang = barang.id
      req.body.idbarang = idbarang
      if (req.body.varian != undefined) {
        let varian = req.body.varian
        varian.map((value) => {
          let sqlvarian = `INSERT INTO public.varian(
          id_barang, nama_varian)
          VALUES ( $1, $2);`
          let datavarian = [idbarang, value.nama_varian]
          koneksi.none(sqlvarian, datavarian)
        })
      }

      res.status(200).json({
        status: true,
        data: req.body,
      })
    })
    .catch((e) => {
      console.log(e)
      res.status(406).json({
        status: true,
        errorMessage: e,
      })
    })
})

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id
  let sql = `UPDATE public.barang
	SET  id_merchant=$1, id_kategori=$2, nama=$3, deskripsi=$4, harga=$5, berat=$6, stok=$7
  where id=$8`
  let data = [
    req.body.id_merchant,
    req.body.id_kategori,
    req.body.nama,
    req.body.deskripsi,
    req.body.harga,
    req.body.berat,
    req.body.stok,
    id,
  ]
  koneksi.none(sql, data)
  if (req.body.varian != undefined) {
    let varian = req.body.varian
    varian.map((value) => {
      if (typeof value.id == "number") {
        let sqlvarian = `UPDATE varian SET nama_varian=$1 WHERE id=$2`
        let datavarian = [value.nama_varian, value.id]
        koneksi.none(sqlvarian, datavarian)
      } else {
        let sqlvarian = `INSERT INTO public.varian(id_barang, nama_varian) VALUES ( $1, $2);`
        let datavarian = [id, value.nama_varian]
        koneksi.none(sqlvarian, datavarian)
      }
    })
  }

  res.status(200).json({
    status: true,
    data: req.body,
  })
})

var multer = require("multer")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/image/barang")
  },

  filename: function (req, file, cb) {
    let ext =
      file.originalname.split(".")[file.originalname.split(".").length - 1]
    let sql = `UPDATE public.barang SET foto_barang=$1 where id=$2`
    let data = [req.params.id + "." + ext, req.params.id]
    koneksi.none(sql, data)

    cb(null, req.params.id + "." + ext)
  },
})
var upload = multer({
  storage: storage,
})
//Post Foto barang
//Buat folder barang di upload image barang
router.post("/foto/:id", upload.single("foto_barang"), function (req, res) {
  res.send({
    status: true,
    data: { filename: req.file.filename, id: req.params.id },
  })
})

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id
  let sql = `DELETE FROM varian WHERE id_barang=$1;DELETE FROM barang WHERE id=$1;`
  let data = [id]
  let exists = await koneksi.any(
    "SELECT id_barang FROM order_detail where id_barang = $1",
    [id]
  )
  let exists2 = await koneksi.any(
    "SELECT id_barang FROM wishlist where id_barang = $1",
    [id]
  )
  if (exists.length == 0 && exists2.length == 0) {
    koneksi.any(sql, data)
    res.status(200).json({
      status: true,
      data: exists[0],
    })
  } else {
    res.status(304).json({
      status: false,
      data: [],
    })
  }
  //
})
module.exports = router

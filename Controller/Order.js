var express = require("express")
const db = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")
const handlerInput = require("../Util/ValidationHandler")
const validate = require("../Validation/OrderValidation")

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT orders.id, id_user, id_alamat, tgl_order, no_faktur, metode_pembayaran, status, no_resi,  username, nama_lengkap, email, no_telp from orders
    inner join users on orders.id_user = users.id`
  )
  res.status(200).json({
    status: true,
    data: data,
  })
})

//GET BY ID
router.get("/:id", async function (req, res, next) {
  let id = req.params.id

  let data = await koneksi.query(
    `SELECT orders.id, id_user, id_alamat, tgl_order, no_faktur, metode_pembayaran, status, no_resi,  username, nama_lengkap, email, no_telp from orders
    inner join users on orders.id_user = users.id where orders.id = $1`,
    [id]
  )
  if (data.length == 1) {
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

//GET BY user
router.get("/user/:id", async function (req, res, next) {
  let id = req.params.id
  let dateObj = new Date()
  let month = dateObj.getMonth() + 1 //months from 1-12
  let day = dateObj.getDate()
  let year = dateObj.getFullYear()

  let cari = ""
  if (req.query.cari) {
    cari = req.query.cari
  }
  let tglAwal = year + "/" + month + "/" + day
  let tglAkhir = year + "/" + month + "/" + day
  if (req.query.startdate) {
    tglAwal = req.query.startdate
  }
  if (req.query.enddate) {
    tglAkhir = req.query.enddate
  }

  let columnStatus = "status > 0 and"
  let statusData = []
  if (req.query.status) {
    statusData = req.query.status.split("_")
    statusData.splice(statusData.length - 1, 1)
    if (statusData.length > 0) {
      columnStatus = "status in ($1:list) and "
    }
  }

  console.log(columnStatus)
  let limit = "10"
  let offset = "0"
  if (req.query.limit) {
    limit = req.query.limit
  }
  if (req.query.offset) {
    offset = req.query.offset
  }

  let data = await koneksi.query(
    `SELECT orders.id, id_user, tgl_order, no_faktur, status, nama_toko,foto_merchant, no_telp from orders inner join (SELECT id,id_order,id_barang from order_detail) T on T.id_order = orders.id inner join barang on barang.id = T.id_barang inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id
     where ${columnStatus} (no_faktur ilike '%${cari}%' or nama_toko ilike '%${cari}%') and id_user=${id} and tgl_order between '${tglAwal} 00:00:00' and '${tglAkhir} 23:59:59' limit ${limit} offset ${offset}`,
    [statusData]
  )
  console.log(`SELECT orders.id, id_user, tgl_order, no_faktur, status, nama_toko,foto_merchant, no_telp from orders inner join (SELECT id,id_order,id_barang from order_detail) T on T.id_order = orders.id inner join barang on barang.id = T.id_barang inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id
  where ${columnStatus} (no_faktur ilike '%${cari}%' or nama_toko ilike '%${cari}%') and id_user=${id} and tgl_order between '${tglAwal} 00:00:00' and '${tglAkhir} 23:59:59' limit ${limit} offset ${offset}`)
  if (data.length) {
    res.status(200).json({
      status: true,
      data: data,
    })
  } else {
    res.status(200).json({
      status: false,
      data: [],
    })
  }
})

// Get by merchant
router.get("/shop/:id", async function (req, res, next) {
  let id = req.params.id
  let dateObj = new Date()
  let month = dateObj.getMonth() + 1 //months from 1-12
  let day = dateObj.getDate()
  let year = dateObj.getFullYear()

  let cari = ""
  if (req.query.cari) {
    cari = req.query.cari
  }
  let tglAwal = year + "/" + month + "/" + day
  let tglAkhir = year + "/" + month + "/" + day
  if (req.query.startdate) {
    tglAwal = req.query.startdate
  }
  if (req.query.enddate) {
    tglAkhir = req.query.enddate
  }

  let columnStatus = "status > 0 and"
  let statusData = []
  if (req.query.status) {
    statusData = req.query.status.split("_")
    statusData.splice(statusData.length - 1, 1)
    if (statusData.length > 0) {
      columnStatus = "status in ($1:list) and "
    }
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
    `SELECT orders.id, id_user, tgl_order, no_faktur, status, nama_lengkap,no_telp,foto_user from orders inner join (SELECT id,id_order,id_barang from order_detail) T on T.id_order = orders.id inner join barang on barang.id = T.id_barang inner join merchant on merchant.id = barang.id_merchant inner join users on users.id = orders.id_user
     where ${columnStatus} (no_faktur ilike '%${cari}%' or nama_lengkap ilike '%${cari}%') and merchant.id=${id} and tgl_order between '${tglAwal}' and '${tglAkhir}' limit ${limit} offset ${offset}`,
    [statusData]
  )
  if (data.length == 1) {
    res.status(200).json({
      status: true,
      data: data,
    })
  } else {
    res.status(200).json({
      status: false,
      data: [],
    })
  }
})

//INSERT
router.post("/", validate(), handlerInput, function (req, res) {
  let sql = `INSERT INTO public.orders(
     id_user, id_alamat, tgl_order, no_faktur, metode_pembayaran, status, no_resi)
    VALUES ($1, $2, $3, $4, $5, $6, $7);`
  let data = [
    req.body.id_user,
    req.body.id_alamat,
    req.body.tgl_order,
    req.body.no_faktur,
    req.body.metode_pembayaran,
    req.body.status,
    req.body.no_resi,
  ]
  koneksi.none(sql, data)
  res.status(200).json({
    status: true,
    data: req.body,
  })
})

router.put("/alamat/:id", async function (req, res) {
  let id = req.params.id
  let sql = `update orders set id_alamat =$1 where id =  $2`
  koneksi
    .none(sql, [req.body.id_alamat, id])
    .then(() => {
      res.status(200).json({
        status: true,
      })
    })
    .catch((e) => {
      res.status(404).json({
        status: false,
        errorMessage: e,
      })
    })
})

// Generate Faktur
router.put("/generate", async function (req, res) {
  let body = req.body
  const { cartData } = req.body
  // console.log('cartData',cartData)
  // return

  try {
    let reference_id
    for (let i = 0; i < cartData.length; i++) {
      const {
        id,
        shipping: { courier_code, courier_service_code },
        metode_pembayaran,
      } = cartData[i]
      let kurirKode = `${courier_code}/${courier_service_code}`
      let { nofaktur } = await koneksi.one(`select
      (
          'PJ' || extract(
              year
              from
                  now()
          ) || extract(
              month
              from
                  now()
          ) || extract(
              day
              from
                  now()
          ) || (
              select
                  case
                      when faktur is null then '0001'
                      else substring(faktur, 10, 3) || (substring(faktur, 13, 1)::int + 1)
                  end
              from
                  (
                      select
                          max(no_faktur) as faktur
                      from
                          orders
                      where
                          tgl_order >= current_date and id != ${id}
                  ) t
          )
      ) as nofaktur;`)
      if (i == 0) reference_id = nofaktur
      await koneksi.none(
        `UPDATE orders SET kurir='${kurirKode}', no_faktur='${nofaktur}', metode_pembayaran='${metode_pembayaran}', tgl_order=CURRENT_DATE  WHERE id=${id}`
      )
    }
    let lastIndex = cartData.length - 1
    let ids = [...cartData].reduce(
      (prev, itemCart, index) => `${prev.id},${itemCart.id}`
    )
    console.log(ids)
    await koneksi.none(
      `UpdATE orders SET reference_id='${reference_id}' WHERE id IN (${ids})`
    )

    // console.log({
    //   status: true,
    //   reference_id: reference_id
    // })
    res.status(200).json({
      status: true,
      reference_id: reference_id,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      status: false,
      errorMessage: e.error,
    })
  }
})

//Ubah Status Order
router.put("/:status/:id", function (req, res) {
  let status_code = "1"
  let status = req.params.status
  let id = req.params.id
  if (status && id) {
    if (status === "tunggu") {
      status_code = "1"
    } else if (status === "tolak") {
      status_code = "2"
    } else if (status === "terima") {
      status_code = "3"
    } else if (status === "siapantar") {
      status_code = "4"
    } else if (status === "antar") {
      status_code = "5"
    } else if (status === "sudahantar") {
      status_code = "6"
    } else if (status === "selesai") {
      status_code = "7"
    }

    let sqlupdate = `UPDATE orders SET status='${status_code}' WHERE id=${id}`
    console.log(sqlupdate)
    db.none(sqlupdate)
    res.status(200).json({
      status: true,
      data: {
        id: id,
        status: status,
      },
    })
  }
})

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id
  let sql = `UPDATE public.orders
	SET  id_user=$1, id_alamat=$2, tgl_order=$3, no_faktur=$4, metode_pembayaran=$5, status=$6, no_resi=$7
  where id=$8`
  let data = [
    req.body.id_user,
    req.body.id_alamat,
    req.body.tgl_order,
    req.body.no_faktur,
    req.body.metode_pembayaran,
    req.body.status,
    req.body.no_resi,
    id,
  ]
  koneksi.none(sql, data)
  res.status(200).json({
    status: true,
    data: req.body,
  })
})

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id
  let sql = `DELETE FROM order_detail WHERE id_order=$1;DELETE FROM orders WHERE id=$1;`
  let data = [id]
  koneksi.any(sql, data)
  res.status(200).json({
    status: true,
  }) //
})

router.post("/ewallet-webhook", async (req, res, next) => {
  // console.log(req.body)
  const { reference_id, status, charge_amount, channel_code } = req.body.data
  if (status != "SUCCEEDED" || reference_id == 'test-payload') {
    // console.log('masuk sini')
    return res.status(200).json({
      status: true,
    })
  }
  try {
    await koneksi.none("BEGIN")
    await koneksi.none(
      `UPDATE orders set status=1 WHERE reference_id='${reference_id}'`
    )

    let { fakturjurnal } = await koneksi.one(`select
    (
        'JL' || extract(
            year
            from
                now()
        ) || extract(
            month
            from
                now()
        ) || extract(
            day
            from
                now()
        ) || (
            select
                case
                    when faktur is null then '0001'
                    else substring(faktur, 10, 3) || (substring(faktur, 13, 1) :: int + 1)
                end
            from
                (
                    select
                        max(no_faktur) as faktur
                    from
                        jurnal j2
                    where
                        tglcreate >= current_date
                ) t
        )
    ) as fakturjurnal`)
    let { id } =
      await koneksi.one(`INSERT INTO public.jurnal (no_faktur, keterangan)
                      VALUES('${fakturjurnal}', 'Pembayaran E-Wallet Reference ID : ${reference_id}') RETURNING id;`)
    await koneksi.none(
      `INSERT INTO public.jurnal_detail (id_jurnal, uid, userver, debit, kredit) VALUES(${id}, 0, 0, ${charge_amount}, 0);`
    )
    await koneksi.none(`COMMIT`)

    res.status(200).json({
      status: true,
      message: "Berhasil Update",
    })
  } catch (e) {
    await koneksi.none("ROLLBACK")
    console.log(e)
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan",
      errorMessage: JSON.stringify(e),
    })
  }
})

router.get("/redirect", async (req, res, next) => {
  res.status(200).json({ status: true })
})

module.exports = router

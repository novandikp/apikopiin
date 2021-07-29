var express = require("express")
const axios = require("axios")
const db = require("../Util/Database")
var router = express.Router()
var koneksi = require("../Util/Database")
const handlerInput = require("../Util/ValidationHandler")
const validate = require("../Validation/OrderValidation")
const moment = require("moment")
const { sendNotification } = require("../Util/Function")
require("dotenv").config()

const { ONESIGNAL_API_KEY_BASE64, ONESIGNAL_APPID } = process.env
// console.log({ONESIGNAL_API_KEY, ONESIGNAL_APPID})
const BASE_ONESIGNAL = "https://onesignal.com/api/v1"
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

  let columnStatus = "status != 0 and"
  let statusData = []
  if (req.query.status) {
    statusData = req.query.status.split("_")
    statusData.splice(statusData.length - 1, 1)
    if (statusData.length > 0) {
      columnStatus = "status in ($1:list) and "
    }
  }

  // console.log(columnStatus)
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
  // console.log(`SELECT orders.id, id_user, tgl_order, no_faktur, status, nama_toko,foto_merchant, no_telp from orders inner join (SELECT id,id_order,id_barang from order_detail) T on T.id_order = orders.id inner join barang on barang.id = T.id_barang inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id
  // where ${columnStatus} (no_faktur ilike '%${cari}%' or nama_toko ilike '%${cari}%') and id_user=${id} and tgl_order between '${tglAwal} 00:00:00' and '${tglAkhir} 23:59:59' limit ${limit} offset ${offset}`)
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
  res.status(200).json({
    status: true,
    data: data,
  })
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
  // console.log("cartData", cartData)
  // return

  try {
    let reference_id
    for (let i = 0; i < cartData.length; i++) {
      const {
        id,
        shipping: { courier_code, courier_service_code, biaya },
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
        `UPDATE orders SET kurir='${kurirKode}', no_faktur='${nofaktur}', metode_pembayaran='${metode_pembayaran}', tgl_order=CURRENT_DATE 
        , ongkir=${biaya} WHERE id=${id}`
      )
    }
    let lastIndex = cartData.length - 1
    // Reduce, jika array isinya 1 item reduce ndak work
    let ids = (
      cartData.length == 1 ? [...cartData, ...cartData] : cartData
    ).reduce((prev, itemCart, index) => `${prev.id},${itemCart.id}`)
    // console.log("ids", ids)
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

router.put("/terima/:id", async function (req, res) {
  let sqlorder =
    "SELECT orders.id_user,orders.no_faktur, kurir,alamat.nama,alamat.latitude, alamat.longitude, alamat.detail, alamat.provinsi, alamat.kota,alamat.kecamatan,alamat.no_telp from orders inner join alamat on alamat.id =orders.id_alamat where orders.id=$1"
  let sqldetail =
    "SELECT barang.nama from order_detail inner join barang on order_detail.id_barang= barang.id  where id_order=$1"
  let sqlmerchant =
    "SELECT nama_toko,no_telp, merchant.alamat_toko,merchant.provinsi, merchant.kota,merchant.kecamatan,lat_toko,long_toko from order_detail inner join barang on order_detail.id_barang= barang.id inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id where id_order=$1"
  let dataOrder = await koneksi.one(sqlorder, [req.params.id])
  let dataDetail = await koneksi.query(sqldetail, [req.params.id])
  let dataMerchant = await koneksi.one(sqlmerchant, [req.params.id])
  let momenttz = require("moment-timezone")
  console.log(momenttz().tz("Asia/Jakarta").format("HH:mm"))
  let kurir = dataOrder.kurir.split("/")
  let catatan = dataDetail
    .map(function (e) {
      return e.nama
    })
    .join(",")
  let dataBody = {
    origin_contact_name: dataOrder.nama,
    origin_contact_phone: dataOrder.no_telp,
    origin_address:
      dataOrder.detail +
      "," +
      dataOrder.kecamatan +
      "," +
      dataOrder.kota +
      "," +
      dataOrder.provinsi,
    origin_coordinate: {
      latitude: dataOrder.latitude,
      longitude: dataOrder.longitude,
    },
    destination_contact_name: dataMerchant.nama_toko,
    destination_contact_phone: dataMerchant.no_telp,
    destination_address:
      dataMerchant.alamat_toko +
      "," +
      dataMerchant.kecamatan +
      "," +
      dataMerchant.kota +
      "," +
      dataMerchant.provinsi,
    destination_coordinate: {
      latitude: dataMerchant.lat_toko,
      longitude: dataMerchant.long_toko,
    },
    courier_company: kurir[0],
    courier_type: kurir[1],
    delivery_type: "later",
    delivery_date: momenttz().tz("Asia/Jakarta").format("yyyy-MM-DD"),
    delivery_time: momenttz().tz("Asia/Jakarta").format("HH:mm"),
    order_note: dataOrder.no_faktur,
    items: [
      {
        name: dataOrder.no_faktur,
        description: catatan,
      },
    ],
  }
  // res.json(dataBody)
  let kode = process.env.APIKEYBITESHIP

  axios
    .post("https://api.biteship.com/v1/orders", JSON.stringify(dataBody), {
      headers: {
        Authorization: `Bearer ${kode}`,
        "Content-Type": "application/json",
      },
    })
    .then(async ({ data }) => {
      try {
        await koneksi.none("BEGIN")
        await koneksi.none(
          "UPDATE orders set status = 3, id_order_biteship=$1 where orders.id=$2",
          [data.id, req.params.id]
        )

        await koneksi.none("COMMIT")
        let deviceids = await koneksi.query(
          `SELECT deviceid FROM user_log WHERE id_user=${dataOrder.id_user} and flaglogin=1`
        )
        // Jika ndak ada deviceid, skip biar ndak error
        if (deviceids.length) {
          sendNotification({
            heading: "Pesanan Sedang Diproses",
            content: `Pesanan Anda ${dataOrder.no_faktur} diterima oleh ${dataMerchant.nama_toko}.`,
            player_ids: deviceids.map((item) => item.deviceid),
            additionalData: {
              params: {
                idorder: req.params.id,
              },
              tujuan: "DetailTransaksi",
            },
          })
        }
        res.status(200).json({
          status: true,
          msg: "Dara berhasil dimasukkan",
        })
      } catch (e) {
        await koneksi.none("ROLLBACK")
        console.log(e)
        res.status(500).json({
          status: false,
          errorMessage: "Data gagal dimasukkan (catch)",
        })
      }
    })
    .catch(async (e) => {
      console.log(e)
      res.status(500).json({
        status: false,
        errorMessage: "Data gagal dimasukkan",
      })
    })
})

router.put("/batalkan/:id", async function (req, res) {
  try {
    let sqlorder = `SELECT ongkir, u.nama_lengkap, orders.id_user,orders.no_faktur, kurir,alamat.nama,alamat.latitude, alamat.longitude, alamat.detail, alamat.provinsi, 
                  alamat.kota,alamat.kecamatan,alamat.no_telp from orders inner join alamat on alamat.id =orders.id_alamat 
                  inner join users u on u.id=orders.id_user
                  where orders.id=$1`
    let sqldetail =
      "SELECT barang.nama,od.harga,od.jumlah from order_detail od inner join barang on od.id_barang= barang.id where id_order=$1"
    let sqlmerchant =
      "SELECT merchant.id, nama_toko,no_telp, merchant.alamat_toko,merchant.provinsi, merchant.kota,merchant.kecamatan,lat_toko,long_toko from order_detail inner join barang on order_detail.id_barang= barang.id inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id where id_order=$1"
    let dataOrder = await koneksi.one(sqlorder, [req.params.id])
    // console.log("dataOrder")
    let dataDetail = await koneksi.query(sqldetail, [req.params.id])
    // console.log("dataDetail")
    let dataMerchant = await koneksi.one(sqlmerchant, [req.params.id])
    // console.log("dataMerchant")
    await koneksi.none("BEGIN")
    // console.log(`UPDATE orders set status = -1 where orders.id=${req.params.id}`)
    await koneksi.none(`UPDATE orders set status = -1 where orders.id=$1`, [
      req.params.id,
    ])

    // Insert jurnal
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
                      VALUES('${fakturjurnal}', 'Pesanan Dibatalkan No. Faktur : ${dataOrder.no_faktur}') RETURNING id;`)
    let total = 0
    for (let i = 0; i < dataDetail.length; i++) {
      const itemDetail = dataDetail[i]
      total += itemDetail.harga * itemDetail.jumlah
    }
    total += dataOrder.ongkir
    await koneksi.none(
      `INSERT INTO public.jurnal_detail (id_jurnal, uid, userver, debit, kredit) VALUES(${id}, ${dataOrder.id_user}, 1, ${total}, 0);`
    )

    await koneksi.none("COMMIT")
    let deviceids_user = await koneksi.query(
      `SELECT deviceid FROM user_log WHERE id_user=${dataOrder.id_user} and flaglogin=1`
    )
    let deviceids_merchant = await koneksi.query(
      `SELECT deviceid FROM merchant_log WHERE id_merchant=${dataMerchant.id} and flaglogin=1`
    )
    // Jika ndak ada deviceid, skip biar ndak error
    if (deviceids_merchant.length) {
      // Send Notifikasi Merchant
      sendNotification({
        heading: "Pesanan Dibatalkan",
        content: `${dataOrder.nama_lengkap} membatalkan pesanan ${dataOrder.no_faktur}`,
        player_ids: deviceids_merchant.map((item) => item.deviceid),
        additionalData: {
          params: {
            idorder: req.params.id,
          },
          tujuan: "DetailTransaksi",
        },
      }).catch((e) => {
        console.log("eror send notif merchant", e)
      })
    }

    if (deviceids_user.length) {
      // Send notifikasi User
      sendNotification({
        heading: "Pesanan Dibatalkan",
        content: `Pesanan Anda ${dataOrder.no_faktur} berhasil dibatalkan. Saldo E-Kopee Anda akan secara otomatis bertambah`,
        player_ids: deviceids_user.map((item) => item.deviceid),
        additionalData: {
          params: {
            idorder: req.params.id,
          },
          tujuan: "DetailTransaksi",
        },
      }).catch((e) => {
        console.log("eror send notif user", e)
      })
    }
    res.status(200).json({
      status: true,
      msg: "Pesanan berhasil ditolak",
    })
  } catch (e) {
    await koneksi.none("ROLLBACK")
    console.log("error batalkan pesanan", e)
    res.status(500).json({
      status: false,
      errorMessage: "Data gagal dimasukkan",
    })
  }
})

router.put("/tolak/:id", async function (req, res) {
  try {
    let sqlorder = `SELECT ongkir, orders.id_user,orders.no_faktur, kurir,alamat.nama,alamat.latitude, alamat.longitude, alamat.detail, alamat.provinsi, 
    alamat.kota,alamat.kecamatan,alamat.no_telp from orders inner join alamat on alamat.id =orders.id_alamat where orders.id=$1`
    let sqldetail =
      "SELECT barang.nama,od.harga,od.jumlah from order_detail od inner join barang on od.id_barang= barang.id where id_order=$1"
    let sqlmerchant =
      "SELECT nama_toko,no_telp, merchant.alamat_toko,merchant.provinsi, merchant.kota,merchant.kecamatan,lat_toko,long_toko from order_detail inner join barang on order_detail.id_barang= barang.id inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id where id_order=$1"
    let dataOrder = await koneksi.one(sqlorder, [req.params.id])
    let dataDetail = await koneksi.query(sqldetail, [req.params.id])
    let dataMerchant = await koneksi.one(sqlmerchant, [req.params.id])
    await koneksi.none("BEGIN")
    await koneksi.none(
      `UPDATE orders set status = 2, alasan_tolak='${req.body.alasan}' where orders.id=$1`,
      [req.params.id]
    )

    // Insert jurnal
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
                      VALUES('${fakturjurnal}', 'Pesanan Ditolak No. Faktur : ${dataOrder.no_faktur}') RETURNING id;`)
    let total = 0
    for (let i = 0; i < dataDetail.length; i++) {
      const itemDetail = dataDetail[i]
      total += itemDetail.harga * itemDetail.jumlah
    }
    total += dataOrder.ongkir
    await koneksi.none(
      `INSERT INTO public.jurnal_detail (id_jurnal, uid, userver, debit, kredit) VALUES(${id}, ${dataOrder.id_user}, 1, ${total}, 0);`
    )

    await koneksi.none("COMMIT")
    let deviceids = await koneksi.query(
      `SELECT deviceid FROM user_log WHERE id_user=${dataOrder.id_user} and flaglogin=1`
    )
    // Jika ndak ada deviceid, skip biar ndak error
    if (deviceids.length) {
      sendNotification({
        heading: "Pesanan Dibatalkan",
        content: `Pesanan Anda ${dataOrder.no_faktur} ditolak oleh ${dataMerchant.nama_toko} karena ${req.body.alasan}. Silakan pilih barang yang lain. Saldo E-kopee Anda akan secara otomatis bertambah.`,
        player_ids: deviceids.map((item) => item.deviceid),
        additionalData: {
          params: {
            idorder: req.params.id,
          },
          tujuan: "DetailTransaksi",
        },
      })
    }
    res.status(200).json({
      status: true,
      msg: "Pesanan berhasil ditolak",
    })
  } catch (e) {
    await koneksi.none("ROLLBACK")
    console.log("error tolak order", e)
    res.status(500).json({
      status: false,
      errorMessage: "Data gagal dimasukkan",
    })
  }
})

router.put("/siapantar/:id", async function (req, res) {
  let sqlorder =
    "SELECT id_user,orders.no_faktur, id_order_biteship from orders where orders.id=$1"
  let dataOrder = await koneksi.one(sqlorder, [req.params.id])

  // res.json(dataBody)
  let kode = process.env.APIKEYBITESHIP
  axios
    .post(
      "https://api.biteship.com/v1/orders/" +
        dataOrder.id_order_biteship +
        "/confirm",
      JSON.stringify({}),
      {
        headers: {
          Authorization: `Bearer ${kode}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then(async ({ data }) => {
      try {
        await koneksi.none("UPDATE orders set status = 4 where orders.id=$1", [
          req.params.id,
        ])
        let deviceids = await koneksi.query(
          `SELECT deviceid FROM user_log WHERE id_user=${dataOrder.id_user} and flaglogin=1`
        )
        // Jika ndak ada deviceid, skip biar ndak error
        if (deviceids.length) {
          sendNotification({
            heading: "Pesanan Siap Diantar",
            content: `Pesanan Anda ${dataOrder.no_faktur} siap diantar ke alamat tujuan.`,
            player_ids: deviceids.map((item) => item.deviceid),
            additionalData: {
              params: {
                idorder: req.params.id,
              },
              tujuan: "DetailTransaksi",
            },
          }).catch((e) => {
            console.log("eror send notif pesanan siap diantar", e)
          })
        }
        res.status(200).json({
          status: true,
          msg: "Data berhasil dimasukkan",
        })
      } catch (e) {
        console.log("eror siap diantar", e)
        res.status(500).json({
          status: false,
          errorMessage: "Data gagal dimasukkan",
        })
      }
    })

    .catch((e) => {
      console.log("eror siap diantar", e.response)
      res.status(500).json({
        status: false,
        errorMessage: "Data gagal dimasukkan",
      })
    })
})

router.post("/biteship", async function (req, res) {
  let order_id = req.body.order_id
  let status = req.body.status
  // let status_code = "1"
  // let status = req.params.status
  try {
    let heading, content
    let dataOrder =
      await koneksi.one(`SELECT id,no_faktur,u.id as id_user FROM orders o where id_order_biteship='${order_id}'
                    INNER JOIN users u on u.id=o.id_user`)
    if (status == "dropping_off") {
      await koneksi.none(
        "update orders set status = 5 where id_order_biteship = '" +
          order_id +
          "'"
      )
      heading = "Pesanan Sedang Diantar"
      content = `Pesanan Anda ${dataOrder.no_faktur} sedang diantar ke alamat tujuan..`
    } else if (status == "delivered") {
      await koneksi.none(
        "update orders set status = 7  where id_order_biteship = '" +
          order_id +
          "'"
      )
      heading = "Pesanan Sudah Diantar"
      content = `Pesanan Anda ${dataOrder.no_faktur} sudah sampai di alamat tujuan. Silakan konfirmasi pesanan sudah selesai.`
    }

    let deviceids = await koneksi.query(
      `SELECT deviceid FROM user_log WHERE id_user=${dataOrder.id_user} and flaglogin=1`
    )
    // Jika ndak ada deviceid, skip biar ndak error
    if (deviceids.length) {
      sendNotification({
        heading: heading,
        content: content,
        player_ids: deviceids.map((item) => item.deviceid),
        additionalData: {
          params: {
            idorder: req.params.id,
          },
          tujuan: "DetailTransaksi",
        },
      })
    }

    res.status(200).json({
      status: true,
    })
  } catch (e) {
    console.log("error webhook", e)
    res.status(500).json({
      status: true,
    })
  }

  // }
})

router.put("/selesai/:id", async function (req, res) {
  try {
    let sqlorder = `SELECT ongkir, orders.id_user,orders.no_faktur, kurir,alamat.nama,alamat.latitude, alamat.longitude, alamat.detail, alamat.provinsi, 
    alamat.kota,alamat.kecamatan,alamat.no_telp from orders inner join alamat on alamat.id =orders.id_alamat where orders.id=$1`
    let sqldetail =
      "SELECT barang.nama,od.harga,od.jumlah from order_detail od inner join barang on od.id_barang= barang.id where id_order=$1"
    let sqlmerchant =
      "SELECT merchant.id, nama_toko,no_telp, merchant.alamat_toko,merchant.provinsi, merchant.kota,merchant.kecamatan,lat_toko,long_toko from order_detail inner join barang on order_detail.id_barang= barang.id inner join merchant on merchant.id = barang.id_merchant inner join users on users.id_merchant = merchant.id where id_order=$1"
    let dataOrder = await koneksi.one(sqlorder, [req.params.id])
    let dataDetail = await koneksi.query(sqldetail, [req.params.id])
    let dataMerchant = await koneksi.one(sqlmerchant, [req.params.id])
    await koneksi.none("BEGIN")
    await koneksi.none(`UPDATE orders set status = 7 where orders.id=$1`, [
      req.params.id,
    ])

    // Insert jurnal
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
                      VALUES('${fakturjurnal}', 'Pesanan Selesai No. Faktur : ${dataOrder.no_faktur}') RETURNING id;`)
    let total = 0
    for (let i = 0; i < dataDetail.length; i++) {
      const itemDetail = dataDetail[i]
      total += itemDetail.harga * itemDetail.jumlah
    }
    // total += dataOrder.ongkir (Ongkir ditanggung E-kopee)
    await koneksi.none(
      `INSERT INTO public.jurnal_detail (id_jurnal, uid, userver, debit, kredit) VALUES(${id}, ${dataOrder.id_user}, 1, ${total}, 0);`
    )

    // await koneksi.none("COMMIT")
    let deviceids = await koneksi.query(
      `SELECT deviceid FROM merchant_log WHERE id_merchant=${dataMerchant.id} and flaglogin=1`
    )
    // Jika ndak ada deviceid, skip biar ndak error
    if (deviceids.length) {
      sendNotification({
        heading: "Pesanan Selesai",
        content: `Pesanan ${dataOrder.no_faktur} sudah selesai. Saldo E-Kopee Anda akan secara otomatis bertambah.`,
        player_ids: deviceids.map((item) => item.deviceid),
        additionalData: {
          params: {
            idorder: req.params.id,
          },
          tujuan: "DetailTransaksi",
        },
      }).catch((e) => {
        console.log("eror send notif selesai pesanan", e)
      })
    }
    res.status(200).json({
      status: true,
      msg: "Pesanan berhasil diselesaikan.",
    })
  } catch (e) {
    await koneksi.none("ROLLBACK")
    console.log("error selesai pesanan", e)
    res.status(500).json({
      status: false,
      errorMessage: JSON.stringify(e),
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
  console.log(req.body)
  const { reference_id, status, charge_amount, channel_code } = req.body.data
  if (status != "SUCCEEDED" || reference_id == "test-payload") {
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

    let dataOrder =
      await koneksi.query(`SELECT o.id as idorder,no_faktur,id_user,u.nama_lengkap, (select b2.id_merchant from order_detail od
                            inner join barang b2 on b2.id=od.id_barang where od.id_order = o.id limit 1) as id_merchant
                            FROM orders o inner join users u on u.id=o.id_user 
                            WHeRE reference_id='${reference_id}'`)
    for (let i = 0; i < dataOrder.length; i++) {
      const itemOrder = dataOrder[i]
      let deviceids = await koneksi.query(
        `SELECT deviceid FROM merchant_log WHERE id_merchant=${itemOrder.id_merchant} and flaglogin=1`
      )
      // Jika ndak ada deviceid, skip biar ndak error
      if (!deviceids.length) continue

      sendNotification({
        heading: "Pesanan Baru",
        content: `Ada pesanan baru ${itemOrder.no_faktur} dari ${itemOrder.nama_lengkap}`,
        player_ids: deviceids.map((item) => item.deviceid),
        additionalData: {
          params: {
            idorder: itemOrder.idorder,
          },
          tujuan: "DetailTransaksi",
        },
      })
    }

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

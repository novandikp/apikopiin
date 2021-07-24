var express = require("express");
const db = require("../Util/Database");
var router = express.Router();
var koneksi = require("../Util/Database");
const handlerInput = require("../Util/ValidationHandler");
const validate = require("../Validation/OrderValidation");

//GET
router.get("/", async function (req, res) {
  let data = await koneksi.query(
    `SELECT orders.id, id_user, id_alamat, tgl_order, no_faktur, metode_pembayaran, status, no_resi,  username, nama_lengkap, email, no_telp from orders
    inner join users on orders.id_user = users.id`
  );
  res.status(200).json({
    status: true,
    data: data,
  });
});

//GET BY ID
router.get("/:id", async function (req, res, next) {
  let id = req.params.id;

  let data = await koneksi.query(
    `SELECT orders.id, id_user, id_alamat, tgl_order, no_faktur, metode_pembayaran, status, no_resi,  username, nama_lengkap, email, no_telp from orders
    inner join users on orders.id_user = users.id where orders.id = $1`,
    [id]
  );
  if (data.length == 1) {
    res.status(200).json({
      status: true,
      data: data[0],
    });
  } else {
    res.status(204).json({
      status: false,
      data: [],
    });
  }
});

//INSERT
router.post("/", validate(), handlerInput, function (req, res) {
  let sql = `INSERT INTO public.orders(
     id_user, id_alamat, tgl_order, no_faktur, metode_pembayaran, status, no_resi)
    VALUES ($1, $2, $3, $4, $5, $6, $7);`;
  let data = [
    req.body.id_user,
    req.body.id_alamat,
    req.body.tgl_order,
    req.body.no_faktur,
    req.body.metode_pembayaran,
    req.body.status,
    req.body.no_resi,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

router.put("/alamat/:id", async function (req, res) {
  let id = req.params.id;
  let sql = `update orders set id_alamat =$1 where id =  $2`;
  koneksi
    .none(sql, [req.body.id_alamat, id])
    .then(() => {
      res.status(200).json({
        status: true,
      });
    })
    .catch((e) => {
      res.status(404).json({
        status: false,
        errorMessage: e,
      });
    });
});

//Ubah Status Order
router.put("/:status/:id", function (req, res) {
  let status_code = "1";
  let status = req.params.status;
  let id = req.params.id;
  if (status && id) {
    if (status === "tunggu") {
      status_code = "1";
    } else if (status === "tolak") {
      status_code = "2";
    } else if (status === "terima") {
      status_code = "3";
    } else if (status === "siapantar") {
      status_code = "4";
    } else if (status === "antar") {
      status_code = "5";
    } else if (status === "sudahantar") {
      status_code = "6";
    } else if (status === "selesai") {
      status_code = "7";
    }

    let sqlupdate = `UPDATE orders SET status='${status_code}' WHERE id=${id}`;
    console.log(sqlupdate);
    db.none(sqlupdate);
    res.status(200).json({
      status: true,
      data: {
        id: id,
        status: status,
      },
    });
  }
});

//UPDATE BY ID
router.put("/:id", validate(), handlerInput, async function (req, res) {
  let id = req.params.id;
  let sql = `UPDATE public.orders
	SET  id_user=$1, id_alamat=$2, tgl_order=$3, no_faktur=$4, metode_pembayaran=$5, status=$6, no_resi=$7
  where id=$8`;
  let data = [
    req.body.id_user,
    req.body.id_alamat,
    req.body.tgl_order,
    req.body.no_faktur,
    req.body.metode_pembayaran,
    req.body.status,
    req.body.no_resi,
    id,
  ];
  koneksi.none(sql, data);
  res.status(200).json({
    status: true,
    data: req.body,
  });
});

router.delete("/:id", async function (req, res, next) {
  let id = req.params.id;
  let sql = `DELETE FROM order_detail WHERE id_order=$1;DELETE FROM orders WHERE id=$1;`;
  let data = [id];
  koneksi.any(sql, data);
  res.status(200).json({
    status: true,
  }); //
});
module.exports = router;

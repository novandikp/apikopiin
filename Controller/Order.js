var express = require("express");
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
  let sql = `DELETE FROM orders WHERE id=$1`;
  let data = [id];
  koneksi.any(sql, data);
  res.status(200).json({
    status: true,
    data: exists[0],
  }); //
});
module.exports = router;

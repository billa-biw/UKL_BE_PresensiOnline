const express = require('express');

/** initiate object that instance of express */
const app = express()

/** allow to read 'request' with json type */
app.use(express.json())

const presensiController = require('../controllers/presensi.controller');
//const { authorize } = require('../controllers/auth.controller'); // Middleware autentikasi
const { authorize } = require(`../controllers/auth.controller`)

let { validateAttendanceInput } = require(`../middlewares/presensi-validation`)
// Rute untuk menambahkan presensi
app.post('/', [authorize, validateAttendanceInput], presensiController.addAttendance);

// Rute untuk mendapatkan presensi berdasarkan userId
app.get('/:id_user', [authorize], presensiController.getPresensiById);
app.get(`/history/:id_user`, [authorize], presensiController.getHistory);

// Rute untuk mendapatkan ringkasan presensi bulanan
app.get('/summary/:id_user', presensiController.getMonthlyAttendanceSummary);

module.exports = app;
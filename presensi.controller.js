const { Attendances, Users, Sequelize } = require('../models'); // Import langsung dari index.js
const { Op, fn, col, literal } = require('sequelize');
const presensiModel = require(`../models/index`).presensi
const userModel = require(`../models/index`).user;
const moment = require('moment'); // Untuk format tanggal

exports.addAttendance = async (request, response) => {
    try {
        const { id_user, date, time, status } = request.body;

        // Validate model existence
        if (!presensiModel) {
            return response.status(500).json({
                success: false,
                message: 'Attendance model is not defined',
            });
        }

        // Create attendance record
        const attendanceModel = await presensiModel.create({ id_user, date, time, status });

        return response.status(201).json({
            success: true,
            message: 'Attendance success',
            data: attendanceModel,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            success: false,
            message: `There's something wrong with the server`,
            error: error.message,
        });
    }
};


exports.getPresensiById = async (request, response) => {
    const { id_user } = request.params;

    presensiModel.findAll({ where: { id_user } })
        .then(presensiData => {
            if (!presensiData.length) {
                return response.status(404).json({
                    success: false,
                    message: `No attendance record found for user ID ${id_user}`,
                });
            }
            const formattedData = attendanceData.map(item => ({
                attendance_id: item.id,
                date: item.date,
                time: item.time,
                status: item.status,
            }));
            return response.json({
                status: 'success',
                data: formattedData,
            });
        })
        .catch(error => {
            return response.status(500).json({
                success: false,
                message: `Error retrieving attendance: ${error.message}`,
            });
        });
};

exports.getHistory = async (request, response) => {
    try {
        const { id_user } = request.params
        const useer = await userModel.findByPk(id_user)

        if (!useer) {
            return response.status(404).json({
                success: false,
                message: `User not found`
            })
        }

        const history = await presensiModel.findAll({
            where: { id_user },
            order: [['date', 'DESC'], ['time', 'DESC']]
        })

        if (history.length === 0) {
            return response.status(404).json({
                success: false,
                message: `Attendance history not found`
            })
        }

        return response.status(200).json({
            success: true,
            data: history
        })
    }

    catch (error) {
        console.error(error)
        return response.status(500).json({
            success: false,
            message: `There's something wrong from the server`,
            error: error.message
        })
    }
}



exports.getMonthlyAttendanceSummary = (request, response) => {
    const { id_user } = request.params;
    const year = request.query.year || moment().format('YYYY');
    const month = request.query.month || moment().format('MM');
    const formattedMonth = month.toString().padStart(2, '0');

    presensiModel.findAll({
        where: {
            id_user: id_user,
            date: {
                [Op.between]: [`${year}-${formattedMonth}-01`, `${year}-${formattedMonth}-31`],
            },
        },
        attributes: [
            [fn('MONTH', col('date')), 'month'],
            [fn('YEAR', col('date')), 'year'],
            [fn('COUNT', col('status')), 'total'],
            [literal("SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END)"), 'hadir'],
            [literal("SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END)"), 'izin'],
            [literal("SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END)"), 'sakit'],
            [literal("SUM(CASE WHEN status = 'alpha' THEN 1 ELSE 0 END)"), 'alpha'],
        ],
        group: ['year', 'month'],
        raw: true,
    })
        .then(data => {
            if (!data.length) {
                return response.status(404).json({
                    success: false,
                    message: `No attendance records found for user ID ${id_user} in ${year}-${formattedMonth}`,
                });
            }
            const summary = {
                id_user,
                month: `${formattedMonth}-${year}`,
                attendanceSummary: {
                    hadir: data[0].hadir,
                    izin: data[0].izin,
                    sakit: data[0].sakit,
                    alpha: data[0].alpha,
                },
            };
            return response.json({
                status: 'success',
                data: summary,
            });
        })
        .catch(error => {
            return response.status(500).json({
                success: false,
                message: `Error retrieving monthly attendance summary: ${error.message}`,
            });
        });
};
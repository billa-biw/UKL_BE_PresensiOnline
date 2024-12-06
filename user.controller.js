const userModel = require(`../models/index`).user;
const md5 = require('md5');
const { Op } = require('sequelize');

// Retrieve all users
exports.getAllUser = async (request, response) => {
    try {
        let users = await userModel.findAll();
        return response.json({
            success: true,
            data: users,
            message: "All Users have been loaded"
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Search for users
exports.findUser = async (request, response) => {
    try {
        let keyword = request.body.keyword;
        let users = await userModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.substring]: keyword } },
                    { username: { [Op.substring]: keyword } },
                    { password: { [Op.substring]: keyword } },
                    { role: { [Op.substring]: keyword } }
                ]
            }
        });
        return response.json({
            success: true,
            data: users,
            message: "Users matching the keyword have been loaded"
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Add a new user
exports.addUser = async (request, response) => {
    try {
        let newUser = {
            name: request.body.name,
            username: request.body.username,
            password: md5(request.body.password),
            role: request.body.role
        };
        let result = await userModel.create(newUser);
        return response.json({
            success: true,
            data: result,
            message: "User has been added"
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Update an existing user
exports.updateUser = async (request, response) => {
    try {
        let dataUser = {
            name: request.body.name,
            username: request.body.username,
            password: md5(request.body.password),
            role: request.body.role
        };
        let id_user = request.params.id;
        await userModel.update(dataUser, { where: { id: id_user } });
        return response.json({
            success: true,
            message: "User data has been updated",
            data: dataUser,
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};
exports.getuserById = async (request, response) => {
    const { id } = request.params;

    try {
        const userData = await userModel.findOne({ where: { id } });

        if (!userData) {
            return response.status(404).json({
                success: false,
                message: `User with ID ${id} not found`,
            });
        }

        return response.json({
            success: true,
            data: userData,
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: `Error retrieving user: ${error.message}`,
        });
    }
};

// Delete a user
exports.deleteUser = async (request, response) => {
    try {
        let id_user = request.params.id;
        await userModel.destroy({ where: { id: id_user } });
        return response.json({
            success: true,
            message: "User has been deleted"
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

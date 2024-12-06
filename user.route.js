const express = require('express')
const app = express()

app.use(express.json())
const userController = 
require(`../controllers/user.controller`)
let { validateUser } = require(`../middlewares/user-validation`)
const { authorize } = require(`../controllers/user.controller`)
app.get("/", userController.getAllUser)
app.get("/:id", userController.getuserById)
app.post("/find", userController.findUser)
app.post("/", [validateUser],userController.addUser)
app.put("/:id", [validateUser], userController.updateUser)
app.delete("/:id", userController.deleteUser)
module.exports = app


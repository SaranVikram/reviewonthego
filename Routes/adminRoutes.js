const express = require("express")
const adminController = require("../Controllers/adminController")
const adminMiddleware = require("../Middlewears/adminMiddleware") // If using separate middleware file
const router = express.Router()

router.get("/admin-login", adminController.getLogin)
router.post("/admin-login", adminController.postLogin)
router.get("/dashboard", adminMiddleware.requireAdminLogin, adminController.getDashboard)
router.get("/create-client", adminMiddleware.requireAdminLogin, adminController.getCreateClient)
router.post("/create-client", adminMiddleware.requireAdminLogin, adminController.postCreateClient)

// Additional routes for editing and deleting clients

module.exports = router

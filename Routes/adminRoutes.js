const express = require("express")
const adminController = require("../Controllers/adminController")
const adminMiddleware = require("../Middlewears/adminMiddleware") // If using separate middleware file
const uploadimage = require("../Middlewears/uploadimage")
const router = express.Router()

// Routes/adminRoutes.js
router.get("/login", adminController.getLogin)
router.post("/login", adminController.postLogin)
router.post("/verify-otp", adminController.postVerifyOtp)
router.post("/logout", adminController.logout)

router.get("/dashboard", adminMiddleware.requireAdminLogin, adminController.getDashboard)
router.get("/create-client", adminMiddleware.requireAdminLogin, adminController.getCreateClient)
router.post("/create-client", adminMiddleware.requireAdminLogin, uploadimage.upload, adminController.postCreateClient)

// Additional routes for editing and deleting clients

module.exports = router

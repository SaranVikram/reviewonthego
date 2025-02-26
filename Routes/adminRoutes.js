const express = require("express")
const adminController = require("../Controllers/adminController")
const adminMiddleware = require("../Middlewears/adminMiddleware") // If using separate middleware file
const uploadimage = require("../Middlewears/uploadImage")
const router = express.Router()

// Routes/adminRoutes.js
router.get("/login", adminController.getLogin)
router.post("/login", adminController.postLogin)
router.post("/verify-otp", adminController.postVerifyOtp)
router.post("/logout", adminController.logout)

router.get("/create-client", adminMiddleware.requireAdminLogin, adminController.getCreateClient)
// Updated route for creating a client with image upload
router.post(
    "/create-client",
    adminMiddleware.requireAdminLogin,
    uploadimage.upload, // Multer middleware to process the file
    uploadimage.uploadToR2, // Middleware to upload to Cloudflare R2
    adminController.postCreateClient // Controller to handle business logic
  );
router.get("/renew-subscription", adminMiddleware.requireAdminLogin, adminController.getrenewSubscription)
router.post(
    "/renew-subscription",
    adminMiddleware.requireAdminLogin,
    adminController.renewSubscription // Controller to handle business logic
  );  
// Additional routes for editing and deleting clients

module.exports = router

const express = require("express")
const router = express.Router()
const { updateSubscriptionStatus } = require("../Middlewears/subscriptionUpdater")
const dashboardController = require("../Controllers/dashboardController")

// Client login route
router.post("/login", updateSubscriptionStatus, dashboardController.postClientLogin)

// Verify client OTP and authenticate
router.post("/verify-otp", dashboardController.verifyClientOTP)

// Fetch client's dashboard data
router.get("/data", dashboardController.authenticate, dashboardController.getDashboardData)

// Update client's profile
//router.put("/profile", dashboardController.authenticate, dashboardController.updateProfile)

// Other dashboard-related routes as needed

module.exports = router

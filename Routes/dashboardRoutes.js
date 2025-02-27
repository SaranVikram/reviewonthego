const express = require("express")
const cors = require("cors")
const router = express.Router()
const { updateSubscriptionStatus } = require("../Middlewears/subscriptionUpdater")
const dashboardController = require("../Controllers/dashboardController")

const corsOptions = {
  origin: ["http://localhost:3000", "https://app.reviewonthego.in"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
}

// Apply CORS with specific options to dashboard-related routes
router.use(cors(corsOptions))

// Client login route
router.post("/login", updateSubscriptionStatus, dashboardController.postClientLogin)

// Client logout route
router.post("/logout", dashboardController.postClientLogout)

// Verify client OTP and authenticate
router.post("/verify-otp", dashboardController.verifyClientOTP)

// Fetch client's dashboard data
router.get("/client-profile", dashboardController.authenticate, dashboardController.getProfile)
router.get("/client-stats", dashboardController.authenticate, dashboardController.getStats)
router.get("/page-views", dashboardController.authenticate, dashboardController.getPageViews)
router.get("/client-reviews", dashboardController.authenticate, dashboardController.getReviews)

router.post("/customer-checkin", dashboardController.authenticate, dashboardController.postCustomerCheckin)
router.get("/customer-checkin", dashboardController.authenticate, dashboardController.getCustomerCheckins)

// Update client's profile
//router.put("/profile", dashboardController.authenticate, dashboardController.updateProfile)

// Other dashboard-related routes as needed

module.exports = router

const express = require("express");
const cors = require("cors");
const router = express.Router();
const {
  updateSubscriptionStatus,
} = require("../Middlewears/subscriptionUpdater");
const dashboardController = require("../Controllers/dashboardController");

const corsOptions = {
  origin: ["http://localhost:3000", "https://nr.reviewonthego.io"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS with specific options to dashboard-related routes
router.use(cors(corsOptions));

// Client login route
router.post(
  "/login",
  updateSubscriptionStatus,
  dashboardController.postClientLogin
);

// Verify client OTP and authenticate
router.post("/verify-otp", dashboardController.verifyClientOTP);

// Fetch client's dashboard data
router.get(
  "/client-stats",
  dashboardController.authenticate,
  dashboardController.getStats
);
router.get(
  "/client-reviews",
  dashboardController.authenticate,
  dashboardController.getReviews
);

router.post(
  "/customer-checkin",
  dashboardController.authenticate,
  dashboardController.postCustomerCheckin
);
router.get(
  "/customer-checkin",
  dashboardController.authenticate,
  dashboardController.getCustomerCheckins
);

// Update client's profile
//router.put("/profile", dashboardController.authenticate, dashboardController.updateProfile)

// Other dashboard-related routes as needed

module.exports = router;

const express = require("express")
const reviewApiController = require("../Controllers/reviewApiController")
const router = express.Router()

router.get("/api/reviews/:clientId", reviewApiController.getReviews)
router.post("/api/reviews/:clientId", reviewApiController.postReview)

module.exports = router

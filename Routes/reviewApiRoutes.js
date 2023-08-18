const express = require("express")
const reviewApiController = require("../Controllers/reviewApiController")
const router = express.Router()

router.get("/review/:clientId", reviewApiController.getReviewPage)
router.get("/api/reviews/:clientId", reviewApiController.getReviews)
router.post("/review/:clientId", reviewApiController.postReview)

module.exports = router

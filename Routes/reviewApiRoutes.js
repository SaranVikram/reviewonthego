const express = require("express")
const reviewApiController = require("../Controllers/reviewApiController")
const router = express.Router()

router.get("/review/:clientId", reviewApiController.getReviewPage)
router.post("/review/:clientId", reviewApiController.postReview)

router.post("/click-count/:clientId", reviewApiController.handleGoogleReviewClick)

module.exports = router

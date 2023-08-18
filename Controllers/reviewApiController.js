const Client = require("../models/Client")
const Review = require("../models/Review")

exports.getReviewPage = async (req, res) => {
  const client = await Client.findById(req.params.clientId)
  res.render("review-client", { client })
}

exports.postReview = async (req, res) => {
  const review = new Review({
    client: req.params.clientId,
    customerName: req.body.customerName,
    reviewText: req.body.reviewText,
    rating: req.body.rating,
  })
  await review.save()
  res.redirect("/thank-you")
}

const Client = require("../models/Client")
const Review = require("../models/Review")

exports.getReviewPage = async (req, res) => {
  const client = await Client.findById(req.params.clientId)
  res.render("review-client", { client })
}

exports.getReviews = async (req, res) => {
  const reviews = await Review.find({ client: req.params.clientId }).populate("client")
  res.json(reviews)
}

exports.postReview = async (req, res) => {
  const review = new Review({
    client: req.params.clientId, // Client ID from the URL (MongoDB object ID)
    customerName: req.body.name, // Customer name from the form
    phoneNumber: req.body.phone, // Phone number from the form
    reviewText: req.body.feedback, // Review text from the form
    rating: req.body.rating, // Rating from the form
  })

  try {
    await review.save()
    res.json({ success: true, review })
  } catch (error) {
    res.status(400).json({ success: false, error })
  }
}

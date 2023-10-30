const Client = require("../Models/Client")
const Review = require("../Models/Review")
const PageView = require("../Models/PageView") // Import your PageView model
const PositiveCount = require("../Models/PositiveCount")
const mongoose = require("mongoose")

exports.getReviewPage = async (req, res) => {
  const clientId = req.params.clientId

  // Check if the provided clientId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).send("Invalid client ID format.")
  }

  try {
    // Fetch the client data
    const client = await Client.findById(clientId)

    // If the client isn't found, render the 404 page
    if (!client) {
      return res.status(404).render("404") // Assuming you have a 404.ejs template
    }

    // Check if the function has already been executed for this session
    if (!req.session.hasIncremented) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let pageView = await PageView.findOne({ createdAt: today, client: clientId })

      if (!pageView) {
        pageView = new PageView({ createdAt: today, client: clientId })
      }

      pageView.count++
      await pageView.save()

      req.session.hasIncremented = true // Set the session flag after incrementing the count
    }

    // Render the client review page
    res.render("review-client", { client })
  } catch (error) {
    console.error("Error fetching client data:", error)
    return res.status(500).send("Error fetching client data.")
  }
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

// Function to handle click count
exports.handleGoogleReviewClick = async (req, res) => {
  const clientId = req.params.clientId

  // Check if the provided clientId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).send("Invalid client ID format.")
  }

  // Check if the function has already been executed for this session
  if (req.session.hasClickedGoogleReview) {
    return res.status(200).json({ message: "Already counted for this session." })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let positiveCount = await PositiveCount.findOne({ createdAt: today, client: clientId })

    if (!positiveCount) {
      positiveCount = new PositiveCount({ createdAt: today, client: clientId })
    }

    positiveCount.count++
    await positiveCount.save()

    req.session.hasClickedGoogleReview = true // Set the session flag after incrementing the count

    res.status(200).json({ message: "Click count updated." })
  } catch (error) {
    console.error("Error updating click count:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

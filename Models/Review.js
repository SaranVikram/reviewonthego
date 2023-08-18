const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  customerName: { type: String, required: true },
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true },
  // Additional fields as needed
})

module.exports = mongoose.model("Review", reviewSchema)

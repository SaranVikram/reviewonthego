const mongoose = require("mongoose")
const Subscription = require("./Subscription") // If using a separate Subscription schema

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  url: { type: String, required: true },
  logo: { type: String, required: true }, // Path to the uploaded logo file
  googleAnalyticsTag: { type: String, required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }, // Reference to Subscription schema
})

module.exports = mongoose.model("Client", clientSchema)

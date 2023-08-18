const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ["trial", "3 months", "6 months", "1 year", "3 years"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  smsLimit: { type: Number, default: 500 },
  smsResetDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" }, // Status field
})

module.exports = mongoose.model("Subscription", subscriptionSchema)

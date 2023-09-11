const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["free", "trial", "3 months", "6 months", "1 year", "3 years"],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  whatsappApiLimit: { type: Number, default: 200 },
  whatsappApiLimitResetDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" }, // Status field
});

module.exports = mongoose.model("Subscription", subscriptionSchema);

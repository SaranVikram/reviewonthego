const mongoose = require("mongoose")

const positiveCountSchema = new mongoose.Schema({
  createdAt: { type: Date, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  count: { type: Number, default: 0 },
})

const PositiveCount = mongoose.model("PositiveCount", positiveCountSchema)

module.exports = PositiveCount

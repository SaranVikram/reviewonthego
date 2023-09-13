const mongoose = require("mongoose")

const pageViewSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  // Other fields related to page views, if needed
})

module.exports = mongoose.model("PageView", pageViewSchema)

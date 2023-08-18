const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  // Other fields as needed
})

module.exports = mongoose.model("Admin", adminSchema)

const mongoose = require("mongoose")

const Schema = mongoose.Schema

const signupSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"], // Regular expression for email validation
  },
})

const Signup = mongoose.model("Signup", signupSchema)

module.exports = Signup

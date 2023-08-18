const Admin = require("../models/Admin") // Path to Admin schema
const Client = require("../models/Client") // Path to Client schema
const twilio = require("twilio") // If using Twilio for OTP

// Admin login page (GET)
exports.getLogin = (req, res) => {
  res.render("admin-login")
}

// Admin login through OTP (POST)
exports.postLogin = async (req, res) => {
  // Validate phone number
  // Generate OTP using Twilio or another service
  // Send OTP to admin's phone number
  // Store OTP in session or database for verification
  // Redirect to OTP verification page
  // Example code (customize as needed):
  const phoneNumber = req.body.phoneNumber
  const otp = Math.floor(100000 + Math.random() * 900000) // Generate 6-digit OTP
  // Send OTP using your preferred service
  req.session.otp = otp // Store OTP in session
  res.redirect("/admin/verify-otp")
}

// Admin dashboard (GET)
exports.getDashboard = async (req, res) => {
  const clients = await Client.find()
  res.render("admin-dashboard", { clients })
}

// Create client page (GET)
exports.getCreateClient = (req, res) => {
  res.render("create-client")
}

// Create client (POST)
exports.postCreateClient = async (req, res) => {
  // Validate and save client data
  const client = new Client(req.body)
  await client.save()
  res.redirect("/admin/dashboard")
}

// Edit client page (GET)
exports.getEditClient = async (req, res) => {
  const client = await Client.findById(req.params.id)
  res.render("edit-client", { client })
}

// Edit client (POST)
exports.postEditClient = async (req, res) => {
  // Validate and update client data
  await Client.findByIdAndUpdate(req.params.id, req.body)
  res.redirect("/admin/dashboard")
}

// Delete client (POST)
exports.deleteClient = async (req, res) => {
  await Client.findByIdAndDelete(req.params.id)
  res.redirect("/admin/dashboard")
}

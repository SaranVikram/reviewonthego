const Client = require("../models/Client")
const twilio = require("twilio") // If using Twilio for OTP

// Get client login page (OTP)
exports.getClientLogin = (req, res) => {
  res.render("client-login")
}

// Post client login (OTP)
exports.postClientLogin = async (req, res) => {
  const phoneNumber = req.body.phoneNumber
  const client = await Client.findOne({ phoneNumber })

  if (!client) {
    // Handle error if phone number not found
    return res.render("client-login", { error: "Phone number not found" })
  }

  const otp = Math.floor(100000 + Math.random() * 900000) // Generate 6-digit OTP

  // Send OTP using Twilio (customize with your Twilio credentials and settings)
  const clientTwilio = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN")
  await clientTwilio.messages.create({
    body: `Your OTP is ${otp}`,
    from: "YOUR_TWILIO_PHONE_NUMBER",
    to: phoneNumber,
  })

  req.session.otp = otp // Store OTP in session
  req.session.clientId = client._id // Store client ID for verification
  res.redirect("/verify-otp")
}

// Verify client OTP
exports.verifyClientOTP = async (req, res) => {
  const inputOTP = req.body.otp

  if (inputOTP === req.session.otp) {
    // OTP is valid, authenticate client
    req.session.isAuthenticated = true
    res.redirect("/dashboard")
  } else {
    // OTP is invalid, show error message
    res.render("verify-otp", { error: "Invalid OTP" })
  }
}

// Get client dashboard
exports.getDashboard = async (req, res) => {
  if (!req.session.isAuthenticated) {
    // Redirect to login if not authenticated
    return res.redirect("/client-login")
  }

  const client = await Client.findById(req.session.clientId)
  res.render("client-dashboard", { client })
}

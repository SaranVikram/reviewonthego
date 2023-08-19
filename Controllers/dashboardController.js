const Client = require("../models/Client")
const jwt = require("jsonwebtoken")
const twilio = require("twilio") // If using Twilio for OTP

// Secret key for JWT (should be stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET

exports.authenticate = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers.authorization?.split(" ")[1]

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Authentication failed" })
    }

    // Store the client's ID in the request object
    req.clientId = decoded.id

    next()
  })
}

exports.postClientLogin = async (req, res) => {
  const phoneNumber = req.body.phoneNumber
  const client = await Client.findOne({ phoneNumber })

  if (!client) {
    // Handle error if phone number not found
    return res.status(404).json({ error: "Phone number not found" })
  }

  const otp = Math.floor(100000 + Math.random() * 900000) // Generate 6-digit OTP

  // Send OTP using Twilio (customize with your Twilio credentials and settings)
  const clientTwilio = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN")
  await clientTwilio.messages.create({
    body: `Your OTP is ${otp}`,
    from: "YOUR_TWILIO_PHONE_NUMBER",
    to: phoneNumber,
  })

  // Store OTP and client ID in session
  req.session.otp = otp
  req.session.clientId = client._id

  res.json({ success: "OTP sent successfully" })
}

// Verify client OTP
exports.verifyClientOTP = async (req, res) => {
  const inputOTP = req.body.otp

  if (inputOTP === req.session.otp) {
    // OTP is valid, authenticate client

    // Generate a JWT with the client's ID
    const token = jwt.sign({ id: req.session.clientId }, JWT_SECRET, { expiresIn: "1d" })

    // Send the token to the client
    res.json({ token })
  } else {
    // OTP is invalid, show error message
    res.status(401).json({ error: "Invalid OTP" })
  }
}

// Get client dashboard
exports.getDashboardData = async (req, res) => {
  if (!req.session.isAuthenticated) {
    // Redirect to login if not authenticated
    return res.redirect("/client-login")
  }

  const client = await Client.findById(req.session.clientId)
  res.render("client-dashboard", { client })
}

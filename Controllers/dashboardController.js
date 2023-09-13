const Client = require("../models/Client")
const Review = require("../models/Review")
const CustomerCheckin = require("../Models/CustomerCheckin")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const twilio = require("twilio") // If using Twilio for OTP

exports.authenticate = (req, res, next) => {
  try {
    // Get the token from the HTTP cookie
    const token = req.cookies.token

    if (!token) {
      throw new Error("No token provided")
    }

    // Verify the token
    jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
      if (err) {
        throw new Error("Authentication failed")
      }

      // Store the client's ID in the request object
      req.clientId = decoded.id

      next()
    })
  } catch (error) {
    console.error("Authentication error:", error.message)
    res.status(401).json({ error: error.message })
  }
}

exports.postClientLogin = async (req, res) => {
  try {
    const mobile = req.body.mobile
    const client = await Client.findOne({ mobile })

    if (!client) {
      // Handle error if phone number not found
      return res.status(404).json({ error: "Phone number not found" })
    }

    const otp = Math.floor(100000 + Math.random() * 9000) // Generate 6-digit OTP

    // Uncomment and customize with your Twilio credentials and settings
    // const clientTwilio = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN");
    // await clientTwilio.messages.create({
    //   body: `Your OTP is ${otp}`,
    //   from: "YOUR_TWILIO_PHONE_NUMBER",
    //   to: mobile,
    // });
    console.log(otp)

    // Store OTP and client ID in session
    req.session.otp = otp
    req.session.clientId = client._id

    res.json({ success: "OTP sent successfully" })
  } catch (error) {
    console.error("Error sending OTP:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.verifyClientOTP = async (req, res) => {
  try {
    const inputOTP = req.body.otp

    if (inputOTP === req.session.otp) {
      // OTP is valid, authenticate client

      // Generate a JWT with the client's ID
      const token = jwt.sign({ id: req.session.clientId }, process.env.JWTSECRET, {
        expiresIn: "1d",
      })

      // Send the token to the client as an HTTP cookie
      res.cookie("token", token, { httpOnly: true, maxAge: 86400000 }) // 1 day in milliseconds
      res.json({ success: "Authenticated successfully" })
    } else {
      // OTP is invalid, show error message
      res.status(401).json({ error: "Invalid OTP" })
    }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.getStats = async (req, res) => {
  try {
    const clientId = req.clientId
    const { dateFilter } = req.query

    // Construct the base query with client ID
    const baseQuery = { client: clientId }
    applyDateFilter(baseQuery, dateFilter) // Assuming you have the applyDateFilter function

    // Fetch counts
    const pageviewsCount = (await PageView.aggregate([{ $match: baseQuery }, { $group: { _id: null, total: { $sum: "$count" } } }]))[0]?.total || 0
    const reviewsCount = await Review.countDocuments(baseQuery)
    const checkinsCount = await CustomerCheckin.countDocuments(baseQuery)

    // Send the counts as the response
    res.json({
      pageviewsCount,
      reviewsCount,
      checkinsCount,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.getReviews = async (req, res) => {
  try {
    // 1. Extract and set default values for pagination and filtering parameters
    const { page = 1, limit = 10, fields = "-_id,-createdAt,-updatedAt,-__v", sort = "-date", dateFilter = "all" } = req.query
    const clientId = req.clientId

    // 2. Validate the client ID format
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).send("Invalid client ID format.")
    }

    // 3. Construct the base query with client ID
    const query = { client: clientId }

    // 4. Apply date filtering based on the dateFilter parameter
    applyDateFilter(query, dateFilter)

    // 5. Fetch reviews based on constructed query
    const reviews = await Review.find(query)
      .select(fields ? fields.split(",").join(" ") : "")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    // 6. Send the fetched reviews as the response
    res.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.postCustomerCheckin = async (req, res) => {
  try {
    // Extract data from request
    const { customerName, phoneNumber } = req.body

    // Validate customerName
    if (!customerName || typeof customerName !== "string" || customerName.length > 50) {
      return res.status(400).json({ error: "Invalid customer name" })
    }

    // Validate phoneNumber
    if (!phoneNumber || typeof phoneNumber !== "number" || phoneNumber.toString().length !== 10) {
      return res.status(400).json({ error: "Invalid phone number" })
    }
    const clientId = req.clientId

    // Create a new checkin using the create operation
    const newCheckin = await CustomerCheckin.create({
      customerName,
      phoneNumber,
      client: clientId,
    })

    // Send a WhatsApp message to the client
    // You'll need to define the sendWhatsAppMessage function or method
    // sendWhatsAppMessage(clientId, `New customer check-in: ${customerName}, Phone: ${phoneNumber}`);

    // Reduce the WhatsApp API limit for the client
    // You'll need to define a function or method to handle this
    // reduceWhatsAppLimit(clientId);

    res.status(201).json({ success: `Check-in recorded and WhatsApp message sent to ${phoneNumber}.` })
  } catch (error) {
    console.error("Error during customer check-in:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.getCustomerCheckins = async (req, res) => {
  try {
    // 1. Extract and set default values for pagination and filtering parameters
    const { page = 1, limit = 10, fields = "-_id,-createdAt,-updatedAt,-__v", sort = "-date", dateFilter = "all" } = req.query
    const clientId = req.clientId

    // 2. Validate the client ID format
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).send("Invalid client ID format.")
    }

    // 3. Construct the base query with client ID
    const query = { client: clientId }

    // 4. Apply date filtering based on the dateFilter parameter
    applyDateFilter(query, dateFilter)

    // 5. Fetch customer checkins based on constructed query
    const checkins = await CustomerCheckin.find(query)
      .select(fields ? fields.split(",").join(" ") : "")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    // 6. Send the fetched checkins as the response
    res.json(checkins)
  } catch (error) {
    console.error("Error fetching customer checkins:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

/**
 * Apply date filtering to the query based on the provided dateFilter value.
 * @param {Object} query - The Mongoose query object.
 * @param {string} dateFilter - The date filter value ('today', 'thisWeek', 'thisMonth', or 'all').
 */
function applyDateFilter(query, dateFilter) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (dateFilter) {
    case "today":
      query.createdAt = { $gte: today }
      break
    case "thisWeek":
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 6)
      query.createdAt = { $gte: lastWeek }
      break
    case "thisMonth":
      const lastMonth = new Date(today)
      lastMonth.setDate(lastMonth.getDate() - 29)
      query.createdAt = { $gte: lastMonth }
      break
    // 'all' or any other value will not modify the query
  }
}

const fs = require("fs") // Import the fs module
const Client = require("../Models/Client")
const Review = require("../Models/Review")
const Subscription = require("../Models/Subscription")
const PageView = require("../Models/PageView")
const PositiveCount = require("../Models/PositiveCount")
const CustomerCheckin = require("../Models/CustomerCheckin")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")
const { isValidNumber } = require("libphonenumber-js")
const crypto = require("crypto")
const { sendWhatsAppMessage } = require("../utils/whatsappService");
const { trackSentMessage } = require("./webhookController")


exports.authenticate = (req, res, next) => {
  // Get the IP address of the client
  let ipAddress = req.ip || req.headers["x-forwarded-for"]

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

    // Log the authentication failure along with the IP address
    const logMessage = `Authentication failed for IP: ${ipAddress}, Error: ${error.message}\n`
    fs.appendFile("./logs/auth-failures.log", logMessage, (err) => {
      if (err) console.error("Failed to log authentication failure:", err)
    })

    res.status(401).json({ error: error.message })
  }
}

exports.postClientLogin = async (req, res) => {
  try {
    const mobile = req.body.mobile
    const isValidMobile = isValidNumber(mobile)
    if (!isValidMobile) {
      throw new Error("Invalid mobile number")
    }

    const client = await Client.findOne({ mobile })

    if (!client) {
      // Handle error if phone number not found
      return res.status(404).json({ error: "Phone number not found" })
    }

    const otp = Math.floor(1000 + Math.random() * 9000) // Generate 4-digit OTP

    //  Construct the template message object
     const templateMessage = {
      template_name: "auth_req",
      parameters: [
        { name: "1", value: otp },
      ],
    };

    // Send a WhatsApp message to the client
    const response = await sendWhatsAppMessage("64e1a8aa5c4d25eda26bb453", templateMessage, mobile);
    console.log(otp)
     
    if(response.result) {
      // Accessing 'localMessageId' from the first item in the 'receivers' array
    const localMessageId = response.receivers[0].localMessageId;
    trackSentMessage(localMessageId,"64e1a8aa5c4d25eda26bb453");
    }

    // Store OTP and client ID in session
    req.session.otp = otp
    // Set OTP expiration time in session
    const otpExpiration = Date.now() + 10 * 60 * 1000 // 10 minutes from now
    req.session.otpExpiration = otpExpiration
    req.session.clientId = client._id

    res.json({ success: "OTP sent successfully" })
  } catch (error) {
    console.error("Error sending OTP:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.verifyClientOTP = async (req, res) => {
  try {
    const inputOTP = req.body.otp
    if (Date.now() > req.session.otpExpiration) {
      return res.status(401).json({ error: "OTP has expired" })
    }

    if (inputOTP === req.session.otp) {
      // OTP is valid, authenticate client

      // Generate a JWT with the client's ID
      const token = jwt.sign({ id: req.session.clientId }, process.env.JWTSECRET, {
        expiresIn: "1d",
      })

      // Send the token to the client as an HTTP cookie
      const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  httpOnly: true,
  maxAge: 86400000, // 1 day in milliseconds
  domain: isProduction ? ".reviewonthego.in" : undefined, // Set domain only in production
  secure: isProduction, // Enable secure only in production
  sameSite: isProduction ? "None" : "Lax", // Use "None" in production, "Lax" in development
});
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

exports.postClientLogout = (req, res) => {
  try {
    // Clear the HttpOnly cookie
    res.clearCookie("token")

    // Send a success response
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout failed:", error)

    // Send an error response
    res.status(500).json({ message: "Logout failed", error })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const clientId = req.clientId

    // Check if clientId is a valid Mongoose Object ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: "Invalid Client ID" })
    }

    // Construct the base query with client ID
    const baseQuery = { _id: clientId }

    // Fetch client profile details with selected fields
    const clientProfile = await Client.findOne(baseQuery).select("name company mobile email").populate({
      path: "subscription",
      select: "whatsappApiLimit status",
    })

    if (!clientProfile) {
      return res.status(404).json({ error: "Client Profile Not Found" })
    }

    // Convert email to Gravatar hash
    const gravatarHash = crypto.createHash("md5").update(clientProfile.email.trim().toLowerCase()).digest("hex")

    // Replace email with Gravatar hash
    clientProfile.email = gravatarHash

    let whatsappApiLimit = clientProfile.subscription.whatsappApiLimit
    let status = clientProfile.subscription.status

    // Check if the subscription status is 'inactive'
    if (status === "inactive") {
      whatsappApiLimit = 0
    }

    const transformedProfile = {
      name: clientProfile.name,
      company: clientProfile.company,
      mobile: clientProfile.mobile,
      email: clientProfile.email,
      whatsappApiLimit: whatsappApiLimit,
      status: status, // Add the status field
    }

    // Send the client profile as the response with a 200 status code
    res.status(200).json(transformedProfile)

    // Check if the subscription status is 'inactive' and update asynchronously
    if (clientProfile.subscription.status === "inactive") {
      // Update the whatsappApiLimit in the database to 0
      Subscription.findByIdAndUpdate(clientProfile.subscription._id, {
        whatsappApiLimit: 0,
      }).catch((error) => {
        console.error("Error updating whatsappApiLimit:", error)
      })
    }
  } catch (error) {
    console.error("Error fetching client profile:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.getStats = async (req, res) => {
  try {
    const clientId = new ObjectId(req.clientId) // Convert to ObjectId
    const { dateFilter } = req.query

    // Construct the base query with client ID
    const baseQuery = { client: clientId }
    applyDateFilter(baseQuery, dateFilter) // Assuming you have the applyDateFilter function

    // Fetch counts
    const pageviewsCount = (await PageView.aggregate([{ $match: baseQuery }, { $group: { _id: null, total: { $sum: "$count" } } }]))[0]?.total || 0
    const reviewsCount = await Review.countDocuments(baseQuery)
    const checkinsCount = await CustomerCheckin.countDocuments(baseQuery)
    const positiveCountsTotal = (await PositiveCount.aggregate([{ $match: baseQuery }, { $group: { _id: null, total: { $sum: "$count" } } }]))[0]?.total || 0

    // Send the counts as the response
    if (res) {
      res.status(200).json({
        pageviewsCount,
        reviewsCount,
        checkinsCount,
        positiveCountsTotal,
      })
    } else {
      throw new Error("Response object is undefined")
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.getPageViews = async (req, res) => {
  try {
    const clientId = req.clientId

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch page views for the client in the last 30 days
    const pageViews = await PageView.find({
      client: clientId,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 }) // Sort by date in ascending order

    // Initialize an array of zeros for the last 30 days
    const countsArray = Array(30).fill(0)

    // Populate the countsArray with actual counts
    pageViews.forEach((doc) => {
      const index = Math.floor((new Date(doc.createdAt) - thirtyDaysAgo) / (1000 * 60 * 60 * 24))
      countsArray[index] = doc.count
    })

    // Send the array back as the response
    res.status(200).json(countsArray)
  } catch (error) {
    console.error("Error fetching page views:", error)
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
    if (!phoneNumber || typeof phoneNumber !== "string" || (phoneNumber.length !== 12 && phoneNumber.length !== 13)) {
      return res.status(400).json({ error: "Invalid phone number" })
    }
    const cleanedNumber = phoneNumber.replace(/^\+91/, "");
    const clientId = req.clientId

    // Find the client and populate the subscription
    const client = await Client.findById(clientId).populate("subscription");

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Check if the subscription exists and is active
    const subscription = client.subscription;
    if (!subscription || subscription.status !== "active") {
      return res.status(403).json({ error: "Subscription is inactive or not found" });
    }

    // Check if the WhatsApp API limit is greater than 0
    if (subscription.whatsappApiLimit <= 0) {
      return res.status(403).json({ error: "WhatsApp API limit exhausted" });
    }

    // Create a new checkin using the create operation
    const newCheckin = await CustomerCheckin.create({
      customerName,
      phoneNumber,
      client: clientId,
    })

       // Construct the clientId link with properly encoded values
       const encodedName = encodeURIComponent(customerName);
       const encodedPhone = encodeURIComponent(cleanedNumber); 

    // Construct the template message object
 
    const templateMessage = {
      template_name: "review_template1",
      parameters: [
        { name: "name", value: customerName },
        { name: "clientId", value: `${clientId}?name=${encodedName}&phone=${encodedPhone}` },
        { name: "company", value: client.company },
        { name: "imagepath", value:`https://cdn.reviewonthego.in/${client.imagePath}`},
      ],
    };

    const response = await sendWhatsAppMessage(clientId, templateMessage, phoneNumber)
    
   
  if(response.result) {
      // Accessing 'localMessageId' from the first item in the 'receivers' array
      const localMessageId = response.receivers[0].localMessageId;
      trackSentMessage(localMessageId,clientId);
    res.status(200).json({
      success: `WhatsApp message sent to ${phoneNumber}.`,
    })
  } else {
    res.status(400).json({
      error:"Failed to send message"
    })
  }
   

   
  } catch (error) {
    console.error("Error during customer check-in:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

exports.getCustomerCheckins = async (req, res) => {
  try {
    // 1. Extract and set default values for pagination and filtering parameters
    const { page = 1, limit = 10, fields = "-_id,-createdAt,-updatedAt,-__v,-client", sort = "-date", dateFilter = "all" } = req.query
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
    res.status(200).json(checkins)
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

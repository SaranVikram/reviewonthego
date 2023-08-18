const Client = require("../models/Client")
const Subscription = require("../models/Subscription")

exports.updateSubscriptionStatus = async (req, res, next) => {
  // Get the client's phone number from the request (adjust as needed)
  const phoneNumber = req.body.mobile

  // Find the client by phone number and populate the subscription
  const client = await Client.findOne({ mobile: phoneNumber }).populate("subscription")

  if (!client) {
    // Handle the case where the client is not found
    return res.status(404).json({ error: "Client not found" })
  }

  // Check if the subscription needs to be updated
  const now = new Date()
  const subscription = client.subscription

  // Check if the subscription has ended
  if (subscription.endDate <= now) {
    subscription.status = "inactive"
  }

  // Check if the SMS limit needs to be reset
  if (subscription.smsResetDate <= now && subscription.status === "active") {
    subscription.smsLimit = 500

    // Set the next SMS reset date to one month in the future
    const nextResetDate = new Date(subscription.smsResetDate)
    nextResetDate.setMonth(nextResetDate.getMonth() + 1)
    subscription.smsResetDate = nextResetDate
  }

  // Save the updated subscription
  await subscription.save()

  // Continue to the next middleware or route handler
  next()
}

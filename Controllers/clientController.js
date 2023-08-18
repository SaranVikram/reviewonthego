const Client = require("../models/Client")

exports.getClients = async (req, res) => {
  const clients = await Client.find()
  res.render("clients", { clients })
}

exports.getCreateClient = (req, res) => {
  res.render("create-client")
}

exports.postCreateClient = async (req, res) => {
  // Validate the required fields
  const { name, company, mobile, email, url, imagePath, gtag, subscriptionType } = req.body
  if (!name || !company || !mobile || !email || !url || !imagePath || !gtag || !subscriptionType) {
    return res.redirect("/admin/clients?error=All fields are required")
  }

  // Calculate the end date based on the subscription type
  const startDate = new Date()
  let endDate = new Date(startDate)
  switch (subscriptionType) {
    case "trial":
      endDate.setDate(endDate.getDate() + 14) // 14 days for trial
      break
    case "3 months":
      endDate.setMonth(endDate.getMonth() + 3)
      break
    case "6 months":
      endDate.setMonth(endDate.getMonth() + 6)
      break
    case "1 year":
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
    case "3 years":
      endDate.setFullYear(endDate.getFullYear() + 3)
      break
  }

  // Calculate the SMS reset date (1 month from start date)
  const smsResetDate = new Date(startDate)
  smsResetDate.setMonth(smsResetDate.getMonth() + 1)

  // Create a new subscription object
  const subscription = new Subscription({
    type: subscriptionType,
    startDate: new Date(),
    endDate: new Date(), // Set the appropriate end date based on the subscription type
    smsResetDate: new Date(), // Set the appropriate SMS reset date
  })

  try {
    // Save the subscription to the database
    await subscription.save()

    // Create a new client object with the saved subscription
    const client = new Client({
      name,
      company,
      mobile,
      email,
      url,
      imagePath,
      gtag,
      subscription: subscription._id, // Reference to the saved subscription
    })

    // Save the client to the database
    await client.save()
    res.redirect("/admin/clients")
  } catch (error) {
    // Handle any database errors
    console.error(error)
    res.redirect("/admin/clients?error=An error occurred while creating the client")
  }
}

exports.getEditClient = async (req, res) => {
  const client = await Client.findById(req.params.id)
  res.render("edit-client", { client })
}

exports.postEditClient = async (req, res) => {
  await Client.findByIdAndUpdate(req.params.id, req.body)
  res.redirect("/admin/clients")
}

exports.deleteClient = async (req, res) => {
  await Client.findByIdAndDelete(req.params.id)
  res.redirect("/admin/clients")
}

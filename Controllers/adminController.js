const Client = require("../Models/Client") // Path to Client schema
const Subscription = require("../Models/Subscription")
const templatesArray = require("../utils/templateArray")
const twilio = require("twilio") // If using Twilio for OTP

// Admin login page (GET)
exports.getLogin = (req, res) => {
  try {
    res.render("admin access")
  } catch (error) {
    console.error("Error rendering the admin access page:", error)
    res.status(500).send("Internal Server Error")
  }
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
  const otp = Math.floor(1000 + Math.random() * 9000) // Generate 4-digit OTP
  // Send OTP using your preferred service
  req.session.otp = otp // Store OTP in session
  console.log(otp)
  res.render("verify-otp")
}

// Handle OTP verification (POST)
exports.postVerifyOtp = (req, res) => {
  const otp1 = req.body.otp1
  const otp2 = req.body.otp2
  const otp3 = req.body.otp3
  const otp4 = req.body.otp4

  // Concatenate the OTP parts
  const userOtp = Number(otp1 + otp2 + otp3 + otp4)
  const sessionOtp = req.session.otp

  if (userOtp === sessionOtp) {
    req.session.admin = true // Set admin property in session
    res.redirect("/admin/create-client")
  } else {
    // Handle incorrect OTP (e.g., render error message)
    res.render("verify-otp", { error: "Incorrect OTP. Please try again." })
  }
}

//Admin logout route
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err)
      return res.status(500).send("Internal Server Error")
    }
    res.redirect("/admin/login") // Redirect to admin login page
  })
}

exports.getCreateClient = (req, res) => {
  try {
    req.flash("success", "Logged in successfully.")
    const successMessages = req.flash("success")
    res.render("create-client", {
      messages: {
        success: successMessages[0],
      },
      templates: templatesArray,
    })
  } catch (error) {
    console.error("Error rendering create-client page:", error)
    req.flash("error", "There was an error rendering the page.")
    const errorMessages = req.flash("error")
    res.status(404).render("404", {
      messages: {
        error: errorMessages[0],
      },
    })
  }
}

exports.postCreateClient = async (req, res) => {
  // Validate the required fields
  const { name, company, mobile, email, URL, template, subscriptionType } = req.body
  const imagePath = req.fileUrl;
  if (!name || !company || !mobile || !email || !URL || !imagePath || !template || !subscriptionType) {
    return res.redirect("/admin/create-client?error=All fields are required")
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
  const whatsappApiLimitResetDate = new Date(startDate)
  whatsappApiLimitResetDate.setMonth(whatsappApiLimitResetDate.getMonth() + 1)

  // Create a new subscription object
  const subscription = new Subscription({
    type: subscriptionType,
    startDate: new Date(),
    endDate, // Set the appropriate end date based on the subscription type
    whatsappApiLimitResetDate, // Set the appropriate SMS reset date
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
      URL,
      template,
      imagePath,
      subscription: subscription._id, // Reference to the saved subscription
    })

    // Save the client to the database
    await client.save()
    req.flash("sucess", "client created succefully")
    res.redirect("/admin/create-client")
  } catch (error) {
    // Handle any database errors
    console.error(error)
    req.flash("error", "There was an error creating client")
    res.redirect("/admin/create-client")
  }
}

exports.getrenewSubscription = (req, res) => {
  try {
    req.flash("success", "Logged in successfully.")
    const successMessages = req.flash("success")
    res.render("renew-subscription", {
      messages: {
        success: successMessages[0],
      },
      templates: templatesArray,
    })
  } catch (error) {
    console.error("Error rendering renew page:", error)
    req.flash("error", "There was an error rendering the page.")
    const errorMessages = req.flash("error")
    res.status(404).render("404", {
      messages: {
        error: errorMessages[0],
      },
    })
  }
}

exports.renewSubscription = async (req, res) => {
  try {
    // Extract mobile and subscriptionType from request
    const { mobile, subscriptionType } = req.body;
    console.log(subscriptionType);
    

    // Find the client by mobile number and populate the subscription
    const client = await Client.findOne({ mobile }).populate("subscription");

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const subscription = client.subscription;

    if (!subscription) {
      return res.status(400).json({ error: "No subscription found for this client" });
    }

    // Set new start date as the current date
    const startDate = new Date();
    let endDate = new Date(startDate);

    // Update endDate based on subscription type
    switch (subscriptionType) {
      case "trial":
        endDate.setDate(endDate.getDate() + 14);
        break;
      case "3 months":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "6 months":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "1 year":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case "3 years":
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      default:
        return res.status(400).json({ error: "Invalid subscription type" });
    }

    // Calculate the WhatsApp API limit reset date (1 month from start date)
    const whatsappApiLimitResetDate = new Date(startDate);
    whatsappApiLimitResetDate.setMonth(whatsappApiLimitResetDate.getMonth() + 1);

    // Update subscription details
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.type = subscriptionType;
    subscription.whatsappApiLimitResetDate = whatsappApiLimitResetDate;
    subscription.status = "active";
    subscription.whatsappApiLimit = 200;

    // Save the updated subscription
    await subscription.save();

    req.flash("sucess", "subscription renewed succefully")
    res.redirect("/admin/renew-subscription")
  } catch (error) {
    console.error("Error renewing subscription:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

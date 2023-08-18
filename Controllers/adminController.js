// Admin login page
exports.getLogin = (req, res) => {
  res.render("admin-login")
}

// Admin login through OTP
exports.postLogin = async (req, res) => {
  // Validate phone number
  // Generate and send OTP
  // Store OTP for verification
  // Redirect to OTP verification page
}

// Admin dashboard
exports.getDashboard = (req, res) => {
  res.render("admin-dashboard")
}

// Create client page
exports.getCreateClient = (req, res) => {
  res.render("create-client")
}

// Create client (POST)
exports.postCreateClient = async (req, res) => {
  // Validate and save client data
  // Redirect to admin dashboard or show success message
}

// Additional functions for editing and deleting clients

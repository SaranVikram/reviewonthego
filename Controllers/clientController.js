const Client = require("../Models/Client") // Path to Client schema

// Get all clients (for admin)
exports.getClients = async (req, res) => {
  const clients = await Client.find()
  res.render("clients", { clients }) // Render clients list
}

// Create client page
exports.getCreateClient = (req, res) => {
  res.render("create-client")
}

// Create client (POST)
exports.postCreateClient = async (req, res) => {
  // Validate and save client data
  // Redirect to clients list or show success message
}

// Edit client page
exports.getEditClient = async (req, res) => {
  const client = await Client.findById(req.params.id)
  res.render("edit-client", { client }) // Render edit client page
}

// Update client (POST)
exports.postEditClient = async (req, res) => {
  // Validate and update client data
  // Redirect to clients list or show success message
}

// Delete client
exports.deleteClient = async (req, res) => {
  await Client.findByIdAndDelete(req.params.id)
  res.redirect("/admin/clients") // Redirect to clients list
}

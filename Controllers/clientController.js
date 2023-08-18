const Client = require("../models/Client")

exports.getClients = async (req, res) => {
  const clients = await Client.find()
  res.render("clients", { clients })
}

exports.getCreateClient = (req, res) => {
  res.render("create-client")
}

exports.postCreateClient = async (req, res) => {
  const client = new Client(req.body)
  await client.save()
  res.redirect("/admin/clients")
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

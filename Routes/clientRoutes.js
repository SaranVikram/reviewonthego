const express = require("express")
const clientController = require("../Controllers/clientController")
const adminMiddleware = require("../Middlewears/adminMiddleware") // If using separate middleware file
const router = express.Router()

router.get("/clients", adminMiddleware.requireAdminLogin, clientController.getClients)
router.get("/create-client", adminMiddleware.requireAdminLogin, clientController.getCreateClient)
router.post("/create-client", adminMiddleware.requireAdminLogin, clientController.postCreateClient)
router.get("/edit-client/:id", adminMiddleware.requireAdminLogin, clientController.getEditClient)
router.post("/edit-client/:id", adminMiddleware.requireAdminLogin, clientController.postEditClient)
router.post("/delete-client/:id", adminMiddleware.requireAdminLogin, clientController.deleteClient)

module.exports = router

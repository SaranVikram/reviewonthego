const express = require("express")
const cors = require("cors")
const router = express.Router()
const webhookController = require("../Controllers/webhookController")

const corsOptions = {
  origin: ["http://localhost:3000", "https://app.reviewonthego.in"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
}

// Apply CORS with specific options to dashboard-related routes
router.use(cors(corsOptions))

router.post("/wati-message-delivered", webhookController.watiMessageDeliveredHook)


module.exports = router
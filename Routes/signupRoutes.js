const express = require("express")
const router = express.Router()
const cors = require("cors")
const csrf = require("csurf")

const SignUp = require("../Models/SignUp")

const corsOptions = {
  origin: ["http://localhost:3000", "https://www.reviewonthego.com"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Add other headers as needed
}

// Apply CORS with specific options to dashboard-related routes
router.use(cors(corsOptions))

router.use(csrf({ cookie: true }))

// Endpoint to get CSRF token
router.get("/get-csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// CSRF error handling
router.use(function (err, req, res, next) {
  console.log(req.body)

  if (err.code !== "EBADCSRFTOKEN") return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send("CSRF token mismatch or missing")
})

// Signup route
router.post("/sign-up", async (req, res) => {
  try {
    const { fullName, company, phoneNumber, email } = req.body
    console.log(req.body)

    // Basic validation
    if (!fullName || !company || !phoneNumber || !email) {
      return res.status(400).send("All fields are required")
    }

    // Create a new SignUp instance
    const newUser = new SignUp({
      fullName,
      company,
      phoneNumber,
      email,
    })

    // Save to database
    await newUser.save()

    res.status(201).send("User signed up successfully")
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send("Email already exists")
    }
    console.error(error)
    res.status(500).send("Server error")
  }
})

module.exports = router
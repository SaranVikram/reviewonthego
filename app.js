const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
const dotenv = require("dotenv")
const adminRoutes = require("./Routes/adminRoutes")
const clientRoutes = require("./Routes/clientRoutes")
const reviewApiRoutes = require("./Routes/reviewApiRoutes")

dotenv.config() // Load environment variables
const app = express()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false,
  })
)

app.use(flash()) // Flash messages

app.use(express.urlencoded({ extended: false })) // Parse form data
app.use(express.json()) // Parse JSON data

app.set("view engine", "ejs") // Set EJS as the view engine

// Static files (CSS, JS, images)
app.use(express.static("public"))

// TODO: Add routes
app.use("/admin", adminRoutes)
app.use("/admin", clientRoutes)
app.use("/", reviewApiRoutes)

// Start the server
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

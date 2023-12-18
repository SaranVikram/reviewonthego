const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv")
const adminRoutes = require("./Routes/adminRoutes")
const reviewApiRoutes = require("./Routes/reviewApiRoutes")
const dashboardRoutes = require("./Routes/dashboardRoutes")
const signupRoutes = require("./Routes/signupRoutes")

dotenv.config() // Load environment variables
const app = express()

const corsOptions = {
  origin: ["http://localhost:4000", "https://nr.reviewonthego.io"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
}

// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => console.error("Could not connect to MongoDB:", err))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
)

// Use cookie middleware
app.use(cookieParser())

app.use(flash()) // Flash messages

app.use(express.urlencoded({ extended: false })) // Parse form data
app.use(express.json()) // Parse JSON data

app.set("view engine", "ejs") // Set EJS as the view engine

// Static files (CSS, JS, images)
app.use(express.static("public"))

// TODO: Add routes
app.use("/admin", adminRoutes)
app.use("/", reviewApiRoutes)
app.use("/api", dashboardRoutes)
app.use("/api", signupRoutes)

// Start the server
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

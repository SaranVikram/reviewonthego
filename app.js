const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const adminRoutes = require("./Routes/adminRoutes");
const clientRoutes = require("./Routes/clientRoutes");
const reviewApiRoutes = require("./Routes/reviewApiRoutes");
const dashboardRoutes = require("./Routes/dashboardRoutes");

dotenv.config(); // Load environment variables
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
  })
);

// Use cookie middleware
app.use(cookieParser());

app.use(flash()); // Flash messages

app.use(express.urlencoded({ extended: false })); // Parse form data
app.use(express.json()); // Parse JSON data

app.set("view engine", "ejs"); // Set EJS as the view engine

// Static files (CSS, JS, images)
app.use(express.static("public"));

// TODO: Add routes
app.use("/admin", adminRoutes);
app.use("/admin", clientRoutes);
app.use("/", reviewApiRoutes);
app.use("/api", dashboardRoutes);

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

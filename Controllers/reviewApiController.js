const Client = require("../models/Client");
const Review = require("../models/Review");
const PageView = require("../Models/PageView"); // Import your PageView model

exports.getReviewPage = async (req, res) => {
  try {
    const clientId = req.params.clientId; // Assuming you have the client's ID

    // Get or create a PageView document for today and the specific client
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pageView = await PageView.findOne({ date: today, client: clientId });

    if (!pageView) {
      pageView = new PageView({ date: today, client: clientId });
    }

    // Increment the count for the page view
    pageView.count++;

    // Save the PageView document
    await pageView.save();

    // Update the Client document to reference the PageView document
    const client = await Client.findByIdAndUpdate(
      clientId,
      { $addToSet: { pageViews: pageView._id } },
      { new: true }
    );

    // Render the "review-client" page with the updated client data
    res.render("review-client", { client });
  } catch (error) {
    console.error(
      "Error updating page views and rendering the review page:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    // Define pagination parameters
    const page = parseInt(req.query.page) || 1; // Page number
    const limit = parseInt(req.query.limit) || 10; // Number of results per page

    // Define query conditions (optional)
    const query = {
      client: req.params.clientId,
    };

    // Define fields to select (optional)
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ") // Convert comma-separated fields to space-separated
      : "";

    // Define sorting criteria (optional)
    const sort = req.query.sort || "-date"; // Default to sorting by date in descending order

    // Apply date filtering based on query parameter
    const dateFilter = req.query.dateFilter || "all"; // Default to 'all'

    if (dateFilter === "today") {
      // Filter for today's reviews
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    } else if (dateFilter === "thisWeek") {
      // Filter for reviews in the last 7 days (including today)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 6);
      lastWeek.setHours(0, 0, 0, 0);
      query.date = { $gte: lastWeek };
    } else if (dateFilter === "thisMonth") {
      // Filter for reviews in the last 30 days (including today)
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 29);
      lastMonth.setHours(0, 0, 0, 0);
      query.date = { $gte: lastMonth };
    }

    // Execute the query without populating the client field
    const reviews = await Review.find(query)
      .select(fields)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // Now, let's populate the client field for a single review
    if (reviews.length > 0) {
      const reviewWithClient = await Review.populate(reviews[0], {
        path: "client",
      });
      res.json([reviewWithClient, ...reviews.slice(1)]); // Send the populated review first and the rest unpopulated
    } else {
      res.json(reviews);
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.postReview = async (req, res) => {
  const review = new Review({
    client: req.params.clientId, // Client ID from the URL (MongoDB object ID)
    customerName: req.body.name, // Customer name from the form
    phoneNumber: req.body.phone, // Phone number from the form
    reviewText: req.body.feedback, // Review text from the form
    rating: req.body.rating, // Rating from the form
  });

  try {
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
};

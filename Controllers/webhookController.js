const { reduceWhatsAppLimit } = require("../utils/whatsappService");

// In-memory store to track sent messages (use a database in production)
const sentMessages = new Map();

// Function to handle WATI webhook events
exports.watiMessageDeliveredHook = (req, res) => {
  try {
    const { eventType, statusString, timestamp } = req.body;

    if (eventType === "sentMessageDELIVERED" && statusString === "Delivered") {

      if (sentMessages.has(timestamp)) {
        const clientId = sentMessages.get(timestamp);
        reduceWhatsAppLimit(clientId);
        sentMessages.delete(timestamp); // Cleanup
        console.log(`API limit reduced for client ${clientId}`);
      } else {
        console.warn(`No clientId found for timestamp ${timestamp}`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal error" });
  }
};


// When sending a message, track the clientId with the timestamp from the send response
exports.trackSentMessage = (timestamp,clientId) => {
  // Generate a timestamp (Unix seconds)
  sentMessages.set(timestamp, clientId);
  console.log(`Tracked client ${clientId} at timestamp ${timestamp}`);
};
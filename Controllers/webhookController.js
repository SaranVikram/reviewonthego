const { reduceWhatsAppLimit } = require("../utils/whatsappService");

// In-memory store to track sent messages (use a database in production)
const sentMessages = new Map();

// Function to handle WATI webhook events
exports.watiMessageDeliveredHook = (req, res) => {
  try {
    const { eventType, statusString, timestamp } = req.body;

    if (eventType === "sentMessageDELIVERED" && statusString === "Delivered") {
      for (const [requestTimestamp, { responseTimestamp, clientId }] of sentMessages.entries()) {
        
        // ✅ Check if timestamp falls within request & response time
        if (timestamp >= requestTimestamp && timestamp <= responseTimestamp) {
          reduceWhatsAppLimit(clientId);
          sentMessages.delete(requestTimestamp); // Cleanup
          console.log(`✅ API limit reduced for client ${clientId}`);
          break; // Exit loop after processing
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ error: "Internal error" });
  }
};


// When sending a message, track the clientId with the timestamp from the send response
exports.trackSentMessage = (requestTimestamp,responseTimestamp,clientId) => {
   // ✅ Store both timestamps in the Map with clientId as the value
   sentMessages.set(requestTimestamp, { responseTimestamp, clientId });
 
};
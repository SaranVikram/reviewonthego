const { reduceWhatsAppLimit } = require("../utils/whatsappService");

// In-memory store to track sent messages (use a database in production)
const sentMessages = new Map();

// Function to handle WATI webhook events
exports.watiMessageDeliveredHook = async (req, res) => {
  try {
    const { eventType, statusString, timestamp } = req.body;

    if (eventType === "sentMessageDELIVERED" && statusString === "Delivered") {
      const deliveryTimestamp = Number(timestamp); // ✅ Convert to number

      for (const [requestTimestamp, { responseTimestamp, clientId }] of sentMessages.entries()) {
        const reqTime = Number(requestTimestamp);
        const resTime = Number(responseTimestamp);

        // ✅ Check if timestamp is within request-response range
        if (deliveryTimestamp >= reqTime && deliveryTimestamp <= resTime) {
          await reduceWhatsAppLimit(clientId); // ✅ Now it waits for execution
          sentMessages.delete(requestTimestamp); // Cleanup after successful execution
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
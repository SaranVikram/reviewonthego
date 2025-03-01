const { reduceWhatsAppLimit } = require("../utils/whatsappService");

// In-memory store to track sent messages (use a database in production)
const sentMessages = new Map();

// Function to handle WATI webhook events
exports.watiMessageDeliveredHook = async (req, res) => {
  try {
    const { eventType, statusString, localMessageId } = req.body;

    if (eventType === "sentMessageDELIVERED_v2" && statusString === "Delivered") {
 
        // ✅ Check if timestamp is within request-response range
        if (sentMessages.has(localMessageId)) {
          await reduceWhatsAppLimit(sentMessages.get(localMessageId)?.clientId); // ✅ Now it waits for execution
          sentMessages.delete(localMessageId); // Cleanup after successful execution
          console.log(`✅ API limit reduced for client`);
        }
      
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ error: "Internal error" });
  }
};

exports.trackSentMessage = (id,clientId) => {
   sentMessages.set(id, {  clientId });
 
};
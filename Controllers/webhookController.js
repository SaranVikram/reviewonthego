const { reduceWhatsAppLimit } = require("../utils/whatsappService");

// In-memory store to track sent messages (use a database in production)
const sentMessages = new Map();

// Function to handle WATI webhook events
exports.watiMessageDeliveredHook = (req, res) => {
  try {
    const { eventType, payload } = req.body;

    // Check if the event is a message status update
    if (eventType === 'sentMessageDELIVERED') {
      const { id, statusString, recipientId } = payload;

      // Check if the message was sent via /customer-checkin
      if (sentMessages.has(id)) {
        console.log(`Message ${id} status: ${statusString}`);

        // Reduce the API limit only if the message is delivered
        if (statusString === 'Delivered') {
          reduceWhatsAppLimit(sentMessages.get(id)?.clientId);
          console.log(`API limit reduced. New limit: ${apiLimit}`);

          // Remove the message from the tracking store
          sentMessages.delete(id);
          
        }
      } else {
        console.warn(`Message ${id} not found in sentMessages. It may have been already processed.`);
      }
    }

    // Respond to the webhook with a 200 OK
    res.sendStatus(200);
  } catch (error) {
    console.error('Error in watiMessageDeliveredHook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing the webhook.',
    });
  }
};


// Function to track sent messages (called from the /customer-checkin route)
exports.trackSentMessage = (messageId, phoneNumber, clientId) => {
    sentMessages.set(messageId, { phoneNumber, clientId });
    console.log(`Tracked message ${messageId} for ${phoneNumber} (Client: ${clientId})`);
  };
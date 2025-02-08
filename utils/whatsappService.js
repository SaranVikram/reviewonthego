const axios = require('axios');
const Client = require("../Models/Client");
const Subscription = require("../Models/Subscription");

// WATI.io API configuration
const WATI_API_KEY = 'your_wati_api_key'; // Replace with your actual WATI.io API key
const WATI_API_ENDPOINT = 'https://api.wati.io/v1/sendTemplateMessage';

/**
 * Function to send WhatsApp message using WATI.io API
 * @param {string} clientId - Unique identifier for the client
 * @param {string} message - The message to send
 * @param {string} number - WhatsApp number of the client (with country code, e.g., +1234567890)
 */
async function sendWhatsAppMessage(clientId, message, number) {
    try {
        const response = await axios.post(
            WATI_API_ENDPOINT,
            {
                template_name: 'generic_message', // Use a generic template or customize as needed
                broadcast_name: `Message_${clientId}`,
                parameters: {
                    message: message, // Pass the message as a parameter
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${WATI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    whatsappNumber: number,
                },
            }
        );

        console.log(`Message sent successfully to ${number}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Failed to send message to ${number}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Function to reduce the WhatsApp API limit for the client
 * @param {string} clientId - Unique identifier for the client
 */
async function reduceWhatsAppLimit(clientId) {
    try {
        // Find the client by ID and populate the subscription
        const client = await Client.findById(clientId).populate("subscription");

        if (!client) {
            console.error(`Client not found with ID: ${clientId}`);
            return;
        }

        // Get the subscription
        const subscription = client.subscription;

        if (!subscription) {
            console.error(`Subscription not found for client: ${clientId}`);
            return;
        }

        // Check if the subscription is active
        if (subscription.status !== "active") {
            console.error(`Subscription is not active for client: ${clientId}`);
            return;
        }

        // Check if the WhatsApp API limit is greater than 0
        if (subscription.whatsappApiLimit > 0) {
            // Reduce the WhatsApp API limit by 1
            subscription.whatsappApiLimit -= 1;

            // Save the updated subscription
            await subscription.save();

            console.log(`WhatsApp API limit reduced for client: ${clientId}. New limit: ${subscription.whatsappApiLimit}`);
        } else {
            console.error(`WhatsApp API limit already exhausted for client: ${clientId}`);
        }
    } catch (error) {
        console.error(`Error reducing WhatsApp API limit for client: ${clientId}`, error);
        throw error;
    }
}

module.exports = {
    sendWhatsAppMessage,
    reduceWhatsAppLimit,
};
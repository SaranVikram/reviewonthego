const axios = require('axios');
const Client = require("../Models/Client");
const Subscription = require("../Models/Subscription");

// WATI.io API configuration
const WATI_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkM2U2MDdjNC1lZDQ5LTQzZGItYTM4Yy04ODBmZDRiM2Y1YTQiLCJ1bmlxdWVfbmFtZSI6InNhcmFuLnZpa3JhbUB5YWhvby5jb20iLCJuYW1laWQiOiJzYXJhbi52aWtyYW1AeWFob28uY29tIiwiZW1haWwiOiJzYXJhbi52aWtyYW1AeWFob28uY29tIiwiYXV0aF90aW1lIjoiMDIvMTcvMjAyNSAxNjoxMTowNSIsInRlbmFudF9pZCI6IjQwNjQzNSIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.3UWCUnA-VLRJCCciRrQ8drIwnBkidCSeH7CVPp2BEBU'; // Replace with your actual WATI.io API key
const WATI_API_ENDPOINT = 'https://live-mt-server.wati.io/406435/api/v1/sendTemplateMessage';

/**
 * Function to send WhatsApp message using WATI.io API
 * @param {string} clientId - Unique identifier for the client
 * @param {string} message - The message to send
 * @param {string} number - WhatsApp number of the client (with country code, e.g., +1234567890)
 */
async function sendWhatsAppMessage(clientId, templateMessage, number) {
    try {
        const { template_name, parameters } = templateMessage;
        const response = await axios.post(
            WATI_API_ENDPOINT,
            {
                template_name,
                broadcast_name: `Reviewonthego`,
                parameters, // Use parameters from the templateMessage object
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
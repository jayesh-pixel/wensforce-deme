import { JWT } from 'google-auth-library';
import fetch from 'node-fetch';
import 'dotenv/config'; // Automatically loads .env variables

// Load service account credentials from environment variables
const clientEmail = process.env.SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n'); // Replace \n with actual newlines
const projectId = process.env.PROJECT_ID;
const tokenUri = 'https://oauth2.googleapis.com/token'; // This is a fixed URL for Google services


// Function to get the Google OAuth2 access token
async function getAccessToken() {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
      tokenUri,
    });
  
    const accessTokenResponse = await jwtClient.authorize();
    return accessTokenResponse.access_token;
}


// Function to send the notification
async function sendNotification(title, message, deviceToken) {
    try {
      const accessToken = await getAccessToken(); // Fetch the access token
  
      const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  
      // Correct notification payload
      const dataToSend = {
        message: {
          token: deviceToken, // Device token for sending the message
          notification: {
            title,             // Title of the notification
            body: message,      // Body of the notification
          },
          android: {
            priority: 'HIGH',   // Use 'HIGH' priority for Android notifications
          },
          data: {
            title,              // Additional data (title)
            message,            // Additional data (message)
          },
        },
      };
  
      // Request headers
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // OAuth access token
      };
  
      // Send the POST request to FCM
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(dataToSend), // Send the JSON payload
      });
  
      // Parse the response
      const result = await response.json();
  
      // Return the result and status
      if (response.ok) {
        return { success: true, message: 'Notification sent successfully', result };
      } else {
        return { success: false, message: 'Failed to send notification', result };
      }
    } catch (error) {
      return { success: false, message: 'Error occurred while sending notification', error };
    }
  }
  export {sendNotification};
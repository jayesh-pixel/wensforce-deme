// pages/api/send-otp.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { mobile } = req.body;
  
    // Validate input
    if (!mobile || typeof mobile !== 'string') {
      return res.status(400).json({ message: 'Invalid mobile number.' });
    }
  
    const AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
  
    if (!AUTH_KEY || !TEMPLATE_ID) {
      return res.status(500).json({ message: 'Server configuration error.' });
    }
  
    const url = `https://control.msg91.com/api/v5/otp?template_id=${TEMPLATE_ID}&mobile=${mobile}&authkey=${AUTH_KEY}&otp_length=4`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
  
      return res.status(200).json({ message: 'OTP sent successfully', data });
    } catch (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  }
  
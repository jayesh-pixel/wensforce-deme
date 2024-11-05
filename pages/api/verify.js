// pages/api/verify-otp.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { otp, mobile } = req.body;

  // Validate input
  if (!otp || typeof otp !== 'string' || otp.length !== 4) {
    return res.status(400).json({ message: 'Invalid OTP.' });
  }

  if (!mobile || typeof mobile !== 'string') {
    return res.status(400).json({ message: 'Invalid mobile number.' });
  }

  const AUTH_KEY = process.env.MSG91_AUTH_KEY;

  if (!AUTH_KEY) {
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  const url = `https://api.msg91.com/api/v5/otp/verify?authkey=${AUTH_KEY}&mobile=${mobile}&otp=${otp}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.type === 'success') {
      // OTP verified successfully
      console.log(`OTP verified successfully for mobile: ${mobile}`);
      return res.status(200).json({ message: 'OTP verified successfully', data });
    } else {
      // OTP verification failed
      console.error(`OTP verification failed for mobile: ${mobile}. Error: ${data.message}`);
      return res.status(400).json({ message: data.message || 'Failed to verify OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

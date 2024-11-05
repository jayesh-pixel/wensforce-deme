// utils/encryption.js
import CryptoJS from 'crypto-js';

// **Important:** In a real-world application, store the SECRET_KEY securely.
// For demonstration purposes, it's hard-coded here.
const SECRET_KEY = 'mayank@7607890127@1516';

export const encryptId = (id) => {
  return CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
};

export const decryptId = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedId = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedId || null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

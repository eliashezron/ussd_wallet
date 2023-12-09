import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const encrypt = async (text: string) => {
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(
    text,
    process.env.ENCRYPTION_KEY as string
  ).toString();

  return ciphertext;
};

const decrypt = async text => {
  // Decrypt
  const bytes = CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText;
};

export { encrypt, decrypt };

import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import { W } from 'mongodb';

dotenv.config();

const encrypt = async (text: string) => {
    const encryptionKey = process.env.ENCRYPTION_KEY as string | undefined;
    if (!encryptionKey) {
        throw new Error('Encryption key is undefined');
      }
  // Encrypt
  const ciphertext = CryptoJS.AES.encrypt(
    text,
    encryptionKey
  ).toString();

  return ciphertext;
};

const decrypt = async (text:string) => {

    const encryptionKey = process.env.ENCRYPTION_KEY as string | undefined;

    if (!encryptionKey) {
      throw new Error('Encryption key is undefined');
    }
  // Decrypt
  const bytes = CryptoJS.AES.decrypt(text, encryptionKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText;
};

export { encrypt, decrypt };

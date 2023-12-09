import express from 'express';
import dotenv from 'dotenv';
import { encrypt, decrypt } from './Encryption/encrypt';
import createWallet from './utils/walletCreation';
import User from './models/userSchema';
import { dot } from 'node:test/reporters';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/createWallet', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const wallet = await createWallet(phoneNumber);
    res.status(200).json({
      status: 'success',
      data: wallet,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      error: error
    });
  }
});
//  listen to port
const port = process.env.PORT || 4500;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
import express from 'express';
import dotenv from 'dotenv';
import { encrypt, decrypt } from './Encryption/encrypt';
import createWallet from './utils/walletCreation';
import User from './models/userSchema';
import mongoose from 'mongoose';
import UssdMenu from "ussd-menu-builder";
import callTx from './utils/calls';


const menu = new UssdMenu();

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const mongoString = process.env.MONGO_URI as string;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
    console.log(error);
});

database.once("connected", () => {
    console.log("Database connected...");
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/create', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const wallet = await createWallet(phoneNumber);
    res.status(200).json({
      status: 'success',
      data: wallet,
    });
    console.log(wallet);
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      error: error
    });
  }
});
app.post('/tx', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const wallet = await callTx(phoneNumber);
    res.status(200).json({
      status: 'success',
      data: wallet,
    });
    console.log(wallet);
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      error: error
    });
  }
});

menu.startState({
  run: () => {
      menu.con(`Welcome to the celo USSD blockchain app`);
  },
  next: {
      '1': 'createWallet',
      '2': 'checkBalance',
      '3': 'sendMoney',
      '4': 'receiveMoney',
      '5': 'buyAirtime',
      '6': 'buyData',
      '7': 'checkWallet',
      '8': 'exit'
  }
});
menu.state('createWallet', {
  run: () => {
      menu.con('Enter your phone number');
  },
  next: {
      '*[0-9]+': 'createWallet.confirm'
  }
});
menu.state('createWallet.confirm', {
  run: async () => {
    const phoneNumber: string | undefined = menu.val; 
      const wallet = await createWallet(phoneNumber);
      menu.end(`Your wallet address is ${wallet.address}`);
  }
});
menu.state('end', {
  run: () => {
      menu.end(`send and recieve funds with your new wallet`);
  }
});
menu.state('quit', {
  run: () => {
      menu.end(`Thank you for using the celo USSD blockchain app`);
  }  
});

app.post('/ussd', (req, res) => {
  menu.run(req.body, (ussdInfo: any) => {
      res.send(ussdInfo);
  });
});
//  listen to port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
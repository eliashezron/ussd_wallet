import express from 'express';
import dotenv from 'dotenv';
import { encrypt, decrypt } from './Encryption/encrypt';
import createWallet from './utils/walletCreation';
import User from './models/userSchema';
import mongoose from 'mongoose';
import UssdMenu from "ussd-menu-builder";
import {callTx, getNativeBalance, getCusdBalance }from './utils/calls';


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

app.post('/create',  async (req, res) => {
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
}})

app.post('/tx', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const wallet = await getNativeBalance(phoneNumber);
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
      menu.con('Welcome to the celo USSD blockchain app' +
          '\n1. Create Wallet' +
          '\n2. Check Balance' +
          '\n3. Send Money' +
          '\n4. Receive Money' +
          '\n5. Buy Airtime' +
          '\n6. Buy Data' +
          '\n7. Check Wallet' +
          '\n8. Exit');
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
      const firstLine = wallet.address.slice(0, 20);
      const secondLine = wallet.address.slice(20);
      menu.con(`Your new wallet address is: \n${firstLine}-${secondLine}`+
            '\n1. end');
  },
  next: {
    '1': 'end'
  }
});
menu.state('checkBalance', {
  run: () => {
      menu.con('Enter your phone number');
  },
  next: {
      '*[0-9]+': 'checkBalance.confirm'
  }
});
menu.state('checkBalance.confirm', {
  run: async () => {
    const phoneNumber: string | undefined = menu.val; 
      const celoBalance = await getNativeBalance(phoneNumber);
      const CusdBalance = await getCusdBalance(phoneNumber);     
      menu.con(`Your wallet balance is` + `\n Celo :${celoBalance} `+ `\n CUSD :${CusdBalance}` +
      '\n1. end' );
  },
  next: {
    '1': 'end'
  }
});
menu.state('sendMoney', {
  run: () => {
      menu.con('Enter your phone number');
  },
  next: {
      '*[0-9]+': 'selectCurrencyToSend'
  }
});
menu.state('selectCurrencyToSend', {
  run: async() => {
    const phoneNumber: string | undefined = menu.val; 
    const celoBalance = await getNativeBalance(phoneNumber);
    const CusdBalance = await getCusdBalance(phoneNumber);
      menu.con('Select currency to send' +
      '\n1. Celo' + `: ${celoBalance} ` +
      '\n2. CUSD:' + `: ${CusdBalance} `);
  },
  next: {
      '1': 'Celo',
      '2': 'CUSD'
  }
});
menu.state('Celo', {
  run: () => {
      menu.con('Enter amount to send');
  },
  next: {
      '*[0-9]+': 'Celo.confirm'
  }
});
menu.state('Celo.confirm', {
  run: async () => {
    const phoneNumber: string | undefined = menu.val; 
      const celoBalance = await getNativeBalance(phoneNumber);
      menu.con(`Your wallet balance is ${celoBalance}` +
      '\n1. end' );
  },
  next: {
    '1': 'end'
  }
});
menu.state('CUSD', {
  run: () => {
      menu.con('Enter amount to send');
  },
  next: {
      '*[0-9]+': 'CUSD.confirm'
  }
});
menu.state('CUSD.confirm', {
  run: async () => {
    const phoneNumber: string | undefined = menu.val; 
      const CusdBalance = await getCusdBalance(phoneNumber);
      menu.con(`Your wallet balance is ${CusdBalance}` +
      '\n1. end' );
  },
  next: {
    '1': 'end'
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
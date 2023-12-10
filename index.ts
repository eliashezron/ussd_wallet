import express from 'express';
import dotenv from 'dotenv';
import { encrypt, decrypt } from './Encryption/encrypt';
import createWallet from './utils/walletCreation';
import User from './models/userSchema';
import mongoose from 'mongoose';
import UssdMenu from "ussd-menu-builder";
import {callTx, getNativeBalance, getCusdBalance }from './utils/calls';
// import {getSession} from africastalking;
// import africastalking from 'africastalking';

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
  },
  defaultNext: 'invalidOption'
});
menu.state('createWallet', {
  run: () => {
      menu.con('Enter your phone number');
  },
  next: {
      '*[0-9]+': 'createWallet.confirm'
  },
  defaultNext: 'invalidOption'
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
    // menu.session.set('phoneNumber', menu.val);
    console.log(phoneNumber);
    const celoBalance = await getNativeBalance(phoneNumber);
    const CusdBalance = await getCusdBalance(phoneNumber);
      menu.con('Select currency to send' +
      '\n1. Celo' + `: ${celoBalance} ` +
      '\n2. CUSD' + `: ${CusdBalance} `);
  },
  next: {
      '1': 'Celo',
      '2': 'CUSD'
  }
});
menu.state('Celo', {
  run: () => {
      menu.con('Enter address to send');
      // menu.session.set('address', menu.val);
  },
  next: {
      '*[0-9]+': 'CeloEnterAmount'
  }
});
menu.state('CeloEnterAmount', {
  run: async () => {
    // const phoneNumber: string | undefined = menu.val; 
      const phoneNumber = '128'
      const celoBalance = await getNativeBalance(phoneNumber);
      menu.con(`Your current celo balance is ${celoBalance}` +
      '\n1. Enter amount' );
      const amount = 1000;
      const address = "0x4Ac4059Ac5570f6BAE6c35BBe1a2Ab4421a3A752";
      // let tx = await callTx(phoneNumber, address, Number(amount));
      menu.end(`Your transaction was successful` );
  },
  next: {
    '1': 'end'
  }
});
menu.state('CUSD', {
  run: () => {
      menu.con('Enter amount to send');
      let phoneNumber = menu.session.get('phoneNumber');
      let amount = menu.val;
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


app.post('/ussd', async (req, res) => {
  let args = {
      phoneNumber: req.body.phoneNumber,
      sessionId: req.body.sessionId,
      serviceCode: req.body.serviceCode,
      Operator: req.body.networkCode || req.body.Operator,
      text: req.body.text
  };
  let resMsg = await menu.run(args);
  res.send(resMsg);
})

//  listen to port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});   
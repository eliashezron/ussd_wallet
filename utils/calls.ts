import * as dotenv from "dotenv";
import { Wallet } from "ethers";
import { decrypt } from "../Encryption/encrypt";

import {
  Bundler,
  CandideAccount,
} from "abstractionkit";
import User from "../models/userSchema";
  
dotenv.config();

const callTx = async (phoneNumber: string) => {

    try{

          //get values from .env
  const bundlerUrl = process.env.BUNDLER_URL as string;
  const entrypointAddress = process.env.ENTRYPOINT_ADDRESS as string;
  const key = await User.findOne({ phoneNumber: phoneNumber });
  console.log("key : " + key);
    const privateKey = await decrypt(key.PrivateKey);
    console.log("privateKey : " + privateKey);

  // Define our Bundler endpoint where we will be sending our userOp
  const bundler: Bundler = new Bundler(bundlerUrl, entrypointAddress);
  
  // Initiate the owner of our Candide Account (EOA)
  const eoaSigner = new Wallet(privateKey);
  
  const smartAccount = new CandideAccount();

  // Generate the new account address and initCode
  let [newAccountAddress, initCode] = smartAccount.createNewAccount([
    eoaSigner.address,
  ]);

  console.log("Account address(sender) : " + newAccountAddress);

  //send 5 wei to 0x1a02592A3484c2077d2E5D24482497F85e1980C6
let callData = smartAccount.createSendEthCallData(
    "0x1a02592A3484c2077d2E5D24482497F85e1980C6", // random address
    5 // 5 wei
  );
 console.log("callData : " + callData);
    }catch(error: any){
        console.error(error);
        throw error;
    }

}

export default callTx;
import * as dotenv from "dotenv";
import { Wallet } from "ethers";
import { decrypt } from "../Encryption/encrypt";
import abi from "../constants/abi.json";
import {
  Bundler,
  CandideAccount,
} from "abstractionkit";
import User from "../models/userSchema";
import {ethers } from "ethers";
  
dotenv.config();   
    const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_NODE_PROVIDER as string);
          //get values from .env
    const bundlerUrl = process.env.BUNDLER_URL as string;
    const entrypointAddress = process.env.ENTRYPOINT_ADDRESS as string;

    const getSmartAccount = async (phoneNumber: string) => {
        try {
            const user = await User.findOne({phoneNumber });
            
            if (!user) {
                throw new Error('User not found');
              }
              console.log(user);
              const privateKey = await decrypt(user.PrivateKey);
            // Define our Bundler endpoint where we will be sending our userOp
            const bundler: Bundler = new Bundler(bundlerUrl, entrypointAddress);
            // Initiate the owner of our Candide Account (EOA)
            const eoaSigner = new Wallet(privateKey,  provider);
            const smartAccount = new CandideAccount();
            // Generate the new account address and initCode
            let [newAccountAddress, initCode] = smartAccount.createNewAccount([
              eoaSigner.address,
            ]); 
            console.log("Account address(sender) : " + newAccountAddress);
            return {smartAccount, eoaSigner};
        } catch (error) {
            console.error(error);
        throw error;
        }
    };

    const getRegisteredSmartAccount = async (phoneNumber: string) => {
        try {
            const key = await User.findOne({phoneNumber });          
            const privateKey = await decrypt(key.PrivateKey);
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
            return {smartAccount, eoaSigner};
        } catch (error) {
            console.error(error);
        throw error;
        }
    };

const callTx = async (phoneNumber: string) => {

    try{
        const {smartAccount}= await getSmartAccount(phoneNumber);
  //send 5 wei to 0x1a02592A3484c2077d2E5D24482497F85e1980C6
        let callData = smartAccount.createSendEthCallData(
    "0x1a02592A3484c2077d2E5D24482497F85e1980C6", // random address
    500000000000 // 5 wei
  );
 console.log("callData : " + callData);
    }catch(error: any){
        console.error(error);
        throw error;
    }

}

const getNativeBalance = async (phoneNumber: string) => {
    try {
        const {eoaSigner} = await getSmartAccount(phoneNumber);
        const balance = await eoaSigner.getBalance();
        console.log("balance : " + balance);
        return ethers.utils.formatEther(balance.toString());
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const getCusdBalance = async (phoneNumber: string) => {
    try {
        const {eoaSigner} = await getSmartAccount(phoneNumber);
        const cusdAddress = "0x874069fa1eb16d44d622f2e0ca25eea172369bc1"
        const cusdContract = new ethers.Contract(cusdAddress, abi, eoaSigner);
        const balance = await cusdContract.balanceOf(eoaSigner.address);
        console.log("balance : " + ethers.utils.formatEther(balance.toString()));
        return ethers.utils.parseEther(balance.toString());
    } catch (error) {
        console.error(error);
        throw error;
    }
}; 

export {callTx, getNativeBalance, getCusdBalance };
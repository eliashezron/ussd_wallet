import * as dotenv from "dotenv";
import { ethers, Wallet,  getBytes, toBeHex, JsonRpcProvider} from "ethers";
import { decrypt } from "../Encryption/encrypt";
import abi from "../constants/abi.json";
import {
  Bundler,
  CandideAccount, getUserOperationHash, UserOperation,
  UserOperationEmptyValues,
  GasEstimationResult,
} from "abstractionkit";
import User from "../models/userSchema";
  
dotenv.config();   
    const provider = new JsonRpcProvider(process.env.JSON_RPC_NODE_PROVIDER as string);
    const bundlerUrl = process.env.BUNDLER_URL as string;
    const entrypointAddress = process.env.ENTRYPOINT_ADDRESS as string;
    const bundler: Bundler = new Bundler(bundlerUrl, entrypointAddress);
    
    const getSmartAccount = async (phoneNumber: string) =>  {
        try {
            const user = await User.findOne({phoneNumber });
            if (!user) {
                throw new Error('User not found');
              }
              console.log(user);
              const privateKey = '54404542639bead4c8da741f543e4fe16ef8cd6a9b1ecf43df65d551937976f7';
              console.log('decryptedPrivate Key:', privateKey);
              const eoaSigner = new Wallet(privateKey);
              console.log("publickey",eoaSigner.address);
            const smartAccount = new CandideAccount();
            const [newAccountAddress, initCode] = smartAccount.createNewAccount([
                eoaSigner.address,
              ]);
            console.log("Account Abstraction address(sender) : " , newAccountAddress);
            return {smartAccount, eoaSigner, newAccountAddress,initCode};
        } catch (error) {
            console.error(error);
        throw error;
        } 
    };

const callTx = async (phoneNumber: string) => {
    try{
        const {smartAccount,newAccountAddress, initCode, eoaSigner} = await getSmartAccount(phoneNumber);
       
        let callData = smartAccount.createSendEthCallData(
            "0x4Ac4059Ac5570f6BAE6c35BBe1a2Ab4421a3A752", 
            5
          );
        let user_operation: UserOperation = {
            ...UserOperationEmptyValues,
            sender: newAccountAddress,
            nonce: "0x00",
            initCode,
            callData, 
          };
          
          let estimation = await bundler.estimateUserOperationGas(user_operation) as GasEstimationResult;
          
          // catch errors if there's any in the estimateUserOperationGas call
          if ("code" in estimation) {
            console.log("error in estimation", estimation);
            return
          }
          
          user_operation.preVerificationGas = "0x" + Math.ceil(Number(estimation.preVerificationGas)*1.2).toString(16)
          user_operation.verificationGasLimit = "0x" + Math.ceil(Number(estimation.verificationGasLimit)*1.5).toString(16)
          user_operation.callGasLimit = "0x" + Math.ceil(Number(estimation.callGasLimit)*1.2).toString(16)

          const feeData = await provider.getFeeData();
          
          if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            user_operation.maxFeePerGas = toBeHex(
              Math.round(Number(feeData.maxFeePerGas) * 1.5)
            );
          
            user_operation.maxPriorityFeePerGas = toBeHex(
              Math.round(Number(feeData.maxFeePerGas) * 1.5)
            );
          }
            console.log("callData : " + callData);
            const chainId = process.env.CHAIN_ID as string;

            const user_operation_hash = getUserOperationHash(
            user_operation,
            entrypointAddress,
            '44787'
            );
            // console.log("user_operation_hash : " + user_operation_hash);

            user_operation.signature = await eoaSigner.signMessage(
            getBytes(user_operation_hash)
            );

            const bundlerResponse = await bundler.sendUserOperation(user_operation);

            console.log(bundlerResponse, "bundlerResponse");

            if ("message" in bundlerResponse && (bundlerResponse.message as string) == "AA21 didn't pay prefund") {
                console.log("Please fund the new account address with some alfajores celo to pay for gas : " + newAccountAddress);
            }

    }catch(error: any){
        console.error(error);
        throw error;
    }
}

const getNativeBalance = async (phoneNumber: string) => {
    try {
        const {eoaSigner} = await getSmartAccount(phoneNumber);
        const balance = await provider.getBalance(eoaSigner.address);
        console.log("balance : " + balance);
        return ethers.formatEther(balance.toString());
        return balance;
    } catch (error) {
        console.error(error);
        throw error;
    }
};  
const getAABalance = async (phoneNumber: string) => {
    try {
        const {newAccountAddress,} = await getSmartAccount(phoneNumber);
        const balance = await provider.getBalance(newAccountAddress);
        console.log("balance : " + balance);
        return ethers.formatEther(balance.toString());
        return balance;
    } catch (error) {
        console.error(error);
        throw error;
    }
};  
const getCusdBalance = async (phoneNumber: string) => {
    try {
        const {eoaSigner} = await getSmartAccount(phoneNumber);
        const cusdAddress = "0x874069fa1eb16d44d622f2e0ca25eea172369bc1"
        const cusdContract = new ethers.Contract(cusdAddress, abi, provider);
        const balance = await cusdContract.balanceOf(eoaSigner.address);
        // console.log("balance : " + ethers.utils.formatEther(balance.toString()));
        return ethers.parseEther(balance.toString());
        return balance;
    } catch (error) {
        console.error(error);
        throw error;
    } 
}; 

export {callTx, getNativeBalance, getCusdBalance , getAABalance, getSmartAccount};
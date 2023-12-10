import { ethers, Wallet } from "ethers"
import User from '../models/userSchema';
import { encrypt } from '../Encryption/encrypt';
import {
    Bundler,
    CandideAccount
  } from "abstractionkit";
import e from "express";
const createWallet = async (phoneNumber:string) => {
    try {
        if (!phoneNumber) {
            throw new Error('Invalid phone number');
        }

        const isUser = await User.findOne({ phoneNumber: phoneNumber as string });
        console.log('Is User:', isUser);

        if (isUser) {
            console.log('User already exists');
            throw new Error('User already exists');
        }
        const bundlerUrl = process.env.BUNDLER_URL as string;
        const entrypointAddress = process.env.ENTRYPOINT_ADDRESS as string;
        

         const bundler: Bundler = new Bundler(bundlerUrl, entrypointAddress);
  
     // Initiate the owner of our Candide Account (EOA)
    //   const eoaSigner = new Wallet(privateKey);
  
        const smartAccount = new CandideAccount();
        console.log('Smart Account:', smartAccount);
        const wallet = Wallet.createRandom();
        
        const encryptedPrivateKey = await encrypt(wallet.privateKey);
        console.log('decryptedPrivate Key:', wallet.privateKey);
        const PublicAddress = await wallet.address;
        
        const eoaSigner = new Wallet(wallet.privateKey);
        // Generate the new account address and initCode
     let [newAccountAddress, initCode] = smartAccount.createNewAccount([
    eoaSigner.address,
    ]);
    console.log("Account Abstraction address(sender) : " + newAccountAddress);
    console.log("Account address : " + wallet.address);
    // console.log("initCode : " + initCode);
        const user = new User({
            // mnemonic: encryptedMnemonic,
            PublicAddress: PublicAddress,
            PrivateKey: encryptedPrivateKey,
            AA_address: newAccountAddress,
            phoneNumber: phoneNumber,
        });
        await user.save();
        return {wallet, newAccountAddress};
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

export default createWallet;
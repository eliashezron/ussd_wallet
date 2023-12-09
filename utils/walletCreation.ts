import { ethers, Wallet } from "ethers"
import User from '../models/userSchema';
import { encrypt } from '../Encryption/encrypt';
import {
    Bundler,
    CandideAccount,
  } from "abstractionkit";
const createWallet = async (phoneNumber:string) => {
    try {
        const isUser = await User.findOne({ phoneNumber: phoneNumber });
        if (isUser) {
            throw new Error('User already exists');
        }
        const bundlerUrl = process.env.BUNDLER_URL as string;
  const entrypointAddress = process.env.ENTRYPOINT_ADDRESS as string;
//   const privateKey = process.env.PRIVATE_KEY as string;
        // Define our Bundler endpoint where we will be sending our userOp
  const bundler: Bundler = new Bundler(bundlerUrl, entrypointAddress);
  
  // Initiate the owner of our Candide Account (EOA)
//   const eoaSigner = new Wallet(privateKey);
  
  const smartAccount = new CandideAccount();
        const wallet = Wallet.createRandom();
        const encryptedMnemonic = await encrypt(wallet.mnemonic.phrase);
        const encryptedPrivateKey = await encrypt(wallet.privateKey);
        const PublicAddress = await wallet.address;
        // const encryptedAddress = await wallet.address;
        const eoaSigner = new Wallet(wallet.privateKey);
         // Generate the new account address and initCode
     let [newAccountAddress, initCode] = smartAccount.createNewAccount([
    eoaSigner.address,
    ]);
    console.log("Account Abstraction address(sender) : " + newAccountAddress);
    console.log("Account address : " + wallet.address);
        const user = new User({
            mnemonic: encryptedMnemonic,
            PublicAddress: PublicAddress,
            PrivateKey: encryptedPrivateKey,
            AA_address: newAccountAddress,
        });
        await user.save();
        return wallet;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

export default createWallet;
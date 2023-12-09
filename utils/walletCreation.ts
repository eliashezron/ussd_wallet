import { ethers, Wallet } from "ethers"
import User from '../models/userSchema';
import { encrypt } from '../Encryption/encrypt';

const createWallet = async (phoneNumber:string) => {
    try {
        const isUser = await User.findOne({ phoneNumber: phoneNumber });
        if (isUser) {
            throw new Error('User already exists');
        }
        const wallet = Wallet.createRandom();
        const encryptedMnemonic = await encrypt(wallet.mnemonic.phrase);
        const encryptedPrivateKey = await encrypt(wallet.privateKey);
        const PublicAddress = await wallet.publicKey;
        const encryptedAddress = await encrypt(wallet.address);
        const user = new User({
            mnemonic: encryptedMnemonic,
            PublicAddress: PublicAddress,
            PrivateKey: encryptedPrivateKey,
            AA_address: encryptedAddress,
        });
        await user.save();
        return wallet;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

export default createWallet;
import mongoose, { Schema} from "mongoose"

const userSchema : Schema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        default: '256',
    },
    password: {
        type: String,
        // required: false,
    },
    country: {
        type: String,
        default: 'UGX',
    },
    mnemonic: {
        type: String,
      },
    PublicAddress: {
        type: String,
        // required: false,
    },
    PrivateKey: {
        type: String,
        // required: false,
    },
    AA_address: {
        type: String,
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }, 
 },
);

const User: any = mongoose.model(`wallets`, userSchema)

export default User
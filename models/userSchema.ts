import mongoose, { Schema} from "mongoose"

const userSchema : Schema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: 'UGX',
    },
    mnemonic: {
        type: String,
      },
    PublicKey: {
        type: String,
        required: true,
    },
    PrivateKey: {
        type: String,
        required: true,
    },
    AA_address: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }, 
 },
);

const userSchemaModel: any = mongoose.model(`orders`, userSchema)

export default userSchemaModel
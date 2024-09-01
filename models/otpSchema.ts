import { Schema, model } from "mongoose"

interface Iotp {
    email:string,
    username: string,
    otp:string,
    createdAt?: Date
}

const OtpSchema=new Schema<Iotp>({
    email: {
        type: String, 
        required: true 
    },
    username: {
        type: String, 
        required: true 
    },
    otp: {
        type: String, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '15m'
    }
}, { timestamps:true })

export default model<Iotp>("JobVentures Otp", OtpSchema)
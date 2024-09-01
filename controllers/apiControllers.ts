import { Response } from "express"
import {Requests} from "../utils/def"
import userSchema from "../models/userSchema"
import empSchema from "../models/empSchema"
import otpSchema from "../models/otpSchema"
import { sendVerificationEmail } from "../utils/mail"


const sendOTP = async (req: Requests, res: Response) => {
    try {
        const { email, username, usertype } = req.body
        if (!email || !username)
            return res.status(403).json({ error: "Email and username fields are mandatory" })
        let userData
        if(usertype==='user')
        userData = await userSchema.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })
        else
        userData = await empSchema.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })
        if (userData) {
            return res.status(409).json({ error: "User with this email or username already exists" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000)
        await sendVerificationEmail(email, otp)
        await otpSchema.create({
            email, username, otp
        })
        return res.status(200).json({ msg: 'Check mail for otp' })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error sending verification email' })
    }
}

const all_exports = {
    sendOTP
}

export default all_exports


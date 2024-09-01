import { Response } from "express"
import { Requests } from "../utils/def"
import axios from 'axios'
import empSchema from "../models/empSchema"
import userSchema from "../models/userSchema"
import otpSchema from "../models/otpSchema"


interface Query {
    email?: string
    username?: string
}

interface IjobApplicantData {
    name: string,
    username: string,
    email: string,
    resume: string,
    coverLetter: string
}

interface IjobPosted {
    jobTitle: string,
    jobDescription: string,
    jobQualifications: string,
    jobPayRange: string,
    isAccepting?: boolean,
    jobApplicants?: number,
    jobApplicantData?: [IjobApplicantData]
}


const genTokens = async (userId: string) => {
    try {
        const user = await empSchema.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        return {}
    }
}


const register = async (req: Requests, res: Response) => {
    try {
        const { name, email, username, mobile, password, company, otp } = req.body
        if (!name || !email || !username || !password || !company || !otp)
            return res.status(403).json({ error: "All the fields are mandatory" })
        const userCheck = await empSchema.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })
        if (userCheck)
            return res.status(409).json({ error: "Account already exists for this email or username as user/employee" })
        const empData = await empSchema.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })
        if (empData) {
            return res.status(409).json({ error: "Employer with this email or username already exists" })
        }
        const otpValid = await otpSchema.findOne({
            $and: [
                { email: email },
                { username: username },
                { otp: otp }
            ]
        })
        if (!otpValid)
            return res.status(404).json({ error: "Wrong OTP" })
        const newEmp = await empSchema.create({
            name, email, username, mobile, password, company
        })
        await otpSchema.deleteOne({ _id: otpValid._id })
        const { accessToken, refreshToken } = await genTokens((newEmp._id).toString())

        return res
            .status(201)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json({ message: "Registered successfully", accessToken, refreshToken })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error occured while registering user' })
    }
}

const login = async (req: Requests, res: Response) => {
    try {
        const { email, username, password } = req.body
        if ((!email && !username) || !password)
            return res.status(403).json({ error: "All the fields are mandatory" })
        const query: Query = {}
        if (email)
            query.email = email
        if (username)
            query.username = username
        const empData = await empSchema.findOne(query)
        if (!empData) {
            return res.status(409).json({ error: "Employer with this email or username does not exists" })
        }
        const checkPassword = await empData.match(password)
        if (!checkPassword)
            return res.status(401).json({ error: "Wrong credentials" })
        const { accessToken, refreshToken } = await genTokens((empData._id).toString())

        return res
            .status(201)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json({ message: "Logged in successfully", accessToken, refreshToken })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error occured while registering the employer' })
    }
}

const postJobs = async (req: Requests, res: Response) => {
    try {
        const { username, jobData }: { username: string; jobData: IjobPosted[] } = req.body
        if (!jobData)
            return res.status(400).json({ error: "All the fields are necessary to post a job." })
        const updatedUser = await empSchema.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    jobPosted: { $each: jobData }
                }
            },
            { new: true, runValidators: true }
        )
        // console.log(updatedUser)
        return res.status(201).json({ error: 'Successfully posted the job.' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error occured while posting the job.' })
    }
}



const all_exports = {
    register,
    login,
    postJobs
}

export default all_exports


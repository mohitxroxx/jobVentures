import { Response } from "express"
import { Requests } from "../utils/def"
import axios, { all } from 'axios'
import userSchema from '../models/userSchema'
import empSchema from "../models/empSchema"
import otpSchema from "../models/otpSchema"
import mongoose from "mongoose"

interface Query {
    email?: string
    username?: string
}

interface IExperience {
    duration:string,
    company:string,
    jobTitle:string
}




const genTokens = async (userId: string) => {
    try {
        const user = await userSchema.findById(userId)
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
        const { name, email, username, mobile, password, otp } = req.body
        if (!name || !email || !username || !password || !otp)
            return res.status(403).json({ error: "All the fields are mandatory" })    
        const empCheck = await empSchema.findOne({
            $or: [
                { email: email },
                { username: username }
            ]    
        })
        if (empCheck)
            return res.status(409).json({ error: "Account already exists for this email or username as Employer" })
        const userData = await userSchema.findOne({
            $or: [
                { email: email },
                { username: username }
            ]    
        })    
        if (userData) {
            return res.status(409).json({ error: "User with this email or username already exists" })
        }    
        const otpValid=await otpSchema.findOne({
            $and: [
                { email: email },
                { username: username },
                {otp: otp}
            ]    
        })
        if(!otpValid)
            return res.status(404).json({error: "Wrong OTP"})
        const newUser = await userSchema.create({
            name, email, username, mobile, password
        })
        await otpSchema.deleteOne({ _id: otpValid._id })    
        const { accessToken, refreshToken } = await genTokens((newUser._id).toString())

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
        const userData = await userSchema.findOne(query) 
        if (!userData) {
            return res.status(409).json({ error: "User with this email or username does not exists" })
        }    
        const checkPassword= await userData.match(password) 
        if(!checkPassword)
            return res.status(401).json({error:"Wrong credentials"})
        const { accessToken, refreshToken } = await genTokens((userData._id).toString())

        return res
            .status(201)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
            .json({ message: "Logged in successfully", accessToken, refreshToken })

    } catch (error) {    
        console.error(error)
        return res.status(500).json({ error: 'Error occured while registering user' })
    }    
}    

const updateProfile = async(req:Requests, res:Response)=>{
    try {
        const { username, education, college, location, expectedSalary, prefferedWorkType } = req.body
        if(!username)
            return res.status(403).json({error:"username is required"})
        const updatedUser = await userSchema.findOneAndUpdate(
            {username:username},
            {
                $set: {
                    education, college, location, expectedSalary, prefferedWorkType
                }
            },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({message:"User data updated"})
    } catch (error) {
        console.log(error)
        return res.status(200).json({message:"Error updating the user data"})
    }
}

const updateSkills = async(req:Requests, res:Response)=>{
    try {
        const { username, skills} = req.body
        if(!username)
            return res.status(403).json({message:"username is required"})
        const user = await userSchema.findOne({username:username})
        if(!user)
            return res.status(404).json({error:"User not found"})

        const newSkills=skills.filter((skill:string)=>!user.skill.includes(skill))

        if(newSkills.length===0)
            return res.status(200).json({message:"No new skills to add, these skills already exists."})

        const updatedUser = await userSchema.findOneAndUpdate(
            {username:username},
            {
                $push: {
                    skill: { $each: newSkills }
                }
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({message:"Skils updated"})
    } catch (error) {
        console.log(error)
        return res.status(200).json({message:"Error updating the user data"})
    }
}

const updateExp = async(req:Requests, res:Response)=>{
    try {
        const { username, experiences}: { username: string; experiences: IExperience[] } = req.body
        if(!username)
            return res.status(403).json({message:"username is required"})
        const user = await userSchema.findOne({username:username})
        if(!user)
            return res.status(404).json({error:"User not found"})
        const existingExperiences=user.experience.map(exp=>({
            company:exp.company,
            jobTitle:exp.jobTitle
        }))

        const newExperiences= experiences.filter((newExp:IExperience)=>{
            return !existingExperiences.some(exp=>
                exp.company===newExp.company && exp.jobTitle===newExp.jobTitle
            )
        })
        if (newExperiences.length === 0) {
            return res.status(200).json({ message: "No new experiences to add" })
        }

        const updatedUser = await userSchema.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    experience: { $each: newExperiences }
                }
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({message:"Experiences updated"})
    } catch (error) {
        console.log(error)
        return res.status(200).json({message:"Error updating the user data"})
    }
}



const applyJob = async(req:Requests, res:Response)=>{
    try {
        const { jobId, username, email, resume, coverLetter} = req.body
        const userCheck = await userSchema.findOne(
                { username: username }
        )
        if (!userCheck)
            return res.status(409).json({ error: "No account exists for this username" })
        if (!mongoose.Types.ObjectId.isValid(jobId)) 
            return res.status(400).json({ error: "Invalid job ID." })
        const jobDetail = await empSchema.aggregate([
            { $match: { 'jobPosted._id': new mongoose.Types.ObjectId(jobId) } },
            { $unwind: '$jobPosted' },
            { $match: { 'jobPosted._id': new mongoose.Types.ObjectId(jobId) } },
            { $project: { jobPosted: 1, _id: 0 } }
        ])
        const jobData=jobDetail.flatMap(it=>it.jobPosted)
        console.log(jobData)
        const employer = await empSchema.findOne({ 'jobPosted._id': jobId })
        const job=[{
            jobId:jobId, jobTitle:jobData[0].jobTitle, companyName:jobData[0].companyName, postedBy: employer.username
        }]
        const updateAppliedUser = await userSchema.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    appliedJobs: { $each: job }
                }
            },
            { new: true, runValidators: true }
        )
        const applicantData={
            username,email,resume,coverLetter
        }
        const updateJobEmp = await empSchema.findOneAndUpdate(
            { 'jobPosted._id': new mongoose.Types.ObjectId(jobId) },
            {
                $inc: { 'jobPosted.$.jobApplicants': 1 },
                $push: { 'jobPosted.$.jobApplicantData': applicantData }
            },
            { new: true, runValidators: true }
        )
        return res.status(201).json({msg:"Successfully applied for the job."})
    } catch (error) {
        console.error(error)
        return res.status(400).json({error:"Error applying for the job"})
    }
}

const displayAllJobs=async(req:Requests,res:Response)=>{
    try {
        const allJobs= await empSchema.find({},{jobPosted:1,_id:0})
        const jobs=allJobs.flatMap(it=>it.jobPosted)
        return res.status(200).json(jobs)
    } catch (error) {
        return res.status(400).json({error:"Error occured while fetching data"})
    }
}

const all_exports = {
    register,
    login,
    updateProfile,
    updateSkills,
    updateExp,
    applyJob,
    displayAllJobs
}

export default all_exports


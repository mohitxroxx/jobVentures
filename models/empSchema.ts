import { Schema, model } from "mongoose"
import { hash, compare } from "bcrypt"
import jwt from "jsonwebtoken"

interface IjobApplicantData{
    username: string,
    email: string,
    resume: string,
    coverLetter: string
}

interface IjobPosted{
    jobTitle: string,
    jobDescription: string,
    jobQualifications: string,
    companyName:string,
    jobPayRange: string,
    isAccepting: boolean,
    jobApplicants?: number,
    jobApplicantData?: [IjobApplicantData]
}

interface IEmp {
    name: string,
    email: string,
    username: string,
    mobile:string,
    password: string,
    company: string,
    jobPosted: [IjobPosted],
    refreshToken: string,
    match: (password: string) => Promise<boolean>,
    generateAccessToken(): string,
    generateRefreshToken(): string
}


const jobApplicantsSchema = new Schema<IjobApplicantData>({
    username:{
        type:String,
        required: true,
        trim: true
    },
    email:{
        type:String,
        required: true,
        trim: true
    },
    resume:{
        type:String,
        required: true,
        trim: true
    },
    coverLetter:{        
        type:String,
        required: true,
        trim: true
    }
}, { timestamps:true })

const jobPostedSchema = new Schema<IjobPosted>({
    jobTitle:{
        type:String,
        required: true,
        trim: true
    },
    jobDescription:{
        type:String,
        required: true,
        trim: true
    },
    jobQualifications:{
        type:String,
        required: true,
        trim: true
    },
    jobPayRange:{
        type:String,
        required: true,
        trim: true
    },
    companyName:{
        type:String,
        required: true,
        trim: true
    },
    jobApplicants:{
        type:Number,
        default: 0
    },
    isAccepting:{
        type:Boolean,
        default:true
    },
    jobApplicantData:{
        type:[jobApplicantsSchema]
    }
}, { timestamps:true })

const EmpSchema = new Schema<IEmp>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true 
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    mobile: {
        type: String,
        trim: true
    },
    password: { 
        type: String,
        required: true 
    },
    company: { 
        type: String,
        required: true 
    },
    jobPosted: { 
        type: [jobPostedSchema]
    },
    refreshToken:{
        type:String
    }
}, { timestamps:true })

EmpSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hash(this.password, 10)
    }
    next()
})

EmpSchema.methods.match = async function (password: string) {
    return compare(password, this.password)
}

EmpSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET_EMPLOYER,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY_EMPLOYER
        }
    )
}
EmpSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_EMPLOYER,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY_EMPLOYER
        }
    )
}

export default model<IEmp>("JobVentures Employer", EmpSchema)

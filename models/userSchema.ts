import { Schema, model } from "mongoose"
import { hash, compare } from "bcrypt"
import jwt from "jsonwebtoken"

interface IExperience {
    duration:string,
    company:string,
    jobTitle:string
}
interface IappliedJobs {
    jobId:string,
    jobTitle:string,
    companyName:string,
    postedBy:string,
}

enum WorkType {
    Remote = "Remote",
    OnSite = "OnSite",
    Hybrid = "Hybrid"
}

interface IUser {
    name: string,
    email: string,
    username: string,
    mobile:string,
    password: string,
    role:string,
    education: string,
    college: string,
    location:string,
    resume: string,
    expectedSalary: string,
    skill: [string],
    experience: [IExperience],
    prefferedWorkType: WorkType,
    prefferedLocations: string,
    appliedJobs: [IappliedJobs],
    refreshToken: string, 
    match: (password: string) => Promise<boolean>,
    generateAccessToken(): string,
    generateRefreshToken(): string
}

const appliedJobSchema=new Schema<IappliedJobs>({
    jobId: {
        type: String, 
        required: true 
    },
    jobTitle: {
        type: String, 
        required: true 
    },
    companyName: {
        type: String, 
        required: true 
    },
    postedBy: {
        type: String, 
        required: true 
    }
})

const ExperienceSchema=new Schema<IExperience>({
    duration: {
        type: String, 
        required: true 
    },
    company: {
        type: String, 
        required: true 
    },
    jobTitle: {
        type: String, 
        required: true 
    }
})

const UserSchema = new Schema<IUser>({
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
    role: {
        type: String,
        default: "user"
    },
    education: { 
        type: String,
        default:""
    },
    college: { 
        type: String,
        default:""
    },
    location: { 
        type: String,
        default:""
    },
    resume: { 
        type: String,
        default:"",
        // unique: true
    },
    expectedSalary: { 
        type: String,
        default:""
    },
    prefferedWorkType: { 
        type: String,
        enum: Object.values(WorkType)
    },
    skill: {
        type: [String]
    },
    experience: {
        type: [ExperienceSchema]
    },
    appliedJobs:{
        type:[appliedJobSchema]
    },
    refreshToken: {
        type: String
    },
}, { timestamps:true })

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hash(this.password, 10)
    }
    next()
})

UserSchema.methods.match = async function (password: string) {
    return compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET_USER,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY_USER
        }
    )
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_USER,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY_USER
        }
    )
}

export default model<IUser>("JobVentures User", UserSchema)

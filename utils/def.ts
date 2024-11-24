import { Request } from 'express'

declare module 'express-session' {
    interface SessionData {
        views: number
    }
}
interface User {
    username: string
    role: string
}
export interface Requests extends Request {
    user: User
}

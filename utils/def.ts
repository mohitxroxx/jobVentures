import { Request } from 'express'

declare module 'express-session' {
    interface SessionData {
        views: number
    }
}

export interface Requests extends Request {
    user: string
}

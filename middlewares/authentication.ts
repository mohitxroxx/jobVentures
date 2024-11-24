import jwt,{JwtPayload} from 'jsonwebtoken'
import { Requests } from '../utils/def'
import { Response, NextFunction } from 'express'

const authentication = (req:Requests, res:Response, next:NextFunction) => {
    const token = req.cookies.accessToken
    if (token) {
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
            req.user = {
                username: data.username,
                role: data.role
            };
        } catch (err) {
            next(err)
        }
    }
    next();
}

export default authentication
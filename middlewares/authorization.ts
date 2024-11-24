import { Requests } from '../utils/def'
import { Response, NextFunction } from 'express'

const roles = ['employer', 'employee', 'admin'];


const authorization = (role:string) => {
    return (req:Requests, res:Response, next:NextFunction) => {
        if (!req.user) {
            return res.status(401).redirect('/user/login');
        }
        if (roles.indexOf(req.user.role) > roles.indexOf(role)) {
            return res.status(403).json({
                message: 'forbidden'
            });
        }
        next();
    }
}
 
export default authorization
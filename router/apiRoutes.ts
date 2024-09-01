import { Router } from "express";
import ctrl from '../controllers/apiControllers'
const app: Router = Router();


app.post('/sendotp',ctrl.sendOTP)

export default app
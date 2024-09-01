import { Router } from "express";
import ctrl from '../controllers/empControllers'
const app: Router = Router();


app.post('/register',ctrl.register)
app.post('/login',ctrl.login)
app.post('/addjob',ctrl.postJobs)

export default app
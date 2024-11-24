import { Router } from "express";
import ctrl from '../controllers/empControllers'
import authorization from "../middlewares/authorization";
const app: Router = Router();


app.post('/register', ctrl.register)
app.post('/login', ctrl.login)
app.post('/addjob', authorization('employer'), ctrl.postJobs)

export default app
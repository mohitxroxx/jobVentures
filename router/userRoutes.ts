import { Router } from "express";
import ctrl from '../controllers/userControllers'
const app: Router = Router();


app.post('/register',ctrl.register)
app.post('/login',ctrl.login)
app.put('/update',ctrl.updateProfile)
app.put('/skills',ctrl.updateSkills)
app.put('/exp',ctrl.updateExp)
app.post('/apply',ctrl.applyJob)
app.get('/jobs',ctrl.displayAllJobs)

export default app
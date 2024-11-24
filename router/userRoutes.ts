import { Router } from "express";
import ctrl from '../controllers/userControllers'
import authorization from '../middlewares/authorization'
const app: Router = Router();


app.post('/register', ctrl.register)
app.post('/login', ctrl.login)
app.put('/update', authorization('employee'), ctrl.updateProfile)
app.put('/skills', authorization('employee'), ctrl.updateSkills)
app.put('/exp', authorization('employee'), ctrl.updateExp)
app.post('/apply', authorization('employee'), ctrl.applyJob)
app.get('/jobs', authorization('employee'), ctrl.displayAllJobs)

export default app
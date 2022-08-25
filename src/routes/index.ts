import { Router } from 'express'
import authRoute from './auth.route'
import userRoute from './user.route'
import authorizationRoute from './authorization.route'
//import relatoryRoute from './relatory.route'

const router = Router()

router.use('/auth', authRoute)
router.use('/user', userRoute)
router.use('/authorization', authorizationRoute)
//router.use('/relatory', relatoryRoute)

export default router
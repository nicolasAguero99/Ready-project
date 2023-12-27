import { Router } from 'express'

// Constants
import { USERS_URL } from '../../constants/constants.js'

// Controllers
import AchievementsController from '../controllers/achievements.js'

const achievementsRouter = Router()

// Get achievements by id
achievementsRouter.get('/', AchievementsController.getAchievementsById)

// Get achievements by user
achievementsRouter.get(`/${USERS_URL}/:userId`, AchievementsController.getAchievementsByUser)

// Achievements add
achievementsRouter.post('/add', AchievementsController.addAchievements)

export default achievementsRouter

import { Router } from 'express'

// Constants
import { PROJECTS_URL } from '../../constants/constants.js'

// Controllers
import ActivitiesController from '../controllers/activities.js'

const activityRouter = Router()

// Get all activity by user
activityRouter.get(`/${PROJECTS_URL}/getAll`, ActivitiesController.getActivities)

// Get activity by project
activityRouter.get(`/${PROJECTS_URL}/:currentProject`, ActivitiesController.getActivitiesByProject)

export default activityRouter

import { Router } from 'express'

// Constants
import { PROJECT_URL, URL_COMMENTS, USERS_URL } from '../../constants/constants.js'

// Middlewares
import { tokenVerify } from '../middlewares/middlewares.js'

// Controllers
import TasksController from '../controllers/tasks.js'

const tasksRouter = Router()

// Get all tasks
tasksRouter.get('/', TasksController.getAllTasks)

// Find task by ID
tasksRouter.get('/:id', TasksController.getById)

// Get all tasks by current user
tasksRouter.get(`/${USERS_URL}/:currentUserId`, TasksController.getTasksByUser)

// Get tasks by project
tasksRouter.get(`/${PROJECT_URL}:projectName`, tokenVerify, TasksController.getTasksByProject)

// Add comment to task
tasksRouter.post(`/${URL_COMMENTS}/add`, TasksController.addComment)

export default tasksRouter

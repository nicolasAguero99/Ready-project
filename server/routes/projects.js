import { Router } from 'express'

// Middlewares
import { tokenVerify } from '../middlewares/middlewares.js'

// Controllers
import ProjectsController from '../controllers/projects.js'

const projectsRouter = Router()

// Projects get
projectsRouter.get('/get', ProjectsController.getProjectsByUser)

// Projects add
projectsRouter.post('/add', ProjectsController.addProject)

// Project get name
projectsRouter.get('/name/:project', ProjectsController.getProjectName)

// Project check by member
projectsRouter.get('/verify', tokenVerify, ProjectsController.checkMember)

// Add user to waiting list project
projectsRouter.post('/accept-invitation', ProjectsController.addUserWaitingList)

// Get users waiting list project
projectsRouter.get('/waitingList', ProjectsController.getWaitingList)

// Remove user waiting list
projectsRouter.post('/decline-member', ProjectsController.removeUserWaitingList)

export default projectsRouter

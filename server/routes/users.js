import { Router } from 'express'

// Constants
import { ACHIEVEMENTS, ADMINS_URL, PHOTO_URL, PROJECTS_URL, TUTORIAL_URL, USERS_GET_BY_ID_URL } from '../../constants/constants.js'

// Controllers
import UsersController from '../controllers/users.js'

// Middlewares
import { uploadMulter } from '../middlewares/middlewares.js'

const usersRouter = Router()

// Users get
usersRouter.get('/get', UsersController.getAllUsers)

// Users is existing email
usersRouter.post('/isExistingEmail', UsersController.isExistingEmail)

// User get by id
usersRouter.get(`/${USERS_GET_BY_ID_URL}/:userId`, UsersController.getUserById)

// Users get by id
// usersRouter.get('/getSome', UsersController.getUsersById)

// Users update
usersRouter.post('/update', UsersController.updateUser)

// Users add
usersRouter.post('/add', UsersController.addUser)

// Users login
usersRouter.post('/login', UsersController.login)

// Get name and photo user
usersRouter.get('/getNamePhoto', UsersController.getNameAndPhoto)

// User photo profile update
usersRouter.post(`/${PHOTO_URL}/update`, uploadMulter.single('imageFile'), UsersController.photoUpdate)

// Users in current project get
usersRouter.get(`/${PROJECTS_URL}/:currentProject`, UsersController.usersInProject)

// Admins in current project get
usersRouter.get(`/${ADMINS_URL}/${PROJECTS_URL}/:currentProject`, UsersController.adminsInProject)

// Users get with achievements by current project
usersRouter.get(`/${ACHIEVEMENTS}/byProject`, UsersController.getUserWithAchievements)

// Users add achievements
usersRouter.post('/updateAchievements', UsersController.addAchievements)

// Users add points
usersRouter.post('/points', UsersController.addPoints)

// Users get tutorial
usersRouter.get(`/${TUTORIAL_URL}`, UsersController.getTutorial)

// Users add tutorial
usersRouter.post(`/${TUTORIAL_URL}`, UsersController.addTutorial)

// Users view again tutorial
usersRouter.get(`/${TUTORIAL_URL}/viewAgain`, UsersController.viewAgainTutorial)

export default usersRouter

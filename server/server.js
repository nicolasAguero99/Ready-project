import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import http from 'node:http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Models
import TasksModel from './models/Tasks.model.js'
import ProjectsModel from './models/Projects.model.js'
import TagsModel from './models/Tags.model.js'
import UsersModel from './models/Users.model.js'
import ActivitiesModel from './models/Activities.model.js'

// Constants
import { ACHIEVEMENTS, ACTIVITY_URL, COOKIES_USER_URL, PETS_URL, PROJECTS_URL, TAGS_URL, URL_API_SHORT, URL_COLLECTION_TASK, USERS_URL } from '../constants/constants.js'

// Utils
import { activityMessage } from '../utils/utils.js'

// Routes
import tasksRouter from './routes/tasks.js'
import projectsRouter from './routes/projects.js'
import activityRouter from './routes/activities.js'
import tagsRouter from './routes/tags.js'
import usersRouter from './routes/users.js'
import achievementsRouter from './routes/achievements.js'
import petsRouter from './routes/pets.js'
import cookiesRouter from './routes/cookies.js'

// Dotenv
dotenv.config()

// Express app
const app = express()

// Cookie parser
app.use(cookieParser())

// Get images
app.use('/images', express.static('./server/profilePictures'))

// Socket.io
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.FRONT_END, credentials: true } })

// Conect to DB (MongoDB)
mongoose
  .connect(process.env.URI_DB + process.env.NAME_DB)
  .then(() => console.log('Connected to DB'))

// Socket
io.on('connection', (socket) => {
  console.log('Se han conectado')

  // Tasks

  // Create task
  socket.on('addTask', async (data) => {
    const newTaskData = new TasksModel(data)
    const saveNewTaskData = await newTaskData.save()
    console.log('saveNewTaskData', saveNewTaskData)
    io.emit('addTask', saveNewTaskData)
    // io.emit('addTask', data)
  })

  // Update task
  socket.on('updateTask', async (data) => {
    const { taskId, updatedTask, currentProject } = data
    const updatedTaskData = await TasksModel.findByIdAndUpdate(taskId, updatedTask, { new: true })
    io.emit('updateTask', { taskId, updatedTask: updatedTaskData, currentProject })
    // io.emit('updateTask', { taskId, updatedTask })
  })

  // Delete task
  socket.on('deleteTask', async (data) => {
    const { taskId, currentProject } = data
    const deletedTaskData = await TasksModel.deleteOne({ _id: taskId })
    console.log('deletedTaskData', deletedTaskData)
    io.emit('deleteTask', { taskId, currentProject })
  })

  // Add comment to task
  socket.on('addComment', async (data) => {
    const { taskId, userId, comment, currentProject } = data
    if (comment.trim() === '') return
    const updatedTask = await TasksModel.findOneAndUpdate(
      { _id: taskId },
      {
        $push: {
          comments: { _id: new mongoose.Types.ObjectId(), user: userId, text: comment }
        }
      },
      {
        new: true,
        projection: { comments: { $slice: -1 } }
      }
    )
    const newComment = updatedTask.comments[0]
    console.log('newComment', newComment)
    io.emit('addComment', { newComment, currentProject, taskId })
  })

  // Notify the new comment
  socket.on('notifyComment', async (data) => {
    const { taskId, userId, currentProject } = data
    io.emit('notifyComment', { currentProject, userId, taskId })
  })

  // Tags

  // Tags add
  socket.on('addTag', async (data) => {
    const { project } = data
    const newTag = new TagsModel(data)
    await newTag.save()
    io.emit('addTag', { newTag, currentProject: project })
  })

  // Users

  // Users add achievements
  socket.on('updateAchievementsByUsers', async (data) => {
    const { achievement, usersId } = data
    const isUsersUpdated = await UsersModel.updateMany({ _id: usersId }, { $push: { achievements: achievement } })
    isUsersUpdated.modifiedCount > 0 &&
      await UsersModel
        .find({ _id: usersId })
        .then(user => { io.emit('updateAchievementsByUsers', user) })
  })

  // Projects

  // Projects delete
  socket.on('deleteProject', async (data) => {
    const { projectName } = data
    await ProjectsModel.deleteOne({ to: projectName })
    await TasksModel.deleteMany({ project: projectName })
    await TagsModel.deleteMany({ project: projectName })
    await ActivitiesModel.deleteMany({ project: projectName })
    io.emit('deleteProject', { projectName })
  })

  // Add user to waiting list project
  socket.on('waitingList', async (data) => {
    const { userId, currentProject, action } = data
    console.log('currentProject', currentProject)
    if (!action) {
      let usersInWaitingList = []
      await ProjectsModel
        .findOne({ to: currentProject })
        .then(project => {
          usersInWaitingList = project.waitingList
        })
      await UsersModel
        .find({ _id: usersInWaitingList })
        .then(users => {
          io.emit('waitingList', { users, currentProject })
        })
    } else {
      let usersInWaitingList = []
      await ProjectsModel
        .findOne({ to: currentProject })
        .updateMany({ $pull: { waitingList: userId } })
        .then(project => {
          usersInWaitingList = project.waitingList
          console.log('usersInWaitingList', usersInWaitingList)
        })
      await UsersModel
        .find({ _id: usersInWaitingList })
        .then(users => {
          io.emit('waitingList', { users, currentProject, userId, action })
        })
    }
  })

  // Remove member of project
  socket.on('expelMember', async (data) => {
    const { userId, currentProject } = data
    const project = await ProjectsModel.findOneAndUpdate(
      { to: currentProject },
      { $pull: { members: userId } },
      { new: true }
    )
    await TasksModel.updateMany({ project: currentProject }, { $pull: { users: userId } })
    io.emit('expelMember', { userId, currentProject })
    io.emit('projectsList', { project, userId, action: true })
  })

  // Add admin member of project
  socket.on('adminMember', async (data) => {
    const { userId, currentProject } = data
    await ProjectsModel.updateMany(
      { to: currentProject },
      { $push: { admins: userId } }
    )
    io.emit('adminMember', { userId, currentProject })
  })

  // Add member to project
  socket.on('membersList', async (data) => {
    const { userData, currentProject } = data
    await ProjectsModel
      .findOne({ to: currentProject })
      .findOneAndUpdate(
        { to: currentProject },
        { $pull: { waitingList: userData._id }, $push: { members: userData._id } },
        { new: true }
      )
      .then(project => {
        io.emit('membersList', { project: currentProject, userData })
      })
  })

  // Add user to member project
  socket.on('projectsList', async (data) => {
    const { userId, currentProject } = data

    console.log('userId', userId)

    console.log('currentProject', currentProject)
    await ProjectsModel
      .findOne({ to: currentProject })
      .findOneAndUpdate(
        { to: currentProject },
        { $pull: { waitingList: userId }, $push: { members: userId } },
        { new: true }
      )
      .then(project => {
        io.emit('projectsList', { project, userId })
      })
  })

  // Projects update
  socket.on('updateProject', async (data) => {
    const { dataEdit, projectName } = data
    const projectUpdated = await ProjectsModel.updateOne({ to: projectName }, dataEdit)
    if (projectUpdated.modifiedCount === 1) {
      const updatedProject = await ProjectsModel.findOne({ to: projectName })

      console.log('updatedProject', updatedProject)

      io.emit('updateProject', { updatedProject })
    }
  })

  // Activities

  // Add activity by project
  socket.on('activity', async (data) => {
    const { author, taskName, action, typeMessage, currentProject, dateTask, toMembers, isAchievement } = data

    const actionMsg = activityMessage(action, taskName, typeMessage, dateTask)
    const activityData = { author, action: actionMsg, project: currentProject, toMembers, isAchievement }

    const newActivity = await ActivitiesModel.create(activityData)
    io.emit('activity', { newActivity, currentProject, toMembers })
  })
})

// Cors
app.use(cors({ origin: process.env.FRONT_END, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

// Tasks
app.use(`${URL_API_SHORT}${URL_COLLECTION_TASK}`, tasksRouter)

// Projects
app.use(`${URL_API_SHORT}${PROJECTS_URL}`, projectsRouter)

// Activity
app.use(`${URL_API_SHORT}${ACTIVITY_URL}`, activityRouter)

// Tags
app.use(`${URL_API_SHORT}${TAGS_URL}`, tagsRouter)

// Users
app.use(`${URL_API_SHORT}${USERS_URL}`, usersRouter)

// Achievements
app.use(`${URL_API_SHORT}${ACHIEVEMENTS}`, achievementsRouter)

// Pets
app.use(`${URL_API_SHORT}${PETS_URL}`, petsRouter)

// Cookies
app.use(`${URL_API_SHORT}${COOKIES_USER_URL}`, cookiesRouter)

// Server listen
const PORT = 3000 || 5000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

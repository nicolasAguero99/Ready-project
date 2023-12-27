// Models
import ProjectsModel from '../models/Projects.model.js'
import UsersModel from '../models/Users.model.js'

const ProjectsController = {
  getProjectsByUser: (req, res) => {
    const { member } = req.query
    ProjectsModel
      .find({ members: { $in: [member] } })
      .then(allProjects => {
        res.json(allProjects)
      })
  },
  addProject: async (req, res) => {
    try {
      const newProject = await ProjectsModel.create(req.body)
      res.status(200).send(newProject)
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  getProjectName: async (req, res) => {
    const { project } = req.params
    try {
      const projectData = await ProjectsModel.findOne({ to: project })
      res.status(200).send({ name: projectData.name, success: true })
    } catch (error) {
      res.json({ message: error.message, success: false })
    }
  },
  checkMember: async (req, res) => {
    const { currentUserId, currentProject } = req.query

    console.log('currentProject', currentProject)

    console.log('currentUserId', currentUserId)

    try {
      const isUserMember = await ProjectsModel.find({ to: currentProject, members: { $in: [currentUserId] } })
      isUserMember ? res.status(200).send(true) : res.status(401).send(false)
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  addUserWaitingList: async (req, res) => {
    const { currentProject, currentUserId } = req.body

    console.log('currentProject', currentProject)

    console.log('currentUserId', currentUserId)

    try {
      await ProjectsModel
        .find({ to: currentProject })
        .updateOne({ $push: { waitingList: currentUserId } })
      res.status(200).send({ message: 'Invitation accept' })
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  getWaitingList: async (req, res) => {
    const { currentProject } = req.query
    try {
      let usersInWaitingList = []
      await ProjectsModel
        .findOne({ to: currentProject })
        .then(project => {
          usersInWaitingList = project.waitingList
        })
      await UsersModel
        .find({ _id: usersInWaitingList })
        .then(users => {
          res.status(200).send(users)
        })
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  removeUserWaitingList: async (req, res) => {
    const { userId, currentProject } = req.body

    console.log('userId', userId)

    console.log('currentProject', currentProject)

    try {
      await ProjectsModel
        .findOne({ to: currentProject })
        .updateOne({ $pull: { waitingList: userId } })
      res.status(200).send({ message: 'Application denied' })
    } catch (error) {
      res.json({ message: error.message })
    }
  }
}

export default ProjectsController

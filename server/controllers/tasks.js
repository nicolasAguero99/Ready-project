import mongoose from 'mongoose'

// Models
import TasksModel from '../models/Tasks.model.js'

const TasksController = {
  getAllTasks: async (req, res) => {
    try {
      const allTasks = await TasksModel.find()
      res.json(allTasks)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tasks', error: error.message })
    }
  },
  getById: async (req, res) => {
    const { id } = req.params
    TasksModel
      .findById(id)
      .then(foundTask => {
        res.json(foundTask)
      })
      .catch(error => {
        console.error('Error al buscar tarea por ID:', error)
        res.status(500).json({ message: 'Error en el servidor' })
      })
  },
  getTasksByUser: async (req, res) => {
    TasksModel
      .find({ users: { $in: [req.params.currentUserId] } })
      .then(allTasks => {
        res.json(allTasks)
      })
  },
  getTasksByProject: async (req, res) => {
    TasksModel
      .find({ project: req.params.projectName })
      .then(allTasksByProject => {
        res.json(allTasksByProject)
      })
  },
  addComment: async (req, res) => {
    const { taskId, userId, comment } = req.body
    comment.trim() === '' && res.status(400).json({ message: 'Comment is empty' })
    comment.trim() !== '' &&
      TasksModel
        .findById(taskId)
        .updateOne({ $push: { comments: { _id: new mongoose.Types.ObjectId(), user: userId, text: comment } } })
        .catch(error => {
          console.error('Error al buscar tarea por ID:', error)
          res.status(500).json({ message: 'Error en el servidor' })
        })
  }
}

export default TasksController

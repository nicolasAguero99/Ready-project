import mongoose from 'mongoose'

const tasksSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  state: { type: String, required: true, default: 'pendiente' },
  priority: { type: String, default: 'baja' },
  date: { type: String, required: true },
  tags: { type: [String], default: [] },
  users: { type: [String], default: [] },
  project: { type: String, required: true },
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }]
},
{
  timestamps: true,
  versionKey: false
})

// tasksSchema.index({ project: 1 })

const TasksModel = mongoose.model('tasks', tasksSchema)

export default TasksModel

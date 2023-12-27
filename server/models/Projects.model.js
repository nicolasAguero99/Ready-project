import mongoose from 'mongoose'

const projectsSchema = new mongoose.Schema({
  name: { type: String, default: 'Default' },
  color: { type: String, default: '#DF437E' },
  description: { type: String, default: '' },
  to: { type: String, unique: true },
  members: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], default: [] },
  admins: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], default: [] },
  waitingList: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], default: [] },
  state: { type: String, default: 'En curso' }
},
{
  timestamps: true,
  versionKey: false
})

const ProjectsModel = mongoose.model('projects', projectsSchema)

export default ProjectsModel

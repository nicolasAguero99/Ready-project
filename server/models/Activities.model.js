import mongoose from 'mongoose'

const activitiesSchema = new mongoose.Schema({
  action: { type: String, required: true, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: '' },
  project: { type: String, required: true, default: '' },
  toMembers: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], default: [] },
  isAchievement: { type: Boolean, default: false }
},
{
  timestamps: true,
  versionKey: false
})

const ActivitiesModel = mongoose.model('activities', activitiesSchema)

export default ActivitiesModel

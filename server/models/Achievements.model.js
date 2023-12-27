import mongoose from 'mongoose'

const achievementsSchema = new mongoose.Schema({
  name: String,
  description: String,
  project: String
},
{
  timestamps: true,
  versionKey: false
})

const AchievementsModel = mongoose.model('achievements', achievementsSchema)

export default AchievementsModel

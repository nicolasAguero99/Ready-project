// Models
import UsersModel from '../models/Users.model.js'
import AchievementsModel from '../models/Achievements.model.js'

const AchievementsController = {
  getAchievementsById: async (req, res) => {
    const { achievementsId } = req.query
    try {
      await AchievementsModel
        .find({ _id: achievementsId })
        .then(achievements => {
          res.status(200).send(achievements)
        })
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  getAchievementsByUser: async (req, res) => {
    const { userId } = req.params
    try {
      await UsersModel
        .findOne({ _id: userId })
        .then(user => {
          res.status(200).send(user.achievements)
        })
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  addAchievements: async (req, res) => {
    const { dataAchievement, projectName } = req.body
    try {
      const achievementInfo = await AchievementsModel.create({ ...dataAchievement, project: projectName })
      res.status(200).send(achievementInfo)
    } catch (error) {
      res.json({ message: error.message })
    }
  }
}

export default AchievementsController

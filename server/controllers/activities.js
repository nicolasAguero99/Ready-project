// Models
import ActivitiesModel from '../models/Activities.model.js'

const ActivitiesController = {
  getActivities: async (req, res) => {
    const { projectsList, reducedTo } = req.query
    try {
      if (reducedTo) {
        await ActivitiesModel
          .find({ project: projectsList })
          .sort({ updatedAt: -1 })
          .limit(reducedTo)
          .then(activity => {
            res.status(200).send(activity)
          })
      } else {
        await ActivitiesModel
          .find({ project: projectsList })
          .sort({ updatedAt: -1 })
          .then(activity => {
            res.status(200).send(activity)
          })
      }
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  getActivitiesByProject: async (req, res) => {
    const { currentProject } = req.params

    console.log('currentProject', currentProject)

    try {
      await ActivitiesModel
        .find({ project: currentProject })
        .sort({ updatedAt: -1 })
        .then(activity => {
          console.log('activity', activity)

          res.status(200).send(activity)
        })
    } catch (error) {
      res.json({ message: error.message })
    }
  }
}

export default ActivitiesController

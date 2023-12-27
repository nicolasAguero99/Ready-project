// Models
import TagsModel from '../models/Tags.model.js'

const TagsController = {
  getTags: (req, res) => {
    const { currentProject } = req.params
    TagsModel
      .find({ project: currentProject })
      .then(tags => {
        res.status(200).json(tags)
      })
  }
}

export default TagsController

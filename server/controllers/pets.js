// Models
import PetsModel from '../models/Pets.model.js'

const PetsController = {
  getPets: async (req, res) => {
    try {
      await PetsModel
        .find()
        .then(pets => {
          res.status(200).send(pets)
        })
    } catch (error) {
      res.json({ message: error.message })
    }
  }
}

export default PetsController

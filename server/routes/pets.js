import { Router } from 'express'

// Controllers
import PetsController from '../controllers/pets.js'

const petsRouter = Router()

// Get pets
petsRouter.get('/', PetsController.getPets)

export default petsRouter

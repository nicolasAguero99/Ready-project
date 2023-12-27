import { Router } from 'express'

// Controllers
import TagsController from '../controllers/tags.js'

const tagsRouter = Router()

// Get tags by project
tagsRouter.get('/:currentProject', TagsController.getTags)

export default tagsRouter

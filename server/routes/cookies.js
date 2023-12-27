import { Router } from 'express'

// Controllers
import CookiesController from '../controllers/cookies.js'

const cookiesRouter = Router()

// Get cookie user
cookiesRouter.get('/', CookiesController.getCookies)

// Remove cookie user
cookiesRouter.get('/remove', CookiesController.removeCookie)

export default cookiesRouter

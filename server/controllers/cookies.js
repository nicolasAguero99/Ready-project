const CookiesController = {
  getCookies: async (req, res) => {
    try {
      res.status(200).json({ cookie: req.cookies.currentUser })
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  removeCookie: async (req, res) => {
    try {
      res.clearCookie('currentUser')
      res.clearCookie('userLogged')
      res.status(200).json({ message: 'Cookies removed' })
    } catch (error) {
      res.json({ message: error.message })
    }
  }
}

export default CookiesController

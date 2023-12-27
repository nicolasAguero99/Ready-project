import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

// Context
import { CurrentUserContext } from './UsersContext'
import { URL_API, USERS_GET_BY_ID_URL, USERS_URL } from '../constants/constants'

export const TutorialContext = createContext()

export const TutorialProvider = ({ children }) => {
  const [currentUser] = useContext(CurrentUserContext)
  const [tutorialsCompleted, setTutorialsCompleted] = useState(null)

  const getTutorialsCompleted = async () => {
    if (!currentUser) return
    const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${currentUser?._id}`)
    setTutorialsCompleted(user.data.tutorial)
  }

  useEffect(() => {
    getTutorialsCompleted()
  }, [currentUser])

  return (
    <TutorialContext.Provider value={[tutorialsCompleted, setTutorialsCompleted]}>
      {children}
    </TutorialContext.Provider>
  )
}

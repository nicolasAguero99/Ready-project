import { createContext, useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'

// Constants
import { PROJECTS_URL, URL_API } from '../constants/constants'

// Context
import { CurrentUserContext } from './UsersContext'

// Utils
import { SocketOnProjectsList } from '../utils/socket'

export const ProjectsContext = createContext()
export const MenuContext = createContext()

export const ProjectsProvider = ({ children }) => {
  const [projectsList, setProjectsList] = useState([])
  const [showMenu, setShowMenu] = useState(false)
  const [currentUser] = useContext(CurrentUserContext)
  const firstRender = useRef(false)

  const getProjectList = async () => {
    if (!currentUser) return
    const res = await axios.get(`${URL_API}${PROJECTS_URL}/get`, { params: { member: currentUser?._id } })
    setProjectsList(res.data)
  }

  useEffect(() => {
    if (!firstRender.current && currentUser?._id) {
      SocketOnProjectsList(setProjectsList, currentUser?._id)
      firstRender.current = true
    }
  }, [currentUser])

  useEffect(() => {
    getProjectList()
  }, [currentUser])

  return (
    <ProjectsContext.Provider value={[projectsList, setProjectsList]}>
      <MenuContext.Provider value={[showMenu, setShowMenu]}>
        {children}
      </MenuContext.Provider>
    </ProjectsContext.Provider>
  )
}

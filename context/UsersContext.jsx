import { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import jwtDecode from 'jwt-decode'

// Constants
import { URL_API, USERS_URL, USERS_GET_BY_ID_URL } from '../constants/constants'

export const CurrentUserContext = createContext()
export const UsersContext = createContext()
export const UsersProjectContext = createContext()
export const AdminsProjectContext = createContext()

export const UsersProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [adminsListByProject, setAdminsListByProject] = useState([])
  const [usersListByProject, setUsersListByProject] = useState([])

  const getCurrentUser = async () => {
    const tokenLocalStorage = window.localStorage.getItem('token')
    const tokenSesionStorage = window.sessionStorage.getItem('token')
    if (!tokenLocalStorage && !tokenSesionStorage) return
    if (tokenLocalStorage) {
      const { id } = jwtDecode(tokenLocalStorage)
      console.log('id', id)
      const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${id}`)
      console.log('user', user)
      setCurrentUser({ ...user.data, token: tokenLocalStorage })
    } else {
      const { id } = jwtDecode(tokenSesionStorage)
      console.log('id', id)
      const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${id}`)
      console.log('user', user)
      setCurrentUser({ ...user.data, token: tokenSesionStorage })
    }
  }

  useEffect(() => {
    getCurrentUser()
  }, [])

  return (
    <CurrentUserContext.Provider value={[currentUser, setCurrentUser]}>
      <UsersContext.Provider value={[usersList, setUsersList]}>
        <UsersProjectContext.Provider value={[usersListByProject, setUsersListByProject]}>
          <AdminsProjectContext.Provider value={[adminsListByProject, setAdminsListByProject]}>
            {children}
          </AdminsProjectContext.Provider>
        </UsersProjectContext.Provider>
      </UsersContext.Provider>
    </CurrentUserContext.Provider>
  )
}

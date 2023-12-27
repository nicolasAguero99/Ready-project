import { Navigate, Outlet } from 'react-router-dom'
import { PATH_LINKS } from '../../constants/constants'

const UserLogged = () => {
  // const userLogged = document.cookie.split('; ').find(row => row.startsWith('userLogged='))
  const userLogged = window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
  return !userLogged ? <Outlet /> : <Navigate replace to={PATH_LINKS.dashboard} />
}

export default UserLogged

import { Navigate, Outlet } from 'react-router-dom'
import { PATH_LINKS } from '../../constants/constants'

const ProtectedRoute = () => {
  // const userLogged = document.cookie.split('; ').find(row => row.startsWith('userLogged='))
  const userLogged = window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
  return userLogged ? <Outlet/> : <Navigate replace to={PATH_LINKS.login} />
}

export default ProtectedRoute

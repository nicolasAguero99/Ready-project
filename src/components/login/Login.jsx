import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import jwtDecode from 'jwt-decode'

// Constants
import { URL_API, USERS_URL, ERRORS_MSG, COOKIES_USER_URL, PATH_LINKS, USERS_GET_BY_ID_URL } from '../../../constants/constants'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
axios.defaults.withCredentials = true

const Login = () => {
  const navigate = useNavigate()
  const [showError, setShowError] = useState(null)
  const [, setCurrentUser] = useContext(CurrentUserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userData = Object.fromEntries(new FormData(e.target))
    let { email, password, remember } = userData
    console.log(userData)
    remember === 'on' ? (remember = true) : (remember = false)
    const userAccount = { email, password, remember }
    console.log('userAccount', userAccount)

    const userExist = await axios.post(`${URL_API}${USERS_URL}/login`, userAccount)

    console.log('userExist', userExist)

    if (userExist.data.success) {
      if (remember) {
        const userDataToken = await axios.get(`${URL_API}${COOKIES_USER_URL}`)
        const expiresDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        userDataToken && (document.cookie = 'userLogged=true; expires=' + expiresDate + '; path=/')
        // const { id } = jwtDecode(userDataToken.data?.cookie)
        window.localStorage.setItem('token', userExist.data?.token)
        console.log('userExist.data?.token', userExist.data?.token)
        const { id } = jwtDecode(userExist.data?.token)

        const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${id}`)
        setCurrentUser({ ...user.data, token: userExist.data?.token })
      } else {
        // const userDataToken = await axios.get(`${URL_API}${SESSION_USER_URL}`)
        // const expiresDate = new Date().setDate((new Date().getDate()) + 30)
        window.sessionStorage.setItem('token', userExist.data?.token)
        // userDataToken && (document.cookie = 'userLogged=true; expires=' + expiresDate + '; path=/')
        const { id } = jwtDecode(userExist.data?.token)
        const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${id}`)
        setCurrentUser({ ...user.data, token: userExist.data?.token })
      }
      setShowError(null)
      navigate(PATH_LINKS.dashboard)
    } else {
      setShowError(ERRORS_MSG.login)
    }
  }

  return (
    <main className='flex flex-col-reverse md:flex-row justify-center'>
      <div className='flex flex-1 md:max-h-screen md:min-h-screen'>
        <img className='w-full object-cover' src="/illustrations/brand-universe.svg" alt="brand universe" />
      </div>
      <div className='flex lg:w-1/2 flex-col justify-center gap-6 px-8 md:px-20 py-16 md:py-6'>
        <img className='w-[120px] lg:w-[150px]' src="/icons/ready-logo.svg" alt="ready logo" />
        <div className='flex flex-col gap-4'>
          <h1 className='w-full text-4xl md:text-5xl text-center md:text-left font-bold text-lightTitle md:leading-[1.40] mb-4'>¡Bienvenido de nuevo!</h1>
          {/* <div className='w-full flex flex-1 flex-col gap-6 py-4'>
            <span className='text-center'>google</span>
            <span className='flex justify-center items-center gap-4 text-extraSoftGrey md:text-lg text-xs before:inline-block before:w-full before:h-[1px] before:bg-extraSoftGrey before:mt-1 after:inline-block after:w-full after:h-[1px] after:bg-extraSoftGrey after:mt-1'>o</span>
          </div> */}
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <input name='email' className='border-2 border-pink rounded-full outline-none px-4 py-2' type="email" placeholder='Correo electrónico' />
          <input name='password' className='border-2 border-pink rounded-full outline-none px-4 py-2' type="password" placeholder='Contraseña' />
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <input className="w-4 h-4 accent-pink cursor-pointer outline-1 after:block after:w-4 after:h-4 after:border-2 after:border-pink" type="checkbox" name="remember" id="remember-checkbox" defaultChecked={true} />
              <label className='font-medium text-sm lg:text-base cursor-pointer' htmlFor="remember-checkbox">Recordarme</label>
            </div>
            <span className='font-semibold text-pink text-sm lg:text-base'>Olvidé mi contraseña</span>
          </div>
          <div className='flex flex-col text-center gap-6'>
            <button type='submit' className='font-semibold text-whiteText px-4 py-2 rounded-full bg-pink border-2 transition-colors duration-300 hover:bg-transparent hover:text-pink hover:border-pink'>Iniciar sesión</button>
            {
              showError &&
              <p className='text-error text-sm md:text-base'>{showError}</p>
            }
            <p className='font-medium text-sm md:text-base text-lightText'>¿No tenés una cuenta? <Link className='font-semibold text-sm md:text-base text-pink underline' to={PATH_LINKS.signup}>Registrate</Link></p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Login

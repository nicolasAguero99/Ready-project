import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

// Constants
import { URL_API, USERS_URL, ERRORS_MSG, COOKIES_USER_URL, PATH_LINKS, USERS_GET_BY_ID_URL, PROFILE_PICTURES_DEFAULT } from '../../../constants/constants'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
import ProfilePicture from '../items/ProfilePicture'
axios.defaults.withCredentials = true

const Signup = () => {
  const navigate = useNavigate()
  const [registerPage, setRegisterPage] = useState(0)
  const [showError, setShowError] = useState(null)
  const [, setCurrentUser] = useContext(CurrentUserContext)
  const [userData, setUserData] = useState({ email: '', password: '', confirmPassword: '', photo: '', remember: 'on' })

  const [extraDataUser, setExtraDataUser] = useState({ name: '', role: '', birthday: '' })
  const [userAge, setUserAge] = useState(0)
  const [isCustomRole, setIsCustomRole] = useState(false)

  useEffect(() => {
    handleChangeRandomPicture()
  }, [])

  const handleChangeRandomPicture = () => {
    const randomIndex = Math.floor(Math.random() * PROFILE_PICTURES_DEFAULT.length)
    setUserData({ ...userData, photo: PROFILE_PICTURES_DEFAULT[randomIndex] })
  }

  const handleUserData = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value
    })
  }

  const handleFormUser = (e) => {
    const { name, value } = e.target
    setExtraDataUser({
      ...extraDataUser,
      [name]: value
    })
  }

  const handleReturnPage = () => {
    setRegisterPage(0)
    const randomIndex = Math.floor(Math.random() * PROFILE_PICTURES_DEFAULT.length)
    setUserData({ email: '', password: '', confirmPassword: '', photo: PROFILE_PICTURES_DEFAULT[randomIndex], remember: 'on' })
    setExtraDataUser({ name: '', role: '', birthday: '' })
  }

  const getAgeUser = () => {
    const birthday = new Date(extraDataUser?.birthday)
    const ageDifMs = Date.now() - birthday.getTime()
    const ageDate = new Date(ageDifMs)
    const age = ageDate.getUTCFullYear() - 1970
    setUserAge(age)
  }

  const birthdayFormat = () => {
    const birthdayFormated = extraDataUser.birthday.split('-').reverse().join('-')
    return birthdayFormated
  }

  const handleCloseCustomRole = () => {
    setIsCustomRole(false)
    setExtraDataUser({ ...extraDataUser, role: '' })
  }
  useEffect(() => {
    extraDataUser.role === 'otro' && setIsCustomRole(true)
  }, [extraDataUser.role])

  useEffect(() => {
    getAgeUser()
  }, [extraDataUser.birthday])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUserData({ ...userData, photo: 'default-profile-penguin' })
    console.log('userData', userData)
    const { email, password, confirmPassword, photo, remember } = userData
    remember === 'on' ? (setUserData({ ...userData, remember: true })) : (setUserData({ ...userData, remember: false }))
    const userAccount = { email, password, remember, photo }
    if (password === confirmPassword) {
      try {
        if (registerPage === 0) {
          setShowError(null)
          const existingEmail = await axios.post(`${URL_API}${USERS_URL}/isExistingEmail`, { email })

          console.log('userData', userData)
          console.log('existingEmail', existingEmail)
          setRegisterPage(1)
        } else if (registerPage === 1) {
          console.log('extraDataUser', extraDataUser)

          const newUserData = await axios.post(`${URL_API}${USERS_URL}/add`, { userAccount, extraDataUser })

          console.log('newUserData', newUserData)

          if (remember) {
            const { id } = jwtDecode(newUserData.data?.token)
            const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${id}`)
            window.localStorage.setItem('token', newUserData.data?.token)
            setCurrentUser({ ...user.data, token: newUserData.data?.token })
          } else {
            const userDataToken = await axios.get(`${URL_API}${COOKIES_USER_URL}`)
            // const expiresDate = new Date().setDate((new Date().getDate()) + 30)
            window.sessionStorage.setItem('token', userDataToken.data?.token)
            // userDataToken && (document.cookie = 'userLogged=true; expires=' + expiresDate + '; path=/')
            const { id } = jwtDecode(userDataToken.data?.token)
            const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${id}`)
            setCurrentUser({ ...user.data, token: userDataToken.data?.token })
          }
          setShowError(null)
          console.log('new project')
          navigate(PATH_LINKS.newProject, { state: { isSignup: true } })
          console.log('new project')
        }
      } catch (error) {
        setShowError(ERRORS_MSG.existingEmail)
      }
    } else {
      setShowError(ERRORS_MSG.confirmPassword)
    }
  }

  return (
    <>
      <SwitchTransition>
        <CSSTransition
          key={registerPage}
          addEndListener={(node, done) => node.addEventListener('transitionend', done, false)}
          classNames='fade'
        >
          {
            registerPage === 0
              ? <main className='flex flex-col-reverse md:flex-row justify-center'>
                <div className='flex flex-1 md:max-h-screen md:min-h-screen'>
                  <img className='w-full object-cover' src="/illustrations/brand-universe.svg" alt="brand universe" />
                </div>
                <div className='flex lg:w-1/2 flex-col justify-center gap-6 px-8 md:px-20 py-16 md:py-6'>
                  <img className='w-[120px] lg:w-[150px]' src="/icons/ready-logo.svg" alt="ready logo" />
                  <div className='flex flex-col gap-4'>
                    <h1 className='w-full text-3xl md:text-5xl text-center md:text-left font-bold text-lightTitle md:leading-[1.40] mb-4'>Creá tu cuenta</h1>
                  </div>
                  <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                    <input onChange={handleUserData} name='email' className='border-2 border-pink rounded-full outline-none px-4 py-2' type="email" placeholder='Correo electrónico' />
                    <input onChange={handleUserData} name='password' className='border-2 border-pink rounded-full outline-none px-4 py-2' type="password" placeholder='Contraseña' />
                    <input onChange={handleUserData} name='confirmPassword' className='border-2 border-pink rounded-full outline-none px-4 py-2' type="password" placeholder='Confirmar contraseña' />
                    <div className='flex items-center gap-2'>
                      <input onChange={handleUserData} className="w-4 h-4 accent-pink cursor-pointer outline-1 after:block after:w-4 after:h-4 after:border-2 after:border-pink" type="checkbox" name="remember" id="remember-checkbox" defaultChecked={true} />
                      <label className='font-medium text-sm lg:text-base cursor-pointer' htmlFor="remember-checkbox">Recordarme</label>
                    </div>
                    <div className='flex flex-col text-center gap-6'>
                      <button type='submit' className='font-semibold text-whiteText px-4 py-2 rounded-full bg-pink border-2 transition-colors duration-300 hover:bg-transparent hover:text-pink hover:border-pink'>Continuar</button>
                      {
                        showError &&
                        <p className='text-error md:text-sm text-xs'>{showError}</p>
                      }
                      <p className='font-medium text-sm md:text-base text-lightText'>¿Ya tenés una cuenta? <Link className='font-semibold text-sm md:text-base text-pink underline' to={PATH_LINKS.login}>Iniciá sesión</Link></p>
                    </div>
                  </form>
                </div>
              </main>
              : (registerPage === 1)
                  ? <main className='relative flex flex-col-reverse lg:flex-row justify-center'>
                    <button onClick={handleReturnPage} className='w-4 h-4 absolute top-8 left-8'><img className='w-full rotate-90' src="/icons/chevron-icon.svg" alt="volver" /></button>
                  <div className='flex-1 min-h-screen flex flex-col gap-6 px-8 md:px-20 lg:px-24 py-8 justify-center'>
                    <img className='w-[100px] md:w-[150px]' src="/icons/ready-logo.svg" alt="ready logo" />
                    <div className='flex flex-col gap-6'>
                      <h2 className='text-3xl lg:text-5xl font-bold text-lightTitle leading-[1.40] lg:leading-[1.40]'>¡Te damos la bienvenida a ready!</h2>
                      <p className='text-sm md:text-base'>Completá los datos a continuación para empezar.</p>
                    </div>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-14 mt-10'>
                      <input onChange={handleFormUser} name='name' className='border-2 border-pink rounded-full outline-none px-4 py-2' type="text" placeholder='¿Cuál es tu nombre?' />
                      {
                        isCustomRole
                          ? <div className='relative'>
                            <input onChange={handleFormUser} name='role' type='text' className='max-h-[200px] overflow-y-auto w-full flex flex-col bg-lightExtraBckg dark:bg-darkExtraBckg max-md:text-sm divide-y divide-extraSoftGrey border-2 border-pink rounded-full outline-none px-4 py-2 z-10 focus:outline-none' placeholder='Otro...' />
                            <button onClick={handleCloseCustomRole} className='absolute top-3 right-4'><img src="/icons/cross-icon.svg" alt="close input" /></button>
                          </div>
                          : <select onChange={handleFormUser} name='role' className='max-h-[200px] overflow-y-auto w-full flex flex-col bg-lightExtraBckg dark:bg-darkExtraBckg max-md:text-sm divide-y divide-extraSoftGrey border-2 border-pink rounded-full outline-none px-4 py-2 z-10 cursor-pointer focus:outline-none'>
                            <option className='hidden' value='' defaultValue={true}>¿Cuál es tu rol?</option>
                            <option className='text-left px-4 py-3 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer md:text-sm text-xs capitalize focus:bg-hoverExtraSoftGrey outline-none' value='programador'>Programador</option>
                            <option className='text-left px-4 py-3 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer md:text-sm text-xs capitalize focus:bg-hoverExtraSoftGrey outline-none' value='diseñador'>Diseñador</option>
                            <option className='text-left px-4 py-3 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer md:text-sm text-xs capitalize focus:bg-hoverExtraSoftGrey outline-none' value='manager'>Manager</option>
                            <option className='text-left px-4 py-3 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer md:text-sm text-xs capitalize focus:bg-hoverExtraSoftGrey outline-none' value='otro'>Otro</option>
                          </select>
                      }
                      <input onChange={handleFormUser} name='birthday' className=' max-md:text-sm border-2 border-pink rounded-full px-4 py-2 outline-none' type="date" />
                      <div className='flex justify-end items-center text-center gap-6'>
                        <button type='submit' className='font-semibold text-whiteText px-4 py-2 rounded-full bg-pink border-2 transition-colors duration-300 hover:bg-transparent hover:text-pink hover:border-pink'>Crear cuenta</button>
                      </div>
                    </form>
                  </div>
                  <div className='max-lg:hidden relative flex flex-1 md:max-h-screen md:min-h-screen'>
                    <div className='absolute top-0 left-0 right-0 bottom-0 m-auto flex flex-col bg-lightBckg dark:bg-darkBckg w-[340px] lg:w-[420px] h-[540px] lg:h-[600px] items-center justify-center gap-10 rounded-lg shadow-cardTask z-10'>
                      <div className='flex flex-col items-center gap-4'>
                        <div className='min-h-[200px] relative flex justify-center w-fit h-fit'>
                          <SwitchTransition>
                            <CSSTransition
                              key={userData.photo}
                              addEndListener={(node, done) => node.addEventListener('transitionend', done, false)}
                              classNames='picture-profile'
                            >
                              <ProfilePicture wH={'w-[200px]'} img={userData.photo} alt='pic profile' />
                            </CSSTransition>
                          </SwitchTransition>
                          <button onClick={handleChangeRandomPicture} className='absolute top-0 right-[20px] p-2 bg-lightBckg dark:bg-darkBckg rounded-full transition-colors duration-300 ease-in-out hover:shadow-cardTask'>
                            <img src="/icons/reload-icon.svg" alt="aleatorio icono" />
                          </button>
                        </div>
                        <h2 className='w-[250px] text-center font-medium lg:text-3xl text-2xl capitalize overflow-x-hidden text-ellipsis whitespace-nowrap'>{extraDataUser.name ? extraDataUser.name : 'Tu nombre'}</h2>
                        <span className='bg-pink text-lightBckg lg:text-sm text-xs rounded-full py-1 px-4 first-letter:uppercase'>{extraDataUser.role ? extraDataUser.role : 'Tu rol'}</span>
                      </div>
                      <div className='flex flex-col items-center gap-4'>
                        <div className='flex items-center gap-4'><img src="/icons/cake-icon.svg" alt="cake icon" /><span>{extraDataUser.birthday ? `${birthdayFormat()} (${userAge} años)` : '00/00/00 (00 años)'}</span></div>
                        <div className='flex items-center gap-4'><img src="/icons/mail-icon.svg" alt="cake icon" /><span>{userData.email ? userData.email : 'nombre@gmail.com'}</span></div>
                        <p className='text-softGrey  dark:text-darkSoftGrey text-sm text-center px-6'>Vas a poder editar tus datos en detalle más adelante</p>
                      </div>
                    </div>
                    <img className='w-full object-cover opacity-30' src="/illustrations/brand-universe.svg" alt="brand universe" />
                  </div>
                </main>
                  : null
          }
        </CSSTransition>
      </SwitchTransition>
    </>
  )
}

export default Signup

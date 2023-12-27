import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Items
import ProfilePicture from '../components/items/ProfilePicture'
import AddProject from './items/AddProject'

// Constants
import { ALERT_MSG, ALERT_TYPE, COOKIES_USER_URL, PATH_LINKS, PROJECTS_URL, TUTORIAL_URL, URL_API, USERS_URL } from '../../constants/constants'

// Context
import { CurrentUserContext } from '../../context/UsersContext'
import { MenuContext } from '../../context/ProjectsContext'
import { AlertContext } from '../../context/AlertContext'
import { DarkModeContext } from '../../context/DarkModeContext'

// Utils
import { SocketAction } from '../../utils/socket'

const Header = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext)
  const [, setShowMenu] = useContext(MenuContext)
  const [, setAlert] = useContext(AlertContext)
  const listOptionsRef = useRef(null)
  const [listOptionsShow, setlistOptionsShow] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showModalShortcuts, setShowModalShortcuts] = useState(false)
  const [darkMode, setDarkMode] = useContext(DarkModeContext)

  useEffect(() => {
    console.log('currentUser', currentUser)
  }, [currentUser])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!listOptionsRef.current?.contains(event.target)) {
        setlistOptionsShow(false)
      }
    }
    document.addEventListener('mouseup', handleClickOutside)
    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  }, [])

  const handleToggleDarkMode = () => setDarkMode(!darkMode)

  const handleToggleMenu = () => setShowMenu(true)

  const handleOpenModal = () => setShowModal(true)

  const handleCloseModal = () => setShowModal(false)

  const handleOpenModalShortcut = () => setShowModalShortcuts(true)

  const handleCloseModalShortcut = () => setShowModalShortcuts(false)

  const handleJoinProject = async (e) => {
    e.preventDefault()
    const { value } = e.target[0]
    console.log('value', value)
    let url = null
    try {
      const urlCheck = new URL(value)
      url = urlCheck
    } catch {
      url = null
    }
    console.log('url', url)
    if (url && url.pathname.includes('/project/')) {
      const projectTo = url.pathname.split('/')[2]
      const projectNameData = await axios.get(`${URL_API}${PROJECTS_URL}/name/${projectTo}`)
      if (!projectNameData.data.name) return
      console.log('projectNameData.data.name', projectNameData.data.name)
      setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.applicationSended, duration: 3000 })
      await axios.post(`${URL_API}${PROJECTS_URL}/accept-invitation`, {
        currentProject: projectTo,
        currentUserId: currentUser._id
      })
      SocketAction('waitingList', { currentProject: projectTo })
      setShowModal(false)
    }
  }

  const handleLogOut = async () => {
    await axios.get(`${URL_API}${COOKIES_USER_URL}/remove`)
    document.cookie = 'userLogged' + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.localStorage.removeItem('token')
    window.sessionStorage.removeItem('token')
    setCurrentUser(null)
    navigate(PATH_LINKS.login)
  }

  const handleViewTutorial = async () => {
    setlistOptionsShow(false)
    await axios.get(`${URL_API}${USERS_URL}/${TUTORIAL_URL}/viewAgain`, { params: { currentUserId: currentUser?._id } })
    setCurrentUser({ ...currentUser, tutorial: [] })
  }

  const handleShowProfileOptions = () => setlistOptionsShow(!listOptionsShow)

  return (
    <>
      {
        showModal &&
        <>
          <div className={`${showModal ? 'block' : 'hidden'} bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[80]`}></div>
          <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:w-3/4 flex flex-col gap-4 p-8 lg:p-12 rounded-[20px] z-[90]'>
            <div className='flex flex-col gap-4 relative'>
              <h3 className='text-2xl md:text-3xl font-semibold text-pink'>Proyecto</h3>
              <button onClick={handleCloseModal} className='absolute top-1 sm:top-2 -right-2 sm:right-0'>
                <img className='w-6 dark:invert' src="/icons/cross-icon.svg" alt="cerrar modal" />
              </button>
              <div className='flex max-md:flex-col justify-center items-center gap-y-6 md:divide-x-2 divide-extraSoftGrey pt-6'>
                <div className='w-full min-[440px]:w-[300px] flex flex-1 flex-col justify-center items-center gap-4 md:px-6'>
                  <img className='max-sm:hidden w-48 dark:invert' src="/illustrations/idea-illustration.png" alt="idea ilustracion" />
                  <p className='max-sm:text-center sm:text-softGrey max-sm:text-base text-base'>¿Tenés una idea en mente?</p>
                  <AddProject />
                </div>
                <form onSubmit={handleJoinProject} className='w-full min-[440px]:w-[300px] flex flex-1 flex-col justify-center items-center gap-4 md:px-6'>
                  <img className='max-sm:hidden w-48 dark:invert' src="/illustrations/team-illustration.png" alt="equipo ilustracion" />
                  <p className='max-sm:text-center sm:text-softGrey max-sm:text-base text-base'>¿Querés unirte a un proyecto ya existente?</p>
                  <div className='relative w-full flex flex-wrap justify-center items-center gap-2'>
                    <input className='w-full border-2 border-pink rounded-full outline-none px-4 pe-10 py-1' type="text" placeholder='Enlace del proyecto' />
                    <button type='submit' className='absolute -top-[2px] right-1 p-2 rounded-full bg-transpaent ease-out'><img className='w-6' src="/icons/send-icon.svg" alt="enviar enlace" /></button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      }
      {
        showModalShortcuts &&
        <>
          <div className={`${showModalShortcuts ? 'block' : 'hidden'} bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[80]`}></div>
          <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:w-3/4 flex flex-col gap-4 p-8 lg:p-12 rounded-[20px] z-[90]'>
            <div className='flex flex-col gap-4 relative'>
              <h3 className='text-2xl md:text-3xl font-semibold text-pink'>Atajos</h3>
              <button onClick={handleCloseModalShortcut} className='absolute top-1 sm:top-2 -right-2 sm:right-0'>
                <img className='w-6 dark:invert' src="/icons/cross-icon.svg" alt="cerrar modal" />
              </button>
              <div className='flex flex-col gap-6 pt-6'>
                <p><b className='text-pink font-semibold'>Alt</b> + <b className='text-pink font-semibold'>Click izq.</b> : Duplicar tarea.</p>
                <p><b className='text-pink font-semibold'>Control</b> + <b className='text-pink font-semibold'>Click izq.</b> : Eliminar tarea.</p>
                {/* <p><b className='text-pink font-semibold'>Doble</b> <b className='text-pink font-semibold'>Click izq.</b> : Editar tarea.</p> */}
                <p><b className='text-pink font-semibold'>Click der.</b> : Abrir menú de opciones de la tarea.</p>
              </div>
            </div>
          </div>
        </>
      }
      <header className='flex items-center justify-between gap-6'>
        <div className='flex gap-6 md:gap-12 items-center'>
          <button onClick={handleToggleMenu} className='xl:hidden'><img className='dark:invert' src="/icons/menu-icon.svg" alt="abrir menu" /></button>
          <button onClick={handleOpenModal} className='text-base md:text-sm font-semibold text-whiteText px-2 md:px-4 py-1 md:py-2 rounded-full bg-pink'>
            + Proyecto
          </button>
        </div>
        <div className='flex items-center gap-6'>
          <div id='profile' className='flex items-center gap-2'>
            <button onClick={handleShowProfileOptions} className='flex items-center gap-4 p-2 rounded-full'>
            {/* <Link className='flex gap-2 items-center' to={PATH_LINKS.profile}> */}
              <ProfilePicture wH={'w-10 h-10'} img={currentUser?.photo} alt={currentUser?.name} />
            {/* </Link> */}
              <img className={`${listOptionsShow ? 'rotate-180' : ''} dark:invert`} src="/icons/chevron-icon.svg" alt="mas opciones" />
            </button>
            {
              listOptionsShow &&
              (
                <div ref={listOptionsRef} className='w-fit absolute top-[90px] right-16 z-30'>
                  <ul className='flex flex-col bg-lightExtraBckg dark:bg-darkExtraBckg w-fit min-w-[270px] h-fit px-4 py-2 rounded-[10px] shadow-cardTask font-normal text-sm md:text-lg [&>li]:border-t-[1px] [&>li]:border-borderSoftGrey [&>li>button]:px-4 overflow-x-hidden'>
                    <li className='flex flex-col items-center py-3 pb-6 border-none'>
                      <ProfilePicture wH={'w-20 h-20'} img={currentUser?.photo} alt={currentUser?.name} />
                      <span className='pt-3 font-medium'>{currentUser?.name}</span>
                      <small className='text-softGrey text-sm'>{currentUser?.email}</small>
                    </li>
                    <li className='hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg border-none'>
                      <Link className='flex gap-2 items-center w-full text-left px-4 py-2 whitespace-nowrap text-ellipsis overflow-x-hidden' to={PATH_LINKS.profile}>
                        <img className='w-6' src="/icons/user-icon.svg" alt="usuario icono" /> Mi perfil
                      </Link>
                    </li>
                    <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-2 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                      <button onClick={handleViewTutorial} className='whitespace-nowrap text-ellipsis overflow-x-hidden'><img className='w-6' src="/icons/play-icon.svg" alt="ver icono" /> Ver tutorial</button>
                    </li>
                    <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-2 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                      <button onClick={handleToggleDarkMode} className='whitespace-nowrap text-ellipsis overflow-x-hidden'><img className='w-6' src="/icons/dark-mode-icon.svg" alt="sol luna icono" /> Modo noche</button>
                    </li>
                    <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-2 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                      <button onClick={handleOpenModalShortcut} className='whitespace-nowrap text-ellipsis overflow-x-hidden'><img className='w-6' src="/icons/info-icon.svg" alt="informacion icono" /> Ver atajos</button>
                    </li>
                    <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:text-error [&>button]:py-2 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                      <button onClick={handleLogOut} className='whitespace-nowrap text-ellipsis overflow-x-hidden'><img className='w-6' src="/icons/logout-icon.svg" alt="salir icono" /> Cerrar sesión</button>
                    </li>
                  </ul>
                </div>
              )
            }
          </div>
        </div>
      </header>
    </>
  )
}

export default Header

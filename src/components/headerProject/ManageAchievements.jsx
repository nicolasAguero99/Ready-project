import { useEffect, useContext, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

// Constants
import { ACHIEVEMENTS, ACTIVITY_TYPE_MSG, PATH_LINKS, URL_API } from '../../../constants/constants'

// Utils
import { SocketAction, SocketOnUpdateAchievements } from '../../../utils/socket'
import { getUsersListByProject } from '../../../utils/utils'

// Items
import ProfilePicture from '../items/ProfilePicture'

// Context
import { UsersProjectContext } from '../../../context/UsersContext'

const ManageAchievements = ({ setlistOptionsShow }) => {
  const [usersListByProject, setUsersListByProject] = useContext(UsersProjectContext)
  const [showAchievementsPage, setShowAchievementsPage] = useState(null)
  const [usersSelected, setUsersSelected] = useState([])
  const [achievementsCurrentProject, setAchievementsCurrentProject] = useState([])
  const [dataAchievement, setDataAchievement] = useState({ name: '', description: '' })
  const { projectName } = useParams()

  useEffect(() => {
    SocketOnUpdateAchievements(setUsersListByProject)
  }, [])

  useEffect(() => {
    getAchievements()
  }, [usersListByProject])

  useEffect(() => {
    getUsersListByProject().then((res) => setUsersListByProject(res))
  }, [projectName])

  const getAchievements = async () => {
    if (!usersListByProject) return
    const users = new Set()
    usersListByProject.forEach(user => user.achievements.forEach(achievement => users.add(achievement)))
    const userArray = Array.from(users)
    const allAchievements = await axios.get(`${URL_API}${ACHIEVEMENTS}`, { params: { achievementsId: userArray } })
    setAchievementsCurrentProject(allAchievements.data)
  }

  const prepareUserAchievements = (achievementsByUser) => {
    const userAchievements = achievementsCurrentProject
      .filter(achievement => achievementsByUser.includes(achievement._id) && achievement.project === projectName)
      .map(achievement => (
        <img key={achievement._id} title={achievement.name} className='w-5 lg:w-6' src="/illustrations/medal-archievent.svg" alt="medal illustration" />
      ))
    return userAchievements
  }

  const handleAchievementData = (e) => {
    const { name, value } = e.target
    setDataAchievement({
      ...dataAchievement,
      [name]: value
    })
  }

  const handleCheckboxUsers = (user) => {
    const index = usersSelected.indexOf(user)

    if (index === -1) {
      setUsersSelected([...usersSelected, user])
    } else {
      setUsersSelected(usersSelected.filter(u => u._id !== user._id))
    }
  }

  const handleAchievements = () => setShowAchievementsPage(1)

  const handleCancelAchievementsPage = () => {
    setShowAchievementsPage(null)
    setlistOptionsShow(false)
    setUsersSelected([])
  }

  const handleBackAchievementsPage = () => {
    setShowAchievementsPage(1)
    // setUsersSelected([])
  }

  const handleAsignAchievements = () => setShowAchievementsPage(2)

  const handleAcceptAchievements = async () => {
    const achievementInfo = await axios.post(`${URL_API}${ACHIEVEMENTS}/add`, { dataAchievement, projectName })
    const usersId = usersSelected.map(user => user._id)
    SocketAction('updateAchievementsByUsers', { achievement: achievementInfo.data._id, usersId })
    setShowAchievementsPage(null)
    setUsersSelected([])
    setlistOptionsShow(false)
    usersSelected.map(user =>
      SocketAction('activity', { author: user._id, taskName: dataAchievement.name, typeMessage: ACTIVITY_TYPE_MSG.addAchievement, currentProject: projectName, isAchievement: true })
    )
  }

  return (
    <>
      <div className={`${showAchievementsPage ? 'block' : 'hidden'} bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[80]`}></div>
      {
        showAchievementsPage &&
        <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:w-3/4 flex flex-col gap-4 p-8 lg:p-12 rounded-[20px] z-[90]'>
          <div className='flex gap-4 relative max-md:justify-center'>
            <button onClick={handleBackAchievementsPage} className={`${showAchievementsPage === 2 ? 'block' : 'hidden'} absolute top-2.5 md:top-3.5 -left-3 md:-left-4`}>
              <img className='w-3 md:w-4 rotate-90 dark:invert' src="/icons/chevron-icon.svg" alt="mas opciones" />
            </button>
            <h3 className='text-xl lg:text-3xl max-md:text-center font-semibold text-pink md:ms-4'>Administrar insignias</h3>
            <button onClick={handleCancelAchievementsPage} className='absolute top-1 md:-top-0 lg:top-1 -right-4 md:-right-2 sm:right-0'>
              <img className='w-5 md:w-6' src="/icons/cross-icon.svg" alt="cerrar modal" />
            </button>
          </div>
          <p className='text-sm max-md:text-center lg:text-base md:ms-4'>{showAchievementsPage === 1 ? ('Marcá las casillas de los miembros del equipo para asignarles una insignia.') : showAchievementsPage === 2 ? ('Completá los datos para asignar la insignia.') : ''}</p>
          {
            showAchievementsPage === 1
              ? (
                <>
                  <div className='flex flex-col gap-6 mt-4 sm:mt-0'>
                    <div className='max-md:hidden flex justify-between text-softGrey  dark:text-darkSoftGrey w-full md:w-[95%] pe-6'>
                      <span>Usuarios del tablero</span>
                      <span className='hidden md:block ms-10'>Rol de trabajo</span>
                      <span className='ms-0 me-8 md:ms-0 md:me-2'>Insignias obtenidas</span>
                      <span className='hidden sm:block'></span>
                    </div>
                    <ul className='flex flex-col gap-8 w-full md:w-[95%] max-h-[320px] px-2 sm:px-0 md:pe-6 overflow-y-auto overflow-x-auto lg:overflow-x-visible'>
                      {
                        usersListByProject.map(user => (
                          <li key={user._id} className='flex justify-between items-center gap-4'>
                            <div className='flex gap-4 md:gap-6 items-center w-48 md:w-60'>
                              <input onChange={() => handleCheckboxUsers(user)} checked={usersSelected.some(u => u._id === user._id)} className="w-4 lg:w-5 h-4 lg:h-5 accent-pink cursor-pointer outline-1 after:block" type="checkbox" />
                              <ProfilePicture wH={'w-9 lg:w-10 h-9 lg:h-10'} img={user.photo} alt={user.name} border />
                              <div className='flex flex-col'>
                                <span className='max-md:hidden w-24 text-ellipsis overflow-x-hidden whitespace-nowrap text-base lg:text-lg'>{user.name}</span>
                                <Link to={`${PATH_LINKS.user}/${user._id}`} className='md:hidden w-24 text-ellipsis overflow-x-hidden whitespace-nowrap text-base lg:text-lg underline'>{user.name}</Link>
                                <small className='block md:hidden first-letter:uppercase text-softGrey  dark:text-darkSoftGrey text-xs'>{user.role}</small>
                              </div>
                            </div>
                            <small className="hidden md:block w-36 text-center text-ellipsis overflow-x-hidden whitespace-nowrap text-whiteText text-xs md:text-sm py-0.5 px-4 mx-6 rounded-[30px] first-letter:uppercase bg-pink">{user.role}</small>
                            <div className="flex gap-2 sm:gap-4 md:w-36 font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap">
                              {prepareUserAchievements(user.achievements)}
                            </div>
                            <Link to={`${PATH_LINKS.user}/${user._id}`} className='max-md:hidden w-20 font-medium text-pink text-sm lg:text-base'>Ver perfil</Link>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </>
                )
              : showAchievementsPage === 2
                ? (
                  <div className='w-full h-full flex justify-center items-center m-auto rounded-[10px] my-4 py-6'>
                    <div className='flex flex-col flex-1 gap-6 items-center'>
                      <img src="/illustrations/medal-illustration.svg" alt="medal badge" />
                      <input onChange={handleAchievementData} name='name' className='w-full md:w-4/5 text-center bg-lightBckg dark:bg-darkBckg rounded-full outline-none px-4 py-2 text-base md:text-lg' type="text" placeholder='¿Cuál es el reconocimiento? *' />
                      <input onChange={handleAchievementData} name='description' className='w-full md:w-4/5 text-center bg-lightBckg dark:bg-darkBckg rounded-full outline-none px-4 py-2' type="text" placeholder='Descripción del reconocimiento' />
                    </div>
                  </div>
                  )
                : null
          }
          <div className='flex flex-1 justify-end items-end mt-6'>
            <button onClick={showAchievementsPage === 1 ? handleAsignAchievements : showAchievementsPage === 2 ? handleAcceptAchievements : null} disabled={usersSelected.length < 1} className='w-fit h-fit font-semibold text-whiteText md:text-sm text-xs px-4 py-2 rounded-full bg-pink disabled:bg-extraSoftGrey'>{showAchievementsPage === 1 ? ('Continuar') : showAchievementsPage === 2 ? ('Asignar medalla') : ''}</button>
          </div>
        </div>
      }
      {
        projectName &&
        <button onClick={handleAchievements}>
            <img className='w-5' src="/icons/achievement-icon.svg" alt="administrar insignias" />
          Admin. Insignias
        </button>
      }
    </>
  )
}

export default ManageAchievements

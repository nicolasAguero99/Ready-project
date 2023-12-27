import { useParams, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'

// Components
import Header from '../Header'
import Nav from '../Nav'

// Context
import { CurrentUserContext, UsersContext } from '../../../context/UsersContext'
import { PetsContext } from '../../../context/PetsContext'
import { StateTasksContext } from '../../../context/TasksContext'

// Utils
import { formatedBirthdayDate, formatedDate, userAge } from '../../../utils/utils'

// Constants
import { ACHIEVEMENTS, PATH_LINKS, PROJECTS_URL, URL_API, URL_COLLECTION_TASK, USERS_GET_BY_ID_URL, USERS_URL } from '../../../constants/constants'

// Items
import ProfilePicture from '../items/ProfilePicture'
import ProfilePet from '../items/ProfilePet'

const User = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [usersList] = useContext(UsersContext)
  const [petsList] = useContext(PetsContext)
  const [statesTasks] = useContext(StateTasksContext)
  const [allTasksList, setAllTasksList] = useState([])
  const [projectsUser, setProjectsUser] = useState([])
  const [achievements, setAchievements] = useState([])
  const [userData, setUserData] = useState([])
  // const [achievementsLength, setAchievementsLength] = useState(0)
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getUserData()
  }, [])

  const getUserData = async () => {
    // if (!currentUser) return
    if (userId === currentUser?._id) {
      navigate(PATH_LINKS.profile, { replace: true })
      return
    }
    try {
      const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${userId}`)
      console.log('user', user)
      if (!user?.data?._id) {
        navigate(PATH_LINKS.dashboard, { replace: true })
        return
      }
      setUserData(user.data)
      const projectsData = await axios.get(`${URL_API}${PROJECTS_URL}/get`, { params: { member: userId } })
      setProjectsUser(projectsData.data)
      console.log('user', user.data)
      getAllTasks()
    } catch (error) {
      navigate(PATH_LINKS.dashboard, { replace: true })
    }
  }

  const getAchievementsByUser = async () => {
    const achievementsByCurrentUser = await axios.get(`${URL_API}${ACHIEVEMENTS}/${USERS_URL}/${userId}`)
    setAchievements(achievementsByCurrentUser.data)
    console.log('achievementsByCurrentUser', achievementsByCurrentUser.data)
  }

  // const getAllPets = async () => {
  //   if (!petsList) return
  //   console.log('petsList', petsList)
  // }

  const getAllTasks = async () => {
    if (!userId) return
    const allTasks = await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${USERS_URL}/${userId}`)
    const allTasksSorted = allTasks.data.sort((a, b) => {
      const dateA = new Date(JSON.parse(a.date)[0])
      const dateB = new Date(JSON.parse(b.date)[0])
      if (dateA === dateB) {
        return dateA - dateB
      } else {
        const dateA = new Date(JSON.parse(a.date)[1])
        const dateB = new Date(JSON.parse(b.date)[1])
        return dateA - dateB
      }
    }).slice(0, 5)
    console.log('allTasks', allTasksSorted)
    setAllTasksList(allTasksSorted)
    getAchievementsByUser()
  }

  return (
    <div className='flex'>
      <Nav />
      <main className='bg-lightBckg dark:bg-darkBckg flex flex-col gap-12 flex-1 px-10 rounded-[20px] m-4 py-5'>
        <Header />
        <div className='flex flex-col min-[870px]:flex-row gap-8'>
          <div className='min-[870px]:w-[410px] flex flex-col gap-8'>
            <section id='profile-info' className='relative bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col items-center gap-8 p-6 rounded-lg shadow-cardTask'>
              <div className="flex flex-col gap-4 items-center text-center">
                <div className='relative w-fit h-fit'>
                  <ProfilePicture wH={'w-28 h-28'} img={userData?.photo} alt={userData?.name} />
                  {
                    userData?.petSelected &&
                    <ProfilePet img={petsList?.find(pet => pet._id === userData?.petSelected)?.img} alt={`pet ${petsList?.find(pet => pet._id === userData?.petSelected)?.name}`} />
                  }
                </div>
                <h1 className="md:text-3xl text-2xl font-medium capitalize">{userData?.name ?? 'Nombre Apellido'}</h1>
                <span className="w-fit bg-pink text-lightBckg text-md rounded-full py-1 px-4 first-letter:uppercase m-auto">{userData?.role ?? 'Rol'}</span>
              </div>
              <ul className='flex flex-col gap-4'>
                <li className='flex gap-4'><img src="/icons/cake-icon.svg" alt="cake icon" /><span>{formatedBirthdayDate(userData?.birthday) ?? '00/00/00'} ({userAge(userData?.birthday) ?? '00'} años)</span></li>
                <li className='flex gap-4'><img src="/icons/location-icon.svg" alt="location icon" /><span>{userData?.location}</span></li>
                <li className='flex gap-4'><img src="/icons/telephone-icon.svg" alt="phone icon" /><span>{userData.phone}</span></li>
                <li className='flex gap-4'><img src="/icons/mail-icon.svg" alt="mail icon" /><span>{userData?.email ?? 'email@gmail.com'}</span></li>
              </ul>
            </section>
            <section id='profile-description' className='relative bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col flex-1 gap-6 p-6 rounded-lg shadow-cardTask'>
              <div className='flex justify-between items-center gap-4'>
                <h2 className="md:text-xl text-base font-medium">Sobre mí</h2>
              </div>
              <p>{userData.description}</p>
            </section>
          </div>
          <div className='flex flex-1 flex-col gap-8'>
            <section id='profile-summary'>
              <ul className="flex flex-col xl:flex-row gap-4">
                <li className="bg-lightExtraBckg dark:bg-darkExtraBckg flex xl:flex-col flex-1 min-xl:justify-center max-xl:items-center gap-4 px-4 py-2 border-s-8 rounded-lg border-pink shadow-cardTask">
                  <span className="text-2xl font-semibold ">{projectsUser?.length.toString().padStart(2, '0') ?? '--'}</span>
                  <span className="md:text-base text-sm">Proyectos en los que está</span>
                </li>
                <li className="bg-lightExtraBckg dark:bg-darkExtraBckg flex xl:flex-col flex-1 min-xl:justify-center max-xl:items-center gap-4 px-4 py-2 border-s-8 rounded-lg border-orange shadow-cardTask">
                  <span className="text-2xl font-semibold">{userData?.achievements?.length.toString().padStart(2, '0') ?? '--'}</span>
                  <span className="md:text-base text-sm">Insignias conseguidas</span>
                </li>
                <li className="bg-lightExtraBckg dark:bg-darkExtraBckg flex xl:flex-col flex-1 min-xl:justify-center max-xl:items-center gap-4 px-4 py-2 border-s-8 rounded-lg border-aqua shadow-cardTask">
                  <span className="text-2xl font-semibold">{userData?.points?.reduce((accumulator, point) => { return accumulator + (point.count || 0) }, 0).toString().padStart(2, '0') ?? '--'}</span>
                  <span className="md:text-base text-sm">Tareas completadas</span>
                </li>
              </ul>
            </section>
            <section id='profile-tasks' className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-6 justify-between p-6 rounded-lg shadow-cardTask">
              <div className="flex justify-between">
                <h2 className="md:text-xl text-base font-semibold">Sus tareas</h2>
                {/* <Link to={PATH_LINKS.allTasks} className="text-pink text-center text-sm">Ver todas</Link> */}
              </div>
              <ul className="flex flex-col divide-y divide-extraSoftGrey">
                {allTasksList.map(task => (
                  task.state !== statesTasks[2]
                    ? (
                        <li key={task._id} className="flex justify-between flex-1 items-center py-4">
                          <div className="flex flex-col pe-0 lg:pe-4">
                            <h3 className="font-medium w-32 text-ellipsis overflow-x-hidden whitespace-nowrap" title={task.name}>{task.name}</h3>
                            <span className="md:text-sm text-xs w-32 text-ellipsis overflow-x-hidden whitespace-nowrap">{projectsUser?.find(project => project.to === task.project)?.name}</span>
                            <span className="flex lg:hidden text-softGrey  dark:text-darkSoftGrey text-sm w-36 text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDate(JSON.parse(task.date))}</span>
                          </div>
                          <span className="hidden lg:flex w-36 font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDate(JSON.parse(task.date))}</span>
                          <span className="hidden xl:block w-32 h-fit text-whiteText md:text-sm text-xs text-center py-0.5 px-4 rounded-[30px] first-letter:uppercase bg-pink">{task.state}</span>
                          <ul className="w-24 flex justify-end -space-x-2.5">
                            {task.users.map((user, index) =>
                              index < 3 &&
                              <li key={user}>
                                <ProfilePicture wH={'w-7 h-7'} img={usersList.find(u => u._id === user)?.photo} alt={usersList.find(u => u._id === user)?.name} border />
                              </li>
                            )}
                            {
                              task.users.length >= 4 && (
                                <div className='w-7 h-7 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${task.users.length - 3}`}</div>
                              )
                            }
                          </ul>
                        </li>
                      )
                    : null
                ))}
              </ul>
            </section>
            <section id='profile-achievements' className='bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-4 justify-center p-6 rounded-lg shadow-cardTask'>
              <div className='flex gap-4 justify-between items-center'>
                <h2 className='w-fit font-medium md:text-base text-xl'>Insignias conseguidas</h2>
                {/* <Link to={PATH_LINKS.tasks} className="text-pink text-center text-sm">Ver todas</Link> */}
              </div>
              <div className='flex gap-4 justify-between items-center'>
                <p className='hidden lg:block w-2/3 md:text-sm text-xs text-softGrey  dark:text-darkSoftGrey'>Una forma de reconocimiento de su buen trabajo y agradecimiento por sus buenos actos.</p>
                <div className='flex gap-4 justify-between items-center'>
                  {
                    achievements.length > 0
                      ? achievements?.map((achievement, index) =>
                        index < 3 && <img key={achievement} className='w-8' src="/illustrations/medal-archievent.svg" alt="medal archievent" />
                      )
                      : 'Todavía no tenés insignias'
                  }
                  {
                    achievements.length >= 4 && <div className='w-7 h-7 text-sm flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${achievements.length - 3}`}</div>
                  }
                </div>
              </div>
            </section>
          </div>
        </div >
      </main >
    </div >
  )
}

export default User

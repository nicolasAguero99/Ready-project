import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Calendar } from 'react-date-range'
import { format } from 'date-fns'

// Constants
import { URL_API, PROJECTS_URL, PATH_LINKS, ACTIVITY_URL, COLOR_PRIMARY, ALERT_MSG, ALERT_TYPE, URL_COLLECTION_TASK, USERS_URL } from '../../../constants/constants'

// Utils
import { colorTaskState, currentHourDashboard, formatedDate } from '../../../utils/utils'
import { SocketAction } from '../../../utils/socket'

// Items
import ProfilePicture from '../items/ProfilePicture'
import Alert from '../items/Alert'
import LoadingActivitiesSummary from '../items/loadings/LoadingActivitiesSummary'
import LoadingAllTasks from '../items/loadings/LoadingAllTasks'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
import { StateTasksContext } from '../../../context/TasksContext'
import { ProjectsContext } from '../../../context/ProjectsContext'
import { AlertContext } from '../../../context/AlertContext'

const Main = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [projectsList] = useContext(ProjectsContext)
  const [statesTasks] = useContext(StateTasksContext)
  const [, setAlert] = useContext(AlertContext)
  const [usersList, setUsersList] = useState([])
  const [allTasksList, setAllTasksList] = useState([])
  const [reducedTasksList, setReducedTasksList] = useState([])
  const [activityList, setActivityList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [monthsView, setMonthsView] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAct, setIsLoadingAct] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const showModalState = location.state?.showModal
  const currentProject = location.state?.project
  const currentNameProject = location.state?.nameProject

  useEffect(() => {
    const monthsResize = () => {
      if (window.innerWidth <= 770 || window.innerWidth >= 1024) {
        setMonthsView(1)
      } else {
        setMonthsView(2)
      }
    }
    monthsResize()
    window.addEventListener('resize', monthsResize)
    return () => {
      window.removeEventListener('resize', monthsResize)
    }
  }, [])

  useEffect(() => {
    getUsersList()
  }, [currentUser])

  useEffect(() => {
    getActivity()
  }, [projectsList])

  useEffect(() => {
    getAllTasks()
  }, [currentUser, statesTasks])

  useEffect(() => {
    setShowModal(showModalState)
  }, [])

  const getUsersList = async () => {
    if (!currentUser) return
    const allTasks = await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${USERS_URL}/${currentUser?._id}`)
    const usersId = allTasks.data.map(task => task.users)
    const usersIdArray = new Set(usersId.flat())
    const users = await axios.get(`${URL_API}${USERS_URL}/get`, { params: { usersId: [...usersIdArray] } })
    setUsersList(users.data)
  }

  const customDayContent = (day) => {
    const isTaskDate = allTasksList.some(task => {
      const taskDate = JSON.parse(task.date)?.[0]
      return taskDate && format(new Date(taskDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    })

    return (
      <div>
        {isTaskDate && (
          <div
            style={{
              height: '5px',
              width: '5px',
              borderRadius: '100%',
              background: '#DF437E',
              position: 'absolute',
              top: 2,
              right: 6
            }}
          />
        )}
        <span>{format(day, 'd')}</span>
      </div>
    )
  }

  const getAllTasks = async () => {
    if (!currentUser) return
    const allTasks = await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${USERS_URL}/${currentUser?._id}`)
    setAllTasksList(allTasks.data)
    const allTasksSorted = allTasks.data.filter(task => task.state !== statesTasks[2]).splice(0, 5).sort((a, b) => {
      const dateA = new Date(JSON.parse(a.date)[0])
      const dateB = new Date(JSON.parse(b.date)[0])
      if (dateA === dateB) {
        return dateA - dateB
      } else {
        const dateA = new Date(JSON.parse(a.date)[1])
        const dateB = new Date(JSON.parse(b.date)[1])
        return dateA - dateB
      }
    })
    setReducedTasksList(allTasksSorted)
    setIsLoading(false)
  }

  const getActivity = async () => {
    if (projectsList.length < 0) return
    const projectsTo = projectsList.map(project => project.to)
    const activityData = await axios.get(`${URL_API}${ACTIVITY_URL}/${PROJECTS_URL}/getAll`, { params: { projectsList: projectsTo, reducedTo: 15 } })
    setActivityList(activityData.data.splice(0, 16))
    setIsLoadingAct(false)
  }

  const getUserFromId = (userId) => {
    const user = usersList?.find(user => user?._id === userId)
    return user ?? { name: 'Usuario expulsado', photo: 'default-profile-penguin', expelled: true }
  }

  const handleAcceptInvitation = async () => {
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.applicationSended, duration: 3000 })
    await axios.post(`${URL_API}${PROJECTS_URL}/accept-invitation`, {
      currentProject,
      currentUserId: currentUser._id
    })
    SocketAction('waitingList', { currentProject })
    setShowModal(false)
    navigate(PATH_LINKS.dashboard, { replace: true })
  }

  const handleCancelInvitation = () => {
    setShowModal(false)
    navigate(PATH_LINKS.dashboard, { replace: true })
  }

  return (
    <>
    {
      showModal &&
      (
        <>
          <div className={'bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[60]'}></div>
          <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:max-w-[1100px] flex flex-col-reverse md:flex-row justify-between items-center gap-4 p-8 lg:p-12 rounded-[20px] z-[65]'>
            <div className='w-4/5 md:w-3/4 lg:w-1/2 flex flex-col justify-center max-md:items-center gap-4'>
              <span className='md:text-4xl text-3xl font-semibold text-pink lg:mb-10'>¡Que emoción!</span>
              <small className='text-sm lg:text-base'>Te invitaron a ser partícipe de <b className='font-semibold'>{currentNameProject}</b> </small>
              <p className='text-sm lg:text-base text-softGrey  dark:text-darkSoftGrey text-center md:text-left'>Al aceptar la invitación, le estarás mandando una solicitud al dueño del tablero para que pueda aceptarte.</p>
              <div className='flex flex-col w-full md:flex-row gap-x-6 gap-y-4 mt-6 max-md:justify-center'>
                <button onClick={handleCancelInvitation} className='max-md:w-full border-2 border-pink text-pink rounded-full px-4 py-2 transition-colors duration-300 hover:bg-pink hover:text-whiteText'>No, gracias</button>
                <button onClick={handleAcceptInvitation} className='max-md:w-full bg-pink text-lightExtraBckg rounded-full px-4 py-2 transition-colors duration-300 hover:bg-lightExtraBckg dark:bg-darkExtraBckg border-2 border-pink hover:text-pink'>¡Aceptar invitación!</button>
              </div>
            </div>
            <div className='w-fit'>
              <img className='w-full dark:invert' src="/illustrations/wellDone-illustration.png" alt="imagen bien hecho" />
            </div>
          </div>
        </>
      )
    }
      <Alert />
      <main className='flex max-lg:flex-col gap-4 justify-center'>
        <div className='flex flex-col gap-6 lg:w-2/3'>
          <section className='flex flex-col gap-6'>
            <div className='relative flex justify-between items-center px-4 max-sm:py-4 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[20px] shadow-cardTask'>
              <div className='flex flex-col gap-2 lg:gap-4'>
                <h1 className='font-semibold text-2xl md:text-3xl pe-14'>¡Buenos días, {currentUser?.name}!</h1>
                <p className='font-normal text-softGrey'>Tené un lindo día de trabajo.</p>
                <span className='text-pink md:text-2xl'>{currentHourDashboard()}</span>
              </div>
              <img className='max-sm:hidden relative w-36 py-4 right-8 dark:invert' src="/illustrations/work-illustration.png" alt="trabajo ilustracion" />
              <span hidden className='hidden text-orange'></span>
              <span hidden className='hidden text-aqua'></span>
            </div>
            <section className="flex max-sm:flex-col gap-4">
              {
                projectsList.length > 0
                  ? [...projectsList].splice(0, 3).map(project => (
                      <Link key={project?._id} to={`/project/${project.to}/tablero`} style={{ backgroundColor: project?.color }} className='relative w-full bg-orange rounded-full ps-8 p-4 overflow-hidden hover:scale-95 transition-transform duration-300 ease-out'>
                        <h3 className='text-lightExtraBckg font-medium lg:text-[20px] xl:text-[24px] whitespace-nowrap overflow-x-hidden text-ellipsis'>{project?.name}</h3>
                        <div className='absolute bottom-0 right-0 w-fit h-fit'>
                        </div>
                      </Link>
                    ))
                  : <div className='relative w-full bg-extraSoftGrey rounded-[20px] p-4 overflow-hidden'>
                    <h3 className='text-lightExtraBckg font-medium lg:text-[20px] xl:text-[24px] whitespace-nowrap overflow-x-hidden text-ellipsis text-center'>No tenés proyectos</h3>
                    <div className='absolute bottom-0 right-0 w-fit h-fit'>
                    </div>
                  </div>
              }
            </section>
          </section>
        <section className='h-full bg-lightExtraBckg dark:bg-darkExtraBckg py-8 rounded-[20px] shadow-cardTask'>
          <div className='flex gap-4 justify-between items-center px-6 pb-4'>
            <h3 className='font-semibold text-xl lg:text-2xl'>Tu próximo trabajo</h3>
            <Link to={PATH_LINKS.allTasks} className="text-pink text-center text-sm lg:text-base">Ver todas</Link>
          </div>
            {
              isLoading
                ? <div className='px-6'>
                    <LoadingAllTasks />
                    <LoadingAllTasks />
                    <LoadingAllTasks />
                    <LoadingAllTasks />
                    <LoadingAllTasks />
                  </div>
                : reducedTasksList.length <= 0
                  ? <div className='flex flex-col items-center gap-6 md:mt-10'>
                      <img className='w-40 md:w-60 dark:invert' src="/illustrations/happy-illustration.png" alt="feliz ilustración" />
                      <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No tenés tareas</p>
                    </div>
                  : <ul className="flex flex-col flex-1 px-6">
                    {reducedTasksList.map(task => (
                      task.state !== statesTasks[2]
                        ? (
                            <li key={task._id} className="flex justify-between flex-1 items-center py-4">
                              <div className="flex flex-col">
                                <h4 className="font-semibold w-32 text-ellipsis overflow-x-hidden whitespace-nowrap" title={task.name}>{task.name}</h4>
                                <span className="md:text-sm text-xs text-ellipsis overflow-x-hidden whitespace-nowrap">{projectsList?.find(project => project.to === task.project)?.name}</span>
                              </div>
                              <span className="w-32 font-medium max-sm:text-center text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDate(JSON.parse(task.date))}</span>
                              <span className={`max-sm:hidden w-32 h-fit md:text-sm text-xs text-center py-0.5 px-4 rounded-[30px] first-letter:uppercase border-[1px] ${colorTaskState(task.state)}`}>{task.state}</span>
                              <ul className="w-24 flex justify-end -space-x-2.5">
                                {task.users.map((user, index) =>
                                  index < 3 &&
                                  <li key={user}>
                                    <ProfilePicture wH={'w-7 h-7'} img={usersList?.find(u => u._id === user)?.photo} alt={usersList?.find(u => u._id === user)?.name} border />
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
              }
        </section>
        </div>
        <div className='flex flex-col flex-1 gap-4 lg:w-2/3'>
          <section className='bg-lightExtraBckg dark:bg-darkExtraBckg max-sm:hidden flex flex-1 w-full justify-center px-4 py-6 rounded-[20px] shadow-cardTask'>
            <Calendar
              months={monthsView}
              direction='horizontal'
              color={COLOR_PRIMARY}
              dayContentRenderer={customDayContent}
            />
          </section>
          <section className='bg-lightExtraBckg dark:bg-darkExtraBckg pe-2 py-8 rounded-[20px] shadow-cardTask'>
            <div className='flex gap-4 justify-between items-center px-6 pb-4'>
              <h3 className='font-semibold text-xl lg:text-xl'>Actividad reciente</h3>
              <Link to={PATH_LINKS.notifications} className="text-pink text-center text-sm xl:text-base">Ver todas</Link>
            </div>
            {
              isLoadingAct
                ? <>
                    <LoadingActivitiesSummary />
                    <LoadingActivitiesSummary />
                    <LoadingActivitiesSummary />
                  </>
                : <ul className="h-[240px] flex flex-col divide-y divide-extraSoftGrey dark:divide-softGrey px-6 overflow-y-auto">
                {
                  activityList.length > 0
                    ? (
                        activityList.map(activity => (
                          activity.toMembers.length === 0
                            ? (
                              <li key={activity._id} className="flex items-center py-4">
                                <div className='flex-1 flex flex-wrap gap-4 justify-between items-center'>
                                  <div className='flex gap-4 items-center lg:text-base text-sm'>
                                    {
                                      !activity.isAchievement
                                        ? <ProfilePicture wH={`w-12 h-12 ${getUserFromId(activity.author)?.expelled ? 'grayscale' : ''}`} img={getUserFromId(activity.author)?.photo} alt={getUserFromId(activity.author)?.name} border />
                                        : <img className='w-12' src="/illustrations/medal-illustration.svg" alt="insignia icono" />
                                    }
                                    <p>
                                      <strong className="font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap first-letter:uppercase">
                                        {getUserFromId(activity.author)?.name}
                                      </strong> {activity.action}
                                    </p>
                                  </div>
                                </div>
                              </li>
                              )
                            : (activity.toMembers.includes(currentUser?._id) &&
                                (
                                  <li key={activity._id} className="flex items-center py-4">
                                    <div className='flex-1 flex flex-wrap gap-4 justify-between items-center'>
                                      <div className='flex gap-4 items-center lg:text-base text-sm'>
                                        <img className='w-[48px]' src="/illustrations/star-illustration.svg" alt="estrella ilustración" />
                                        <p className='first-letter:uppercase font-semibold'>{activity.action}</p>
                                      </div>
                                    </div>
                                  </li>
                                )
                              )
                        ))
                      )
                    : <div className='flex flex-col items-center gap-2 md:mt-10'>
                        <img className='w-40 dark:invert' src="/illustrations/no-activities-illustration.png" alt="aburrido ilustración" />
                        <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay actividades</p>
                      </div>
                }
              </ul>
            }
          </section>
        </div>
      </main>
    </>
  )
}

export default Main

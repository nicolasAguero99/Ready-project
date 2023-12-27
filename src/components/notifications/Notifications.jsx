import { useContext, useEffect, useState } from 'react'
import axios from 'axios'

// Components
import Header from '../Header'
import Nav from '../Nav'

// Itmes
import ProfilePicture from '../items/ProfilePicture'
import LoadingActivities from '../items/loadings/LoadingActivities'

// Constants
import { ACTIVITY_URL, PROJECTS_URL, URL_API, URL_COLLECTION_TASK, USERS_URL } from '../../../constants/constants'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
import { ProjectsContext } from '../../../context/ProjectsContext'

// Utils
import { formatedDateForActivity } from '../../../utils/utils'

const Notifications = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [projectsList] = useContext(ProjectsContext)
  // const { projectName } = useParams()
  const [usersList, setUsersList] = useState([])
  const [activityList, setActivityList] = useState([])
  const [sectionNotifications, setSectionNotifications] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getUsersList()
  }, [currentUser])

  useEffect(() => {
    getActivity()
  }, [projectsList])

  const getUsersList = async () => {
    if (!currentUser) return
    const allTasks = await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${USERS_URL}/${currentUser?._id}`)
    const usersId = allTasks.data.map(task => task.users)
    const usersIdArray = new Set(usersId.flat())
    const users = await axios.get(`${URL_API}${USERS_URL}/get`, { params: { usersId: [...usersIdArray] } })
    setUsersList(users.data)
    setIsLoading(false)
  }

  const getActivity = async () => {
    if (projectsList.length < 0) return
    const projectsTo = projectsList.map(project => project.to)
    const activityData = await axios.get(`${URL_API}${ACTIVITY_URL}/${PROJECTS_URL}/getAll`, { params: { projectsList: projectsTo } })
    setActivityList(activityData.data)
  }

  const getUserFromId = (userId) => {
    const user = usersList?.find(user => user?._id === userId)
    return user ?? { name: 'Usuario expulsado', photo: 'default-profile-penguin', expelled: true }
  }

  const getProjectName = (project) => {
    const projectName = projectsList.find(p => p.to === project)?.name
    return projectName
  }

  const handleToggleSectionNotifications = (section) => {
    setSectionNotifications(section)
  }

  return (
    <div className='flex'>
      <Nav />
      <main className='bg-lightBckg dark:bg-darkBckg flex flex-col gap-12 flex-1 px-10 rounded-[20px] m-4 py-5'>
        <Header />
        <div className='flex gap-8'>
          <div className='flex flex-col flex-1 gap-8'>
            <h1 className="text-2xl sm:text-3xl font-medium">Tus notificaciones</h1>
            <div className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-2 justify-between p-6 rounded-lg shadow-cardTask">
                <div className='flex max-md:flex-col gap-x-10 gap-y-4 justify-center items-center pt-6'>
                  <button onClick={() => handleToggleSectionNotifications(1)} className={`${sectionNotifications === 1 ? 'max-md:bg-pink max-md:text-whiteText max-md:py-1 md:border-b-2 border-b-pink' : ''} max-md:w-full max-md:rounded-full font-medium text-xl`}>Notificaciones</button>
                  <button onClick={() => handleToggleSectionNotifications(2)} className={`${sectionNotifications === 2 ? 'max-md:bg-pink max-md:text-whiteText max-md:py-1 md:border-b-2 border-b-pink' : ''} max-md:w-full max-md:rounded-full font-medium text-xl`}>Actividades</button>
                  <button onClick={() => handleToggleSectionNotifications(3)} className={`${sectionNotifications === 3 ? 'max-md:bg-pink max-md:text-whiteText max-md:py-1 md:border-b-2 border-b-pink' : ''} max-md:w-full max-md:rounded-full font-medium text-xl`}>Insignias</button>
                </div>
                {
                  sectionNotifications === 1
                    ? <section className="bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] px-8 py-4">
                      {
                        isLoading
                          ? <>
                              <LoadingActivities />
                              <LoadingActivities />
                              
                              <LoadingActivities />
                              <LoadingActivities />
                              <LoadingActivities />
                            </>
                          : <ul className="flex flex-col divide-y divide-extraSoftGrey dark:divide-softGrey">
                            {
                              activityList.some(activity => activity.toMembers.includes(currentUser?._id))
                                ? (
                                    activityList.map(activity => (
                                      activity.toMembers.includes(currentUser?._id) && (
                                        <li key={activity._id} className="flex items-center py-4">
                                          <div className='flex-1 flex flex-col flex-wrap gap-4'>
                                            <small className='text-softGrey  dark:text-darkSoftGrey text-sm'>{getProjectName(activity.project)}</small>
                                            <div className='w-full flex gap-4 justify-between items-center lg:text-base text-sm'>
                                              <div className='flex gap-4 items-center'>
                                                <img className='w-[48px]' src="/illustrations/star-illustration.svg" alt="star illustration" />
                                                <p className='first-letter:uppercase'>{activity.action}</p>
                                              </div>
                                              <small className='text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(activity.createdAt)}</small>
                                            </div>
                                          </div>
                                        </li>
                                      )
                                    ))
                                  )
                                : <div className='flex flex-col items-center gap-6 md:my-10'>
                                    <img className='w-40 md:w-60 dark:invert' src="/illustrations/happy-illustration.png" alt="feliz ilustración" />
                                    <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay notificaciones</p>
                                  </div>
                            }
                            </ul>
                      }
                    </section>
                    : (sectionNotifications === 2)
                        ? <section className="bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] px-8 py-4">
                          <ul className="flex flex-col divide-y divide-extraSoftGrey dark:divide-softGrey">
                            {
                              activityList.length > 0
                                ? (
                                    activityList.map(activity => (
                                      activity.toMembers.length === 0
                                        ? (
                                            <li key={activity._id} className="flex items-center py-4">
                                              <div className='flex-1 flex flex-col flex-wrap gap-4'>
                                                  <small className='text-softGrey  dark:text-darkSoftGrey text-sm'>{getProjectName(activity.project)}</small>
                                                <div className='w-full flex gap-4 justify-between items-center lg:text-base text-sm'>
                                                  <div className='flex gap-4 items-center'>
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
                                                    <small className='text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(activity.createdAt)}</small>
                                                  </div>
                                                </div>
                                            </li>
                                          )
                                        : (activity.toMembers.includes(currentUser?._id) &&
                                            (
                                              <li key={activity._id} className="flex items-center py-4">
                                                <div className='flex-1 flex flex-col flex-wrap gap-4'>
                                                  <small className='text-softGrey  dark:text-darkSoftGrey text-sm'>{getProjectName(activity.project)}</small>
                                                  <div className='w-full flex gap-4 justify-between items-center lg:text-base text-sm'>
                                                    <div className='flex gap-4 items-center'>
                                                      <img className='w-[48px]' src="/illustrations/star-illustration.svg" alt="star illustration" />
                                                      <p className='first-letter:uppercase font-semibold'>{activity.action}</p>
                                                    </div>
                                                    <small className='text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(activity.createdAt)}</small>
                                                  </div>
                                                </div>
                                              </li>
                                            )
                                          )
                                    ))
                                  )
                                : <div className='flex flex-col items-center gap-6 md:my-10'>
                                    <img className='w-40 md:w-60 dark:invert' src="/illustrations/no-activities-illustration.png" alt="aburrido ilustración" />
                                    <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay actividades</p>
                                  </div>
                            }
                          </ul>
                        </section>
                        : <section className="bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] px-8 py-4">
                            <ul className="flex flex-col divide-y divide-extraSoftGrey dark:divide-softGrey">
                              {
                                activityList.length > 0 && activityList.some(activity => activity.isAchievement)
                                  ? (
                                      activityList.map(activity => (
                                        activity.isAchievement &&
                                          <li key={activity._id} className="flex items-center py-4">
                                            <div className='flex-1 flex flex-col flex-wrap gap-4'>
                                                <small className='text-softGrey  dark:text-darkSoftGrey text-sm'>{getProjectName(activity.project)}</small>
                                              <div className='w-full flex gap-4 justify-between items-center lg:text-base text-sm'>
                                                <div className='flex gap-4 items-center'>
                                                    {/* <ProfilePicture wH={'w-12 h-12'} img={getUserFromId(activity.author)?.photo} alt={getUserFromId(activity.author)?.name} border /> */}
                                                    <img className='w-12' src="/illustrations/medal-illustration.svg" alt="insignia icono" />
                                                    <p>
                                                      <strong className="font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap first-letter:uppercase">
                                                        {getUserFromId(activity.author)?.name}
                                                      </strong> {activity.action}
                                                    </p>
                                                  </div>
                                                  <small className='text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(activity.createdAt)}</small>
                                                </div>
                                              </div>
                                          </li>
                                      )
                                      ))
                                  : <div className='flex flex-col items-center gap-6 md:my-10'>
                                      <img className='w-40 md:w-60 dark:invert' src="/illustrations/happy-illustration.png" alt="feliz ilustración" />
                                      <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay notificaciones de insignias</p>
                                    </div>
                              }
                            </ul>
                          </section>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Notifications

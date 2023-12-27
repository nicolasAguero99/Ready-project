import { useContext, useEffect, useState } from 'react'
import axios from 'axios'

// Components
import Header from '../Header'
import Nav from '../Nav'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
import { ProjectsContext } from '../../../context/ProjectsContext'
import { StateTasksContext } from '../../../context/TasksContext'

// Utils
import { colorPriority, colorTaskState, formatedDate } from '../../../utils/utils'

// Constants
import { URL_API, URL_COLLECTION_TASK, USERS_URL } from '../../../constants/constants'

// Items
import ProfilePicture from '../items/ProfilePicture'
import LoadingAllTasks from '../items/loadings/LoadingAllTasks'

const AllTasks = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [projectsList] = useContext(ProjectsContext)
  const [statesTasks] = useContext(StateTasksContext)
  const [usersList, setUsersList] = useState([])
  const [allTasksList, setAllTasksList] = useState([])
  // const [usersData, setUsersData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAllTasks()
    console.log('usersList', usersList)
  }, [currentUser])

  // useEffect(() => {
  //   console.log('usersData', usersData)
  //   if (usersData.length <= 0) return
  //   setUsersList(usersData)
  // }, [usersData])

  const getAllTasks = async () => {
    if (!currentUser) return
    const allTasks = await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${USERS_URL}/${currentUser?._id}`)
    const usersId = allTasks.data.map(task => task.users)
    const usersIdArray = new Set(usersId.flat())
    const users = await axios.get(`${URL_API}${USERS_URL}/get`, { params: { usersId: [...usersIdArray] } })
    setUsersList(users.data)
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
    })
    setAllTasksList(allTasksSorted)
    setIsLoading(false)
  }

  return (
    <div className='flex'>
      <Nav />
      <main className='max-xl:min-h-[96vh] bg-lightBckg dark:bg-darkBckg flex flex-col gap-12 flex-1 px-10 rounded-[20px] m-4 py-5'>
        <Header />
        <div className='flex gap-8'>
          <div className='flex flex-col flex-1 gap-8'>
            <h1 className="text-2xl sm:text-3xl font-medium">Tus tareas</h1>
            <section className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-6 justify-between p-6 rounded-lg shadow-cardTask">
              {
                isLoading
                  ? <>
                      <LoadingAllTasks />
                      <LoadingAllTasks />
                      <LoadingAllTasks />
                      <LoadingAllTasks />
                      <LoadingAllTasks />
                    </>
                  : allTasksList.length > 0
                    ? <>
                        <ul className="flex justify-between font-medium text-sm text-softGrey  dark:text-darkSoftGrey">
                          <li className="font-semibold w-32 text-ellipsis overflow-x-hidden whitespace-nowrap">Tarea y proyecto</li>
                          <li className="max-md:hidden w-32 text-sm clamped-text">Descripción</li>
                          <li className="max-lg:text-center max-sm:text-end w-36 font-medium text-ellipsis overflow-x-hidden whitespace-nowrap">Entrega</li>
                          <li className="max-md:hidden w-32 h-fit md:text-sm text-xs rounded-[30px] first-letter:uppercase">Estado</li>
                          <li className='max-lg:hidden w-32 h-fit md:text-sm text-xs rounded-[30px] first-letter:uppercase'>Prioridad</li>
                          <li className='max-sm:hidden w-24 h-fit md:text-sm text-xs rounded-[30px] first-letter:uppercase'>Responsables</li>
                        </ul>
                        <ul className="flex flex-col divide-y divide-extraSoftGrey dark:divide-softGrey">
                          {allTasksList.map(task => (
                            task.state !== statesTasks[2]
                              ? (
                                  <li key={task._id} className="flex justify-between flex-1 items-center py-4">
                                    <div className="flex flex-col">
                                      <h4 className="font-semibold w-32 text-ellipsis overflow-x-hidden whitespace-nowrap" title={task.name}>{task.name}</h4>
                                      <span className="md:text-sm text-xs w-32 text-ellipsis overflow-x-hidden whitespace-nowrap">{projectsList.find(project => project.to === task.project)?.name}</span>
                                    </div>
                                    <p className="max-md:hidden w-32 text-sm clamped-text" title={task.description}>{task.description}</p>
                                    <span className="max-lg:text-center max-sm:text-end w-36 font-medium text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDate(JSON.parse(task.date))}</span>
                                    <span className={`max-md:hidden w-32 h-fit md:text-sm text-xs text-center py-0.5 px-4 rounded-[30px] first-letter:uppercase border-[1px] ${colorTaskState(task.state)}`}>{task.state}</span>
                                    <span className={`max-lg:hidden w-32 h-fit text-whiteText md:text-sm text-xs text-center py-0.5 px-4 rounded-[30px] first-letter:uppercase ${colorPriority(task.priority)}`}>{task.priority}</span>
                                    <ul className="max-sm:hidden w-24 flex -space-x-2.5 justify-end">
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
                      </>
                    : <div className='flex flex-col items-center gap-6 md:my-10'>
                        <img className='w-40 md:w-60 dark:invert' src="/illustrations/happy-illustration.png" alt="feliz ilustración" />
                        <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay tareas</p>
                      </div>
              }
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AllTasks

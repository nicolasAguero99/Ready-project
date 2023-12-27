import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

// Items
import TasksList from '../../items/TasksList'
import OnBoarding from '../../items/OnBoarding'
import Alert from '../../items/Alert'

// Context
import { TasksContext, AddTasksContext, StateTasksContext } from '../../../../context/TasksContext'
import { TutorialContext } from '../../../../context/TutorialContext'
import { UsersContext } from '../../../../context/UsersContext'
import { EditTaskContext } from '../../../../context/EditTaskContext'

// Constants
import { TUTORIAL, URL_API, USERS_URL } from '../../../../constants/constants'

// Utils
import { SocketOnAddTask, SocketOnDeleteTask, SocketOnUpdateTask } from '../../../../utils/socket'

// Components
import FormTask from '../FormTask'

const BoardSection = ({ showRowTasksStates }) => {
  const [tasks, setTasks] = useContext(TasksContext)
  const [, setUsersList] = useContext(UsersContext)
  const [statesTasks] = useContext(StateTasksContext)
  const [, setIsAddTaskMode] = useContext(AddTasksContext)
  // const [usersListByProject] = useContext(UsersContext)
  const { state } = useContext(EditTaskContext)
  const [tutorialsCompleted] = useContext(TutorialContext)
  // const [currentUser] = useContext(CurrentUserContext)
  // const [, setAlert] = useContext(AlertContext)
  const rowTitlesTasksStatesref = useRef(null)
  const tasksListRef = useRef(null)
  const [showTutorial, setShowTutorial] = useState(null)
  const { projectName } = useParams()

  useEffect(() => {
    getUsersList()
  }, [tasks])

  useEffect(() => {
    SocketOnAddTask(setTasks, projectName)
    SocketOnUpdateTask(setTasks, projectName)
    SocketOnDeleteTask(setTasks, projectName)
  }, [projectName])

  useEffect(() => {
    setShowTutorial(tutorialState())
  }, [tutorialsCompleted])

  useEffect(() => {
    const handleScrollXList = () => {
      const scrollX = tasksListRef.current?.scrollLeft
      rowTitlesTasksStatesref.current.scrollLeft = scrollX
    }
    const handleScrollXTitles = () => {
      const scrollX = rowTitlesTasksStatesref.current?.scrollLeft
      tasksListRef.current.scrollLeft = scrollX
    }
    tasksListRef.current?.addEventListener('scroll', handleScrollXList)
    rowTitlesTasksStatesref.current?.addEventListener('scroll', handleScrollXTitles)

    return () => {
      tasksListRef.current?.removeEventListener('scroll', handleScrollXList)
      rowTitlesTasksStatesref.current?.removeEventListener('scroll', handleScrollXTitles)
    }
  }, [])

  const getUsersList = async () => {
    if (tasks?.length <= 0) return
    const usersId = tasks.map(task => task.users)
    const usersIdArray = new Set(usersId.flat())
    const users = await axios.get(`${URL_API}${USERS_URL}/get`, { params: { usersId: [...usersIdArray] } })
    setUsersList(users.data)
  }

  const tutorialState = () => {
    if (!tutorialsCompleted) return
    return !tutorialsCompleted.includes(TUTORIAL.stepsFirstScreen)
  }

  const handleClickAddTask = (stateParam) => {
    state.current = stateParam
    setIsAddTaskMode(true)
  }

  return (
    <>
      {
        showTutorial && <OnBoarding mode='stepsFirstScreen' />
      }
      <Alert />
      <main className='flex flex-col'>
        <div className='flex flex-col gap-4 bg-lightBckg dark:bg-darkBckg pb-2 z-10 sticky -top-6'>
          <div ref={rowTitlesTasksStatesref} className={`${showRowTasksStates ? 'flex' : 'hidden'} justify-between gap-6 entry-sticky-tasks-states overflow-x-auto z-20`}>
            {
              statesTasks.map(state => (
                <div key={state} className='bg-lightExtraBckg dark:bg-darkExtraBckg flex-1 rounded-full min-w-[300px]'>
                  <div className='bg-lightExtraBckg dark:bg-darkExtraBckg flex justify-between px-4 py-6 font-semibold md:text-xl text-base z-10 overflow-y-hidden'>
                    <h4 className='first-letter:uppercase tasklist-title-custom'>{state}</h4>
                    <div className='flex items-center gap-2'>
                      <button onClick={() => handleClickAddTask(state)}>
                        <img src='/icons/plus-icon.svg' alt='añadir tarea' />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className='flex flex-col gap-8'>
          <div id='board-project' className='hidden md:flex justify-between font-semibold md:text-xl text-base gap-6 pb-16 overflow-y-hidden'>
            {
              statesTasks.map(state => (
                <TasksList key={state} stateTask={state} />
              ))
            }
          </div>
          <div ref={tasksListRef} className='flex md:hidden justify-between font-semibold md:text-xl text-base gap-6 pb-16 overflow-x-auto'>
            {
              statesTasks.map(state => (
                <TasksList key={state} stateTask={state} />
              ))
            }
          </div>
          <FormTask />
        </div>
      </main>
    </>
  )
}

export default BoardSection

import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

// Constants
import { ARRAY_TASKS_STATES, PROJECT_URL, URL_API, URL_COLLECTION_TASK } from '../constants/constants'

// Context
import { CurrentUserContext } from './UsersContext'

export const TasksContext = createContext()
export const StateTasksContext = createContext()
export const AddTasksContext = createContext()
export const EditTasksContext = createContext()
export const OrderTasks = createContext()

export const AddTaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [statesTasks, setStatesTasks] = useState([])
  const [isAddTaskMode, setIsAddTaskMode] = useState(false)
  const [isEditTaskMode, setIsEditTaskMode] = useState(false)
  const [tasksOrdered, setTasksOrdered] = useState('')
  const [currentUser] = useContext(CurrentUserContext)
  const projectName = window.location.pathname.split('/')[2]
  const isUserUrl = window.location.pathname.split('/')[1] === 'user'

  const sendCurrentProjectName = async () => {
    if (isUserUrl) return
    if (!currentUser) return
    const config = {
      headers: {
        Authorization: `Bearer ${currentUser?.token}`
      }
    }
    setStatesTasks(ARRAY_TASKS_STATES)
    await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${PROJECT_URL}${projectName}`, config)
      .then((response) => {
        setTasks(response.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  useEffect(() => {
    sendCurrentProjectName()
  }, [currentUser])

  return (
    <TasksContext.Provider value={[tasks, setTasks]}>
      <StateTasksContext.Provider value={[statesTasks, setStatesTasks]}>
        <AddTasksContext.Provider value={[isAddTaskMode, setIsAddTaskMode]}>
          <EditTasksContext.Provider value={[isEditTaskMode, setIsEditTaskMode]}>
            <OrderTasks.Provider value={[tasksOrdered, setTasksOrdered]}>
              {children}
            </OrderTasks.Provider>
          </EditTasksContext.Provider>
        </AddTasksContext.Provider>
      </StateTasksContext.Provider>
    </TasksContext.Provider>
  )
}

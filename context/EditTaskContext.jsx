import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

// Constants
import { ARRAY_TASKS_PRIORITY, ARRAY_TASKS_STATES } from '../constants/constants'

// Context
import { EditTasksContext } from './TasksContext'
import { ProjectsContext } from './ProjectsContext'
import { UsersContext } from '../context/UsersContext'
import { getUsersListByProject } from '../utils/utils'

export const EditTaskContext = createContext()

export const EditTaskProvider = ({ children }) => {
  const [, setIsEditTaskMode] = useContext(EditTasksContext)
  const [projectsList] = useContext(ProjectsContext)
  const [usersListByProject, setUsersListByProject] = useContext(UsersContext)
  const [lastIdTask, setLastIdTask] = useState('')
  const [usersSelected, setUsersSelected] = useState([])
  const [tagsSelected, setTagsSelected] = useState([])
  const [commentsList, setCommentsList] = useState([])
  const name = useRef('')
  const users = useRef('')
  const project = useRef('')
  const state = useRef(ARRAY_TASKS_STATES[0])
  const priority = useRef(ARRAY_TASKS_PRIORITY[2])
  const date = useRef('')
  const tags = useRef('')
  const description = useRef('')
  const comments = useRef('')
  const { projectName } = useParams()

  useEffect(() => {
    getUsersListByProject().then((res) => setUsersListByProject(res))
  }, [projectName])

  const handleClickEdit = (task) => {
    setTagsSelected(task.tags)
    task.users.map(user =>
      setUsersSelected(prevUsersSelected => [...prevUsersSelected, usersListByProject.find(u => u._id === user)])
    )
    console.log('taskcomments', task.comments)
    // const sortedComments = task.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    // const updatedCommentsList = [...commentsList]
    // sortedComments.forEach(comment => {
    //   updatedCommentsList.push(comment)
    // })
    // console.log('updatedCommentsList', updatedCommentsList)
    // setCommentsList(updatedCommentsList)

    setIsEditTaskMode(true)
    setLastIdTask(task._id)
    name.current.value = task.name
    state.current = task.state
    priority.current = task.priority
    date.current = JSON.parse(task.date)
    tags.current = task.tags
    description.current.value = task.description
    users.current = task.users
    project.current = projectsList.find(project => project.to === task.project)?.name
    comments.current = commentsList
  }

  const contextValue = {
    setLastIdTask,
    lastIdTask,
    usersSelected,
    setUsersSelected,
    tagsSelected,
    setTagsSelected,
    handleClickEdit,
    commentsList,
    setCommentsList,
    name,
    project,
    users,
    state,
    priority,
    date,
    tags,
    description,
    comments
  }

  return (
    <EditTaskContext.Provider value={contextValue}>
      {children}
    </EditTaskContext.Provider>
  )
}

import { useEffect, useRef, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

// Context
import { EditTaskContext } from '../../../context/EditTaskContext'
import { CurrentUserContext, UsersProjectContext } from '../../../context/UsersContext'
import { StateTasksContext, TasksContext } from '../../../context/TasksContext'
import { AlertContext } from '../../../context/AlertContext'

// Items
import ProfilePicture from './ProfilePicture'

// Utils
import { formatedDate, colorPriority, formatedDateForActivity } from '../../../utils/utils'
import { SocketAction, SocketOnAddComment, SocketOnNotifyComment } from '../../../utils/socket'

// Constants
import { ACTIVITY_TYPE_MSG, ALERT_MSG, ALERT_TYPE, ARRAY_TASKS_PRIORITY, ARRAY_TASKS_STATES, URL_API, USERS_URL } from '../../../constants/constants'

const Task = ({ task }) => {
  const { setLastIdTask, setUsersSelected, setTagsSelected, name, users, state, priority, date, tags, description, comments, setCommentsList, handleClickEdit } = useContext(EditTaskContext)
  const [tasks] = useContext(TasksContext)
  const [statesTasks] = useContext(StateTasksContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [, setAlert] = useContext(AlertContext)
  // const [usersList] = useContext(UsersContext)
  const [usersListByProject] = useContext(UsersProjectContext)
  // const { setCommentsList } = useContext(EditTaskContext)
  const [commentsListTask, setCommentsListTask] = useState([])
  const [listOptionsShow, setlistOptionsShow] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false)
  const [notifyComment, setNotifyComment] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  const taskRef = useRef(null)
  const listOptionsRef = useRef(null)
  const { projectName } = useParams()

  useEffect(() => {
    setCommentsListTask(task.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    // SocketOnAddComment(setCommentsList, projectName, task._id)
    SocketOnAddComment(setCommentsListTask, projectName, task._id)
    SocketOnNotifyComment(setNotifyComment, projectName, task._id, currentUser?._id)
  }, [projectName])

  useEffect(() => {
    setCommentsList(commentsListTask)
  }, [commentsListTask])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!listOptionsRef.current?.contains(event.target)) {
        setlistOptionsShow(false)
        setIsSubMenuVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    // const handleEditTaskShortCut = () => {
    //   handleClickEditTask()
    // }
    // taskRef.current?.addEventListener('dblclick', handleEditTaskShortCut)

    const handleShowOptionsShortCut = (e) => {
      e.preventDefault()
      handleClickOptions()
    }
    taskRef.current?.addEventListener('contextmenu', handleShowOptionsShortCut)

    const handleDuplicateTaskShortCut = (e) => {
      e.altKey && handleClickDuplicateTask()
    }
    taskRef.current?.addEventListener('click', handleDuplicateTaskShortCut)

    const handleDeleteTaskShortCut = (e) => {
      e.ctrlKey && handleClickDelete()
    }
    taskRef.current?.addEventListener('click', handleDeleteTaskShortCut)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // taskRef.current?.removeEventListener('dblclick', handleEditTaskShortCut)
      taskRef.current?.removeEventListener('contextmenu', handleShowOptionsShortCut)
      taskRef.current?.removeEventListener('click', handleDuplicateTaskShortCut)
      taskRef.current?.removeEventListener('click', handleDeleteTaskShortCut)
    }
  }, [])

  const handleShowComments = () => {
    setShowComments(true)
    setNotifyComment(false)
  }
  const handleCloseComments = () => setShowComments(false)

  const handleClickOptions = () => setlistOptionsShow(true)

  const handleClickChangeState = async (taskParam, stateParam) => {
    setlistOptionsShow(false)
    const taskIndex = tasks.findIndex(eachTask => eachTask._id === task._id)

    if (taskIndex !== -1) {
      const updatedTask = tasks[taskIndex] = { ...tasks[taskIndex], state: stateParam }

      SocketAction('updateTask', { taskId: task._id, updatedTask, currentProject: task.project })
      if (stateParam === statesTasks[2]) {
        await axios.post(`${URL_API}${USERS_URL}/points`, { usersId: task.users, currentProject: task.project })
      }
      SocketAction('activity', { author: currentUser?._id, taskName: taskParam.name, action: stateParam, typeMessage: ACTIVITY_TYPE_MSG.moveTask, currentProject: task.project })
    }
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.taskMoved, duration: 3000 })
  }

  const handleClickEditTask = () => {
    setLastIdTask()
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    comments.current = ''
    // project.current = ''
    setUsersSelected([])
    setTagsSelected([])
    setCommentsList([])

    console.log('commentsListTask', commentsListTask)
    handleClickEdit({ ...task, comments: '' })
    setCommentsList(commentsListTask)
    console.log('task', task)
    console.log('commentsListTask', commentsListTask)

    setlistOptionsShow(false)
  }

  const handleClickDuplicateTask = () => {
    setlistOptionsShow(false)
    const duplicatedTask = {
      id: uuidv4(),
      name: task.name,
      state: task.state,
      priority: task.priority,
      date: task.date,
      description: task.description,
      tags: task.tags,
      users: task.users,
      project: task.project,
      comments: commentsListTask
    }
    SocketAction('addTask', duplicatedTask)
    SocketAction('activity', { author: currentUser?._id, taskName: duplicatedTask.name, action: duplicatedTask.state, typeMessage: ACTIVITY_TYPE_MSG.dupTask, currentProject: duplicatedTask.project })
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.taskDuplicated, duration: 3000 })
  }

  const handleClickDelete = () => {
    setlistOptionsShow(false)
    SocketAction('deleteTask', { taskId: task._id, currentProject: task.project })
    SocketAction('activity', { author: currentUser?._id, taskName: task.name, action: task.state, typeMessage: ACTIVITY_TYPE_MSG.deleteTask, currentProject: task.project })
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.taskDeleted, action: handleUndo, duration: 7000 })
  }

  const handleUndo = () => {
    const undoDeletedTask = {
      id: uuidv4(),
      name: task.name,
      state: task.state,
      priority: task.priority,
      date: task.date,
      description: task.description,
      tags: task.tags,
      users: task.users,
      project: task.project,
      comments: commentsListTask
    }
    SocketAction('addTask', undoDeletedTask)
    SocketAction('activity', { author: currentUser?._id, taskName: undoDeletedTask.name, action: undoDeletedTask.state, typeMessage: ACTIVITY_TYPE_MSG.recovered, currentProject: undoDeletedTask.project })
    setAlert(prevAlert => ({ ...prevAlert, show: false }))
  }

  const handleTypeComment = (e) => {
    setNewCommentText(e.target.value)
  }

  const handleSendComment = () => {
    // await axios.post(`${URL_API}${URL_COLLECTION_TASK}/${URL_COMMENTS}/add`, { taskId: task._id, userId: currentUser?._id, comment: newCommentText })
    SocketAction('addComment', { taskId: task._id, userId: currentUser?._id, comment: newCommentText, currentProject: projectName })
    SocketAction('notifyComment', { taskId: task._id, userId: currentUser?._id, currentProject: projectName })
    setNewCommentText('')
    SocketAction('activity', { author: currentUser?._id, taskName: task.name, typeMessage: ACTIVITY_TYPE_MSG.commentAdded, currentProject: task.project })
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.commentAdded, duration: 3000 })
  }

  return (
    <>
      <div ref={taskRef} id={task._id} className='flex flex-col gap-4 relative bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] shadow-cardTask px-4 py-4 cursor-pointer card-task task-card-custom animate-taskEntry'>
        <div className='flex justify-between items-center'>
          <span className={`text-whiteText md:text-sm text-xs ${colorPriority(task.priority)} py-1 px-4 rounded-[30px] first-letter:uppercase task-priority-custom`}>{task.priority}</span>
          <div className='relative flex gap-1 items-center'>
            <button onClick={handleShowComments} className='flex gap-2 items-center px-1 py-2 rounded-full'>
              {
                notifyComment &&
                <div className='absolute top-1.5 right-8 w-2 h-2 bg-pink rounded-full'></div>
              }
              {
                commentsListTask.length > 0 &&
                <span className={`${!notifyComment ? 'text-softGrey  dark:text-darkSoftGrey' : 'font-semibold'} text-xs`}>{commentsListTask.length}</span>
              }
              <img className='w-3.5 dark:invert' src='/icons/comments-icon.svg' alt='ver comentarios' />
            </button>
            <button onClick={handleClickOptions} className='px-1 py-2 rounded-full'>
              <img className='dark:invert' src='/icons/options-icon.svg' alt='ver opciones' />
            </button>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <h5 className='font-semibold md:text-xl text-base task-name-custom text-ellipsis whitespace-nowrap overflow-x-hidden'>{task.name}</h5>
          <p className='md:text-sm text-xs text-softGrey dark:text-darkSoftGrey task-description-custom clamped-description-task'>{task.description}</p>
        </div>
        <div className='flex justify-between items-center border-t-2 border-t-borderSoftGrey dark:border-t-softGrey pt-3'>
          <div className='flex items-center -space-x-2.5'>
            {task.users.map((user, index) =>
              index < 3 &&
              <ProfilePicture key={user} wH={'w-6 h-6'} img={usersListByProject?.find(u => u._id === user)?.photo} alt={usersListByProject?.find(u => u._id === user)?.name} border />
            )}
            {
              task.users.length >= 4 && (
                <div className='w-7 h-7 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${task.users.length - 3}`}</div>
              )
            }
          </div>
          <div>
            <small className='md:text-sm text-xs text-softGrey dark:text-darkSoftGrey'>{formatedDate(JSON.parse(task.date))}</small>
          </div>
        </div>
        {listOptionsShow && (
          <div ref={listOptionsRef} className='w-fit absolute top-10 right-9 z-10'>
            <ul className='flex flex-col bg-lightExtraBckg dark:bg-darkExtraBckg w-[236px] h-fit py-2 rounded-[10px] shadow-cardTask font-normal text-sm md:text-lg divide-y divide-borderSoftGrey [&>li>button>img:not:&>li>button>img+img]:w-5 [&>li>button>img]:h-auto [&>li]:px-4 z-[70]'>
              <li onMouseOver={() => setIsSubMenuVisible(false)} className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                <button onClick={handleClickEditTask}><img className='w-5' src="/icons/edit-icon.svg" alt="editar tarea" /> Editar tarea</button>
              </li>
              <li onMouseOver={() => setIsSubMenuVisible(false)} className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                <button onClick={handleClickDuplicateTask}><img className='w-5' src="/icons/duplicate-icon.svg" alt="duplicar tarea" /> Duplicar tarea</button>
              </li>
              <li onMouseOver={() => setIsSubMenuVisible(true)} onClick={() => setIsSubMenuVisible(!isSubMenuVisible)} className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                <button><img className='w-5' src="/icons/check-icon.svg" alt="check icon" /> Mover a <img className='w-2 h-auto ml-auto' src="/icons/chevron-right-icon.svg" alt="mas opciones" /> </button>
                <ul className={`absolute top-[84px] ${task.state !== ARRAY_TASKS_STATES[2]
                  ? 'left-60'
                  : 'right-60'
                } flex-col bg-lightExtraBckg dark:bg-darkExtraBckg w-[236px] h-fit py-2 rounded-[10px] shadow-cardTask font-normal text-sm md:text-lg divide-y divide-borderSoftGrey ${isSubMenuVisible
                  ? 'opacity-100 visible'
                  : 'opacity-0 invisible'
                } group-hover:opacity-100 group-hover:visible`}>
                  {ARRAY_TASKS_STATES.map(state => (
                    <li key={state} className='px-4 [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg first-letter:[&>button]:uppercase'>
                      <button onClick={() => handleClickChangeState(task, state)}>{state}</button>
                    </li>
                  ))}
                </ul>
              </li>
              <li onMouseOver={() => setIsSubMenuVisible(false)} className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                <button onClick={handleClickDelete} className='text-error'><img className='w-5' src="/icons/trash-icon.svg" alt="eliminar tarea" /> Eliminar tarea</button>
              </li>
            </ul>
          </div>
        )}
      </div>
      {
        showComments &&
          <div className='flex flex-col z-[40] fixed right-0 sm:right-8 max-sm:left-0 max-md:m-auto md:right-10 bottom-0 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-lg shadow-cardTask max-w-[510px] w-[90%] px-4 pt-6 pb-8'>
            <div className='flex justify-between items-center gap-4 pt-4'>
              <span className='w-5/6 text-xl font-medium text-ellipsis overflow-x-hidden whitespace-nowrap'>{`Comentarios de "${task.name}" (${commentsListTask.length})`}</span>
              <button onClick={handleCloseComments} className='absolute top-4 right-4'>
                <img className='w-5' src='/icons/cross-icon.svg' alt='cerrar modal' />
              </button>
            </div>
            <div className='flex flex-col flex-1 gap-4 mt-4'>
              <ul className='max-h-[520px] flex flex-col divide-y divide-borderSoftGrey overflow-x-hidden overflow-y-auto'>
                {
                  commentsListTask?.map(comment =>
                    <li key={comment._id} className='flex gap-4 items-center py-4'>
                      <ProfilePicture wH={`w-12 h-12 ${usersListByProject?.find(u => u?._id === comment.user)?.photo ? '' : 'grayscale'}`} img={usersListByProject?.find(u => u?._id === comment.user)?.photo ?? 'default-profile-penguin'} alt={usersListByProject?.find(u => u?._id === comment.user)?.name} border />
                      <div className='flex flex-col'>
                        <div className='flex gap-2 items-center'>
                          <span className={`font-medium ${usersListByProject?.find(u => u?._id === comment.user)?.name ? '' : 'text-softGrey  dark:text-darkSoftGrey text-base'}`}>{usersListByProject?.find(u => u?._id === comment.user)?.name ?? 'Usuario expulsado'}</span>
                          <small className='max-[360px]:hidden text-xs text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(comment.createdAt)}</small>
                        </div>
                        <p className='text-sm'>{comment.text}</p>
                      </div>
                    </li>
                  )
                }
              </ul>
              <form onSubmit={(e) => e.preventDefault()} className='flex gap-4 justify-between items-center'>
                <div className='relative w-full flex gap-4 items-center'>
                  <ProfilePicture wH={'max-md:hidden w-9 h-9'} img={currentUser?.photo} alt={currentUser?.name} />
                  <input onChange={handleTypeComment} className='w-full border-2 border-borderSoftGrey text-base resize-none outline-none rounded-[20px] ps-4 pe-12 py-1' type='text' placeholder='Añadir comentario...' value={newCommentText} />
                  <button onClick={handleSendComment} className='absolute top-[1px] right-1 p-1 rounded-full'><img className='w-6' src="/icons/send-icon.svg" alt="enviar comentario" /></button>
                </div>
              </form>
            </div>
          </div>
      }
    </>
  )
}

export default Task

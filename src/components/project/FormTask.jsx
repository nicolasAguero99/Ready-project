import { useState, useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { DateRangePicker } from 'react-date-range'
import axios from 'axios'

// Context
import { AddTasksContext, EditTasksContext, StateTasksContext } from '../../../context/TasksContext'
import { EditTaskContext } from '../../../context/EditTaskContext'
import { ProjectsContext } from '../../../context/ProjectsContext'
import { TagsContext } from '../../../context/TagsContext'
import { CurrentUserContext, UsersProjectContext } from '../../../context/UsersContext'
import { TutorialContext } from '../../../context/TutorialContext'
import { AlertContext } from '../../../context/AlertContext'

// Items
import ProfilePicture from '../items/ProfilePicture'
import OnBoarding from '../items/OnBoarding'

// Utils
import { SocketAction, SocketOnAddTag } from '../../../utils/socket'
import { colorPriority, colorTaskState, formatedDate, formatedDateForActivity, formatedDateForDB, getTagsListByProject, getUsersListByProject } from '../../../utils/utils'

// Constants
import { ACTIVITY_TYPE_MSG, ALERT_MSG, ALERT_TYPE, ARRAY_TASKS_PRIORITY, ARRAY_TASKS_STATES, COLOR_PRIMARY, TUTORIAL, URL_API, USERS_URL } from '../../../constants/constants'

const FormTask = () => {
  // const [tasks] = useContext(TasksContext)
  const [statesTasks] = useContext(StateTasksContext)
  const { lastIdTask, setLastIdTask, usersSelected, setUsersSelected, tagsSelected, setTagsSelected, name, users, project, state, priority, date, tags, description, commentsList, setCommentsList } = useContext(EditTaskContext)
  const [isAddTaskMode, setIsAddTaskMode] = useContext(AddTasksContext)
  const [isEditTaskMode, setIsEditTaskMode] = useContext(EditTasksContext)
  const [projectsList] = useContext(ProjectsContext)
  const [tagsByProject, setTagsByProject] = useContext(TagsContext)
  const [usersListByProject, setUsersListByProject] = useContext(UsersProjectContext)
  const [tutorialsCompleted] = useContext(TutorialContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [alert, setAlert] = useContext(AlertContext)
  const { projectName } = useParams()
  const [isSelectUsersMode, setIsSelectUsersMode] = useState(false)
  const [isSelectPriorityMode, setIsSelectPriorityMode] = useState(false)
  const [isSelectStateMode, setIsSelectStateMode] = useState(false)
  const [isSelectProjectMode, setIsSelectProjectMode] = useState(false)
  const [isSelectDateMode, setIsSelectDateMode] = useState(false)
  const [isSelectTagsMode, setIsSelectTagsMode] = useState(false)
  const [isEditDate, setIsEditDate] = useState(false)
  const [isEditUsers, setIsEditUsers] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('#CCCCCC')
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  })

  useEffect(() => {
    SocketOnAddTag(setTagsByProject, projectName)
  }, [])

  useEffect(() => {
    setShowTutorial(tutorialState())
  }, [tutorialsCompleted])

  useEffect(() => {
    getUsersListByProject().then((res) => setUsersListByProject(res))
    getTagsListByProject(projectName).then((res) => setTagsByProject(res))
  }, [projectName])

  useEffect(() => {
    project.current = projectsList.find(project => project.to === projectName)?.name
  }, [projectsList, projectName])

  useEffect(() => {
    const handleCloseModalShortCut = (e) => {
      if (e.key === 'Escape') {
        handleClickCloseAddTask()
        handleCloseEditTaskMode()
      }
    }
    document.addEventListener('keydown', handleCloseModalShortCut)

    return () => {
      document.removeEventListener('keydown', handleCloseModalShortCut)
    }
  }, [])

  const tutorialState = () => {
    if (!tutorialsCompleted) return
    return !tutorialsCompleted.includes(TUTORIAL.stepsCreateNewTask)
  }

  const handleAddTask = () => {
    tags.current = tagsSelected
    users.current = usersSelected.map(user => user._id)
    setIsAddTaskMode(false)
    const newTask = {
      id: uuidv4(),
      name: name.current.value,
      state: state.current,
      priority: priority.current,
      date: date.current ? JSON.stringify(date.current) : JSON.stringify(formatedDateForDB(new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))),
      description: description.current.value,
      tags: tags.current,
      users: users.current,
      project: projectsList.find(p => p.name === project.current).to
    }
    SocketAction('addTask', newTask)

    SocketAction('activity', { author: currentUser?._id, taskName: newTask.name, action: newTask.state, typeMessage: ACTIVITY_TYPE_MSG.addTask, currentProject: newTask.project })
    isEditUsers && SocketAction('activity', { taskName: newTask.name, typeMessage: ACTIVITY_TYPE_MSG.forYouTask, currentProject: newTask.project, toMembers: newTask.users })
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    // project.current = ''
    setUsersSelected([])
    setTagsSelected([])
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.taskAdded, action: '', duration: 3000 })
  }

  const handleUpdateTask = () => {
    tags.current = tagsSelected
    users.current = usersSelected.map(user => user._id)
    setIsEditTaskMode(false)
    const updatedTask = {
      name: name.current.value,
      state: state.current,
      priority: priority.current,
      date: date.current ? JSON.stringify(date.current) : JSON.stringify(formatedDateForDB(new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))),
      description: description.current.value,
      tags: tags.current,
      users: users.current,
      project: projectsList.find(p => p.name === project.current).to
    }

    SocketAction('updateTask', { taskId: lastIdTask, updatedTask, currentProject: updatedTask.project })
    if (isEditDate) {
      SocketAction('activity', { author: currentUser?._id, taskName: updatedTask.name, typeMessage: ACTIVITY_TYPE_MSG.editTaskDate, currentProject: updatedTask.project, dateTask: formatedDate(date.current) })
      SocketAction('activity', { author: currentUser?._id, taskName: updatedTask.name, typeMessage: ACTIVITY_TYPE_MSG.editTask, currentProject: updatedTask.project })
    } else {
      SocketAction('activity', { author: currentUser?._id, taskName: updatedTask.name, typeMessage: ACTIVITY_TYPE_MSG.editTask, currentProject: updatedTask.project })
    }
    isEditUsers && SocketAction('activity', { taskName: updatedTask.name, typeMessage: ACTIVITY_TYPE_MSG.forYouTask, currentProject: updatedTask.project, toMembers: updatedTask.users })
    setLastIdTask()
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    // project.current = ''
    setUsersSelected([])
    setTagsSelected([])
    setCommentsList([])
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.taskEdited, action: '', duration: 3000 })
  }

  const handleSelect = (ranges) => {
    setSelectionRange(ranges.selection)
  }

  const handleClickCloseAddTask = () => {
    setIsAddTaskMode(false)
    setLastIdTask()
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    // project.current = ''
    setUsersSelected([])
    setTagsSelected([])
  }

  const handleClickSelectPriority = () => {
    setIsSelectPriorityMode(!isSelectPriorityMode)
    setIsSelectStateMode(false)
  }

  const handleClickSelectProject = () => {
    setIsSelectProjectMode(!isSelectProjectMode)
  }

  const handleClickSelectUsers = () => {
    setIsSelectUsersMode(!isSelectUsersMode)
  }

  const handleCheckboxUsers = (user) => {
    const index = usersSelected.indexOf(user)

    if (index === -1) {
      setUsersSelected([...usersSelected, user])
    } else {
      setUsersSelected(usersSelected.filter(u => u._id !== user._id))
    }
    !isEditUsers && (setIsEditUsers(true))
  }

  // const handleClickProject = (projectParam) => {
  //   setIsSelectProjectMode(false)
  //   project.current = projectParam
  // }

  const handleClickPriority = (priorityParam) => {
    setIsSelectPriorityMode(false)
    priority.current = priorityParam
  }

  const handleClickSelectState = () => {
    setIsSelectStateMode(!isSelectStateMode)
    setIsSelectPriorityMode(false)
  }

  const handleClickState = (stateParam) => {
    setIsSelectStateMode(false)
    state.current = stateParam
  }

  const handleClickSelectDate = () => {
    setIsSelectDateMode(!isSelectDateMode)
    date.current = formatedDateForDB(selectionRange.startDate, selectionRange.endDate)

    console.log('date.current', date.current)

    console.log('selectionRange', selectionRange)
    isEditTaskMode && !isEditDate && (setIsEditDate(true))
  }

  const handleClickCloseSelectDate = () => {
    setIsSelectDateMode(!isSelectDateMode)
  }

  const handleSelectTags = () => {
    setIsSelectTagsMode(!isSelectTagsMode)
    setShowModal(false)
    setTagName('')
    setTagColor('#CCCCCC')
  }

  const handleOpenModalTag = () => setShowModal(true)

  const handleCloseModalTag = () => {
    setShowModal(false)
    setTagName('')
    setTagColor('#CCCCCC')
  }

  const handleTypeNewTag = event => setTagName(event.target.value)

  const handleColorNewTag = event => setTagColor(event.target.value)

  const handleCreateTag = async () => {
    SocketAction('addTag', { name: tagName, color: tagColor, project: projectName })
    setShowModal(false)
  }

  const handleRemoveTag = (tag) => {
    setTagsSelected(tagsSelected.filter(t => t !== tag))
  }

  const handleCheckboxTags = (tag) => {
    const index = tagsSelected.indexOf(tag)
    if (index === -1) {
      setTagsSelected([...tagsSelected, tag])
    } else {
      setTagsSelected(tagsSelected.filter(t => t !== tag))
    }
  }

  const handleCompleteTask = async () => {
    const updatedTask = {
      name: name.current.value,
      state: statesTasks[2],
      priority: priority.current,
      date: JSON.stringify(date.current),
      description: description.current.value,
      tags: tags.current,
      users: users.current,
      project: projectsList.find(p => p.name === project.current).to
    }
    SocketAction('updateTask', { taskId: lastIdTask, updatedTask, currentProject: updatedTask.project })
    await axios.post(`${URL_API}${USERS_URL}/points`, { usersId: updatedTask.users, currentProject: updatedTask.project })
    SocketAction('activity', { author: currentUser?._id, taskName: updatedTask.name, action: updatedTask.state, typeMessage: ACTIVITY_TYPE_MSG.moveTask, currentProject: updatedTask.project })
    setIsEditTaskMode(false)
    setLastIdTask()
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    // project.current = ''
    setUsersSelected([])
    setTagsSelected([])
  }

  const handleCloseEditTaskMode = () => {
    setIsEditTaskMode(false)
    setLastIdTask()
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    // comments.current = ''
    // project.current = ''
    setUsersSelected([])
    setTagsSelected([])
    setCommentsList([])
  }

  const handleTypeComment = (e) => {
    setNewCommentText(e.target.value)
  }

  const handleSendComment = () => {
    SocketAction('addComment', { taskId: lastIdTask, userId: currentUser?._id, comment: newCommentText, currentProject: projectName })
    SocketAction('notifyComment', { taskId: lastIdTask, userId: currentUser?._id, currentProject: projectName })
    setNewCommentText('')
    SocketAction('activity', { author: currentUser?._id, taskName: name.current.value, typeMessage: ACTIVITY_TYPE_MSG.commentAdded, currentProject: projectName })
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.commentAdded, duration: 3000 })
  }

  return (
    <>
    {
      !isAddTaskMode &&
      <button onClick={() => setIsAddTaskMode(true)} className={`fixed ${!alert.show ? 'bottom-10' : 'bottom-28'} right-10 bg-pink rounded-full w-12 h-12 z-20 cursor-pointer text-whiteText text-4xl font-semibold transition-[bottom] ease-in-out duration-200`}>
        +
      </button>
    }
      {
        isAddTaskMode && (showTutorial && <OnBoarding mode='stepsCreateNewTask' />)
      }
      <div className={`${!isAddTaskMode && !isEditTaskMode ? 'hidden' : ''} ${isEditTaskMode && !isSelectDateMode ? 'max-h-[90vh] overflow-y-auto' : ''} z-20 fixed max-md:left-0 right-0 md:right-10 bottom-0 max-md:m-auto bg-lightExtraBckg dark:bg-darkExtraBckg rounded-lg shadow-cardTask w-[90%] md:w-[510px]`}>
        <div>
          <div className={`${!isEditTaskMode ? 'flex' : 'hidden'} justify-between bg-pink pb-2 pt-4 px-4 rounded-t-lg`}>
            <h2 className='text-base font-medium text-whiteText'>Agregar tarea</h2>
          </div>
          <div>
            <div className='flex flex-col gap-6 py-6 px-4'>
              <div className={`${!isEditTaskMode ? 'flex gap-2' : 'flex justify-between items-baseline gap-4 pt-10 pb-2'} `}>
                <input
                  id='board-add-task-name'
                  className={`${!isEditTaskMode ? 'md:text-xl text-base' : 'text-2xl'} bg-transparent font-semibold w-full outline-none`}
                  type='text'
                  ref={name}
                  placeholder='Nombre de tarea'
                />
                <button onClick={handleCompleteTask} className={`${!isEditTaskMode && !isSelectDateMode ? ' hidden' : 'flex'} min-w-[170px] gap-2 items-center border-[1px] border-dashed border-extraSoftGrey rounded-[12px] py-0.5 px-3`}><img className='w-5' src="/icons/check-icon.svg" alt="cerrar modal" />
                  Finalizar tarea
                </button>
                <button onClick={!isEditTaskMode ? handleClickCloseAddTask : handleCloseEditTaskMode} className='absolute top-4 right-4'>
                  {
                    !isEditTaskMode
                      ? <img className='w-5' src='/icons/cross-formTask-icon.svg' alt='cerrar modal' />
                      : <img className='w-5' src='/icons/cross-icon.svg' alt='cerrar modal' />
                  }
                </button>
              </div>
              <div className={`${!isEditTaskMode ? 'flex items-center gap-4' : 'flex-col gap-6'} flex mt-[10px]`}>
                <div id='board-add-task-members' className='flex gap-4'>
                  <span>Para</span>
                  <button onClick={handleClickSelectUsers} className='flex gap-2 items-center -space-x-3.5'>
                    {
                      usersSelected.length > 0
                        ? (<>
                          {usersSelected.map((user, index) =>
                            index < 3 && (
                              <div key={user?._id} className='flex items-center gap-2'>
                                <ProfilePicture wH={'w-6 h-6'} img={user?.photo} alt={user?.name} border />
                                {usersSelected.length === 1 ? user?.name : ''}
                              </div>
                            )
                          )}
                          {usersSelected.length >= 4 && (
                            <div className='w-6 h-6 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${usersSelected.length - 3}`}</div>
                          )}
                        </>
                          )
                        : (
                          <span className='md:text-sm text-xs border-[.5px] border-softGrey flex items-center h-fit py-0.5 px-4 rounded-[30px]'>
                            Nadie
                          </span>
                          )
                    }
                  </button>
                </div>
                {isSelectUsersMode &&
                  <div className='absolute top-20 left-0 right-0 m-auto md:right-[110px] flex flex-col w-[250px] pt-4 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] z-10 shadow-cardTask'>
                    <h4 className='text-center font-medium pb-2'>Usuarios</h4>
                    <button onClick={handleClickSelectUsers} className='absolute top-[20px] right-3'><img src='/icons/cross-icon.svg' alt='cerrar desplegable' /></button>
                    <ul className='max-h-[250px] overflow-y-auto flex flex-col divide-y divide-extraSoftGrey py-2 '>
                      {usersListByProject.map(user => (
                        <li key={user?._id} className='flex items-center gap-4 px-4 py-2 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer'>
                          <input id={`user-${user?._id}`} onChange={() => handleCheckboxUsers(user)} checked={usersSelected?.some(u => u?._id === user?._id)} type='checkbox' className='cursor-pointer' />
                          <label htmlFor={`user-${user?._id}`} className='flex items-center gap-2 cursor-pointer'>
                            <ProfilePicture wH={'w-6 h-6'} img={user?.photo} alt={user?.name} />
                            <div className='md:text-sm text-xs py-1 rounded-[30px] first-letter:uppercase'>{user?.name}</div>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div className='flex flex-col gap-2 bg-lightExtraBckg dark:bg-darkExtraBckg p-4 rounded-b-[10px]'>
                      <button onClick={handleClickSelectUsers} className='font-semibold text-whiteText md:text-sm text-xs px-4 py-2 rounded-full bg-pink'>Guardar cambios</button>
                    </div>
                  </div>
                }
                <div id='board-add-task-project' className='flex gap-2'>
                  <span>En</span>
                  <span onClick={handleClickSelectProject} className='flex gap-2 items-center'>
                    <span className='md:text-sm text-xs font-medium flex items-center h-fit py-0.5 px-4 rounded-[30px]'>
                      {project.current ? project.current : 'Sin asignar'}
                    </span>
                  </span>
                </div>
              </div>
              <div id='board-add-task-date' className='flex items-center gap-4'>
                <span className='text-ellipsis whitespace-nowrap overflow-x-hidden'>Fecha de entrega</span>
                <button onClick={handleClickSelectDate}><img src='/icons/calendar-icon.svg' alt='establecer fecha' /></button>
                <small className='text-softGrey  dark:text-darkSoftGrey'>{date.current ? formatedDate(date.current) : 'Sin asignar'}</small>
                {isSelectDateMode &&
                  <div className='flex flex-col absolute top-[80px] md:top-[130px] right-0 sm:right-6 md:-left-20 z-10 shadow-cardTask'>
                    <DateRangePicker
                      style={{ color: 'red' }}
                      fixedHeight={true}
                      showMonthAndYearPickers={false}
                      showDateDisplay={false}
                      showPreview={false}
                      weekStartsOn={1}
                      minDate={new Date()}
                      rangeColors={[COLOR_PRIMARY]}
                      ranges={[selectionRange]}
                      onChange={handleSelect}
                    />
                    <div className='flex justify-end gap-4 bg-lightExtraBckg px-6 pb-4'>
                      <button onClick={handleClickCloseSelectDate} className='font-semibold text-pink md:text-sm text-xs px-4 py-2 rounded-full border-[1px] border-pink'>Cancelar</button>
                      <button onClick={handleClickSelectDate} className='font-semibold text-whiteText md:text-sm text-xs px-4 py-2 rounded-full bg-pink'>Aceptar</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <div className={`${!isEditTaskMode ? 'gap-6 border-t-[.5px] border-t-extraSoftGrey pt-6' : 'flex-col gap-6'} flex flex-col mx-4`}>
            <div id='board-add-task-priority-state' className={`${!isEditTaskMode ? 'gap-4 max-sm:gap-6' : 'flex-col gap-6'} flex max-sm:flex-col`}>
              <div className='flex gap-4'>
                Prioridad
                <div className='relative'>
                  <div onClick={handleClickSelectPriority} className={`text-whiteText text-sm ${colorPriority(priority.current)} py-0.5 px-4 rounded-[30px] first-letter:uppercase cursor-pointer`}>{priority.current}</div>
                  {isSelectPriorityMode &&
                    <div className='absolute left-0 right-0 m-auto md:top-[-60px] md:left-[70px] flex flex-col w-fit pt-4 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] z-10 shadow-cardTask'>
                      <h4 className='font-medium ps-4'>Prioridad</h4>
                      <button onClick={handleClickSelectPriority} className='absolute top-[18px] right-3'><img src='/icons/cross-icon.svg' alt='cerrar desplegable' /></button>
                      <ul className='max-h-[150px] overflow-y-auto flex flex-col divide-y divide-extraSoftGrey py-2'>
                        {ARRAY_TASKS_PRIORITY.map(priority => (
                          <li key={priority} onClick={() => handleClickPriority(priority)} className='py-2 px-4 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer'><div className={`w-28 text-whiteText text-sm text-center ${colorPriority(priority)} py-0.5 px-4 rounded-[30px] first-letter:uppercase`}>{priority}</div></li>
                        ))}
                      </ul>
                    </div>
                  }
                </div>
              </div>
              <div className='flex gap-4'>
                Estado
                <div className='relative'>
                  <div onClick={handleClickSelectState} className={`border-[1px] ${colorTaskState(state.current)} text-sm py-0.5 px-4 rounded-[30px] first-letter:uppercase cursor-pointer`}>{state.current}</div>
                  {isSelectStateMode &&
                    <div className='absolute left-0 right-0 m-auto md:top-[-60px] md:left-[85px] flex flex-col w-fit pt-4 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] z-10 shadow-cardTask'>
                      <h4 className='font-medium ps-4'>Estado</h4>
                      <button onClick={handleClickSelectState} className='absolute top-[18px] right-3'><img src='/icons/cross-icon.svg' alt='cerrar desplegable' /></button>
                      <ul className='max-h-[150px] overflow-y-auto flex flex-col divide-y divide-extraSoftGrey py-2 '>
                        {statesTasks.map(state => (
                          <li key={state} onClick={() => handleClickState(state)} className='px-4 py-2 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg cursor-pointer'><div className={`text-sm text-center py-0.5 px-4 rounded-[30px] first-letter:uppercase border-[1px] ${colorTaskState(state)}`}>{state}</div></li>
                        ))}
                      </ul>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div id='board-add-task-tags' className='flex gap-4'>
              Etiquetas
              <div className='flex flex-wrap gap-2'>
                {tagsSelected.length > 0
                  ? tagsSelected.map(tag =>
                    <button key={tagsByProject?.find(t => t.name === tag)?._id} style={{ backgroundColor: tagsByProject.find(t => t.name === tag)?.color }} onClick={() => handleRemoveTag(tag)} className='relative text-whiteText text-sm border-[.5px] flex items-center h-fit py-1 px-4 rounded-[30px] tags-pill transition-[padding] duration-300 ease-out'>{tag}<img className='hidden absolute right-2' src='/icons/cross-tags-icon.svg' alt='cross icon' /></button>
                  )
                  : (
                      <span className='text-sm border-[.5px] border-softGrey flex items-center h-fit py-0.5 px-4 rounded-[30px]'>
                        Sin etiquetas
                      </span>
                    )
                }
                <button onClick={handleSelectTags}>
                  <img className='w-6 h-auto' src="/icons/plus-tag-icon.svg" alt="agregar etiqueta" />
                </button>
              </div>
              {/* <div className='md:text-sm text-xs border-[.5px] border-softGrey flex items-center h-fit py-0.5 px-4 rounded-[30px]'>Etiqueta</div> */}
              {isSelectTagsMode &&
                <div className='absolute top-20 left-0 right-0 m-auto md:right-[10px] flex flex-col w-[250px] pt-4 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] shadow-cardTask'>
                  <div className='flex gap-4 justify-between items-center px-4'>
                    <button onClick={handleCloseModalTag} className={`${!showModal ? 'hidden' : ''} px-1`}><img className='rotate-180' src='/icons/chevron-return-icon.svg' alt='cerrar desplegable' /></button>
                    <span className='text-center font-medium'>Etiquetas</span>
                    <button onClick={handleSelectTags}><img src='/icons/cross-icon.svg' alt='cerrar desplegable' /></button>
                  </div>
                  <ul className='flex flex-col divide-y divide-extraSoftGrey py-2 '>
                    {tagsByProject.map(tag => (
                      <li key={tag._id} className='flex gap-4 px-4 py-2'><input onChange={() => handleCheckboxTags(tag.name)} checked={tagsSelected.includes(tag.name)} type='checkbox' className='cursor-pointer' /><span style={{ backgroundColor: tag.color }} className='flex-1 text-whiteText md:text-sm text-xs py-1 px-4 rounded-[30px] first-letter:uppercase'>{tag.name}</span>
                      {/* <img src='/icons/pencil-icon.svg' /> */}
                      </li>
                    ))}
                  </ul>
                    {showModal && <div className='flex gap-4 px-4'><input type='checkbox' disabled className='cursor-pointer opacity-30' /><span style={{ backgroundColor: tagColor }} className='flex-1 text-whiteText md:text-sm text-xs py-1 px-4 rounded-[30px] first-letter:uppercase'>{tagName !== '' ? tagName : 'Etiqueta...'}</span>
                    {/* <img className='opacity-30' src='/icons/pencil-icon.svg' /> */}
                    </div>}
                  <div className='relative flex flex-col gap-2 bg-lightExtraBckg dark:bg-darkExtraBckg p-4 rounded-b-[10px]'>
                    {
                      showModal &&
                        <div className='relative'>
                          <input onChange={handleTypeNewTag} className='w-full text-sm rounded-full border-[1px] border-extraSoftGrey px-4 py-1 outline-none' type="text" placeholder='Nombre del etiqueta' />
                          <label htmlFor='color-tag-input' className='absolute top-[7px] right-2 w-4 h-4 bg-transparent' ><img src="/icons/pallet-icon.svg" alt="seleccionar color" /></label>
                          <input onChange={handleColorNewTag} id='color-tag-input' className='opacity-0 absolute top-[7px] right-2 w-4 h-4 bg-transparent' type="color" placeholder='Nombre del etiqueta' />
                        </div>
                    }
                    <button onClick={handleOpenModalTag} className={`${showModal ? 'hidden' : ''} font-semibold md:text-sm text-xs px-4 py-2 border-[1px] border-pink rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-pink`}>Crear nueva etiqueta</button>
                    <button onClick={!showModal ? handleSelectTags : handleCreateTag} className='font-semibold text-whiteText md:text-sm text-xs px-4 py-2 rounded-full bg-pink'>{!showModal ? 'Guardar cambios' : 'Crear etiqueta'}</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        <div className={`${!isEditTaskMode ? 'px-4 py-4' : 'px-4 py-6'}`}>
          <textarea
            id='board-add-task-description'
            className={`${!isEditTaskMode ? 'border-borderSoftGrey dark:border-darkSoftGrey' : 'border-borderSoftGrey'} bg-transparent px-4 border-[1px] text-base font-normal w-full h-24 mb-2 py-2 my-4 resize-none outline-none rounded-[20px]`}
            ref={description}
            placeholder='Descripción...'
          ></textarea>
          <div className={`${!isEditTaskMode ? 'hidden' : 'flex'} flex-col gap-4`}>
            <span className='font-medium text-lg'>Comentarios ({commentsList?.length})</span>
            <ul className='max-h-[120px] flex flex-col divide-y divide-borderSoftGrey overflow-y-auto'>
              {
                commentsList?.map(comment =>
                  <li key={comment._id} className='flex gap-4 items-center py-4'>
                    <ProfilePicture wH={`w-9 h-9 ${usersListByProject?.find(u => u?._id === comment.user)?.photo ? '' : 'grayscale'}`} img={usersListByProject?.find(u => u?._id === comment.user)?.photo ?? 'default-profile-penguin'} alt={usersListByProject?.find(u => u?._id === comment.user)?.name} border />
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
            <div className='flex flex-col gap-2 py-2'>
              <form onSubmit={(e) => e.preventDefault()} className='flex gap-4 justify-between items-center'>
                <div className='relative w-full flex gap-4 items-center'>
                  <ProfilePicture wH={'max-md:hidden w-9 h-9'} img={currentUser?.photo} alt={currentUser?.name} />
                  <input onChange={handleTypeComment} className='w-full border-[1px] border-borderSoftGrey bg-transparent text-base resize-none outline-none rounded-[20px] ps-4 pe-12 py-1' type='text' placeholder='Añadir comentario...' value={newCommentText} />
                  <button onClick={handleSendComment} className='absolute top-[2px] right-1 p-1 rounded-full'><img className='w-6' src="/icons/send-icon.svg" alt="enviar comentario" /></button>
                </div>
              </form>
            </div>
          </div>
          <div className={`${!isEditTaskMode ? '' : 'mt-6'} flex justify-end`}>
            <button id='board-add-task-button' className='font-semibold text-whiteText px-4 py-2 rounded-full bg-pink' onClick={!isEditTaskMode ? handleAddTask : handleUpdateTask}>
              {!isEditTaskMode ? 'Crear tarea' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FormTask

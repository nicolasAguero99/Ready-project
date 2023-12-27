import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Fullcalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Constants
import { ACTIVITY_TYPE_MSG, ARRAY_TASKS_PRIORITY, ARRAY_TASKS_STATES } from '../../../../constants/constants'

// Context
import { EditTaskContext } from '../../../../context/EditTaskContext'
import { TasksContext } from '../../../../context/TasksContext'
import { CurrentUserContext } from '../../../../context/UsersContext'

// Utils
import { formatedDate, formatedDateForDB } from '../../../../utils/utils'
import { SocketAction, SocketOnUpdateTask } from '../../../../utils/socket'
import { TagsContext } from '../../../../context/TagsContext'

const Diary = () => {
  const { setLastIdTask, setUsersSelected, setTagsSelected, name, users, state, priority, date, tags, description, comments, setCommentsList, handleClickEdit } = useContext(EditTaskContext)
  const [tasks, setTasks] = useContext(TasksContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [tagsByProject] = useContext(TagsContext)
  const { projectName } = useParams()
  // const [setStatesTasks] = useContext(StateTasksContext)
  const [eventsTasks, setEventsTasks] = useState([])
  const calendarRef = useRef(null)

  useEffect(() => {
    SocketOnUpdateTask(setTasks, projectName)
  }, [projectName])

  useEffect(() => {
    const events = []
    tasks.map(task => (
      events.push({
        id: task._id,
        title: task.name,
        start: JSON.parse(task.date)[0],
        end: JSON.parse(task.date)[1],
        color: tagsByProject.find(tag => tag.name === task?.tags[0])?.color ?? '#000000',
        display: 'block',
        classNames: ['py-1 px-2 my-2 rounded-[15px]']
      })
    ))
    setEventsTasks(events)
  }, [tasks])

  const handleChangeTask = (event) => {
    const eventTaskId = event.event._def.publicId
    const eventTaskStart = event.event._instance.range.start
    const eventTaskEnd = event.event._instance.range.end
    const updatedTask = { date: JSON.stringify(formatedDateForDB(eventTaskStart, eventTaskEnd)) }
    SocketAction('updateTask', { taskId: eventTaskId, updatedTask, currentProject: projectName })
    SocketAction('activity', { author: currentUser?._id, taskName: event.event._def.title, typeMessage: ACTIVITY_TYPE_MSG.editTask, currentProject: projectName })
    SocketAction('activity', { author: currentUser?._id, taskName: event.event._def.title, typeMessage: ACTIVITY_TYPE_MSG.editTaskDate, currentProject: projectName, dateTask: formatedDate(formatedDateForDB(eventTaskStart, eventTaskEnd)) })
  }

  const handleClickTask = (event) => {
    console.log('event', event.event._def.publicId)
    const task = tasks.find(task => task._id === event.event._def.publicId)
    setLastIdTask()
    name.current.value = ''
    state.current = ARRAY_TASKS_STATES[0]
    priority.current = ARRAY_TASKS_PRIORITY[2]
    date.current = ''
    tags.current = ''
    description.current.value = ''
    users.current = ''
    comments.current = ''
    setUsersSelected([])
    setTagsSelected([])
    setCommentsList([])
    handleClickEdit({ ...task, comments: '' })
  }

  return (
    <>
      <Fullcalendar
        ref={calendarRef}
        events={eventsTasks}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={'dayGridMonth'}
        timeZone={'UTC'}
        headerToolbar={{
          start: 'title',
          center: '',
          end: 'prev,next,today,dayGridMonth,timeGridWeek'
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana'
        }}
        buttonHints={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          prev: 'Mes anterior',
          next: 'Mes siguiente'
        }}
        locale={'es'}
        firstDay={1}
        editable={true}
        viewClassNames={['h-full']}
        eventChange={handleChangeTask}
        eventClick={handleClickTask}
      />
    </>
  )
}

export default Diary

import moment from 'moment'

// Constants
import { ACTIVITY_TYPE_MSG, ADMINS_URL, ARRAY_PROJECT_STATE, ARRAY_TASKS_PRIORITY, ARRAY_TASKS_STATES, PROJECTS_URL, TAGS_URL, URL_API, USERS_URL } from '../constants/constants.js'
import axios from 'axios'

export const formatedDate = (dateToFormat) => {
  const [startDate, endDate] = dateToFormat
  const dateStart = new Date(startDate)
  const dateEnd = new Date(endDate)
  const formatedStartDate = dateStart?.toLocaleString('es-ES', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short'
  })

  const formatedEndDate = dateEnd?.toLocaleString('es-ES', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short'
  })

  const dateResult = (formatedStartDate === formatedEndDate ? formatedStartDate : `${formatedStartDate} - ${formatedEndDate}`)

  return dateResult
}

export const formatedDateForDB = (startDate, endDate) => {
  const arrayDates = []
  const dateStart = moment(startDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  const dateEnd = moment(endDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  dateStart && arrayDates.push(dateStart)
  dateEnd && arrayDates.push(dateEnd)
  return arrayDates
}

export const formatedDateFromDB = (date) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  const formatedDate = new Date(date).toLocaleString('es-ES', options)
  return formatedDate
}

export const formatedDateForActivity = (date) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }
  const formatedDate = new Date(date).toLocaleString('es-ES', options)
  return formatedDate
}

export const formatedBirthdayDate = (birthday) => {
  const birthdayDate = new Date(birthday).toLocaleDateString('es-ES', { timeZone: 'UTC' })
  return birthdayDate
}

export const userAge = (birthday) => {
  const age = new Date().getFullYear() - new Date(birthday).getFullYear()
  return age
}

export const colorPriority = (priority) => {
  if (priority === ARRAY_TASKS_PRIORITY[0]) {
    return 'bg-pink'
  } else if (priority === ARRAY_TASKS_PRIORITY[1]) {
    return 'bg-orange'
  } else if (priority === ARRAY_TASKS_PRIORITY[2]) {
    return 'bg-aqua'
  } else {
    return 'bg-extraSoftGrey'
  }
}

export const colorTaskState = (state) => {
  if (state === ARRAY_TASKS_STATES[0]) {
    return 'border-pink text-pink'
  } else if (state === ARRAY_TASKS_STATES[1]) {
    return 'border-orange text-orange'
  } else if (state === ARRAY_TASKS_STATES[2]) {
    return 'border-aqua text-aqua'
  } else {
    return 'border-extraSoftGrey'
  }
}

export const colorProjectState = (state) => {
  if (state === ARRAY_PROJECT_STATE[0]) {
    return 'bg-aqua'
  } else if (state === ARRAY_PROJECT_STATE[1]) {
    return 'bg-orange'
  } else if (state === ARRAY_PROJECT_STATE[2]) {
    return 'bg-error'
  } else if (state === ARRAY_PROJECT_STATE[3]) {
    return 'bg-green'
  } else {
    return 'bg-extraSoftGrey'
  }
}

export const currentHourDashboard = () => {
  const now = new Date()
  const currentHour = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return currentHour
}

export const getUsersListByProject = async () => {
  const currentProject = window.location.pathname.split('/')[2]
  const isUserUrl = window.location.pathname.split('/')[1] === 'user'
  if (!currentProject) return
  if (isUserUrl) return
  const res = await axios.get(`${URL_API}${USERS_URL}/${PROJECTS_URL}/${currentProject}`)
  return res.data
}

export const geAdminsListByProject = async () => {
  const currentProject = window.location.pathname.split('/')[2]
  const isUserUrl = window.location.pathname.split('/')[1] === 'user'
  if (!currentProject) return
  if (isUserUrl) return
  const res = await axios.get(`${URL_API}${USERS_URL}/${ADMINS_URL}/${PROJECTS_URL}/${currentProject}`)
  return res.data
}

export const getTagsListByProject = async (currentProject) => {
  const isUserUrl = window.location.pathname.split('/')[1] === 'user'
  if (!currentProject) return
  if (isUserUrl) return
  const res = await axios.get(`${URL_API}${TAGS_URL}/${currentProject}`)
  return res.data
}

export const activityMessage = (action, taskName, typeMessage, dateTask) => {
  if (typeMessage === ACTIVITY_TYPE_MSG.moveTask) {
    return `ha movido: "${taskName}” a la columna de “${action}"`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.addTask) {
    return `ha añadido: "${taskName}” a la columna de “${action}"`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.editTask) {
    return `ha editado la tarea: "${taskName}”`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.deleteTask) {
    return `ha eliminado la tarea: "${taskName}”`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.dupTask) {
    return `ha duplicado la tarea: "${taskName}”`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.editTaskDate) {
    return `ha editado la fecha de: "${taskName}” al ${dateTask}`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.forYouTask) {
    return `Te han asignado responsable de la tarea: "${taskName}”`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.recovered) {
    return `ha recuperado la tarea eliminada: "${taskName}”`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.addAchievement) {
    return `ha recibido la insignia: "${taskName}”`
  } else if (typeMessage === ACTIVITY_TYPE_MSG.commentAdded) {
    return `ha comentado en la tarea: "${taskName}”`
  }
}

// Components
import Project from '../src/components/Project'
import Dashboard from '../src/components/Dashboard'
// import DiarySection from '../src/components/project/DiarySection'
// import AnalyticsSection from '../src/components/project/AnalyticsSection'
// import Register from '../src/components/register/Register'

// Constants
import { IMG_LINKS, PATH_LINKS, PROJECT_SECTIONS_LINKS, OBJECT_PROJECT } from '../constants/constants'

// const routesSections =
// PROJECT_SECTIONS_LINKS.map((section) => (
//   { id: section.id, path: '/project' + '/:projectName' + '/:section', component: section.component }
// ))

// const routes = [
//   { id: 1, path: PATH_LINKS.dashboard, component: <Dashboard /> },
//   // { id: 2, path: '/notifications', component: 'Notifications' },
//   // { id: 3, path: '/messages', component: 'Messages' },
//   { id: 4, path: PATH_LINKS.project, component: <Project /> }
//   // { id: 5, path: PATH_LINKS.register, component: <Register /> }
//   // ...routesSections
// ]

const navLinks = [
  { id: 1, name: 'Panel', img: IMG_LINKS.dashboard, to: PATH_LINKS.dashboard },
  { id: 2, name: 'Notificaciones', img: IMG_LINKS.notifications, to: PATH_LINKS.notifications },
  { id: 3, name: 'Tus tareas', img: IMG_LINKS.allTasks, to: PATH_LINKS.allTasks }
]

const projectsLinks =
  OBJECT_PROJECT.map(project => (
    { id: project.id, name: project.name, color: project.color, to: `/project/${project.to}` }
  ))

const projectSectionsLinks =
  PROJECT_SECTIONS_LINKS.map(section => (
    { id: section.id, name: section.name, to: `${section.to}` }
  ))

export { navLinks, projectsLinks, projectSectionsLinks }

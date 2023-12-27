import { Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Context
import { AddTaskProvider } from '../context/TasksContext'
import { EditTaskProvider } from '../context/EditTaskContext'
import { ProjectsProvider } from '../context/ProjectsContext'
import { TagsProvider } from '../context/TagsContext'
import { UsersProvider } from '../context/UsersContext'
import { TutorialProvider } from '../context/TutorialContext'
import { PetsProvider } from '../context/PetsContext'
import { AlertProvider } from '../context/AlertContext'
import { DarkModeProvider } from '../context/DarkModeContext'

// Routes
import '../routes/routes'

// Components
import Dashboard from './components/Dashboard'
import AllTasks from './components/allTasks/AllTasks'
import Project from './components/Project'
import Signup from './components/signup/Signup'
import Login from './components/login/Login'
import Profile from './components/profile/Profile'
import User from './components/user/User'
import AllAchievements from './components/allAchievements/AllAchievements'
import NewProject from './components/newProject/NewProject'
import Notifications from './components/notifications/Notifications'

// Auth
import ProtectedRoute from './auth/ProtectedRoutes'
import ProtectedProjects from './auth/ProtectedProjects'
import UserLogged from './auth/UserLogged'

// Constants
import { PATH_LINKS } from '../constants/constants'

const App = () => {
  return (
    <DarkModeProvider>
      <UsersProvider>
        <TutorialProvider>
          <ProjectsProvider>
            <TagsProvider>
              <AddTaskProvider>
                <EditTaskProvider>
                  <AlertProvider>
                    <PetsProvider>
                      <Routes>
                        <Route path="*" element={<Navigate to={PATH_LINKS.dashboard} />} />
                        <Route element={<UserLogged />}>
                          <Route path={'/'} element={<Navigate to={PATH_LINKS.login} />} />
                          <Route path={`/${PATH_LINKS.login}`} element={<Login />} />
                          <Route path={`/${PATH_LINKS.signup}`} element={<Signup />} />
                        </Route>
                        <Route element={<ProtectedRoute />}>
                          <Route path={`/${PATH_LINKS.newProject}`} element={<NewProject />} />
                          <Route path={`/${PATH_LINKS.dashboard}`} element={<Dashboard />} />
                          <Route path={`/${PATH_LINKS.notifications}`} element={<Notifications />} />
                          <Route path={`/${PATH_LINKS.allTasks}`} element={<AllTasks />} />
                          <Route path={`/${PATH_LINKS.allAchievements}`} element={<AllAchievements />} />
                          <Route path={`/${PATH_LINKS.profile}`} element={<Profile />} />
                          <Route path={`/${PATH_LINKS.user}/:userId`} element={<User />} />
                          <Route element={<ProtectedProjects />}>
                            <Route path="project/:projectName" element={<Project />}>
                              <Route path=":section" element={<Project />} />
                            </Route>
                          </Route>
                        </Route>
                      </Routes>
                    </PetsProvider>
                  </AlertProvider>
                </EditTaskProvider>
              </AddTaskProvider>
            </TagsProvider>
          </ProjectsProvider>
        </TutorialProvider>
      </UsersProvider>
    </DarkModeProvider>
  )
}

export default App

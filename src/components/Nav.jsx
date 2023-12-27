import { NavLink, useLocation, useParams } from 'react-router-dom'
import { useContext, useEffect, useRef } from 'react'

// Items
import Dot from '../components/items/Dot'

// Routes
import { navLinks } from '../../routes/routes'

// Utils
import NavSvg from '../../utils/NavSvg'

// Constants
import { COLOR_SVG_NAV, COLOR_SVG_NAV_ACTIVE, PATH_LINKS } from '../../constants/constants'

// Context
import { MenuContext, ProjectsContext } from '../../context/ProjectsContext'
import { SocketOnDeleteProject, SocketOnUpdateProject } from '../../utils/socket'
import { CurrentUserContext, UsersProjectContext } from '../../context/UsersContext'
import { AddTasksContext } from '../../context/TasksContext'
import { EditTaskContext } from '../../context/EditTaskContext'
import { DarkModeContext } from '../../context/DarkModeContext'

const Nav = () => {
  const [projectsList, setProjectsList] = useContext(ProjectsContext)
  const [showMenu, setShowMenu] = useContext(MenuContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [, setIsAddTaskMode] = useContext(AddTasksContext)
  const { setTagsSelected } = useContext(EditTaskContext)
  const [darkMode] = useContext(DarkModeContext)
  const [, setUsersListByProject] = useContext(UsersProjectContext)
  const { projectName } = useParams()
  const listProject = useRef(null)
  const currentLocation = useLocation().pathname

  useEffect(() => {
    SocketOnUpdateProject(setProjectsList, currentUser?._id)
    SocketOnDeleteProject(setProjectsList, projectName, setUsersListByProject)
  }, [])

  const handleCloseMenu = () => {
    setShowMenu(false)
    setIsAddTaskMode(false)
  }

  const handleScrollTop = () => {
    listProject.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    handleCloseMenu(false)
    setIsAddTaskMode(false)
    setTagsSelected([])
  }

  return (
    <>
      <nav id='nav' className={`${showMenu ? 'flex' : 'hidden'} xl:flex bg-lightExtraBckg dark:bg-darkExtraBckg flex-col xl:w-[20%] h-screen justify-between ps-8 py-6 pb-6 xl:py-8 fixed xl:sticky top-0 overflow-y-auto overflow-x-hidden z-30`}>
        <div className='flex flex-col flex-1 justify-between gap-6 z-20'>
          <div className='flex flex-col gap-4 pe-4'>
            <div className='flex xl:hidden justify-end pe-4'>
              <button onClick={handleCloseMenu}><img className='w-6' src="/icons/cross-icon.svg" alt="ir inicio" /></button>
            </div>
              <NavLink className='mb-4 ps-2 w-fit' to={PATH_LINKS.dashboard}>
                {
                  !darkMode
                    ? <img className='w-[80%] lg:w-[90%] nav-logo-custom' src="/icons/ready-logo-2.svg" alt="ir inicio" />
                    : <img className='w-[80%] lg:w-[90%] nav-logo-custom' src="/icons/ready-logo-dark-mode.svg" alt="ir inicio" />
                }
              </NavLink>
            <ul className='flex flex-col gap-4 lg:md:text-lg md:text-sm'>
              {
                navLinks.map(link => (
                  <li key={link.id}><NavLink onClick={handleCloseMenu} className={({ isActive }) => `max-w-[190px] flex items-center gap-4 px-2 py-2 rounded-full ${isActive ? 'text-whiteText bg-pink' : ''} nav-title-project-custom`} to={link.to}><NavSvg src={link.img} color={!darkMode ? (currentLocation !== link.to ? COLOR_SVG_NAV : COLOR_SVG_NAV_ACTIVE) : COLOR_SVG_NAV_ACTIVE} /><span className='overflow-x-hidden text-ellipsis whitespace-nowrap'>{link.name}</span></NavLink></li>
                ))
              }
            </ul>
            <div className='flex flex-col gap-4 xl:gap-6 mt-6'>
              <span className='text-softGreyborder-t-borderSoftGreysvg nav-title-project-custom'>Tus proyectos</span>
              <ul ref={listProject} className='max-h-[280px] flex flex-col w-full gap-2 text-sm lg:text-lg overflow-y-auto overflow-x-hidden pe-4 nav-custom'>
                {
                  projectsList
                    ? projectsList.map(project => (
                    <li key={project._id} className={`w-full flex-1 ${project.to.includes(projectName) ? 'order-first' : ''}`}>
                      <NavLink onClick={handleScrollTop} to={`/project/${project.to}/tablero`} className={`flex items-center gap-4 px-2 py-2 rounded-full ${project.to.includes(projectName) ? 'text-whiteText bg-pink' : ''}` }>
                        <Dot bckg={project.to.includes(projectName) ? 'bg-lightExtraBckg dark:bg-darkExtraBckg' : project.color} projectsList={!project.to.includes(projectName)} />
                        <span className='w-2/3 text-ellipsis overflow-x-hidden whitespace-nowrap nav-item-custom'>{project.name}</span>
                      </NavLink>
                    </li>
                    ))
                    : <li className='w-full flex-1'><span className='w-full text-sm text-softGrey  dark:text-darkSoftGrey nav-item-custom'>No tienes proyectos</span></li>
                }
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <div onClick={handleCloseMenu} className={`${showMenu ? 'block' : 'hidden'} bg-lightText w-[120vw] h-[120vh] fixed top-0 left-0 opacity-50 cursor-pointer z-[28]`}></div>
    </>
  )
}

export default Nav

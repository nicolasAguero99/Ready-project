import { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Context
import { ProjectsContext } from '../../../context/ProjectsContext'
import { CurrentUserContext } from '../../../context/UsersContext'
import { StateTasksContext } from '../../../context/TasksContext'

// Constants
import { COLORS_ARRAY, PATH_LINKS, PROJECTS_URL, PROJECT_SECTIONS_LINKS, URL_API } from '../../../constants/constants'
import Dot from '../items/Dot'
import ProfilePicture from '../items/ProfilePicture'

const NewProject = () => {
  const navigate = useNavigate()
  const [projectsList, setProjectsList] = useContext(ProjectsContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [statesTasks] = useContext(StateTasksContext)
  const randomColor = COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)]
  const ID_PROJECT = uuidv4().split('-')[0]
  const [projectData, setProjectData] = useState({ name: '', color: randomColor, description: '' })
  const location = useLocation()
  const isSignupMode = location.state?.isSignup

  const handleProjectData = (e) => {
    const { name, value } = e.target
    setProjectData({
      ...projectData,
      [name]: value
    })
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    const newProject = await axios.post(`${URL_API}${PROJECTS_URL}/add`, { name: projectData.name, color: projectData.color, description: projectData.description, to: ID_PROJECT, members: [currentUser?._id], admins: [currentUser?._id] })
    setProjectsList([...projectsList, newProject.data])
    console.log('newProject', newProject)
    navigate(PATH_LINKS.dashboard)
  }

  const handleLater = () => {
    navigate(PATH_LINKS.dashboard, { replace: true })
  }

  const handleReturnPage = () => {
    navigate(-1)
  }

  return (
    <main className='relative flex flex-col md:flex-row justify-center'>
      {
        !isSignupMode &&
        <button onClick={handleReturnPage} className='w-4 h-4 absolute top-8 left-8'><img className='w-full rotate-90' src="/icons/chevron-icon.svg" alt="volver" /></button>
      }
      <div className='flex-1 md:min-h-screen flex flex-col justify-center gap-6 px-12 md:px-24 py-8'>
        <img className='w-[150px]' src="/icons/ready-logo.svg" alt="ready logo" />
        <div className='flex flex-col gap-6'>
          <h1 className='text-3xl lg:text-5xl font-bold text-lightTitle leading-[1.40] lg:leading-[1.40]'>¿Qué proyecto ténes en mente?</h1>
          <p className='text-sm md:text-base'>Completá los datos a continuación para empezar un nuevo proyecto.</p>
        </div>
        <form className='flex flex-col gap-14 mt-10'>
          <input onChange={handleProjectData} name='name' className='border-2 border-pink rounded-full max-md:text-sm px-4 py-2 outline-none' type="text" placeholder='¿Cuál es el nombre del proyecto?' />
          <input onChange={handleProjectData} name='description' className='border-2 border-pink rounded-full max-md:text-sm px-4 py-2 outline-none' type="text" placeholder='¿De qué trata?' />
          <label htmlFor="color" className='flex gap-4 justify-between border-2 border-pink rounded-full max-md:text-sm px-4 py-2'>
            <span className='text-softGrey  dark:text-darkSoftGrey'>¿Qué color representa este proyecto?</span>
            <input onChange={handleProjectData} name='color' id='color' className='w-6 h-6 mb-[4px] bg-transparent rounded-full cursor-pointer' type="color" placeholder='¿De qué trata?' />
          </label>
          <div className={`flex ${isSignupMode ? 'justify-between' : 'justify-end'} items-center text-center gap-6`}>
            {
              isSignupMode &&
              <button onClick={handleLater} type='submit' className='text-sm font-semibold text-pink bg-transparent px-4 py-2 rounded-full border-2 border-pink transition-colors duration-300 hover:text-whiteText hover:bg-pink'>Ahora no</button>
            }
            <button onClick={handleAddProject} type='submit' className='text-sm font-semibold text-whiteText px-4 py-2 rounded-full bg-pink border-2 transition-colors duration-300 hover:bg-transparent hover:text-pink hover:border-pink'>Crear proyecto</button>
          </div>
        </form>
      </div>
      <div className='max-lg:hidden relative flex flex-1 md:max-h-screen md:min-h-screen'>
        <div className='absolute top-0 -right-4 bottom-0 m-auto flex flex-col bg-lightExtraBckg dark:bg-darkExtraBckg w-[340px] lg:w-[90%] h-[580px] lg:h-[650px] items-center justify-center gap-10 rounded-[20px] shadow-cardTask z-10 py-4 ps-4'>
          <div className='flex flex-col flex-1 w-full bg-lightBckg dark:bg-darkBckg items-center justify-center gap-8 rounded-[20px] ps-6'>
            <div id='project-header' className='w-full flex flex-col gap-4'>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-semibold text-lightTitle headerproject-name-custom'>{projectData.name}</span>
                <img className='w-6 h-auto' src='/icons/fav-icon.svg' alt='añadir favoritos' />
              </div>
              <div className='flex items-center gap-3'>
                <Dot bckg={'bg-aqua headerproject-icon-custom'} />
                <span className='font-normal text-lg text-lightText headerproject-state-custom'>En curso</span>
              </div>
            </div>
            <div className='flex w-full justify-between py-6 px-5 rounded-[10px] bg-lightExtraBckg dark:bg-darkExtraBckg z-20 navproject-bar-custom'>
              <ul className='flex gap-6 font-normal md:text-lg text-base overflow-x-hidden'>
                {
                  PROJECT_SECTIONS_LINKS?.map((link, index) => (
                    <li id={`project-navbar-${link.to}`} key={link.id}><span className={index === 0 ? 'border-b-2 border-b-pink navproject-custom' : 'navproject-custom'} to={link.to}>{link.name}</span></li>
                  ))
                }
              </ul>
            </div>
            <div className='flex w-full gap-4'>
              {statesTasks?.map(stateTask => (
                <div key={stateTask} className='bg-lightExtraBckg dark:bg-darkExtraBckg flex-1 rounded-[10px] h-full tasklist-custom'>
                  <div className='bg-lightExtraBckg dark:bg-darkExtraBckg flex justify-between px-4 py-6 font-semibold md:text-xl text-base z-10 overflow-y-hidden'>
                    <h4 className='first-letter:uppercase'>{stateTask}</h4>
                    <div className='flex items-center gap-2'>
                      <button>
                        <img src='/icons/plus-icon.svg' alt='añadir tarea' />
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-col px-4 py-4 gap-4'>

                    <div className='flex flex-col gap-4 relative bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] shadow-cardTask px-4 py-4 card-task task-card-custom'>
                      <div className='flex justify-between items-center'>
                        <span className='bg-softGrey py-1 px-4 rounded-[30px] first-letter:uppercase task-priority-custom'></span>
                        <div className='relative flex gap-1 items-center'>
                          <span className='px-1 py-2 rounded-full'>
                            <img src='/icons/options-icon.svg' alt='ver opciones' />
                          </span>
                        </div>
                      </div>

                      <div className='flex flex-col gap-2'>
                        <span className='bg-softGrey py-1 w-2/3 rounded-full mb-4'></span>
                        <span className='bg-softGrey py-[2px] w-full rounded-full'></span>
                        <span className='bg-softGrey py-[2px] w-2/3 rounded-full'></span>
                      </div>
                      <div className='flex justify-between items-center border-t-2 border-t-borderSoftGrey pt-3'>
                        <div className='flex items-center -space-x-2.5'>
                          <ProfilePicture wH={'w-6 h-6'} bckg={'bg-pink'} pos={10} />
                          <ProfilePicture wH={'w-6 h-6'} bckg={'bg-orange'} pos={20} />
                          <ProfilePicture wH={'w-6 h-6'} bckg={'bg-aqua'} pos={50} />
                        </div>
                        <div>
                          <small className='md:text-sm text-xs text-softGrey  dark:text-darkSoftGrey'></small>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <img className='w-full object-cover opacity-30' src="/illustrations/brand-universe.svg" alt="brand universe" />
      </div>
    </main>
  )
}

export default NewProject

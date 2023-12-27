import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

// Context
import { CurrentUserContext, UsersProjectContext } from '../../context/UsersContext'
import { TasksContext } from '../../context/TasksContext'

// Items
import ProfilePicture from './items/ProfilePicture'
import Dot from './items/Dot'

// Utils
import { getUsersListByProject } from '../../utils/utils'
import { ProjectsContext } from '../../context/ProjectsContext'

// Constants
import { PROJECT_URL, URL_API, URL_COLLECTION_TASK } from '../../constants/constants'

// Components
import ManageAchievements from './headerProject/ManageAchievements'
import InfoProject from './headerProject/InfoProject'
import DeleteProject from './headerProject/DeleteProject'
import ManageMembers from './headerProject/ManageMembers'
import { SocketOnMembersList } from '../../utils/socket'

const HeaderProject = () => {
  const [, setTasks] = useContext(TasksContext)
  const [usersListByProject, setUsersListByProject] = useContext(UsersProjectContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [projectsList] = useContext(ProjectsContext)
  const listOptionsRef = useRef(null)
  const { projectName } = useParams()
  const [listOptionsShow, setlistOptionsShow] = useState(false)
  const currentProjectName = projectsList.find(project => project.to === projectName)?.name

  useEffect(() => {
    SocketOnMembersList(setUsersListByProject, projectName)
  }, [])

  useEffect(() => {
    getUsersListByProject().then((res) => setUsersListByProject(res))
  }, [projectName])

  useEffect(() => {
    sendCurrentProjectName()
  }, [currentUser, usersListByProject])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!listOptionsRef.current?.contains(event.target)) {
        setlistOptionsShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const sendCurrentProjectName = async () => {
    if (!currentUser) return
    const config = {
      headers: {
        Authorization: `Bearer ${currentUser?.token}`
      }
    }
    await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${PROJECT_URL}${projectName}`, config)
      .then((response) => {
        setTasks(response.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleOptions = () => {
    setlistOptionsShow(true)
  }

  return (
    <>
      <div className='flex justify-between'>
        <div id='project-header' className='flex flex-col gap-4'>
          <div className='flex items-baseline gap-2'>
            <h1 className='text-3xl font-semibold headerproject-name-custom'>{currentProjectName}</h1>
          </div>
          <ul className="sm:hidden flex -space-x-1.5">
            {usersListByProject?.map((user, index) =>
              index < 4 &&
              <li key={user._id}>
                <ProfilePicture wH={'w-7 h-7'} img={usersListByProject?.find(u => u._id === user._id)?.photo} alt={usersListByProject?.find(u => u._id === user._id)?.name} border />
              </li>
            )}
            {
              usersListByProject?.length > 4 && (
                <div className='w-7 h-7 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${usersListByProject?.length - 4}`}</div>
              )
            }
          </ul>
          <div className='flex items-center gap-3'>
            <Dot bckg={'bg-aqua headerproject-icon-custom'} />
            <span className='font-normal text-lg headerproject-state-custom'>En curso</span>
          </div>
        </div>
        <div className='relative flex gap-6 items-center'>
          <ul id='project-users' className="max-sm:hidden flex -space-x-1.5">
            {usersListByProject?.map((user, index) =>
              index < 4 &&
              <li key={user._id}>
                <ProfilePicture wH={'w-7 h-7'} img={usersListByProject?.find(u => u._id === user._id)?.photo} alt={usersListByProject?.find(u => u._id === user._id)?.name} border />
              </li>
            )}
            {
              usersListByProject?.length > 4 && (
                <div className='w-7 h-7 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${usersListByProject?.length - 4}`}</div>
              )
            }
          </ul>
          <button onClick={handleOptions} id='project-options'><img className='w-2 h-auto dark:invert' src="/icons/options-vertical-icon.svg" alt="opciones icono" /></button>
            <div ref={listOptionsRef} className={`${listOptionsShow ? 'block' : 'hidden'} w-fit absolute top-14 right-4 z-30`}>
              <ul className='flex flex-col bg-lightExtraBckg dark:bg-darkExtraBckg w-fit min-w-[270px] h-fit py-2 rounded-[10px] shadow-cardTask font-normal text-sm md:text-lg divide-y divide-extraSoftGrey borderSoftGrey [&>li>button>img:not:&>li>button>img+img]:w-5 [&>li>button>img]:h-auto [&>li>button]:px-4 overflow-x-hidden'>
                <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                  <InfoProject setlistOptionsShow={setlistOptionsShow} />
                </li>
                <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                  <ManageMembers setlistOptionsShow={setlistOptionsShow} />
                </li>
                <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                  <ManageAchievements setlistOptionsShow={setlistOptionsShow} />
                </li>
                <li className='[&>button]:flex [&>button]:gap-2 [&>button]:items-center [&>button]:w-full [&>button]:text-left [&>button]:text-error [&>button]:py-1.5 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg'>
                  <DeleteProject setlistOptionsShow={setlistOptionsShow} />
                </li>
              </ul>
            </div>
        </div>
      </div>
    </>
  )
}

export default HeaderProject

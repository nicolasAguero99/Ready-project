import { useEffect, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'

// Utils
import { colorProjectState, geAdminsListByProject } from '../../../utils/utils'

// Items
import ProfilePicture from '../items/ProfilePicture'

// Constants
import { ALERT_MSG, ALERT_TYPE } from '../../../constants/constants'

// Context
import { AdminsProjectContext } from '../../../context/UsersContext'
import { ProjectsContext } from '../../../context/ProjectsContext'
import { SocketAction } from '../../../utils/socket'
import { AlertContext } from '../../../context/AlertContext'

const InfoProject = ({ setlistOptionsShow }) => {
  const [adminsListByProject, setAdminsListByProject] = useContext(AdminsProjectContext)
  const [projectsList] = useContext(ProjectsContext)
  const [showModal, setShowModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [, setAlert] = useContext(AlertContext)
  const [dataEdit, setDataEdit] = useState({ name: '', description: '' })
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const { projectName } = useParams()
  const currentProjectName = projectsList.find(project => project.to === projectName)?.name
  const currentProjectState = projectsList.find(project => project.to === projectName)?.state
  const currentProjectDescription = projectsList.find(project => project.to === projectName)?.description

  useEffect(() => {
    initialData()
  }, [])

  useEffect(() => {
    geAdminsListByProject().then((res) => setAdminsListByProject(res))
  }, [projectName])

  const initialData = () => {
    setDataEdit({ name: currentProjectName, description: currentProjectDescription })
  }

  const handleDataEdit = (e) => {
    const { name, value } = e.target
    setDataEdit({ ...dataEdit, [name]: value })
  }

  const handleShowModal = () => setShowModal(true)

  const handleCloseModal = () => {
    setShowModal(false)
    setlistOptionsShow(false)
  }

  const handleOpenEdit = () => setIsEditMode(true)

  const handleCloseEdit = () => setIsEditMode(false)

  const handleAcceptEdit = async () => {
    SocketAction('updateProject', { dataEdit, projectName })
    setIsEditMode(false)
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.projectEdited, duration: 3000 })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsLinkCopied(true)
    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  return (
    <>
      <div className={`${showModal ? 'block' : 'hidden'} bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[80]`}></div>
      {
        showModal &&
        <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:w-3/4 flex flex-col gap-6 md:gap-10 p-8 lg:p-12 rounded-[20px] z-[90]'>
          <div className='flex gap-4 justify-between items-center'>
            <span className="text-lg sm:text-xl md:text-3xl font-semibold text-pink">Información del proyecto</span>
            <button onClick={handleCloseModal}>
              <img className='w-6' src="/icons/cross-icon.svg" alt="cerrar modal" />
            </button>
          </div>
          <div className='flex flex-col gap-6 mt-6'>
            <div className='flex flex-col gap-2'>
              <small className='text-softGrey dark:text-darkSoftGrey text-sm'>Nombre del proyecto</small>
              <div className='flex flex-1 gap-4 items-start'>
                <div className='flex max-md:flex-col w-full flex-1 gap-4 justify-between md:items-center'>
                  {
                    !isEditMode
                      ? <span className='text-xl font-medium'>{currentProjectName}</span>
                      : <input onChange={handleDataEdit} className='w-full md:w-3/4 text-xl font-medium px-4 py-2 rounded-[10px] bg-lightBckg dark:bg-darkBckg' name='name' type="text" value={dataEdit.name} />
                  }
                  <span className={`md:hidden w-fit text-whiteText md:text-sm text-xs ${colorProjectState(currentProjectState)} py-1 px-4 rounded-[30px] first-letter:uppercase task-priority-custom`}>{currentProjectState}</span>
                </div>
                <div className='relative flex gap-4 items-center'>
                  <span className={`max-md:hidden text-whiteText md:text-sm text-xs ${colorProjectState(currentProjectState)} py-1 px-4 rounded-[30px] first-letter:uppercase task-priority-custom`}>{currentProjectState}</span>
                    {
                      !isEditMode
                        ? (
                            <button onClick={handleOpenEdit}>
                              <img className='w-5' src="/icons/edit-icon.svg" alt="editar proyecto" />
                            </button>
                          )
                        : (
                            <div className='absolute -top-7 -right-4 w-[80px] h-[20px] flex gap-4 justify-center items-center'>
                              <button onClick={handleCloseEdit}>
                                <img className='w-5' src="/icons/cross-icon.svg" alt="aceptar edición" />
                              </button>
                              <button onClick={handleAcceptEdit}>
                                <img className='w-5' src="/icons/check-icon.svg" alt="cerrar edición" />
                              </button>
                            </div>
                          )
                    }
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <small className='text-softGrey  dark:text-darkSoftGrey text-sm'>Acerca del proyecto</small>
              {
                !isEditMode
                  ? <p className='w-full md:w-3/4 max-h-52 pe-2 overflow-y-auto'>{currentProjectDescription}</p>
                  : <textarea onChange={handleDataEdit} className='w-full md:w-3/4 max-h-52 pe-2 overflow-y-auto px-4 py-2 rounded-[10px] bg-lightBckg dark:bg-darkBckg' name='description' type="text" value={dataEdit.description} />
              }
            </div>
          </div>
          <div className='flex flex-col flex-1 gap-6 mt-4 sm:mt-0'>
            <div className='flex flex-col gap-2'>
              <small className='text-softGrey  dark:text-darkSoftGrey text-sm'>Administradores del proyecto</small>
                <ul className="w-24 flex -space-x-2.5">
                  {adminsListByProject.map((admin, index) =>
                    index < 3 &&
                    <li key={admin?._id} title={admin?.name}>
                      <ProfilePicture wH={'w-7 h-7'} img={admin?.photo} alt={admin?.name} border />
                    </li>
                  )}
                  {
                    adminsListByProject.length >= 4 && (
                      <div className='w-7 h-7 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${adminsListByProject.length - 3}`}</div>
                    )
                  }
                </ul>
            </div>
          </div>
            <div className='flex justify-end items-end'>
              <button onClick={handleCopyLink} className='flex gap-4 items-center text-sm font-semibold text-pink px-4 py-2 rounded-full border-2 border-pink'>
                {
                  !isLinkCopied
                    ? (
                        <img className='w-4' src="/icons/copy-icon.svg" alt="copiar enlace" />
                      )
                    : (
                        <img className='w-4' src="/icons/check-icon.svg" alt="icono tick" />
                      )
                }
                Copiar enlace del proyecto
              </button>
            </div>
        </div>
      }
      {
        <button onClick={handleShowModal}>
          <img className='w-5' src="/icons/edit-icon.svg" alt="icono editar" />
          Info. del proyecto
        </button>
      }
    </>
  )
}

export default InfoProject

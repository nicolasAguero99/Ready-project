import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Utils
import { SocketAction } from '../../../utils/socket'

// Constants
import { PATH_LINKS } from '../../../constants/constants'

const DeleteProject = ({ setlistOptionsShow }) => {
  const [showModal, setShowModal] = useState(false)
  const [isTyped, setIsTyped] = useState(false)
  const navigate = useNavigate()
  const { projectName } = useParams()
  const textToType = `project-${projectName}`

  const handleShowModal = () => setShowModal(true)

  const handleCloseModal = () => {
    setShowModal(false)
    setlistOptionsShow(false)
  }

  const handleTypeText = (e) => {
    if (e.target.value === textToType) {
      setIsTyped(true)
    } else {
      setIsTyped(false)
    }
  }

  const handleDeleteProject = () => {
    setShowModal(false)
    setlistOptionsShow(false)
    SocketAction('deleteProject', { projectName })
    navigate(PATH_LINKS.dashboard, { replace: true })
  }

  return (
    <>
      <div className={`${showModal ? 'block' : 'hidden'} bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[80]`}></div>
      {
        showModal &&
        <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:w-3/5 flex flex-col gap-10 p-8 lg:p-12 rounded-[20px] z-[90]'>
          <div className='flex gap-4 justify-between items-center'>
            <span className="md:text-3xl text-xl font-semibold text-pink">Eliminar proyecto</span>
            <button onClick={handleCloseModal}>
              <img className='w-6' src="/icons/cross-icon.svg" alt="cerrar modal" />
            </button>
          </div>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <p className='text-softGrey  dark:text-darkSoftGrey'>¿Querés eliminar el proyecto? Una vez eliminado, <b className='font-medium text-error'>se perderán todos los datos del mismo</b>.</p>
                <p className='mb-4'>Para eliminar este proyecto ingresá exactamente <b className='font-semibold'>project-{projectName}</b> en el siguiente campo:</p>
                <div className='flex flex-col lg:flex-row items-center gap-4'>
                  <input onChange={handleTypeText} className='w-2/3 text-sm px-4 py-2 border-2 border-pink rounded-full outline-none' type="text" />
                  <button onClick={handleDeleteProject} disabled={!isTyped} className='w-2/3 lg:w-1/3 font-semibold text-whiteText px-4 py-2 rounded-full bg-error disabled:bg-softGrey'>Eliminar proyecto</button>
              </div>
            </div>
          </div>
        </div>
      }
      <button onClick={handleShowModal}>
        <img className='w-5' src="/icons/trash-icon.svg" alt="icono tacho" />
        Eliminar tablero
      </button>
    </>
  )
}

export default DeleteProject

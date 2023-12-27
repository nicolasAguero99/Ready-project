import { useState } from 'react'
import { useParams } from 'react-router-dom'

// Components
// import { SocketOnExpelMember, SocketOnAdminMember } from '../../../utils/socket'
import WaitingList from './WaitingList'
import MembersList from './MembersList'

const ManageMembers = ({ setlistOptionsShow }) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [modalMembers, setModalMembers] = useState(false)
  const [sectionMember, setSectionMember] = useState(1)
  const { projectName } = useParams()

  // useEffect(() => {
  //   SocketOnExpelMember(setUsersListByProject, projectName)
  //   SocketOnAdminMember(setUsersListByProject, projectName)
  // }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsLinkCopied(true)
    setTimeout(() => setIsLinkCopied(false), 2000)
  }

  const handleShowMembers = () => setModalMembers(true)

  const handleCloseModal = () => {
    setModalMembers(false)
    setlistOptionsShow(false)
  }

  const handleToggleSectionMember = (section) => setSectionMember(section)

  return (
    <>
      {
        modalMembers &&
        (
          <>
            <div className={'bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[60]'}></div>
            <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] h-fit lg:max-w-[1100px] lg:h-3/4 flex flex-col justify-center gap-4 p-8 lg:p-12 rounded-[20px] z-[65]'>
              <div className='flex gap-4 justify-between items-center'>
                <span className="md:text-3xl text-base font-semibold text-pink">Miembros y solicitudes</span>
                <button onClick={handleCloseModal}>
                  <img className='w-6' src="/icons/cross-icon.svg" alt="cerrar modal" />
                </button>
              </div>
              <div className='flex gap-10 pt-6 pb-4'>
                <button onClick={() => handleToggleSectionMember(1)} className={`${sectionMember === 1 ? 'border-b-2 border-b-pink' : ''} font-medium`}>Miembros</button>
                <button onClick={() => handleToggleSectionMember(2)} className={`${sectionMember === 2 ? 'border-b-2 border-b-pink' : ''} font-medium`}>Solicitudes</button>
              </div>
              <MembersList sectionMember={sectionMember} currentProject={projectName} />
              <WaitingList sectionMember={sectionMember} currentProject={projectName} />
              <div className='flex justify-center md:justify-end items-end'>
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
          </>
        )
      }
      <button onClick={handleShowMembers} className='text-sm md:text-base whitespace-nowrap text-ellipsis overflow-x-hidden'><img className='w-5' src="/icons/members-icon.svg" alt="icono miembros" /> Miembros y solicitudes</button>
    </>
  )
}

export default ManageMembers

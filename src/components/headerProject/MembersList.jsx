import { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'

// Components
import { SocketAction, SocketOnExpelMember, SocketOnAdminMember } from '../../../utils/socket'

// Utils
import ProfilePicture from '../items/ProfilePicture'

// Context
import { AlertContext } from '../../../context/AlertContext'
import { ALERT_MSG, ALERT_TYPE, PATH_LINKS } from '../../../constants/constants'
import { CurrentUserContext, UsersProjectContext } from '../../../context/UsersContext'

const MembersList = ({ sectionMember }) => {
  const [, setAlert] = useContext(AlertContext)
  const [currentUser] = useContext(CurrentUserContext)
  const [usersListByProject, setUsersListByProject] = useContext(UsersProjectContext)
  // const [membersList, setMembersList] = useState([])
  const [showModal, setShowModal] = useState({ show: false, type: null })
  const [memberSelected, setMemberSelected] = useState({ _id: null, name: null })
  const { projectName } = useParams()

  useEffect(() => {
    // setMembersList(users)
    SocketOnExpelMember(setUsersListByProject, projectName)
    SocketOnAdminMember(setUsersListByProject, projectName)
  }, [])

  const handleModalAddAdmin = (userId, userName) => {
    setShowModal({ show: true, type: 'admin' })
    setMemberSelected({ _id: userId, name: userName })
  }

  const handleModalExpelMember = (userId, userName) => {
    setShowModal({ show: true, type: 'expel' })
    setMemberSelected({ _id: userId, name: userName })
  }

  const handleCancelModal = () => {
    setShowModal({ show: false, type: null })
    setMemberSelected({ _id: null, name: null })
  }

  const handleAddAdminMember = (userId) => {
    SocketAction('adminMember', { userId, currentProject: projectName })
    setShowModal({ show: false, type: null })
    setMemberSelected({ _id: null, name: null })
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.adminAdded, duration: 3000 })
  }

  const handleExpelMember = (userId) => {
    SocketAction('expelMember', { userId, currentProject: projectName })
    setShowModal({ show: false, type: null })
    setMemberSelected({ _id: null, name: null })
    setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.memberExpelled, duration: 3000 })
  }

  return (
    <>
      {
        showModal?.show &&
          <>
            <div className={'bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[60]'}></div>
            <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] md:w-[80%] h-fit lg:max-w-[1000px] flex flex-col-reverse md:flex-row justify-between items-center gap-4 p-8 lg:p-12 rounded-[20px] z-[65]'>
              <div className='w-full flex flex-col justify-center max-md:items-center gap-4'>
              <span className='md:text-4xl text-3xl font-semibold text-pink lg:mb-2'>{showModal.type === 'expel' ? currentUser?._id !== memberSelected._id ? 'Quitar miembro' : 'Abandonar proyecto' : 'Hacer administrador'}</span>
                <p className='text-base lg:text-lg text-softGrey  dark:text-darkSoftGrey max-md:text-center'>
                  {showModal.type !== 'expel'
                    ? <span>¿Deseas hacer a <b>{memberSelected?.name}</b> administrador del proyecto?</span>
                    : currentUser?._id !== memberSelected._id
                      ? <span>¿Deseas quitar a <b>{memberSelected?.name}</b> del proyecto?</span>
                      : <span>¿Deseas salir del proyecto?</span>
                  }
                </p>
                <div className='flex flex-col w-full md:flex-row gap-x-6 gap-y-4 mt-6 max-md:justify-center'>
                  <button onClick={handleCancelModal} className='max-md:w-full border-2 border-pink text-pink text-sm lg:text-base rounded-full px-4 py-1.5 transition-colors duration-300 hover:bg-pink hover:text-whiteText'>Cancelar</button>
                  {
                    showModal.type === 'expel'
                      ? <button onClick={() => handleExpelMember(memberSelected?._id)} className='max-md:w-full bg-error text-lightExtraBckg text-sm lg:text-base rounded-full px-4 py-1.5 transition-colors duration-300 hover:bg-lightExtraBckg dark:bg-darkExtraBckg border-2 border-error hover:text-error'>{currentUser?._id !== memberSelected._id ? 'Quitar miembro' : 'Salir'}</button>
                      : <button onClick={() => handleAddAdminMember(memberSelected?._id)} className='max-md:w-full bg-pink text-lightExtraBckg text-sm lg:text-base rounded-full px-4 py-1.5 transition-colors duration-300 hover:bg-lightExtraBckg dark:bg-darkExtraBckg border-2 border-pink hover:text-pink'>Hacer administrador</button>
                  }
                </div>
              </div>
              <div className='w-fit max-md:mb-6'>
              <img className='w-56 md:w-[85%] m-auto dark:invert' src={showModal.type === 'expel' ? '/illustrations/expelled-member-illustration.png' : '/illustrations/rank-up-illustration.png'} alt={showModal.type === 'expel' ? 'ilustración viajar' : 'ilustración soldado'} />
              </div>
            </div>
          </>
      }
      <div className={`${sectionMember === 1 ? 'flex' : 'hidden'} relative flex-col flex-1 gap-8`}>
        <div className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-6 justify-between">
          <ul className="max-h-[380px] flex flex-col divide-y divide-extraSoftGrey lg:px-4 overflow-y-auto">
            {
              usersListByProject.length > 0
                ? (
                    usersListByProject.map(user => (
                      <li key={user._id} style={{ borderTop: currentUser?._id === user._id ? 'none' : '', borderBottom: currentUser?._id === user._id ? '1px solid #D7D7D7' : '' }} className={`flex justify-between items-center py-4 ${currentUser?._id === user._id ? 'order-first' : ''}`}>
                        <div className='flex-1 flex gap-4 justify-between items-center'>
                          <div className='flex gap-6 items-center'>
                            <ProfilePicture wH={'w-12 h-12'} img={user.photo} alt={user.name} border />
                            <div className='flex flex-col gap-1'>
                              <span className="max-md:hidden w-36 font-semibold text-base text-ellipsis overflow-x-hidden whitespace-nowrap" title={user.name}>{user.name}</span>
                              <Link to={`${PATH_LINKS.user}/${user._id}`} className="md:hidden w-36 font-semibold text-base text-ellipsis overflow-x-hidden whitespace-nowrap underline" title={user.name}>{user.name}</Link>
                              <small className='lg:hidden w-44 text-ellipsis overflow-x-hidden whitespace-nowrap text-xs text-softGrey  dark:text-darkSoftGrey first-letter:uppercase'>{user.role}</small>
                            </div>
                            <small className='max-lg:hidden w-44 bg-pink text-lightBckg text-xs lg:text-sm text-center rounded-full py-1 px-4 first-letter:uppercase'>{user.role}</small>
                          </div>
                          <div className='flex max-sm:flex-col sm:gap-4 items-start sm:items-center'>
                            <Link to={`${PATH_LINKS.user}/${user._id}`} className='max-md:hidden w-full max-sm:text-left text-sm sm:text-base font-semibold text-pink px-4 py-3 sm:py-1 rounded-full'>Perfil</Link>
                            <button onClick={() => handleModalAddAdmin(user._id, user.name)} className='w-full max-sm:text-left text-sm sm:text-base font-semibold text-pink px-4 py-3 sm:py-1 rounded-full'>Administrador</button>
                            <button onClick={() => handleModalExpelMember(user._id, user.name)} className={`${currentUser?._id !== user._id ? 'px-4' : 'px-[21px]'} w-full max-sm:text-left text-sm sm:text-base font-semibold text-error py-3 sm:py-1 rounded-full`}>{currentUser?._id === user._id ? 'Salir' : 'Quitar'}</button>
                          </div>
                        </div>
                      </li>
                    ))
                  )
                : (<p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay miembros</p>)
            }
          </ul>
        </div>
      </div>
    </>
  )
}

export default MembersList

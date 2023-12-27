import { useEffect, useState } from 'react'
import axios from 'axios'

// Constants
import { PROJECTS_URL, URL_API } from '../../../constants/constants'

// Components
import ProfilePicture from '../items/ProfilePicture'

// Utils
import { SocketAction, SocketOnWaitingList } from '../../../utils/socket'

const WaitingList = ({ currentProject, sectionMember }) => {
  const [waitingList, setWaitingList] = useState([])

  useEffect(() => {
    console.log('waitingList', waitingList)
  }, [waitingList])

  useEffect(() => {
    SocketOnWaitingList(setWaitingList, currentProject)
  }, [])

  useEffect(() => {
    SocketAction('waitingList', { currentProject })
    // getWaitingList()
  }, [])

  // const getWaitingList = async () => {
  //   const membersInWaitList = await axios.get(`${URL_API}${PROJECTS_URL}/waitingList`, { params: { currentProject } })
  //   setWaitingList(membersInWaitList.data)
  //   console.log('membersInWaitList.data', membersInWaitList.data)
  // }

  const handleAcceptApplication = async (userId, userData) => {
    // setWaitingList(waitingList.filter(user => user._id !== userId))
    // await axios.post(`${URL_API}${PROJECTS_URL}/add-member`, { userId, currentProject })
    SocketAction('waitingList', { userId, currentProject, action: true })
    SocketAction('projectsList', { userId, currentProject })
    SocketAction('membersList', { userData, currentProject })
  }

  const handleDeclineApplication = async (userId) => {
    setWaitingList(waitingList.filter(user => user._id !== userId))
    await axios.post(`${URL_API}${PROJECTS_URL}/decline-member`, { userId, currentProject })
  }

  return (
    <div className={`${sectionMember === 2 ? 'flex' : 'hidden'} flex-col flex-1 gap-8`}>
      <div className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-6 justify-between">
        <ul className="max-h-[380px] flex flex-col divide-y divide-extraSoftGrey px-4 overflow-y-auto">
          {
            waitingList.length > 0
              ? (
                  waitingList.map(user => (
                    <li key={user._id} className="flex justify-between flex-1 items-center py-4">
                      <div className='flex flex-wrap gap-4 justify-center items-center'>
                        <ProfilePicture wH={'w-12 h-12'} img={user.photo} alt={user.name} border />
                        <span className='lg:hidden ps-4 text-sm font-semibold w-32 text-ellipsis overflow-x-hidden whitespace-nowrap' title={user.name}>{user.name}</span>
                        <p className='max-lg:hidden text-sm'><strong className="font-semibold w-32 text-ellipsis overflow-x-hidden whitespace-nowrap" title={user.name}>{user.name}</strong> ha solicitado unirse a este tablero. ¿Deseas aceptar esta solicitud?</p>
                      </div>
                      <div className='flex gap-6'>
                        <button onClick={() => handleAcceptApplication(user._id, user)} className='rounded-full p-1 hover:bg-extraSoftGrey active:bg-extraSoftGrey'><img src="/icons/check-accept-icon.svg" alt="accept" /></button>
                        <button onClick={() => handleDeclineApplication(user._id)} className='rounded-full p-1 hover:bg-extraSoftGrey active:bg-extraSoftGrey'><img src="/icons/cross-decline-icon.svg" alt="decline" /></button>
                      </div>
                    </li>
                  ))
                )
              : <div className='flex flex-col items-center gap-6 md:mt-10'>
                  <img className='w-40 md:w-60 dark:invert' src="/illustrations/reading-illustration.png" alt="leyendo ilustración" />
                  <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay solicitudes pendientes</p>
                </div>
          }
        </ul>
      </div>
    </div>
  )
}

export default WaitingList

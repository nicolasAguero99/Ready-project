import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

// Items
import ProfilePicture from '../../items/ProfilePicture'

// Constants
import { PROJECTS_URL, URL_API, ACTIVITY_URL } from '../../../../constants/constants'

// Context
import { CurrentUserContext, UsersProjectContext } from '../../../../context/UsersContext'

// Utils
import { SocketOnActivities } from '../../../../utils/socket'
import { formatedDateForActivity } from '../../../../utils/utils'
import LoadingActivities from '../../items/loadings/LoadingActivities'

const ActivitySection = () => {
  const [usersListByProject] = useContext(UsersProjectContext)
  const { projectName } = useParams()
  const [currentUser] = useContext(CurrentUserContext)
  const [activityList, setActivityList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getActivity()
    SocketOnActivities(setActivityList, projectName, currentUser?._id)
  }, [])

  const getActivity = async () => {
    const activityData = await axios.get(`${URL_API}${ACTIVITY_URL}/${PROJECTS_URL}/${projectName}`)
    setActivityList(activityData.data)
    setIsLoading(false)
  }

  const getUserFromId = (userId) => {
    const user = usersListByProject?.find(user => user?._id === userId)
    return user ?? { name: 'Usuario expulsado', photo: 'default-profile-penguin', expelled: true }
  }

  return (
    <section className="bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] px-8 py-4">
      {
        isLoading
          ? <>
              <LoadingActivities />
              <LoadingActivities />
              <LoadingActivities />
              <LoadingActivities />
              <LoadingActivities />
              <LoadingActivities />
            </>
          : (
            <>
              {
                activityList.length > 0 && <h2 className='font-medium text-2xl py-4'>Actividad del proyecto</h2>
              }
              <ul className="flex flex-col divide-y divide-extraSoftGrey">
                {
                  activityList.length > 0
                    ? (
                        activityList.map(activity => (
                          activity.toMembers.length === 0
                            ? (
                                <li key={activity._id} className="flex items-center py-4">
                                  <div className='flex-1 flex flex-wrap gap-4 justify-between items-center'>
                                    <div className='flex gap-4 items-center lg:text-base text-sm'>
                                      {
                                        !activity.isAchievement
                                          ? <ProfilePicture wH={`w-12 h-12 ${getUserFromId(activity.author)?.expelled ? 'grayscale' : ''}`} img={getUserFromId(activity.author)?.photo
                                          } alt={getUserFromId(activity.author)?.name} border />
                                          : <img className='w-12' src="/illustrations/medal-illustration.svg" alt="insignia icono" />
                                      }
                                      <p>
                                        <strong className="font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap first-letter:uppercase">
                                          {getUserFromId(activity.author)?.name}
                                        </strong> {activity.action}
                                      </p>
                                    </div>
                                    <small className='text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(activity.createdAt)}</small>
                                  </div>
                                </li>
                              )
                            : (activity.toMembers.includes(currentUser?._id) &&
                                (
                                  <li key={activity._id} className="flex items-center py-4">
                                    <div className='flex-1 flex flex-wrap gap-4 justify-between items-center'>
                                      <div className='flex gap-4 items-center lg:text-base text-sm'>
                                        <img className='w-[48px]' src="/illustrations/star-illustration.svg" alt="star illustration" />
                                        <p className='first-letter:uppercase font-semibold'>{activity.action}</p>
                                      </div>
                                      <small className='text-softGrey  dark:text-darkSoftGrey'>{formatedDateForActivity(activity.createdAt)}</small>
                                    </div>
                                  </li>
                                )
                              )
                        ))
                      )
                    : <div className='flex flex-col items-center gap-6 md:my-10'>
                      <img className='w-40 md:w-60 dark:invert' src="/illustrations/no-activities-illustration.png" alt="aburrido ilustración" />
                      <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay actividades</p>
                    </div>
                }
              </ul>
            </>
            )
      }
    </section>
  )
}

export default ActivitySection

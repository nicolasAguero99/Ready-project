import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

// Components
import Header from '../Header'
import Nav from '../Nav'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
import { ProjectsContext } from '../../../context/ProjectsContext'

// Utils
import { formatedDateFromDB } from '../../../utils/utils'

// Constants
import { ACHIEVEMENTS, URL_API, USERS_GET_BY_ID_URL, USERS_URL } from '../../../constants/constants'

const AllAchievements = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [projectsList] = useContext(ProjectsContext)
  const [allAchievementsList, setAllAchievementsList] = useState([])
  const { projectName } = useParams()

  const getAllAchievements = async () => {
    console.log('currentUser?._id', currentUser?._id)
    if (!currentUser) return
    const user = await axios.get(`${URL_API}${USERS_URL}/${USERS_GET_BY_ID_URL}/${currentUser?._id}`)
    console.log('user.data.achievements', user.data.achievements)
    const allAchievements = await axios.get(`${URL_API}${ACHIEVEMENTS}`, { params: { achievementsId: user.data.achievements } })
    setAllAchievementsList(allAchievements.data)
  }

  useEffect(() => {
    getAllAchievements()
  }, [currentUser, projectName])

  return (
    <div className='flex'>
      <Nav />
      <main className='bg-lightBckg dark:bg-darkBckg flex flex-col gap-12 flex-1 px-10 rounded-[20px] m-4 py-5'>
        <Header />
        <div className='flex gap-8'>
          <div className='flex flex-col flex-1 gap-8'>
            <h1 className="md:text-3xl text-base font-medium">Tus insignias</h1>
            <section className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-6 justify-between p-6 rounded-lg shadow-cardTask">
              <ul className="flex justify-between font-medium text-sm text-softGrey  dark:text-darkSoftGrey">
                {/* <li>Tarea y proyecto</li>
                <li>Descripción</li>
                <li>Entrega</li>
                <li>Estado</li>
                <li>Prioridad</li>
                <li>Responsables</li> */}
                <li className="font-semibold w-36 text-ellipsis overflow-x-hidden whitespace-nowrap">Insignia y proyecto</li>
                <li className="w-32 text-sm clamped-text">Descripción</li>
                <li className="w-36 font-medium text-ellipsis overflow-x-hidden whitespace-nowrap">Obtenida</li>
              </ul>
              <ul className="flex flex-col divide-y divide-extraSoftGrey">
                {allAchievementsList.map(achievement => (
                  <li key={achievement._id} className="flex justify-between flex-1 items-center py-4">
                    <div className="flex flex-col">
                      <h4 className="font-semibold w-36 text-ellipsis overflow-x-hidden whitespace-nowrap" title={achievement.name}>{achievement.name}</h4>
                      <span className="md:text-sm text-xs w-32 text-ellipsis overflow-x-hidden whitespace-nowrap">{projectsList.find(project => project.to === achievement.project)?.name}</span>
                    </div>
                    <p className="w-32 text-sm clamped-text" title={achievement.description}>{achievement.description}</p>
                    <span className="w-36 font-medium text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDateFromDB(achievement.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AllAchievements

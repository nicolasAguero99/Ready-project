import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import axios from 'axios'

// Context
import { ACHIEVEMENTS, COLOR_TEXT, URL_API, USERS_URL } from '../../../../constants/constants'
import { TasksContext } from '../../../../context/TasksContext'
import { UsersProjectContext } from '../../../../context/UsersContext'
import { TagsContext } from '../../../../context/TagsContext'
import { DarkModeContext } from '../../../../context/DarkModeContext'

// Items
import ProfilePicture from '../../../components/items/ProfilePicture'

// Utils
import { getTagsListByProject, getUsersListByProject } from '../../../../utils/utils'

const Charts = () => {
  ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)
  ChartJS.defaults.color = COLOR_TEXT
  const [tasks] = useContext(TasksContext)
  const [usersListByProject, setUsersListByProject] = useContext(UsersProjectContext)
  const [darkMode] = useContext(DarkModeContext)
  const [tagsByProject, setTagsByProject] = useContext(TagsContext)
  const [rankingList, setRankingList] = useState([])
  const [tasksByTags, setTasksByTags] = useState({})
  const { projectName } = useParams()

  useEffect(() => {
    getTagsListByProject(projectName).then((res) => setTagsByProject(res))
  }, [projectName])

  useEffect(() => {
    getUsersListByProject().then((res) => setUsersListByProject(res))
  }, [projectName])

  useEffect(() => {
    getUsersWithAchievements()
  }, [usersListByProject])

  useEffect(() => {
    setTasksByTags(INITIAL_TAGS_OBJ)
  }, [tasks])

  const getUsersWithAchievements = async () => {
    if (usersListByProject.length <= 0) return
    const usersId = usersListByProject.map(user => user._id)
    const allAchievements = await axios.get(`${URL_API}${USERS_URL}/${ACHIEVEMENTS}/byProject`, { params: { usersId, currentProject: projectName } })
    setRankingList(allAchievements.data)
  }

  const rankingTierStyles = (index) => {
    if (index === 0) {
      return 'bg-pink h-24'
    } else if (index === 1) {
      return 'bg-orange h-16'
    } else if (index === 2) {
      return 'bg-purple h-12'
    } else {
      return null
    }
  }

  const tasksByStateCount = {}
  tasks.forEach(task => {
    if (!tasksByStateCount[task.state]) {
      tasksByStateCount[task.state] = 0
    }
    tasksByStateCount[task.state]++
  })

  const tasksByTagCount = {}
  tasks.forEach(task => {
    task.tags.forEach(tag => {
      if (!tasksByTagCount[tag]) {
        tasksByTagCount[tag] = 0
      }
      tasksByTagCount[tag]++
    })
  })

  const INITIAL_TAGS_OBJ = tasksByTagCount
  const TASKS_TAGS_NAMES = tagsByProject?.map(tag => tag.name)
  const TASKS_TAGS_QUANTITY = Object.values(tasksByTags)
  const COLOR_TAGS = tagsByProject?.map(tag => tag.color)

  const dataChartTags = {
    labels: [...TASKS_TAGS_NAMES],
    datasets: [
      {
        label: 'Tareas',
        data: [...TASKS_TAGS_QUANTITY],
        backgroundColor: [...COLOR_TAGS],
        cutout: '80%'
      }
    ]
  }

  const optionsChartTags = (isMobile) => {
    return {
      color: darkMode ? '#fff' : '#000',
      fill: true,
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { position: !isMobile ? 'right' : 'bottom', labels: { boxWidth: 10, padding: 15, usePointStyle: true, pointStyleWidth: 20, font: { size: 14, family: 'Montserrat' } } }
      }
    }
    // return options
  }

  return (
    <>
      <div className='bg-lightExtraBckg dark:bg-darkExtraBckg flex max-lg:flex-1 flex-col gap-12 px-8 py-6 rounded-[10px] shadow-cardTask overflow-x-auto'>
        <h3 className='font-medium text-2xl max-sm:text-center'>Tareas por etiqueta</h3>
        {
          dataChartTags?.labels?.length > 0
            ? (
                <>
                  <div className='max-sm:hidden m-auto' style={{ width: '280px', height: '160px' }}>
                    <Doughnut data={dataChartTags} options={optionsChartTags()} />
                  </div>
                  <div className='sm:hidden w-[200px] h-[200px] m-auto'>
                    <Doughnut data={dataChartTags} options={optionsChartTags(true)} />
                  </div>
                </>
              )
            : <div className='flex flex-col items-center gap-6 md:my-10'>
                <img className='w-36 md:w-40 dark:invert' src="/illustrations/stats-illustration.png" alt="estadístico ilustración" />
                <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay estadísticas</p>
              </div>
        }
      </div>
      <div className='bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col max-md:w-full md:flex-1 gap-6 justify-center px-8 py-6 rounded-[10px] shadow-cardTask'>
        <h3 className='font-medium text-2xl max-sm:text-center'>Ranking por insignias</h3>
        {
          rankingList.length > 0
            ? <div className='flex justify-center md:items-end'>
                <div className='w-full md:min-w-[300px] flex max-sm:flex-col justify-center sm:gap-2 max-sm:divide-y-[1px] divide-extraSoftGrey dark:divide-darkSoftGrey'>
                  {rankingList?.slice(0, 3).map((user, index) => (
                    <div key={user._id} className={`flex flex-col flex-1 gap-4 justify-end items-center max-sm:py-4 ${index === 0 ? 'sm:order-1' : index === 1 ? 'sm:order-2' : `sm:order-${index + 1}`}`}>
                      <div className='flex flex-col flex-1 gap-4 justify-end items-center'>
                        <span className='sm:hidden ms-1'>{index + 1}º</span>
                        <ProfilePicture wH={'w-10 h-10'} img={user.photo} alt={user.name} />
                        <div className={`max-sm:hidden relative ${rankingTierStyles(index)} w-12 rounded-[10px] text-center pt-2 text-2xl font-semibold text-lightExtraBckg`}>
                          {index + 1}<span className='ms-1'>º</span>
                        </div>
                        <div className='flex flex-col gap-2 items-center text-center px-2'>
                          <span className='w-28 text-ellipsis overflow-x-hidden whitespace-nowrap'>{user.name}</span>
                          <small><b className='font-semibold'>{user.achievements.length}</b> insignias</small>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="hidden lg:flex flex-col gap-2 order-4">
                    {rankingList.slice(3).map((user, index) => (
                      <div key={user._id} className="flex items-center">
                        <span className="text-sm">{index + 4}. {user.name} ({user.achievements.length})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            : <div className='flex flex-col items-center gap-6 md:my-10'>
                <img className='w-36 md:w-40 dark:invert' src="/illustrations/ranking-illustration.png" alt="estadístico ilustración" />
                <p className='text-softGrey  dark:text-darkSoftGrey text-center'>No hay ranking</p>
              </div>
        }
      </div>
    </>
  )
}

export default Charts

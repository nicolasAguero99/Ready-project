import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// Constants
import { ORDER_BY, ORDER_BY_TEXT, PRIORITY_ORDER, PROJECT_SECTIONS_LINKS } from '../../constants/constants'

// Context
import { TasksContext } from '../../context/TasksContext'

const NavProject = () => {
  const [tasks, setTasks] = useContext(TasksContext)
  const [showSelectOrderBy, setShowSelectOrderBy] = useState(false)
  const [listOptionsShow, setlistOptionsShow] = useState(false)
  const listOptionsRef = useRef(null)
  const location = useLocation()
  const isBoardLocation = location.pathname.includes(PROJECT_SECTIONS_LINKS[0].to)
  const currentSection = PROJECT_SECTIONS_LINKS.find(section => section.to === location?.pathname.split('/')[3])?.name

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

  const handleOpenOptions = () => {
    setlistOptionsShow(true)
  }

  const handleCloseOptions = () => {
    setlistOptionsShow(false)
  }

  const byDefault = [...tasks].sort((a, b) => {
    const defaultA = new Date(a.updatedAt)
    const defaultB = new Date(b.updatedAt)

    return defaultB - defaultA
  })
  const byPriorityDes = [...tasks].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority]
    const priorityB = PRIORITY_ORDER[b.priority]

    return priorityB - priorityA
  })
  const byDateAsc = [...tasks].sort((a, b) => {
    let dateA = null
    let dateB = null
    if (a?.date && b?.date) {
      dateA = new Date(JSON.parse(a.date)[0])
      dateB = new Date(JSON.parse(b?.date)[0])
    }

    if (dateA === dateB) {
      return dateA - dateB
    } else {
      const dateA = new Date(JSON.parse(a?.date)[1])
      const dateB = new Date(JSON.parse(b?.date)[1])
      return dateA - dateB
    }
  })

  const handleClickShowOrderBy = () => {
    setShowSelectOrderBy(!showSelectOrderBy)
  }

  const handleClickFilter = (order) => {
    setShowSelectOrderBy(!showSelectOrderBy)
    orderTasksBy(order)
  }

  const orderTasksBy = (orderParam) => {
    if (orderParam === ORDER_BY[1]) {
      setTasks(byPriorityDes)
    } else if (orderParam === ORDER_BY[2]) {
      setTasks(byDateAsc)
    } else {
      setTasks(byDefault)
    }
  }

  return (
    <nav id='project-navbar' className='flex justify-between py-6 px-5 rounded-[10px] bg-lightExtraBckg dark:bg-darkExtraBckg z-20 navproject-bar-custom'>
      <ul className='flex gap-6 font-normal md:text-lg text-base overflow-x-auto'>
        {
          PROJECT_SECTIONS_LINKS.map(link => (
            <li id={`project-navbar-${link.to}`} key={link.id}><NavLink className={({ isActive }) => isActive ? 'border-b-2 border-b-pink navproject-custom' : 'navproject-custom'} to={link.to}>{link.name}</NavLink></li>
          ))
        }
      </ul>
      <div id='project-navbar-order-by' className='relative w-24 max-sm:top-1 flex justify-end items-start sm:pe-4'>
        {
          isBoardLocation &&
          <button onClick={handleClickShowOrderBy} className='flex justify-center items-center gap-2 whitespace-nowrap'>
            <img className='w-6' src="/icons/filter-icon.svg" alt="filtrar icono" />
            <span className='max-sm:hidden'>Ordenar por</span>
          </button>
        }
        {
          showSelectOrderBy &&
          <ul className='absolute top-[45px] right-[10px] flex-col bg-lightExtraBckg dark:bg-darkExtraBckg w-[236px] h-fit py-2 rounded-[10px] shadow-cardTask font-normal md:text-lg text-base overflow-x-auto divide-y divide-borderSoftGrey z-20'>
            {
              ORDER_BY.map(order => (
                <li key={ORDER_BY_TEXT[order]} className='[&>button]:w-full [&>button]:text-left [&>button]:py-1.5 first-letter:[&>button]:uppercase px-4 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg navproject-custom'>
                  <button onClick={() => handleClickFilter(order)}>{ORDER_BY_TEXT[order]}</button>
                </li>
              ))
            }
          </ul>
        }
      </div>
    </nav>
  )
}

export default NavProject

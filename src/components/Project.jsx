import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
// import { useEffect } from 'react'

// Components
import Nav from './Nav'
import BoardSection from './project/BoardSection/BoardSection'
import Header from './Header'
import DiarySection from './project/DiarySection/DiarySection'
import AnalyticsSection from './project/AnalyticsSection/AnalyticsSection'
import HeaderProject from './HeaderProject'
import NavProject from './NavProject'
import ActivitySection from './project/ActivitySection/ActivitySection'

const Project = () => {
  const { section } = useParams()
  const [showRowTasksStates, setShowRowTasksStates] = useState(false)
  const rowTasksStatesref = useRef(null)

  let renderData = ''

  if (section === 'tablero' || !section) {
    renderData = (<BoardSection showRowTasksStates={showRowTasksStates} />)
  } else if (section === 'agenda') {
    renderData = (<DiarySection />)
  } else if (section === 'analiticas') {
    renderData = (<AnalyticsSection />)
  } else if (section === 'actividad') {
    renderData = (<ActivitySection />)
  }

  useEffect(() => {
    if (section === 'tablero' || !section) {
      const handleScroll = () => {
        rowTasksStatesref.current?.scrollTop > 345
          ? setShowRowTasksStates(true)
          : setShowRowTasksStates(false)
      }
      rowTasksStatesref.current?.addEventListener('scroll', handleScroll)

      return () => {
        rowTasksStatesref.current?.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <>
      <div className='flex'>
        <Nav />
        <div ref={rowTasksStatesref} className='rounded-[20px] md:m-4 w-full bg-lightBckg dark:bg-darkBckg px-6 py-5 overflow-x-hidden h-[calc(100vh-2.50rem)]'>
          <div className='flex flex-col gap-8'>
            <Header />
            <HeaderProject />
            <NavProject />
            {renderData}
          </div>
        </div>
      </div>
    </>
  )
}

export default Project

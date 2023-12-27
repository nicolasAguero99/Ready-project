import { useContext, useEffect } from 'react'
import axios from 'axios'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

// Utils
import { stepsFirstScreen, stepsCreateNewTask, stepsProfile } from '../../../utils/stepsOnBoarding'

// Context
import { TUTORIAL_URL, URL_API, USERS_URL } from '../../../constants/constants'
import { CurrentUserContext } from '../../../context/UsersContext'
import { TutorialContext } from '../../../context/TutorialContext'

const OnBoarding = ({ mode }) => {
  const [currentUser] = useContext(CurrentUserContext)
  const [, setTutorialsCompleted] = useContext(TutorialContext)

  const modeOnBoarding = () => {
    if (mode === 'stepsFirstScreen') {
      return stepsFirstScreen
    } else if (mode === 'stepsCreateNewTask') {
      return stepsCreateNewTask
    } else if (mode === 'stepsProfile') {
      return stepsProfile
    }
  }

  // useEffect(() => {

  // }, [])

  useEffect(() => {
    if (!currentUser) return
    const intro = introJs()
    intro.setOptions({
      steps: modeOnBoarding(),
      showProgress: true,
      showStepNumbers: true,
      tooltipClass: 'flex flex-col gap-4 bg-lightExtraBckg dark:bg-darkExtraBckg rounded-full shadow-cardTask px-4 py-4 card-task',
      prevLabel: 'Anterior',
      nextLabel: 'Siguiente',
      doneLabel: 'Entendido',
      skipLabel: 'x',
      hidePrev: true,
      stepNumbersOfLabel: 'de',
      buttonClass: 'font-semibold text-sm text-whiteText px-4 py-2 rounded-full bg-pink',
      disableInteraction: true,
      exitOnOverlayClick: false
    })
    intro.onexit(async () => {
      await axios.post(`${URL_API}${USERS_URL}/${TUTORIAL_URL}`, { currentUserId: currentUser?._id, mode })
      setTutorialsCompleted(prevState => [...prevState, mode])
    })
    intro.start()
  }, [currentUser])

  return <div className='hidden'></div>
}

export default OnBoarding

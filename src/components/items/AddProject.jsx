// Constants
import { URL_NEW_PROJECT } from '../../../constants/constants'

// Context
import { Link } from 'react-router-dom'

const AddProject = () => {
  return (
    <Link className='w-full text-xs md:text-base text-center first-letter:uppercase whitespace-nowrap font-semibold text-whiteText px-2 md:px-4 py-1 rounded-full border-2 border-pink bg-pink hover:bg-lightExtraBckg dark:bg-darkExtraBckg hover:text-pink transition-colors duration-300 ease-out' to={`/${URL_NEW_PROJECT}`}>Crear proyecto</Link>
  )
}

export default AddProject

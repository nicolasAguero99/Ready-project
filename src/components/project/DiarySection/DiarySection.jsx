// Components
import Diary from './Diary'
import FormTask from '../FormTask'

const DiarySection = () => {
  return (
    <main className='flex flex-col gap-6'>
        <Diary />
        <FormTask />
    </main>
  )
}

export default DiarySection

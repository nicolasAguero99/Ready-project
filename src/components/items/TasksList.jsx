import { useContext, useState, useEffect } from 'react'
// import axios from 'axios'

// Context
import { AddTasksContext, TasksContext } from '../../../context/TasksContext'
import { EditTaskContext } from '../../../context/EditTaskContext'

// Components
import Task from './Task'

// Items
import LoadingTasks from './loadings/LoadingTasks'

// Constants
// import { URL_API, USERS_URL } from '../../../constants/constants'

const TasksList = ({ stateTask }) => {
  const [tasks] = useContext(TasksContext)
  const [, setIsAddTaskMode] = useContext(AddTasksContext)
  const { state } = useContext(EditTaskContext)
  const [isLoading, setIsLoading] = useState(true)

  const handleClickAddTask = (stateParam) => {
    state.current = stateParam
    setIsAddTaskMode(true)
  }

  useEffect(() => {
    tasks.length < 0 ? setIsLoading(true) : setIsLoading(false)
  }, [tasks])

  return (
    <>
      <div className='bg-lightExtraBckg dark:bg-darkExtraBckg flex-1 rounded-b-[10px] min-w-[300px] min-h-[560px] tasklist-custom'>
        <div className='bg-lightExtraBckg dark:bg-darkExtraBckg flex justify-between px-4 py-6 font-semibold md:text-xl text-base z-10 overflow-y-hidden'>
          <h4 className='first-letter:uppercase'>{stateTask}</h4>
          <div className='flex items-center gap-2'>
            <button id={stateTask[0] && 'board-add-task'} onClick={() => handleClickAddTask(stateTask)}>
              <img className='dark:invert' src='/icons/plus-icon.svg' alt='añadir tarea' />
            </button>
          </div>
        </div>
        {
          isLoading
            ? (
                <div className='flex flex-col gap-4 items-center'>
                  <LoadingTasks />
                  <LoadingTasks />
                  <LoadingTasks />
                </div>
              )
            : (
                <div className='flex flex-col px-4 py-4 gap-4'>
                  {
                    tasks.map(task =>
                      task.state === stateTask &&
                      <Task key={task._id} task={task} />
                    )
                  }
                </div>
              )
        }
      </div>
    </>
  )
}

export default TasksList

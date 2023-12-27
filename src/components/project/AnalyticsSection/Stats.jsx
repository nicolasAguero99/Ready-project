import { useContext } from 'react'

// Context
import { StateTasksContext, TasksContext } from '../../../../context/TasksContext'

const Stats = () => {
  const [tasks] = useContext(TasksContext)
  const [statesTasks] = useContext(StateTasksContext)

  console.log('statesTasks', statesTasks)

  const tasksByStates = (state) => {
    return tasks.filter(task => task.state === state).length
  }

  return (
    <>
      {
        statesTasks.map(state => (
          <div key={state} className="flex flex-col flex-1 gap-4">
            <span className="text-pink text-2xl font-semibold">{tasksByStates(state)}</span>
            <span className="text-sm lg:text-base text-ellipsis whitespace-nowrap overflow-x-hidden">Tareas {state}</span>
          </div>
        ))
      }
      <div className="flex flex-col flex-1 gap-4">
        <span className="text-pink text-2xl font-semibold">{tasks.length}</span>
        <span className="text-sm lg:text-base text-ellipsis whitespace-nowrap overflow-x-hidden">Tareas totales</span>
      </div>
    </>
  )
}

export default Stats

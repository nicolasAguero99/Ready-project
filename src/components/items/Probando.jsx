// import { useDrag, useDrop } from 'react-dnd'
// import { io } from 'socket.io-client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Items

const Probando = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id })

  const styleXD = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <>
      <div ref={setNodeRef} {...attributes} {...listeners} style={{ transform: CSS.Transform.toString(transform), transition }} id={task._id} className='flex flex-col gap-4 relative bg-lightExtraBckg dark:bg-darkExtraBckg rounded-full shadow-cardTask px-4 py-4 card-task'>
        {task._id}
      </div>
    </>
  )
}

export default Probando

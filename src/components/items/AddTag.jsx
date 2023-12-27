import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

// Constants
import { COLORS_ARRAY } from '../../../constants/constants'

// Utils
import { SocketAction, SocketOnAddTag } from '../../../utils/socket'

// Context
import { TagsContext } from '../../../context/TagsContext'

const AddTag = ({ showModal, setShowModal }) => {
  const [tagName, setTagName] = useState('')
  const [, setTagsByProject] = useContext(TagsContext)
  const { projectName } = useParams()

  const RANDOM_COLOR = COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)]

  const handleOpenModal = () => setShowModal(true)

  const handleTypeProject = event => setTagName(event.target.value)

  const handleAddProject = async () => {
    SocketAction('addTag', { name: tagName, color: RANDOM_COLOR, project: projectName })
    setShowModal(false)
  }

  return (
    <>
      <button onClick={handleOpenModal} className={`${showModal ? 'hidden' : ''} font-semibold md:text-sm text-xs px-4 py-2 rounded-full bg-extraSoftGrey`}>Crear nueva etiqueta</button>
      {
        showModal &&
        <div className='bg-lightExtraBckg dark:bg-darkExtraBckg'>
          <h2 className='text-lg font-semibold text-center pt-10'>Añadir etiqueta</h2>
          <div className='flex justify-center items-center gap-4 pt-10'>
            <input onChange={handleTypeProject} className='rounded-full border-[1px] border-extraSoftGrey px-4 py-1' type="text" placeholder='Nombre del etiqueta' />
            <button onClick={handleAddProject} className='rounded-full bg-pink text-lightExtraBckg'>Añadir</button>
          </div>
        </div>
      }
    </>
  )
}

export default AddTag

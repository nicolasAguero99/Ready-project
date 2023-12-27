import { createContext, useState } from 'react'

export const TagsContext = createContext()

export const TagsProvider = ({ children }) => {
  const [tagsByProject, setTagsByProject] = useState([])

  return (
    <TagsContext.Provider value={[tagsByProject, setTagsByProject]}>
      {children}
    </TagsContext.Provider>
  )
}

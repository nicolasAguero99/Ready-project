import { createContext, useState } from 'react'

export const AlertContext = createContext()

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, type: '', message: '', action: '', duration: 0 })
  return (
    <AlertContext.Provider value={[alert, setAlert]}>
      {children}
    </AlertContext.Provider>
  )
}

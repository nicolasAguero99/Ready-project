import { createContext, useEffect, useState } from 'react'
import axios from 'axios'

// Constants
import { URL_API, PETS_URL } from '../constants/constants'

export const PetsContext = createContext()

export const PetsProvider = ({ children }) => {
  const [petsList, setPetsList] = useState([])

  const getPetsList = async () => {
    const res = await axios.get(`${URL_API}${PETS_URL}`)
    setPetsList(res.data)
    console.log('pets', res.data)
  }

  useEffect(() => {
    getPetsList()
  }, [])

  return (
    <PetsContext.Provider value={[petsList, setPetsList]}>
      {children}
    </PetsContext.Provider>
  )
}

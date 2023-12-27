// Constants
import { URL_IO } from '../../../constants/constants'

const ProfilePicture = ({ wH, bckg, img, alt, border }) => {
  return (
    <>
    {!img
      ? <div draggable="false" className={`${wH ?? ''} rounded-full ${bckg}`}></div>
      : <img draggable="false" className={`${wH ?? ''} ${border ? 'ring-2 ring-lightExtraBckg dark:ring-darkExtraBckg' : ''} object-cover rounded-full`} src={isValidURL(img) ? img : `/server/profilePictures/${img}.jpg`} alt={`profile picture ${alt}`} />
    }
    </>
  )
}

const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default ProfilePicture

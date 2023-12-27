import { Link, useParams } from 'react-router-dom'
import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'

// Components
import Header from '../Header'
import Nav from '../Nav'

// Context
import { CurrentUserContext } from '../../../context/UsersContext'
import { ProjectsContext } from '../../../context/ProjectsContext'
import { TutorialContext } from '../../../context/TutorialContext'
import { PetsContext } from '../../../context/PetsContext'
import { StateTasksContext } from '../../../context/TasksContext'

// Utils
import { colorTaskState, formatedBirthdayDate, formatedDate, userAge } from '../../../utils/utils'

// Constants
import { ACHIEVEMENTS, PATH_LINKS, PHOTO_URL, TUTORIAL, URL_API, URL_COLLECTION_TASK, USERS_URL } from '../../../constants/constants'

// Items
import ProfilePicture from '../items/ProfilePicture'
import OnBoarding from '../items/OnBoarding'
import ProfilePet from '../items/ProfilePet'

const Profile = () => {
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext)
  const [projectsList] = useContext(ProjectsContext)
  const [tutorialsCompleted] = useContext(TutorialContext)
  const [petsList] = useContext(PetsContext)
  const [statesTasks] = useContext(StateTasksContext)
  const [allTasksList, setAllTasksList] = useState([])
  const [achievements, setAchievements] = useState([])
  // const [achievementsLength, setAchievementsLength] = useState(0)
  const [showTutorial, setShowTutorial] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isEditModeDescription, setIsEditModeDescription] = useState(false)
  const [showEditPhoto, setShowEditPhoto] = useState(false)
  const [descriptionText, setDescriptionText] = useState('')
  const [photoSrc, setPhotoSrc] = useState('')
  const [profileData, setProfileData] = useState([])
  const [usersList, setUsersList] = useState([])
  const [petSelectedId, setPetSelectedId] = useState('')
  const [petFocused, setPetFocused] = useState('')
  const { projectName } = useParams()
  const sectionDropRef = useRef(null)

  useEffect(() => {
    setShowTutorial(tutorialState())
  }, [tutorialsCompleted])

  useEffect(() => {
    getAllTasks()
  }, [currentUser, projectName, statesTasks])

  useEffect(() => {
    initialStateProfile()
  }, [currentUser])

  useEffect(() => {
    getAllPets()
  }, [petsList])

  useEffect(() => {
    getPetSelectedData()
  }, [petsList, petSelectedId])

  useEffect(() => {
    console.log('photoSrc', photoSrc)
  }, [photoSrc])

  useEffect(() => {
    console.log('profileData', profileData)
  }, [profileData])

  const tutorialState = () => {
    if (!tutorialsCompleted) return
    console.log('tutorialsCompleted', tutorialsCompleted)
    console.log(' !tutorialsCompleted.includes(TUTORIAL.stepsProfile)', !tutorialsCompleted.includes(TUTORIAL.stepsProfile))
    return !tutorialsCompleted.includes(TUTORIAL.stepsProfile)
  }

  const initialStateProfile = () => {
    if (!currentUser) return

    console.log('currentUser', currentUser)
    setProfileData({ ...currentUser, birthday: new Date(currentUser.birthday).toISOString().split('T')[0] })
    setDescriptionText(currentUser?.description)
    setPetSelectedId(currentUser?.petSelected)
  }

  const handleCloseEditProfile = () => setIsEditMode(false)

  const handleChangeProfileDescription = () => setIsEditModeDescription(true)

  const handleCloseEditDescription = () => setIsEditModeDescription(false)

  const handleTypeDescriptionText = (e) => setDescriptionText(e.target.value)

  const handleSaveDescription = async () => {
    setIsEditModeDescription(false)
    const userData = { ...currentUser, birthday: new Date(currentUser.birthday).toISOString().split('T')[0], description: descriptionText }
    console.log('profileData', profileData)
    const user = await axios.post(`${URL_API}${USERS_URL}/update`, { profileData: userData })
    const token = window.localStorage.getItem('token')
    setCurrentUser({ ...user.data, token })
  }

  const handleEditProfile = () => setIsEditMode(true)

  const handleEditPhoto = () => setShowEditPhoto(true)

  const handleUploadPhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoSrc(file)
    const fileBlob = URL.createObjectURL(file)
    setProfileData({ ...profileData, photo: fileBlob })
    console.log('URL.createObjectURL(file)', URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    console.log('file', e.dataTransfer)
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setPhotoSrc(file)
    const fileBlob = URL.createObjectURL(file)
    setProfileData({ ...profileData, photo: fileBlob })
  }

  const handleOnDragEnter = () => {
    sectionDropRef.current.classList.add('border-pink', 'border-dashed')
    sectionDropRef.current.classList.remove('border-transparent')
  }

  const handleCloseEditPhoto = () => setShowEditPhoto(false)

  const getPetSelectedData = () => {
    if (!petsList) return
    const dataPet = petsList.filter(pet => pet._id === profileData?.petSelected)
    return dataPet
  }

  const isUnlocked = (petValueToUnlock) => currentUser?.points.reduce((total, point) => total + point.count, 0) >= petValueToUnlock

  const handleSaveProfile = async () => {
    setIsEditMode(false)
    const formData = new FormData()
    formData.append('imageFile', photoSrc)

    console.log('photoSrc', photoSrc)
    console.log('profileData.photo', formData)

    let photoUploaded = ''
    if (photoSrc) {
      photoUploaded = await axios.post(`${URL_API}${USERS_URL}/${PHOTO_URL}/update`, formData)
      if (!photoUploaded.data?.newPhoto) return
      setProfileData({ ...profileData, photo: photoUploaded.data?.newPhoto })
      console.log('photoUploaded', photoUploaded.data?.newPhoto)
      console.log('xd')
    }

    console.log('profileData', profileData)
    const user = await axios.post(`${URL_API}${USERS_URL}/update`, { profileData: { ...profileData, photo: photoSrc ? photoUploaded.data?.newPhoto : currentUser?.photo } })
    console.log('user.data', user.data)
    setCurrentUser({ ...currentUser, ...user.data })
    setPhotoSrc('')
  }

  const handleChangeProfileData = (e) => {
    if (e) {
      const { name, value } = e.target
      setProfileData({ ...profileData, petSelected: petSelectedId, [name]: value })
    } else {
      setProfileData({ ...profileData, petSelected: petSelectedId })
    }
  }

  const handleChangePet = (id, toUnlock, isNone) => {
    if (isUnlocked(toUnlock) || isNone) {
      console.log('toUnlock', toUnlock)
      setPetSelectedId(id)
    }
    setPetFocused(id)
  }

  const getAchievementsByCurrentUser = async () => {
    const achievementsByCurrentUser = await axios.get(`${URL_API}${ACHIEVEMENTS}/${USERS_URL}/${currentUser?._id}`)
    setAchievements(achievementsByCurrentUser.data)
    console.log('achievementsByCurrentUser', achievementsByCurrentUser.data)
  }

  const getAllPets = async () => {
    if (!petsList) return
    console.log('petsList', petsList)
  }

  const getAllTasks = async () => {
    if (!currentUser || statesTasks.length <= 0) return
    const allTasks = await axios.get(`${URL_API}${URL_COLLECTION_TASK}/${USERS_URL}/${currentUser?._id}`)
    const usersId = allTasks.data.map(task => task.users)
    const usersIdArray = new Set(usersId.flat())
    const users = await axios.get(`${URL_API}${USERS_URL}/get`, { params: { usersId: [...usersIdArray] } })
    setUsersList(users.data)
    const allTasksSorted = allTasks.data.filter(task => task.state !== statesTasks[2]).sort((a, b) => {
      const dateA = new Date(JSON.parse(a.date)[0])
      const dateB = new Date(JSON.parse(b.date)[0])
      if (dateA === dateB) {
        return dateA - dateB
      } else {
        const dateA = new Date(JSON.parse(a.date)[1])
        const dateB = new Date(JSON.parse(b.date)[1])
        return dateA - dateB
      }
    }).slice(0, 3)
    console.log('allTasks', allTasksSorted)
    setAllTasksList(allTasksSorted)
    getAchievementsByCurrentUser()
  }

  return (
    <div className='flex'>
      {
        showTutorial && <OnBoarding mode='stepsProfile' />
      }
      {
        showEditPhoto &&
        <>
          <div className={'bg-lightText min-w-full min-h-full fixed top-0 left-0 opacity-50 z-[60]'}></div>
          <div className='bg-lightExtraBckg dark:bg-darkExtraBckg fixed top-0 left-0 bottom-0 right-0 m-auto w-[90%] max-h-[90%] md:max-h-[580px] lg:max-w-[1100px] lg:h-3/4 flex flex-col justify-center gap-4 p-8 lg:p-12 rounded-[20px] z-[65]'>
            <div className='flex justify-between items-center gap-4'>
              <span className='text-xl sm:text-3xl font-semibold'>Cambiar perfil</span>
              <div className='flex gap-4 items-center'>
                <div className='relative'>
                  <input onClick={(e) => { handleChangeProfileData(e); handleCloseEditPhoto() }} name='petSelected' value={petSelectedId} type='button' className='relative w-5 opacity-0 rounded-[10px] transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey cursor-pointer z-20' />
                  <img className='absolute top-1 left-0 w-5 z-10' src="/icons/check-icon.svg" alt="guardar cambios" />
                </div>
                <button onClick={handleCloseEditPhoto} className='rounded-[10px] text-pink text-sm transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey z-20'>
                  <img className='w-6' src="/icons/cross-icon.svg" alt="cerrar modal" />
                </button>
              </div>
            </div>
            <div className='flex max-md:flex-col justify-around items-center flex-1 md:gap-10 max-md:overflow-y-hidden'>
              <div
                ref={sectionDropRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onDragEnter={handleOnDragEnter}
                className='max-md:w-full h-full max-md:max-h-[300px] flex max-lg:w-[60%] flex-col justify-around items-center md:gap-12 px-4 py-4 md:py-8 md:shadow-cardTask rounded-[10px] border-2 border-transparent'
              >
                <div className='relative w-fit h-fit'>
                  <ProfilePicture wH={'w-40 h-40 md:w-56 md:h-56'} img={profileData?.photo} alt={profileData?.name} />
                  {
                    petsList.some(pet => pet._id === petSelectedId) &&
                    <ProfilePet wH={'w-20 h-20 md:w-24 md:h-24'} img={petsList.find(pet => pet._id === petSelectedId)?.img} alt={`pet ${petsList.find(pet => pet._id === petSelectedId)?.name}`} />
                  }
                </div>
                <div className='flex flex-col items-center gap-4'>
                  <label htmlFor='input-photo' className='bg-pink font-medium text-lightBckg max-md:text-center text-md rounded-full py-2 md:py-1 px-4 cursor-pointer'>Seleccionar foto</label>
                  <input onChange={handleUploadPhoto} type='file' accept="image/*" id='input-photo' className='hidden' />
                  <span className='max-lg:hidden text-softGrey dark:text-darkSoftGrey text-sm'>O arrastrá tu foto acá para cambiarla.</span>
                </div>
              </div>
              <div className='flex flex-col items-center justify-center gap-6 max-h-[500px] min-[340px]:max-h-[380px] lg:max-h-max max-md:mt-6'>
                <span className='text-xl font-medium max-md:text-center'>Mascotas conseguidas</span>
                <ul className='justify-center m-auto max-w-[550px] md:max-w-[450px] max-h-[350px] flex flex-wrap gap-x-12 gap-y-6 md:pt-4 max-md:py-2 max-md:pb-6 overflow-y-auto'>
                  <li className='flex flex-col items-center'>
                    <button onClick={() => handleChangePet('', '', true)} className='flex flex-col items-center gap-4'>
                      <div className='relative'>
                        <ProfilePicture wH={'w-20 h-20 md:w-24 md:h-24'} img={profileData?.photo} alt={profileData?.name} />
                      </div>
                      <div className='flex flex-col'>
                        <span className={petFocused === '' ? 'text-pink font-medium' : ''}>Ninguno</span>
                        {
                          !currentUser?.petSelected &&
                          <small className='text-sm text-softGrey  dark:text-darkSoftGrey'>En uso</small>
                        }
                      </div>
                    </button>
                  </li>
                  {
                    petsList.sort((a, b) => a?.toUnlock - b?.toUnlock)?.map(pet => (
                      <li key={pet._id} className='flex flex-col items-center select-none'>
                        <button onClick={() => handleChangePet(pet?._id, pet?.toUnlock)} className='flex flex-col items-center gap-4'>
                          <div draggable="false" className={`relative ${!isUnlocked(pet?.toUnlock) ? 'opacity-50' : ''}`}>
                            {
                              !isUnlocked(pet?.toUnlock) &&
                              <img className='absolute top-0 bottom-0 left-0 right-0 m-auto z-20' src="/icons/padlock-icon.svg" alt="padlock icon" />
                            }
                            <ProfilePicture wH={'w-20 h-20 md:w-24 md:h-24'} img={profileData?.photo} alt={profileData?.name} />
                            <ProfilePet img={pet?.img} alt={pet?.name} />
                          </div>
                          <div className='flex flex-col'>
                            <span className={petFocused === pet?._id ? 'text-pink font-medium' : ''}>{pet?.name}</span>
                            {
                              currentUser?.petSelected === pet?._id &&
                              <small className='text-sm text-softGrey  dark:text-darkSoftGrey'>En uso</small>
                            }
                          </div>
                        </button>
                      </li>
                    ))
                  }
                </ul>
                <div>
                  <p className={`${petFocused ? '' : 'hidden'} text-center text-sm text-softGrey  dark:text-darkSoftGrey`}>
                    Esta mascota se obtiene al completar
                    <b className={`${petFocused ? '' : 'hidden'} ms-1 font-medium text-lightText`}>
                      {petsList?.find(pet => pet?._id === petFocused)?.toUnlock} tareas
                    </b>
                  </p>
                  <p className={`${petFocused ? 'hidden' : ''} text-center text-sm text-softGrey  dark:text-darkSoftGrey`}>Ninguna mascota seleccionada</p>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      <Nav />
      <main className='bg-lightBckg dark:bg-darkBckg flex flex-col gap-12 flex-1 px-10 rounded-[20px] m-4 py-5'>
        <Header />
        <div className='flex flex-col min-[870px]:flex-row gap-8'>
          <div className='min-[870px]:w-[410px] flex flex-col gap-8'>
            <section id='profile-info' className='relative bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col items-center gap-8 p-6 rounded-lg shadow-cardTask'>
              {
                !isEditMode
                  ? (
                      <>
                        <button onClick={handleEditProfile} className='absolute top-2 right-2 p-2 rounded-[10px] transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey'>
                          <img src="/icons/edit-icon.svg" alt="editar perfil" />
                        </button>
                        <div className="flex flex-col gap-4 items-center text-center">
                          <div className='relative w-fit h-fit'>
                            <ProfilePicture wH={'w-28 h-28'} img={profileData?.photo} alt={profileData?.name} />
                            {
                              getPetSelectedData().length > 0 &&
                              <ProfilePet img={getPetSelectedData()[0]?.img} alt={`pet ${getPetSelectedData()[0]?.name}`} />
                            }
                          </div>
                          <h1 className="md:text-3xl text-2xl font-medium capitalize">{profileData?.name ?? 'Nombre Apellido'}</h1>
                          <span className="w-fit bg-pink text-lightBckg text-md rounded-full py-1 px-4 first-letter:uppercase m-auto">{profileData?.role ?? 'Rol'}</span>
                        </div>
                        <ul className='flex flex-col gap-4'>
                          <li className='flex gap-4'><img src="/icons/cake-icon.svg" alt="cake icon" /><span>{formatedBirthdayDate(profileData?.birthday) ?? '00/00/00'} ({userAge(profileData?.birthday) ?? '00'} años)</span></li>
                          <li className='flex gap-4'><img src="/icons/location-icon.svg" alt="location icon" /><span>{profileData?.location}</span></li>
                          <li className='flex gap-4'><img src="/icons/telephone-icon.svg" alt="phone icon" /><span>{profileData.phone}</span></li>
                          <li className='flex gap-4'><img src="/icons/mail-icon.svg" alt="mail icon" /><span>{profileData?.email ?? 'email@gmail.com'}</span></li>
                        </ul>
                      </>
                    )
                  : (
                    <>
                      <button onClick={handleCloseEditProfile} className='absolute top-2 left-2 p-2 rounded-[10px] text-pink text-sm transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey z-20'>
                        Cancelar
                      </button>
                      <button onClick={handleSaveProfile} className='absolute top-2 right-2 p-2 rounded-[10px] transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey z-20'>
                        <img src="/icons/check-icon.svg" alt="editar perfil" />
                      </button>
                      <div className="relative flex flex-col gap-4 items-center text-center">
                        <button onClick={handleEditPhoto} className='absolute top-1 left-[90px] right-0 m-auto w-fit bg-lightExtraBckg dark:bg-darkExtraBckg p-2 rounded-full transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey shadow-cardTask z-20'>
                          <img className='w-4' src="/icons/pencil-photo-icon.svg" alt="editar perfil" />
                        </button>
                        <div className='relative w-fit h-fit'>
                          <ProfilePicture wH={'w-28 h-28'} img={profileData?.photo} alt={profileData?.name} />
                          {
                            getPetSelectedData().length > 0 &&
                            <ProfilePet img={getPetSelectedData()[0]?.img} alt={`pet ${getPetSelectedData()[0]?.name}`} />
                          }
                        </div>
                        <input onChange={handleChangeProfileData} className="w-3/5 md:text-3xl text-2xl font-medium capitalize py- m-auto text-center border-b-[1px] border-pink outline-none" placeholder='Tu nombre y apellido' name='name' value={profileData.name} />
                        <input onChange={handleChangeProfileData} className="w-2/4 text-md px-2 first-letter:uppercase border-pink border-[1px] text-pink rounded-full py-1 m-auto text-center outline-none" placeholder='Tu rol' name='role' value={profileData.role} />
                      </div>
                      <ul className='flex flex-col gap-4'>
                        <li className='flex gap-4'><img src="/icons/cake-icon.svg" alt="cake icon" /><input onChange={handleChangeProfileData} type="date" className='flex-1 border-b-[1px] border-pink outline-none' placeholder='Tu fecha de nacimiento' name='birthday' value={profileData.birthday} /></li>
                        <li className='flex gap-4'><img src="/icons/location-icon.svg" alt="location icon" /><input onChange={handleChangeProfileData} placeholder='Tu ubicación' className='border-b-[1px] border-pink outline-none' name='location' value={profileData.location} /></li>
                        <li className='flex gap-4'><img src="/icons/telephone-icon.svg" alt="phone icon" /><input onChange={handleChangeProfileData} type="text" className='border-b-[1px] border-pink outline-none' placeholder='Tu número de teléfono' name='phone' value={profileData.phone} /></li>
                        <li className='flex gap-4'><img src="/icons/mail-icon.svg" alt="mail icon" /><input onChange={handleChangeProfileData} placeholder='Tu email' className='border-b-[1px] border-pink outline-none' name='email' value={profileData.email} /></li>
                      </ul>
                    </>
                    )
              }
            </section>
            <section id='profile-description' className='relative bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col flex-1 gap-6 p-6 rounded-lg shadow-cardTask'>
              <div className='flex justify-between items-center gap-4'>
                <h2 className="md:text-xl text-base font-medium">Sobre mí</h2>
                {
                  !isEditModeDescription
                    ? (
                        <>
                          <button onClick={handleChangeProfileDescription} className='p-2 rounded-[10px] transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey'>
                            <img className='w-[18px]' src="/icons/edit-icon.svg" alt="editar descripción" />
                          </button>
                        </>
                      )
                    : (
                        <div className='flex gap-4'>
                          <button onClick={handleCloseEditDescription} className='p-2 rounded-[10px] text-pink text-sm transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey z-20'>
                            Cancelar
                          </button>
                          <button onClick={handleSaveDescription} className='p-2 rounded-[10px] transition-colors duration-300 hover:bg-hoverExtraSoftGrey dark:hover:bg-darkBckg active:bg-hoverExtraSoftGrey z-20'>
                            <img src="/icons/check-icon.svg" alt="guardar descripción" />
                          </button>
                        </div>
                      )
                }
              </div>
              {
                !isEditModeDescription
                  ? (
                      <p>{descriptionText}</p>
                    )
                  : (
                      <textarea onChange={handleTypeDescriptionText} className='flex-1 border-b-[1px] border-pink outline-none' placeholder='¿Qué te gustaría que sepan de vos?' name='description' value={descriptionText} />
                    )
              }
            </section>
          </div>
          <div className='flex flex-1 flex-col gap-8'>
            <section id='profile-summary'>
              <ul className="flex flex-col xl:flex-row gap-4">
                <li className="bg-lightExtraBckg dark:bg-darkExtraBckg flex xl:flex-col flex-1 min-xl:justify-center max-xl:items-center gap-4 px-4 py-2 border-s-8 rounded-lg border-pink shadow-cardTask">
                  <span className="text-2xl font-semibold ">{projectsList.length.toString().padStart(2, '0') ?? '--'}</span>
                  <span className="md:text-base text-sm">Proyectos en los que estás</span>
                </li>
                <li className="bg-lightExtraBckg dark:bg-darkExtraBckg flex xl:flex-col flex-1 min-xl:justify-center max-xl:items-center gap-4 px-4 py-2 border-s-8 rounded-lg border-orange shadow-cardTask">
                  <span className="text-2xl font-semibold">{currentUser?.achievements.length.toString().padStart(2, '0') ?? '--'}</span>
                  <span className="md:text-base text-sm">Insignias conseguidas</span>
                </li>
                <li className="bg-lightExtraBckg dark:bg-darkExtraBckg flex xl:flex-col flex-1 min-xl:justify-center max-xl:items-center gap-4 px-4 py-2 border-s-8 rounded-lg border-aqua shadow-cardTask">
                  <span className="text-2xl font-semibold">{currentUser?.points.reduce((accumulator, point) => { return accumulator + (point.count || 0) }, 0).toString().padStart(2, '0') ?? '--'}</span>
                  <span className="md:text-base text-sm">Tareas completadas</span>
                </li>
              </ul>
            </section>
            <section id='profile-tasks' className="bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-6 justify-between p-6 rounded-lg shadow-cardTask">
              <div className="flex justify-between">
                <h2 className="md:text-xl text-base font-semibold">Tus tareas</h2>
                <Link to={PATH_LINKS.allTasks} className="text-pink text-center text-sm">Ver todas</Link>
              </div>
              <ul className="flex flex-col divide-y divide-extraSoftGrey">
                {allTasksList.map(task => (
                  // task.state !== statesTasks[2]
                  //   ? (
                  <li key={task._id} className="flex justify-between flex-1 items-center py-4">
                    <div className="flex flex-col pe-0 lg:pe-4">
                      <h3 className="font-medium w-32 text-ellipsis overflow-x-hidden whitespace-nowrap" title={task.name}>{task.name}</h3>
                      <span className="md:text-sm text-xs w-32 text-ellipsis overflow-x-hidden whitespace-nowrap">{projectsList?.find(project => project.to === task.project)?.name}</span>
                      <span className="flex lg:hidden text-softGrey  dark:text-darkSoftGrey text-sm w-36 text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDate(JSON.parse(task.date))}</span>
                    </div>
                    <span className="hidden lg:flex w-36 font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap">{formatedDate(JSON.parse(task.date))}</span>
                    <span className={`hidden xl:block w-32 h-fit md:text-sm text-xs text-center py-0.5 px-4 rounded-[30px] first-letter:uppercase border-[1px] ${colorTaskState(task.state)}`}>{task.state}</span>
                    <ul className="w-24 flex justify-end -space-x-2.5">
                      {task.users.map((user, index) =>
                        index < 3 &&
                        <li key={user}>
                          <ProfilePicture wH={'w-7 h-7'} img={usersList?.find(u => u._id === user)?.photo} alt={usersList?.find(u => u._id === user)?.name} border />
                        </li>
                      )}
                      {
                        task.users.length >= 4 && (
                          <div className='w-7 h-7 text-xs flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${task.users.length - 3}`}</div>
                        )
                      }
                    </ul>
                  </li>
                )
                  // : null
                )}
              </ul>
            </section>
            <section id='profile-achievements' className='bg-lightExtraBckg dark:bg-darkExtraBckg flex flex-col gap-4 justify-center p-6 rounded-lg shadow-cardTask'>
              <div className='flex gap-4 justify-between items-center'>
                <h2 className='w-fit font-medium md:text-base text-xl'>Insignias conseguidas</h2>
                <Link to={PATH_LINKS.allAchievements} className="text-pink text-center text-sm">Ver todas</Link>
              </div>
              <div className='flex gap-4 justify-between items-center'>
                <p className='hidden lg:block w-2/3 md:text-sm text-xs text-softGrey  dark:text-darkSoftGrey'>Una forma de reconocimiento de tu buen trabajo y agradecimiento por tus buenos actos.</p>
                <div className='flex gap-4 justify-between items-center'>
                  {
                    achievements.length > 0
                      ? achievements?.map((achievement, index) =>
                        index < 3 && <img key={achievement} className='w-8' src="/illustrations/medal-archievent.svg" alt="medal archievent" />
                      )
                      : 'Todavía no tenés insignias'
                  }
                  {
                    achievements.length >= 4 && <div className='w-7 h-7 text-sm flex justify-center items-center rounded-full bg-lightExtraBckg dark:bg-darkExtraBckg text-lightTitle'>{`+${achievements.length - 3}`}</div>
                  }
                </div>
              </div>
            </section>
          </div>
        </div >
      </main >
    </div >
  )
}

export default Profile

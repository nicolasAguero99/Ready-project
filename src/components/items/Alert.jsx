import { useContext, useEffect } from 'react'

// Constants
import { ALERT_TYPE } from '../../../constants/constants'

// Context
import { AlertContext } from '../../../context/AlertContext'

const Alert = () => {
  const [alert, setAlert] = useContext(AlertContext)

  useEffect(() => {
    if (!alert) return
    let timeOut = null
    // let timeOutStyles = null
    if (alert.show) {
      timeOut = setTimeout(() => setAlert(prevAlert => ({ ...prevAlert, show: false })), alert.duration)
      // timeOutStyles = setTimeout(() => setAlert({ show: false, type: '', message: '', action: '' }), 4000)
    }
    return () => clearTimeout(timeOut)
    // clearTimeout(timeOutStyles)
  }, [alert])

  return (
    // <button onClick={() => setAlert({ show: true, type: ALERT_TYPE.success, message: ALERT_MSG.taskDeleted })} className='right-11 fixed bottom-[220px] bg-pink w-7 h-7'></button>
    <div className={`${alert.show ? 'max-sm:left-0 max-sm:m-auto right-0 sm:right-11 max-sm:bottom-4 md:right-11 blur-none' : 'max-sm:-bottom-20 max-sm:left-0 max-sm:right-0 -right-[120vw] max-sm:m-auto md:-right-[80vw] lg:-right-[40vw] blur-sm'} fixed bottom-10 max-sm:w-[90%] w-fit min-w-[350px] h-10 flex gap-4 items-center md:border-s-[10px] ${alert.type === ALERT_TYPE.success ? 'border-aqua' : 'border-error'} rounded-[10px] bg-lightExtraBckg dark:bg-darkExtraBckg ps-3 pe-2 md:pe-6 shadow-cardTask z-[60] transition-all ease-in-out duration-1000`}>
      {
        alert.type === ALERT_TYPE.success
          ? <img src="/icons/success-icon.svg" alt="correcto icono" />
          : alert.type === ALERT_TYPE.error
            ? <img src="/icons/error-icon.svg" alt="error icono" />
            : null
      }
      <span className='text-xs md:text-sm lg:text-base font-medium'>{alert.message}</span>
      {
        alert.action && <button onClick={alert.action} className='text-pink text-xs md:text-sm font-bold hover:opacity-50 transition-opacity duration-300 ease-out'>Deshacer</button>
      }
    </div>
  )
}

export default Alert

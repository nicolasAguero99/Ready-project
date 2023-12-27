import ProfilePicture from '../ProfilePicture'

const LoadingActivitiesSummary = () => {
  return (
    <div className="flex flex-1 items-center px-6 py-4">
      <div className='flex-1 flex flex-wrap gap-4 items-center'>
        <div className='flex flex-1 gap-4 justify-center items-center'>
          <ProfilePicture wH={'w-12 h-12'} bckg={'skeleton-loading'} />
          <p className='w-4/5 skeleton-loading h-3 rounded-full'></p>
        </div>
      </div>
    </div>
  )
}

export default LoadingActivitiesSummary

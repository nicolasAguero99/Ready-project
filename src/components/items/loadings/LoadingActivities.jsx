import ProfilePicture from '../ProfilePicture'

const LoadingActivities = () => {
  return (
    <div className="flex items-center py-4">
      <div className='flex-1 flex flex-wrap gap-4 justify-between items-center'>
        <div className='flex flex-1 gap-4 items-center'>
          <ProfilePicture wH={'w-12 h-12'} bckg={'skeleton-loading'} />
          <p className='w-3/5 skeleton-loading h-3 rounded-full'></p>
        </div>
        <small className='skeleton-loading w-20 h-2 rounded-full'></small>
      </div>
    </div>
  )
}

export default LoadingActivities

import ProfilePicture from '../ProfilePicture'

const LoadingAllTasks = () => {
  return (
    <div className="flex items-center py-4">
      <div className='flex-1 flex flex-wrap gap-4 justify-between items-center'>
        <div className='flex flex-1 gap-4 items-center'>
          <div className="flex flex-1 flex-col gap-6 h-6">
            <span className='md:hidden flex-1 skeleton-loading h-3 rounded-full'></span>
            <small className='max-md:hidden flex-1 skeleton-loading h-3 rounded-full'></small>
          </div>
            <span className='max-md:hidden flex-1 skeleton-loading h-3 rounded-full'></span>
            <span className='max-md:hidden flex-1 skeleton-loading h-3 rounded-full'></span>
            <span className='max-sm:hidden flex-1 skeleton-loading h-3 rounded-full'></span>
        </div>
        <div className="max-sm:hidden w-24 flex -space-x-2.5 justify-end">
          <ProfilePicture wH={'w-7 h-7'} bckg={'skeleton-loading'} />
          <ProfilePicture wH={'w-7 h-7'} bckg={'skeleton-loading'} />
          <ProfilePicture wH={'w-7 h-7'} bckg={'skeleton-loading'} />
        </div>
      </div>
    </div>
  )
}

export default LoadingAllTasks

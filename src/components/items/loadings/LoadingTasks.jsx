import ProfilePicture from '../ProfilePicture'

const LoadingTasks = () => {
  return (
    <div className='flex flex-col w-[90%] gap-4 relative bg-lightExtraBckg dark:bg-darkExtraBckg rounded-[10px] shadow-cardTask px-4 py-4 card-task task-card-custom'>
      <div className='flex justify-between items-center'>
        <span className='skeleton-loading py-2 px-6 rounded-full'></span>
        <div className='relative flex gap-1 items-center opacity-30'>
          <span className='px-1 py-2 rounded-full'>
            <img className='w-3.5' src='/icons/comments-icon.svg' alt='ver comentarios' />
          </span>
          <span className='px-1 py-2 rounded-full'>
            <img src='/icons/options-icon.svg' alt='ver opciones' />
          </span>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <span className='w-3/4 skeleton-loading py-1.5 rounded-full mb-4'></span>
        <span className='w-full skeleton-loading py-0.5 rounded-full'></span>
        <span className='w-full skeleton-loading py-0.5 rounded-full'></span>
      </div>
      <div className='flex justify-between items-center border-t-2 border-t-borderSoftGrey pt-3'>
        <div className='flex items-center -space-x-2.5'>
          <ProfilePicture wH={'w-6 h-6'} bckg={'skeleton-loading'} />
          <ProfilePicture wH={'w-6 h-6'} bckg={'skeleton-loading'} />
          <ProfilePicture wH={'w-6 h-6'} bckg={'skeleton-loading'} />
        </div>
        <div>
          <span className='skeleton-loading h-2'></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingTasks

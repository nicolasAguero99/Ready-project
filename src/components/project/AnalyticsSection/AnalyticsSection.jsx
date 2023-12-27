// Components
import Charts from './Charts'
import Stats from './Stats'

const AnalyticsSection = () => {
  return (
    <main className='flex flex-col gap-6'>
      <section className='bg-lightExtraBckg dark:bg-darkExtraBckg grid grid-cols-1 min-[370px]:grid-cols-2 lg:grid-cols-4 gap-y-8 text-center lg:px-12 py-10 lg:divide-x-2 rounded-[10px] divide-extraSoftGrey shadow-cardTask'>
        <Stats />
      </section>
      <section className='flex flex-wrap gap-4'>
        <Charts />
      </section>
    </main>
  )
}

export default AnalyticsSection

import Nav from '../components/Nav'
import Header from '../components/Header'
import Summary from './dashboard/Summary'

const Dashboard = () => {
  return (
    <>
      <div className='flex'>
        <Nav />
        <div className='rounded-[20px] m-4 w-full bg-lightBckg dark:bg-darkBckg px-6 py-5'>
          <div className='flex flex-col gap-12'>
            <Header />
            <Summary />
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard

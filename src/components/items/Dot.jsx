const Dot = ({ wH, bckg, projectsList }) => {
  return (
    !projectsList
      ? <div className={`w-3 h-3 rounded-full ${bckg}`}></div>
      : <div style={{ backgroundColor: bckg }} className='w-3 h-3 rounded-full'></div>
  )
}

export default Dot

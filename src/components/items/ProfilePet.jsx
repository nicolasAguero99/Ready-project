const ProfilePet = ({ wH, img, alt }) => {
  return (
    <>
      <img draggable="false" className={`${wH ?? ''} absolute bottom-[0px] right-0`} src={`/pets/${img}`} alt={`pet ${alt}`} />
    </>
  )
}

export default ProfilePet

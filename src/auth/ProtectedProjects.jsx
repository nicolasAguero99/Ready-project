import { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

// Constants
import { PATH_LINKS, PROJECTS_URL, URL_API } from '../../constants/constants'

// Context
import { ProjectsContext } from '../../context/ProjectsContext'

const ProtectedProjects = () => {
  const { projectName } = useParams()
  const [projectsList] = useContext(ProjectsContext)
  const [isVerified, setIsVerified] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [nameProject, setNameProject] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    verifyMember()
    handleGetNameProject()
  }, [projectsList, projectName])

  const handleGetNameProject = async () => {
    const projectNameData = await axios.get(`${URL_API}${PROJECTS_URL}/name/${projectName}`)
    console.log('projectNameData.data', projectNameData.data)
    if (!projectNameData.data.success) {
      navigate(PATH_LINKS.dashboard, { replace: true })
      return
    }
    setNameProject(projectNameData.data.name)
    console.log('projectNameData', projectNameData)
  }

  const verifyMember = () => {
    if (projectsList?.length <= 0) {
      setIsLoading(true)
      return
    }
    const isVerified = projectsList.some((project) => project.to === projectName)

    console.log('isVerified', isVerified)

    console.log('projectsList', projectsList)

    console.log('projectName', projectName)

    setIsVerified(isVerified)
    setIsLoading(false)
  }

  if (isLoading) return null

  return (
    isVerified ? <Outlet /> : (<Navigate state={{ showModal: true, project: projectName, nameProject }} replace to={PATH_LINKS.dashboard} />)
  )
}

export default ProtectedProjects

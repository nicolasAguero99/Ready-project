import { io } from 'socket.io-client'

// Constants
import { URL_IO } from '../constants/constants'

const socket = io(URL_IO)

// Tasks

export const SocketOnAddTask = (set, projectName) => {
  socket.on('addTask', (data) => {
    console.log('projectName', projectName)
    console.log('data', data)
    if (data.project !== projectName) return
    set(prevTasks => {
      console.log('prevTasks', prevTasks)
      const isTaskExist = prevTasks.some(prevTask => prevTask._id === data._id)
      if (isTaskExist) return prevTasks
      return [data, ...prevTasks]
    })
  })
  return () => {
    socket.off('addTask')
  }
}

export const SocketOnUpdateTask = (set, projectName) => {
  socket.on('updateTask', (data) => {
    const { taskId, updatedTask, currentProject } = data
    if (currentProject !== projectName) return
    set(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task._id === taskId
          ? updatedTask.project === projectName
            ? { ...task, ...updatedTask }
            : null
          : task
      ).filter((task) => task !== null)
      return updatedTasks
    })
  })
  return () => {
    socket.off('updateTask')
  }
}

export const SocketOnDeleteTask = (set, projectName) => {
  socket.on('deleteTask', (data) => {
    const { taskId, currentProject } = data
    if (currentProject !== projectName) return
    set(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task._id !== taskId)
      return updatedTasks
    })
  })
  return () => {
    socket.off('deleteTask')
  }
}

export const SocketOnAddComment = (set, projectName, lastIdTask) => {
  socket.on('addComment', (data) => {
    const { newComment, currentProject, taskId } = data
    if (currentProject !== projectName) return
    if (lastIdTask !== taskId) return
    set(prevComments => {
      const isNewCommentExist = prevComments.some(comment => comment._id === newComment._id)
      if (isNewCommentExist) return prevComments
      return [newComment, ...prevComments]
    })
  })

  return () => {
    socket.off('addComment')
  }
}

export const SocketOnNotifyComment = (set, projectName, lastIdTask, currentUserId) => {
  socket.on('notifyComment', (data) => {
    const { currentProject, userId, taskId } = data
    if (currentProject !== projectName) return
    if (lastIdTask !== taskId) return
    if (userId === currentUserId) return
    set(true)
  })

  return () => {
    socket.off('notifyComment')
  }
}

// Tags

export const SocketOnAddTag = (set, projectName) => {
  socket.on('addTag', (data) => {
    const { newTag, currentProject } = data
    if (currentProject !== projectName) return
    set(prevTags => {
      console.log('newTag', newTag)
      console.log('prevTags', prevTags)
      const isTagExist = prevTags.some(prevTag => prevTag._id === newTag._id)
      if (isTagExist) return prevTags
      return [...prevTags, newTag]
    })
  })

  return () => {
    socket.off('addTag')
  }
}

// Users
export const SocketOnUpdateAchievements = (set) => {
  socket.on('updateAchievementsByUsers', (data) => {
    set(prevUsers => {
      const updatedUsers = [...prevUsers]
      data.forEach(newUserData => {
        const indexToUpdate = updatedUsers.findIndex(user => user._id === newUserData._id)
        if (indexToUpdate !== -1) {
          updatedUsers[indexToUpdate] = newUserData
        }
      })
      return updatedUsers
    })
  })

  return () => {
    socket.off('updateAchievementsByUsers')
  }
}

// Projects
export const SocketOnDeleteProject = (set, currentProject, setUsersListByProject) => {
  socket.on('deleteProject', (data) => {
    const { projectName } = data
    if (projectName !== currentProject) return
    setUsersListByProject([])
    set(prevProjects => {
      const projects = prevProjects.filter(project => project.to !== projectName)
      console.log('projects', projects)
      return projects
    })
  })

  return () => {
    socket.off('deleteProject')
  }
}

export const SocketOnWaitingList = (set, projectName) => {
  socket.on('waitingList', (data) => {
    const { users, currentProject, userId, action } = data
    if (projectName !== currentProject) return
    if (!action) {
      set(prevUsers => {
        const isUserExist = prevUsers.some(prevUser => users.some(user => prevUser._id === user._id))
        console.log('isUserExist', isUserExist)
        if (isUserExist) return prevUsers
        console.log('prevUsers', prevUsers)
        console.log('users', ...users)
        return [...prevUsers, ...users]
      })
    } else {
      set(prevUsers => {
        const usersUpdated = prevUsers.filter(prevUser => prevUser._id !== userId)
        console.log('usersUpdated', usersUpdated)
        return usersUpdated
      })
    }
  })

  return () => {
    socket.off('waitingList')
  }
}

export const SocketOnUpdateProject = (set, currentUserId) => {
  console.log('currentUserId', currentUserId)

  socket.on('updateProject', (data) => {
    const { updatedProject } = data

    console.log('updatedProject', updatedProject)

    console.log('updatedProject.members', updatedProject.members)
    console.log('updatedProject.members.includes(currentUserId)', updatedProject.members.includes(currentUserId))
    if (!updatedProject.members.includes(currentUserId)) return
    set(prevProject => {
      const projects = prevProject.map(project => project.to === updatedProject.to ? { ...updatedProject } : project)
      console.log('projects', projects)
      return projects
    })
  })

  return () => {
    socket.off('updateProject')
  }
}

export const SocketOnMembersList = (set, currentProject) => {
  console.log('currentProject', currentProject)
  socket.on('membersList', (data) => {
    const { project, userData } = data
    console.log('data', data)
    if (project !== currentProject) return
    set(prevMembers => {
      const isMemberExist = prevMembers.some(prevMember => prevMember._id === userData._id)
      if (isMemberExist) return prevMembers
      console.log('prevMembers', prevMembers)
      return [...prevMembers, userData]
    })
  })

  return () => {
    socket.off('membersList')
  }
}

export const SocketOnProjectsList = (set, currentUserId) => {
  console.log('currentUserId', currentUserId)
  socket.on('projectsList', (data) => {
    const { project, userId, action } = data
    console.log('data', data)
    if (userId !== currentUserId) return
    if (!action) {
      set(prevProjects => {
        console.log('prevProjects', prevProjects)
        return [...prevProjects, project]
      })
    } else {
      set(prevProjects => {
        const projects = prevProjects.filter(prevProject => prevProject.to !== project.to)
        return projects
      })
    }
  })

  return () => {
    socket.off('projectsList')
  }
}

export const SocketOnExpelMember = (set, projectName) => {
  socket.on('expelMember', (data) => {
    const { userId, currentProject } = data
    console.log('userId', userId)
    console.log('projectName', projectName)
    console.log('currentProject', currentProject)
    if (currentProject !== projectName) return
    set(prevMember => {
      console.log('prevMember', prevMember)
      const members = prevMember.filter(member => member._id !== userId)
      console.log('members', members)
      return [...members]
    })
  })

  return () => {
    socket.off('expelMember')
  }
}

export const SocketOnAdminMember = (set, projectName) => {
  socket.on('adminMember', (data) => {
    // const { userId, currentProject } = data
    // console.log('userId', userId)
    // console.log('projectName', projectName)
    // console.log('currentProject', currentProject)
    // if (currentProject !== projectName) return
    // set(prevMember => {
    //   console.log('prevMember', prevMember)
    //   const members = prevMember.filter(member => member._id !== userId)
    //   console.log('members', members)
    //   return [...members]
    // })
  })

  return () => {
    socket.off('adminMember')
  }
}

// Activities

export const SocketOnActivities = (set, currentProjectParam, currentUserId) => {
  socket.on('activity', (data) => {
    const { newActivity, currentProject, toMembers } = data
    if (currentProjectParam === currentProject) {
      if (toMembers) {
        if (toMembers.includes(currentUserId)) {
          set(prevActivities => {
            return [newActivity, ...prevActivities]
          })
        }
      } else {
        set(prevActivities => {
          return [newActivity, ...prevActivities]
        })
      }
    }
  })

  return () => {
    socket.off('activity')
  }
}

export const SocketAction = (action, data) => {
  console.log(data)
  if (action === 'addTask') {
    return socket.emit('addTask', data)
  } else if (action === 'updateTask') {
    return socket.emit('updateTask', data)
  } else if (action === 'deleteTask') {
    return socket.emit('deleteTask', data)
  } else if (action === 'addTag') {
    return socket.emit('addTag', data)
  } else if (action === 'updateAchievementsByUsers') {
    return socket.emit('updateAchievementsByUsers', data)
  } else if (action === 'waitingList') {
    return socket.emit('waitingList', data)
  } else if (action === 'membersList') {
    return socket.emit('membersList', data)
  } else if (action === 'projectsList') {
    return socket.emit('projectsList', data)
  } else if (action === 'updateProject') {
    return socket.emit('updateProject', data)
  } else if (action === 'activity') {
    return socket.emit('activity', data)
  } else if (action === 'expelMember') {
    return socket.emit('expelMember', data)
  } else if (action === 'adminMember') {
    return socket.emit('adminMember', data)
  } else if (action === 'addComment') {
    return socket.emit('addComment', data)
  } else if (action === 'notifyComment') {
    return socket.emit('notifyComment', data)
  } else if (action === 'deleteProject') {
    return socket.emit('deleteProject', data)
  }
}

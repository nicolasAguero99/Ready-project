import moment from 'moment'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import sharp from 'sharp'
import fs from 'fs'

// Models
import UsersModel from '../models/Users.model.js'
import ProjectsModel from '../models/Projects.model.js'
import PetsModel from '../models/Pets.model.js'

// Generate token session
const generateTokenForSession = (id) => {
  const payload = { id }
  const secret = process.env.SECRET
  const options = { expiresIn: '24h' }
  const token = jwt.sign(payload, secret, options)
  return token
}

const UsersController = {
  getAllUsers: async (req, res) => {
    const { usersId } = req.query
    UsersModel
      .find({ _id: usersId })
      .then(users => {
        res.status(200).json(users)
      })
  },
  isExistingEmail: async (req, res) => {
    const { email } = req.body
    const existingUser = await UsersModel.findOne({ email })
    !existingUser
      ? res.status(200).json({ message: 'Email not taken' })
      : res.status(404).json({ message: 'Email already used' })
  },
  getUserById: async (req, res) => {
    const { userId } = req.params
    try {
      const user = await UsersModel.findOne({ _id: userId })
      res.status(200).json(user)
    } catch (error) {
      res.json({ success: false, message: error.message })
    }
  },
  // getUsersById: async (req, res) => {
  //   const { usersId } = req.params
  //   try {
  //     const users = await UsersModel.find({ _id: usersId })
  //     res.status(200).json(users)
  //   } catch (error) {
  //     res.json({ success: false, message: error.message })
  //   }
  // },
  updateUser: async (req, res) => {
    const { profileData } = req.body
    const { _id, birthday, petSelected, ...restProfileData } = profileData

    const formatedBirthday = moment(birthday).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    const userFinded = await UsersModel.findOne({ _id })
    if (!userFinded) return res.status(400).json({ message: 'User not found' })

    if (petSelected) {
      const pet = await PetsModel.findOne({ _id: petSelected })
      const userPoints = userFinded.points.reduce((total, point) => total + point.count, 0)

      if (userPoints >= pet.toUnlock) {
        await UsersModel.findByIdAndUpdate(_id, { $set: { ...profileData, birthday: formatedBirthday } })
        res.json({ ...profileData, birthday: formatedBirthday })
      } else {
        await UsersModel.findByIdAndUpdate(_id, { $set: { ...restProfileData, birthday: formatedBirthday } })
        res.json({ ...profileData, birthday: formatedBirthday, petSelected: userFinded.petSelected })
      }
    } else {
      await UsersModel.findByIdAndUpdate(_id, { $set: { ...profileData, birthday: formatedBirthday } })
      res.json({ ...profileData, birthday: formatedBirthday })
    }
  },
  addUser: async (req, res) => {
    try {
      const { email, password, remember, photo } = req.body.userAccount
      const { extraDataUser } = req.body
      const { birthday } = extraDataUser
      await UsersModel.findOne({ email })
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new UsersModel({ email, password: hashedPassword, photo, birthday: new Date(birthday), ...extraDataUser })
      await newUser.save()
      if (!remember) {
        req.session.token = generateTokenForSession(newUser._id)
        res.status(200).json({ session: req.session.token })
      } else {
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET, { expiresIn: '30d' })

        console.log('newUser._id', newUser._id)

        res.cookie('currentUser', token, { httpOnly: true }, { expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) })

        console.log('token', token)
        res.status(200).json({ token })
      }
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  login: async (req, res) => {
    const { email, password, remember } = req.body
    const user = await UsersModel.findOne({ email })
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '30d' })
      if (!remember) {
        res.status(200).json({ token, success: true })
      } else {
        res.cookie('currentUser', token, { httpOnly: true }, { expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) })
        res.status(200).json({ cookie: req.cookies.currentUser, token, success: true })
      }
    } else {
      res.json({ success: false, message: 'Wrong credentials' })
    }
  },
  getNameAndPhoto: async (req, res) => {
    const { userId } = req.query
    try {
      await UsersModel
        .findOne({ _id: userId })
        .then(user => {
          res.status(200).send({ name: user.name, photo: user.photo })
        })
    } catch (error) {
      res.json({ message: error.message })
    }
  },
  photoUpdate: async (req, res) => {
    if (!req.file?.path) return

    console.log('req.file?.path', req.file?.path)

    await sharp(req.file.path)
      .resize({ width: 225 })
      // .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile('server/profilePictures/pp' + req.file.filename.split('.')[0] + '.jpg')
      .then(() => {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error al eliminar el archivo original:', err)
          } else {
            console.log('Archivo original eliminado')
          }
          const newPhoto = `pp${req.file.filename.split('.')[0]}`
          res.status(200).json({ newPhoto })
        })
      })

    if (!req.file) {
      return res.status(400).send('No se ha subido ningún archivo')
    }
  },
  usersInProject: async (req, res) => {
    const { currentProject } = req.params
    const projectSelected = await ProjectsModel.findOne({ to: currentProject })
    await UsersModel
      .find({ _id: projectSelected?.members })
      .then(users => {
        res.json(users)
      })
  },
  adminsInProject: async (req, res) => {
    const { currentProject } = req.params
    const projectSelected = await ProjectsModel.findOne({ to: currentProject })
    await UsersModel
      .find({ _id: projectSelected?.admins })
      .then(admins => {
        console.log('admins', admins)
        res.json(admins)
      })
  },
  getUserWithAchievements: async (req, res) => {
    const { usersId, currentProject } = req.query
    await UsersModel
      .aggregate([
        { $match: { _id: { $in: usersId.map(id => new mongoose.Types.ObjectId(id)) } } },
        { $unwind: '$achievements' },
        {
          $lookup: {
            from: 'achievements',
            let: { achievementId: '$achievements' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$achievementId'] },
                      { $eq: ['$project', currentProject] }
                    ]
                  }
                }
              }
            ],
            as: 'filteredAchievements'
          }
        },
        {
          $group: {
            _id: '$_id',
            photo: { $first: '$photo' },
            name: { $first: '$name' },
            achievements: { $push: { $arrayElemAt: ['$filteredAchievements._id', 0] } }
          }
        },
        {
          $addFields: {
            totalAchievements: { $size: '$achievements' }
          }
        },
        {
          $sort: {
            totalAchievements: -1
          }
        }
      ])
      .then(user => {
        res.status(200).send(user)
      })
  },
  addAchievements: async (req, res) => {
    const { achievement, usersId } = req.body

    await UsersModel.updateMany({ _id: usersId }, { $push: { achievements: achievement } })

    res.status(200).json({
      message: 'Data added successfully'
    })
  },
  addPoints: async (req, res) => {
    const { usersId, currentProject } = req.body

    console.log('currentProject', currentProject)

    console.log('usersId', usersId)

    try {
      usersId.forEach(async (userId) => {
        const user = await UsersModel.findOne({ _id: usersId, 'points.project': currentProject })
        if (user) {
          await UsersModel.updateMany(
            { _id: usersId, 'points.project': currentProject },
            { $inc: { 'points.$.count': 1 } }
          )
        } else {
          await UsersModel.updateMany(
            { _id: usersId },
            { $push: { points: { project: currentProject, count: 1 } } }
          )
        }
      })
    } catch (error) {
      console.log('error', error)
    }
    res.status(200).json({
      message: 'Data added successfully'
    })
  },
  getTutorial: async (req, res) => {
    const { currentUserId } = req.query
    await UsersModel
      .findOne({ _id: currentUserId })
      .then(user => {
        res.status(200).send(user.tutorial)
      })

    res.status(200).json({
      message: 'Data got successfully'
    })
  },
  addTutorial: async (req, res) => {
    const { currentUserId, mode } = req.body
    await UsersModel.updateMany({ _id: currentUserId }, { $push: { tutorial: mode } })
    res.status(200).json({
      message: 'Data added successfully'
    })
  },
  viewAgainTutorial: async (req, res) => {
    const { currentUserId } = req.query
    await UsersModel.updateMany({ _id: currentUserId }, { $set: { tutorial: [] } })
    res.status(200).json({
      message: 'Changed successfully'
    })
  }
}

export default UsersController

import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Verify token
export const tokenVerify = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    req.body = decoded
    next()
  })
}

// Multer

export const storageMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('server/', 'profilePictures'))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + uuidv4() + path.extname(file.originalname))
  }
})

export const uploadMulter = multer({
  storage: storageMulter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: (req, file, cb) => {
    cb(null, true)
  }
})

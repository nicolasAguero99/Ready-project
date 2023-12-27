import mongoose from 'mongoose'

const usersSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  photo: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: '' },
  birthday: { type: Date, default: '' },
  achievements: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'achievements' }], default: [] },
  tutorial: { type: [String], default: [] },
  location: { type: String, default: '' },
  phone: { type: Number, default: '' },
  description: { type: String, default: '¡Hola! Estoy usando Ready. 😄' },
  points: [{
    project: { type: String },
    count: { type: Number, default: 0 }
  }],
  pets: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'frames' }], default: [] },
  petSelected: { type: String, default: null }
},
{
  timestamps: true,
  versionKey: false
})

const UsersModel = mongoose.model('users', usersSchema)

export default UsersModel

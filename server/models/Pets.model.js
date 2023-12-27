import mongoose from 'mongoose'

const petsSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  img: { type: String, default: '' },
  toUnlock: { type: Number, default: 0 }
},
{
  timestamps: true,
  versionKey: false
})

const PetsModel = mongoose.model('pets', petsSchema)

export default PetsModel

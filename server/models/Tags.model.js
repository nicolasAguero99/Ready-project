import mongoose from 'mongoose'

const tagsSchema = new mongoose.Schema({
  name: { type: String, required: true, default: '' },
  color: { type: String, default: '#DF437E' },
  project: { type: String, required: true, default: '' }
},
{
  timestamps: true,
  versionKey: false
})

const TagsModel = mongoose.model('tags', tagsSchema)

export default TagsModel

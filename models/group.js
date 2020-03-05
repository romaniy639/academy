const {Schema, model} = require('mongoose')

module.exports = model('Group', new Schema({
  name: {type: String, required: true},
  students: [{type: Schema.Types.ObjectId, ref: 'User'}],
  advertisement: [{type: String}]
}))
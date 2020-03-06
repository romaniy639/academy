const {Schema, model} = require('mongoose')

module.exports = model('User', new Schema({
  email: {type: String, required: true},
  name: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true},
  group: {type: Schema.Types.ObjectId, ref: 'Group'},
  resetToken: {type: String},
  resetTokenExp: {type: Date}
}))
const {Schema, model} = require('mongoose')

module.exports = model('User', new Schema({
  email: {type: String, required: true},
  name: {type: String, required: true},
  password: {type: String, required: true},
  isTeacher: {type: Boolean},
  resetToken: {type: String},
  resetTokenExp: {type: Date},
}))
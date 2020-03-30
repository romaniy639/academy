const {Schema, model} = require('mongoose')

module.exports = model('User', new Schema({
  email: {type: String, required: true},
  name: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true},
  group: {type: Schema.Types.ObjectId, ref: 'Group'},
  notification: [{
    author: {type: String},
    message: {type: String},
    expiredTime: {type: Date}
  }],
  resetToken: {type: String},
  resetTokenExp: {type: Date}
}))
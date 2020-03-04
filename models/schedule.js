const {Schema, model} = require('mongoose')

module.exports = model('Schedule', new Schema({
  week: [{
      courseName: {type: String, required: true},
      courseTeacher: {type: Schema.Types.ObjectId, ref: 'User', required: true},
      classroom: {type: String, require: true}
  }],
  scheduleAuthor: {
      name: {type: String, required: true},
      userId: {type: Schema.Types.ObjectId, ref: 'User', required: true}
  },
  date: {type: Date, default: Date.now}
}))
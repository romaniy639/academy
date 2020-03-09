const {Schema, model} = require('mongoose')

module.exports = model('Schedule', new Schema({
  group: {type: Schema.Types.ObjectId, ref: 'Group', required: true},
  week: {
    monday: [{
      courseName: {type: String, required: true},
      courseTeacher: {type: String, required: true},
      classroom: {type: String, require: true}
    }],
    tuesday: [{
      courseName: {type: String, required: true},
      courseTeacher: {type: String, required: true},
      classroom: {type: String, require: true}
    }],
    wednesday: [{
      courseName: {type: String, required: true},
      courseTeacher: {type: String, required: true},
      classroom: {type: String, require: true}
    }],
    thursday: [{
      courseName: {type: String, required: true},
      courseTeacher: {type: String, required: true},
      classroom: {type: String, require: true}
    }],
    friday: [{
      courseName: {type: String, required: true},
      courseTeacher: {type: String, required: true},
      classroom: {type: String, require: true}
    }]
  },
  scheduleAuthor: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  date: {type: Date, default: Date.now},
  comments: [{
    date: {type: Date, default: Date.now},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    message: {type: String, required: true}
  }]
}))
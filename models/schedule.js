const {Schema, model} = require('mongoose')

module.exports = model('Schedule', new Schema({
  group: {type: Schema.Types.ObjectId, ref: 'Group', required: true},
  week: {
    monday: [{
      courseName: {type: String},
      courseTeacher: {type: String},
      classroom: {type: String}
    }],
    tuesday: [{
      courseName: {type: String},
      courseTeacher: {type: String},
      classroom: {type: String}
    }],
    wednesday: [{
      courseName: {type: String},
      courseTeacher: {type: String},
      classroom: {type: String}
    }],
    thursday: [{
      courseName: {type: String},
      courseTeacher: {type: String},
      classroom: {type: String}
    }],
    friday: [{
      courseName: {type: String},
      courseTeacher: {type: String},
      classroom: {type: String}
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
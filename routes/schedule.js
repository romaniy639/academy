const { Router } = require('express')
const Schedule = require('../models/schedule')
const User = require("../models/user")
const Group = require("../models/group")

const router = new Router()

router.get('/', async (req, res) => {
  const { role } = await User.findById(req.session.userId)
  res.render('schedule/show-create', {
    title: "Schedule",
    schedules: await Schedule.find().populate('scheduleAuthor', 'email name').select('week date'),
    isTeacher: role === "teacher",
    isAdmin: role === "admin",
    isAuth: req.session.isAuth,
    groups: await Group.find()
  })
})

router.get('/:id', async (req, res) => {
  try {
    res.render('schedule/edit', {
      title: "Edit current schedule",
      schedule: await Schedule.findById(req.params.id)
    })
  } catch (e) {
    console.log(e);
  }
})

router.get('/test/s', (req,res) => {
  res.render('schedule/test')
})

router.post('/create', async (req, res) => {
  try {
    const week = {
      monday: [{
        courseName: req.body.monday_first,
        courseTeacher: req.body.monday_first_teacher,
        classroom: req.body.monday_first_class
      } || null,
      {
        courseName: req.body.monday_second,
        courseTeacher: req.body.monday_second_teacher,
        classroom: req.body.monday_second_class
      } || null,
      {
        courseName: req.body.monday_third,
        courseTeacher: req.body.monday_third_teacher,
        classroom: req.body.monday_third_class
      } || null,
      {
        courseName: req.body.monday_fourth,
        courseTeacher: req.body.monday_fourth_teacher,
        classroom: req.body.monday_fourth_class
      } || null
      ],
      tuesday: [{
        courseName: req.body.tuesday_first,
        courseTeacher: req.body.tuesday_first_teacher,
        classroom: req.body.tuesday_first_class
      } || null,
      {
        courseName: req.body.tuesday_second,
        courseTeacher: req.body.tuesday_second_teacher,
        classroom: req.body.tuesday_second_class
      } || null,
      {
        courseName: req.body.tuesday_third,
        courseTeacher: req.body.tuesday_third_teacher,
        classroom: req.body.tuesday_third_class
      } || null,
      {
        courseName: req.body.tuesday_fourth,
        courseTeacher: req.body.tuesday_fourth_teacher,
        classroom: req.body.tuesday_fourth_class
      } || null
      ],
      wednesday: [{
        courseName: req.body.wednesday_first,
        courseTeacher: req.body.wednesday_first_teacher,
        classroom: req.body.wednesday_first_class
      } || null,
      {
        courseName: req.body.wednesday_second,
        courseTeacher: req.body.wednesday_second_teacher,
        classroom: req.body.wednesday_second_class
      } || null,
      {
        courseName: req.body.wednesday_third,
        courseTeacher: req.body.wednesday_third_teacher,
        classroom: req.body.wednesday_third_class
      } || null,
      {
        courseName: req.body.wednesday_fourth,
        courseTeacher: req.body.wednesday_fourth_teacher,
        classroom: req.body.wednesday_fourth_class
      } || null
      ],
      thursday: [{
        courseName: req.body.thursday_first,
        courseTeacher: req.body.thursday_first_teacher,
        classroom: req.body.thursday_first_class
      } || null,
      {
        courseName: req.body.thursday_second,
        courseTeacher: req.body.thursday_second_teacher,
        classroom: req.body.thursday_second_class
      } || null,
      {
        courseName: req.body.thursday_third,
        courseTeacher: req.body.thursday_third_teacher,
        classroom: req.body.thursday_third_class
      } || null,
      {
        courseName: req.body.thursday_fourth,
        courseTeacher: req.body.thursday_fourth_teacher,
        classroom: req.body.thursday_fourth_class 
      } || null
      ],
      friday: [{
        courseName: req.body.friday_first,
        courseTeacher: req.body.friday_first_teacher,
        classroom: req.body.friday_first_class
      } || null,
      {
        courseName: req.body.friday_second,
        courseTeacher: req.body.friday_second_teacher,
        classroom: req.body.friday_second_class
      } || null,
      {
        courseName: req.body.friday_third,
        courseTeacher: req.body.friday_third_teacher,
        classroom: req.body.friday_third_class
      } || null,
      {
        courseName: req.body.friday_fourth,
        courseTeacher: req.body.friday_fourth_teacher,
        classroom: req.body.friday_fourth_class
      }
      ] || null,
    }
    const newSchedule = new Schedule({
      group: await Group.findById(req.body.group),
      week: week,
      scheduleAuthor: req.session.userId
    })

    await newSchedule.save()
    res.redirect('/schedule')
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', async (req, res) => {
  const { id } = req.body
  try {
    delete req.body.id
    const schedule = await Schedule.findById(id)
    Object.assign(schedule, req.body)
    await schedule.save()
    res.redirect('/schedule')
  } catch (e) {
    console.log(e)
  }
})

router.post('/delete', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.body.id)
    res.redirect('/schedule')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
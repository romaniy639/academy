const { Router } = require('express')
const { validationResult } = require('express-validator')
const Group = require('../models/group')
const { authMiddleware } = require('../middleware/auth')
const teacherMiddleware = require('../middleware/teacher')
const flash = require('connect-flash')
const ObjectId = require('mongodb').ObjectID
const User = require('../models/user')
const { groupIdValidator, addStudentValidator, notificationValidator, groupNameValidator, groupEditValidator, groupDeleteValidator, deleteStudentsValidators } = require('../utils/validators')

const router = new Router()

router.get('/', authMiddleware, async (req, res) => {
  res.status(200).json({
    groups: await Group.find(),
    user: await User.findById(req.session.userId).select("name email _id role"),
    isAuth: req.session.isAuth
  })
})

router.get('/:id', authMiddleware, groupIdValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    res.status(200).json({
      group: await Group.findById(req.params.id),
      isAuth: req.session.isAuth,
      user: await User.findById(req.session.userId).select("name email _id role"),
      students: (await User.find({ role: "student" })).filter(c => !c.group),
      group_students: (await Group.findById(req.params.id).populate('students', 'name').select('name')).students
    })
  } catch (e) {
    console.log(e)
  }
})

router.put('/add_student', authMiddleware, teacherMiddleware, addStudentValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      //req.flash('error', errors.array()[0].msg)
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    const group = await Group.findByIdAndUpdate(req.body.groupId, { $push: { students: req.body.studentId } })
    const user = await User.findByIdAndUpdate(req.body.studentId, { group: req.body.groupId })
    res.status(200).json({
      group,
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role
    }})
  } catch (e) {
    console.log(e)
  }
})

router.post('/notification', authMiddleware, teacherMiddleware, notificationValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    const teacherName = (await User.findById(req.session.userId)).name
    await User.updateMany({ group: req.body.group }, { $push: { notification: { author: teacherName, message: req.body.message } } })
    res.status(200).json({users: await User.find({group: req.body.group}).select("name email _id role")})
  } catch (e) {
    console.log(e)
  }
})

router.post('/create', authMiddleware, teacherMiddleware, groupNameValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      //req.flash('error', errors.array()[0].msg)
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    const newGroup = new Group({ name: req.body.name })
    await newGroup.save()
    res.status(200).json({newGroup})
  } catch (e) {
    console.log(e)
  }
})

router.put('/edit', authMiddleware, teacherMiddleware, groupEditValidator, async (req, res) => {
  try {
    const { id } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      //req.flash('error', errors.array()[0].msg)
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    const group = await Group.findByIdAndUpdate(id, { name: req.body.name })
    //req.flash('success', 'Group has been renamed...')
    res.status(200).json({group})
  } catch (e) {
    console.log(e)
  }
})

router.put('/delete_students', authMiddleware, teacherMiddleware, deleteStudentsValidators, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    let students_id = (await Group.findById(req.body.groupId)).students
    let delete_students = []
    for (let i = students_id.length - 1; i >= 0; i--) {
      if (req.body.userId[i]) {
        delete_students.push(students_id[i])
      }
    }
    students_id = students_id.filter(st => !(delete_students.includes(st)))
    const group = await Group.findByIdAndUpdate(req.body.groupId, { students: students_id })
    await User.updateMany({ _id: delete_students }, { $unset: { group: "" } })
    res.status(200).json({ group, users: await User.find({group: req.body.groupId})})
  } catch (e) {
    console.log(e)
  }
})

router.delete('/delete', authMiddleware, teacherMiddleware, groupDeleteValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    await User.updateMany({ group: req.body.id }, { $unset: { group: "" } })
    const deleteGroup = await Group.findByIdAndDelete(req.body.id)
    res.status(200).json({deleteGroup})
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
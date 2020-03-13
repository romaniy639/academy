const { Router } = require('express')
const { validationResult } = require('express-validator')
const Group = require('../models/group')
const { tokenMiddleware } = require('../middleware/auth')
const teacherMiddleware = require('../middleware/teacher')
const flash = require('connect-flash')
const ObjectId = require('mongodb').ObjectID
const User = require('../models/user')
const { groupIdValidator, addStudentValidator, notificationValidator, groupNameValidator, groupEditValidator, groupDeleteValidator, deleteStudentsValidators } = require('../utils/validators')

const router = new Router()

router.get('/', tokenMiddleware, async (req, res) => {
  res.status(200).json({groups: await Group.find()})
})

router.post('/notification', tokenMiddleware, notificationValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    const teacherName = (await User.findById(req.userId)).name
    await User.updateMany({ group: req.body.group }, { $push: { notification: { author: teacherName, message: req.body.message } } })
    res.status(200).json({users: await User.find({group: req.body.group}).select("name email _id role")})
  } catch (e) {
    console.log(e)
  }
})

router.post('/create', tokenMiddleware, groupNameValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    const newGroup = new Group({ name: req.body.name })
    await newGroup.save()
    res.status(200).json({newGroup})
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id', tokenMiddleware, groupIdValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    res.status(200).json({
      group: await Group.findById(req.params.id),
      user: await User.findById(req.userId).select("name email _id role"),
      students: (await User.find({ role: "student" })).filter(c => !c.group),
      group_students: (await Group.findById(req.params.id).populate('students', 'name').select('name')).students
    })
  } catch (e) {
    console.log(e)
  }
})

router.put('/:id', tokenMiddleware, groupEditValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    await Group.findByIdAndUpdate(req.params.id, { name: req.body.name })
    res.status(200).json({group: await Group.findById(req.params.id)})
  } catch (e) {
    console.log(e)
  }
})

router.put('/:id/add_student', tokenMiddleware, addStudentValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    await Group.findByIdAndUpdate(req.params.id, { $push: { students: req.body.studentId } })
    const user = await User.findByIdAndUpdate(req.body.studentId, { group: req.params.id })
    res.status(200).json({
      group: await Group.findById(req.params.id),
      addedStudent: {
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role
    }})
  } catch (e) {
    console.log(e)
  }
})

router.put('/:id/delete_students', tokenMiddleware, deleteStudentsValidators, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    let students_id = (await Group.findById(req.params.id)).students
    students_id = students_id.filter(st => !(req.params.id.includes(st.toString())))
    await Group.findByIdAndUpdate(req.params.id, { students: students_id })
    await User.updateMany({ _id: req.body.userId }, { $unset: { group: "" } })
    res.status(200).json({ 
      group: await Group.findById(req.params.id), 
      users: await User.find({group: req.params.id})})
  } catch (e) {
    console.log(e)
  }
})

router.delete('/:id/delete', tokenMiddleware, groupDeleteValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({message: `${errors.array()[0].msg}`})
    }
    await User.updateMany({ group: req.params.id }, { $unset: { group: "" } })
    const deleteGroup = await Group.findByIdAndDelete(req.params.id)
    res.status(200).json({deleteGroup})
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
const {Router} = require('express')
const {validationResult} = require('express-validator')
const Group = require('../models/group')
const {authMiddleware} = require('../middleware/auth')
const teacherMiddleware = require('../middleware/teacher')
const flash = require('connect-flash')
const ObjectId = require('mongodb').ObjectID
const User = require('../models/user')
const {groupIdValidator, addStudentValidator, notificationValidator, groupNameValidator, groupEditValidator, groupDeleteValidator} = require('../utils/validators')

const router = new Router()

router.get('/', authMiddleware, async (req, res) => {
  const {role} = await User.findById(req.session.userId)
  res.render('groups/show-reg-notify', {
    title: (role==="teacher") ? "Groups management" : "Groups",
    groups: await Group.find(),
    isTeacher: role === "teacher",
    isAdmin: role === "admin",
    isAuth: req.session.isAuth
  })
})

router.get('/:id', authMiddleware, groupIdValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).redirect('/groups')
    }

    res.render('groups/edit', {
      title: "Group",
      group: await Group.findById(req.params.id),
      isTeacher: (await User.findById(req.session.userId)).role === "teacher",
      isAdmin: (await User.findById(req.session.userId)).role === "admin",
      isAuth: req.session.isAuth,
      students: (await User.find({role: "student"})).filter(c => !c.group),
      group_students: (await Group.findById(req.params.id).populate('students', 'name').select('name')).students
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/add_student', authMiddleware, teacherMiddleware, addStudentValidator, async (req,res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect('/groups/'+req.body.groupId)
    }

    await Group.findByIdAndUpdate(req.body.groupId, {$push: {students: req.body.studentId}})
    await User.findByIdAndUpdate(req.body.studentId, {group: req.body.groupId})
    res.redirect('/groups/'+req.body.groupId)
  } catch (e) {
    console.log(e)
  }
})

router.post('/notification', authMiddleware, teacherMiddleware, notificationValidator, async (req,res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).redirect('/groups#addNotification')
    }
  
    const teacherName = (await User.findById(req.session.userId)).name
    await User.updateMany({group: req.body.group}, {$push: {notification: {author: teacherName, message: req.body.message}}})
    res.redirect('/groups#addNotification')
  } catch (e) {
      console.log(e)
  }
})

router.post('/create', authMiddleware, teacherMiddleware, groupNameValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect('/groups#createGroup')
    }

    const newGroup = new Group({name: req.body.name})
    await newGroup.save()
    res.redirect('/groups/'+newGroup._id)
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', authMiddleware, teacherMiddleware, groupEditValidator, async (req, res) => {
  try {
    const {id} = req.body
    console.log(id)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect('/groups/'+id)
    }

    await Group.findByIdAndUpdate(id, {name: req.body.name})
    req.flash('success', 'Group has been renamed...')
    res.redirect('/groups/'+id)
  } catch(e) {
      console.log(e)
  }
})

router.post('/delete_students', authMiddleware, teacherMiddleware, async (req,res) => {
  try {
    let students_id = (await Group.findById(req.body.groupId)).students
    let delete_students = []
    for (let i=students_id.length-1;i>=0;i--) {
      if (req.body.userId[i]) {
        delete_students.push(students_id[i])
      }
    }
    students_id = students_id.filter(st => !(delete_students.includes(st)))
    await Group.findByIdAndUpdate(req.body.groupId, {students: students_id})
    await User.updateMany({_id: delete_students}, {$unset: {group: ""}})
    res.redirect('/groups/' + req.body.groupId)
  } catch (e) {
    console.log(e)
  }
})

router.post('/delete', authMiddleware, teacherMiddleware, groupDeleteValidator, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).redirect('/groups')
    }

    await User.updateMany({group: req.body.id}, {$unset: {group: ""}})
    await Group.findByIdAndDelete(req.body.id)
    res.redirect('/groups')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
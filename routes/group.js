const {Router} = require('express')
const {validationResult} = require('express-validator')
const Group = require('../models/group')
const authMiddleware = require('../middleware/auth')
const teacherMiddleware = require('../middleware/teacher')
const flash = require('connect-flash')
const User = require('../models/user')

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

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const {role} = await User.findById(req.session.userId)
    const group = await Group.findById(req.params.id)
    if (!group) return res.redirect('/groups')
    res.render('groups/edit', {
      title: "Group",
      group,
      isTeacher: role === "teacher",
      isAdmin: role === "admin",
      isAuth: req.session.isAuth,
      students: (await User.find({role: "student"})).filter(c => !c.group),
      group_students: (await Group.findById(req.params.id).populate('students', 'name').select('name')).students
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/add_notification', authMiddleware, teacherMiddleware, async (req,res)=> {
  const {role} = await User.findById(req.session.userId)
  res.render('groups/notification', {
      title: "Notification",
      isAuth: req.session.isAuth,
      isTeacher: role === "teacher",
      isAdmin: role === "admin",
      groups: await Group.find(),
  })
})

router.post('/add_student', authMiddleware, teacherMiddleware, async (req,res)=> {
  try {
    if (req.body.student) {
      const candidate = await User.findById(req.body.student)
      if (!candidate.group) {
        await Group.findByIdAndUpdate(req.body.id, {$push: {'students': req.body.student}})
        await User.findByIdAndUpdate(req.body.student, {group: req.body.id})
      }
    }
    res.redirect('/groups/' + req.body.id)
  } catch (e) {
    console.log(e)
  }
})

router.post('/notification', authMiddleware, teacherMiddleware, async (req,res)=> {
  try {
      if (req.body.group) {
          const students = await Group.findById(req.body.group)
          const teacherName = (await User.findById(req.session.userId)).name
          const message = {
              author: teacherName,
              message: req.body.message
          }
          for (let student of students.students) {
            await User.findByIdAndUpdate(student, {$push: {notification: message}})
          }
      }
      res.redirect('/groups#addNotification')
  } catch (e) {
      console.log(e)
  }
})

router.post('/create', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    if (!(await Group.findOne({name: req.body.name}))) {
      const newGroup = new Group({name: req.body.name})
      await newGroup.save()
      res.redirect('/groups/'+newGroup._id)
    } else {
      req.flash('error', 'Group with this name is already exist...')
      res.redirect('/groups#createGroup')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const {id} = req.body
    if (!(await Group.findOne({name: req.body.name}))) {
      await Group.findByIdAndUpdate(id, {name: req.body.name})
      req.flash('success', 'Group has been renamed...')
    } else {
      req.flash('error', 'Group with this name is already exist...')
    }
    res.redirect('/groups/'+id)
  } catch(e) {
      console.log(e)
  }
})

router.post('/delete', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    await User.updateMany({group: req.body.id}, {$unset: {group: ""}})
    await Group.findByIdAndDelete(req.body.id)
    res.redirect('/groups')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
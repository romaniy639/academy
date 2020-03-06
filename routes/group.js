const {Router} = require('express')
const Group = require('../models/group')
const authMiddleware = require('../middleware/auth')
const flash = require('connect-flash')
const User = require('../models/user')

const router = new Router()

router.get('/', authMiddleware, async (req, res) => {
  res.render('groups', {
    title: "Groups management",
    groups: await Group.find(),
    isTeacher: (await User.findById(req.session.userId)).role === "teacher",
    isAdmin: (await User.findById(req.session.userId)).role === "admin",
    isAuth: req.session.isAuth,
  })
})

router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    res.render('editGroup', {
      title: "Edit current group",
      group: await Group.findById(req.params.id),
      isTeacher: (await User.findById(req.session.userId)).role === "teacher",
      isAdmin: (await User.findById(req.session.userId)).role === "admin",
      isAuth: req.session.isAuth,
    })
  } catch (e) {
    console.log(e);
  }
})

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const newGroup = new Group({name: req.body.groupName})
    await newGroup.save()
    res.redirect('/groups')
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', authMiddleware, async (req, res) => {
  try {
    const {id} = req.body
    if (!(await Group.findOne({name: req.body.name}))) {
      delete req.body.id
      const group = await Group.findById(id)
      Object.assign(group, req.body)
      await group.save()
      req.flash('success', 'Group has been renamed...')
    } else {
      req.flash('error', 'Group with this name is already exist...')
    }
    res.redirect('/groups/edit/'+id)
  } catch(e) {
      console.log(e)
  }
})

router.post('/delete', authMiddleware, async (req, res) => {
  try {
    await Group.deleteOne({_id: req.body.id})
    res.redirect('groups')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
const {Router} = require('express')
const Group = require('../models/group')
const authMiddleware = require('../middleware/auth')
const flash = require('connect-flash')

const router = new Router()

router.get('/', authMiddleware, async (req, res) => {
  res.render('groups/show-reg-notify', {
    title: "Groups management",
    groups: await Group.find(),
    isTeacher: req.session.isAuthenticatedTeacher,
    isAdmin: req.session.isAdmin,
    isAuth: req.session.isAuth,
  })
})

router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    res.render('groups/edit', {
      title: "Edit current group",
      group: await Group.findById(req.params.id),
      isTeacher: req.session.isAuthenticatedTeacher,
      isAdmin: req.session.isAdmin,
      isAuth: req.session.isAuth,
    })
  } catch (e) {
    console.log(e);
  }
})

router.get('/add_notification', authMiddleware, async (req,res)=> {
  res.render('groups/notification', {
      title: "Notification",
      isAdmin: req.session.isAdmin,
      isAuth: req.session.isAuth,
      isTeacher: req.session.isAuthenticatedTeacher,
      groups: await Group.find()
  })

})

router.post('/notification', authMiddleware, async (req,res)=> {
  try {
      if (req.body.group) {
          await Group.findByIdAndUpdate(req.body.group, {$push: {notification: req.body.message}})
      }
      res.redirect('/add_notification')
  } catch (e) {
      console.log(e)
  }
})

router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (!(await Group.findOne({name: req.body.name}))) {
      const newGroup = new Group({name: req.body.name})
      await newGroup.save()
      res.redirect('/groups/edit/'+newGroup._id)
    } else {
      req.flash('error', 'Group with this name is already exist...')
      res.redirect('/groups#createGroup')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', authMiddleware, async (req, res) => {
  try {
    const {id} = req.body
    if (!(await Group.findOne({name: req.body.name}))) {
      await Group.findByIdAndUpdate(id, {name: req.body.name})
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
const {Router} = require('express')
const Group = require('../models/group')

const router = new Router()

router.get('/', async (req, res) => {
  res.render('groups', {
    title: "Groups management",
    groups: await Group.find()
  })
})

router.get('/edit/:id', async (req, res) => {
  try {
    res.render('editGroup', {
      title: "Edit current group",
      group: await Group.findById(req.params.id)
    })
  } catch (e) {
    console.log(e);
  }
})

router.post('/create', async (req, res) => {
  try {
    const newGroup = new Group({name: req.body.groupName})
    await newGroup.save()
    res.redirect('/groups')
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', async (req, res) => {
  const {id} = req.body
  try {
      delete req.body.id
      const group = await Group.findById(id)
      Object.assign(group, req.body)
      await group.save()
      res.redirect('/groups/edit/'+id)
  } catch(e) {
      console.log(e)
  }
})

router.post('/delete', async (req, res) => {
  try {
    await Group.deleteOne({_id: req.body.id})
    res.redirect('groups')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
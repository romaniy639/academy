const {Router} = require('express')
const Schedule = require('../models/schedule')

const router = new Router()

router.get('/', async (req, res) => {
  res.render('schedule/show', {
    title: "Schedule",
    schedules: await Schedule.find().populate('scheduleAuthor', 'email name').select('week date')
  })
})

router.get('/create', (req, res) => {
  res.render('schedule/create', {
    title: "Add new schedule"
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

router.post('/create', async (req, res) => {
  try {
    const newSchedule = new Schedule({
      group: await Group.find({name: req.body.groupName}),
      week: req.body.week,
      scheduleAuthor: req.session.userId
    })

    await newSchedule.save()
    res.render('/schedule')
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', async (req, res) => {
  const {id} = req.body
  try {
      delete req.body.id
      const schedule = await Schedule.findById(id)
      Object.assign(schedule, req.body)
      await schedule.save()
      res.redirect('/schedule')
  } catch(e) {
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
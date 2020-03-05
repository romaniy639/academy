const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const mainRouter = require('./routes/main')
const User = require('./models/user')
const session = require('express-session')
const scheduleRouter = require('./routes/crudSchedule')
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')

const PORT = 3000

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})


app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: 'some secret value',
    resave: false, 
    saveUninitialized: false
}))


app.use(flash())
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success')
    res.locals.error_messages = req.flash('error')
    next()
  })
app.use('/', mainRouter)
app.use('/schedule', scheduleRouter)





async function start() {
    try {
        await mongoose.connect('mongodb+srv://valik:ed2LxZkst8fukqZF@cluster0-msus2.mongodb.net/academy', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => {
            console.log("Server has been started...")
         })

    } catch (e) {
        console.log(e)
    }
}


start()
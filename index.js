const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const keys = require('./keys')
const mainRouter = require('./routes/main')
const groupRouter = require('./routes/group')
const scheduleRouter = require('./routes/crudSchedule')

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
    secret: keys.SESSION_SECRET,
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
app.use('/groups', groupRouter)




async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
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
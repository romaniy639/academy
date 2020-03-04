const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const mainRouter = require('./routes/main')
const User = require('./models/user')
const session = require('express-session')
const authMiddleware = require('./middleware/auth')


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


app.use(mainRouter)
app.use(authMiddleware)



async function start() {
    try {
        await mongoose.connect('mongodb+srv://romacin:v7vhSB48euWnYxtg@cluster0-msus2.mongodb.net/academy', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => {
            console.log("Server has been started...")
         })
         
        /*const admin = new User({
            email: "admin@gmail.com",
            name: "admin",
            password: "admin"
        }) 
        await admin.save()*/

    } catch (e) {
        console.log(e)
    }
}

start()


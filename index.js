const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const mainRouter = require('./routes/main')

const PORT = 3000

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})


app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(mainRouter)


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
    } catch (e) {
        console.log(e)
    }
}

start()
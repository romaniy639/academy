const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')

const PORT = 3000

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')



async function start() {
    try {
        await mongoose.connect('mongodb+srv://romaniy:pBoLSujnVwaUqXhw@cluster0-msus2.mongodb.net/university', {
            useNewUrlParser: true,
            useFindAndModify: false
        })
        app.listen(PORT, () => {
            console.log("Server has been started...")
         })
    } catch (e) {
        console.log(e)
    }
}


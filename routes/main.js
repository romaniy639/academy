const {Router} = require('express')
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')

const router = new Router()

router.get('/', (req,res)=> {
    res.render('index', {
        isTeacher: req.session.isAuthenticatedTeacher,
        isAdmin: req.session.isAdmin,
        isAuth: req.session.isAuth,
        title: "Academy"
    })
})

router.get('/login', (req,res)=> {
    res.render('login', {
        title: "Login",
        isTeacher: req.session.isAuthenticatedTeacher,
        isAdmin: req.session.isAdmin,
        isAuth: req.session.isAuth  
    })
})

router.get('/register', authMiddleware, (req,res)=> {
    if (req.session.isAdmin) {
        res.render('register', {
            title: "Register teacher",
            isAdmin: req.session.isAdmin,
            isAuth: req.session.isAuth
        })
    }
})

router.get('/logout', async (req,res)=> {
    req.session.destroy(() => {
        res.redirect('/login')
    })
})

router.post('/login', async (req,res)=> {
    try {
    const name = req.body.username
    const password = req.body.password
    const candidate = await User.findOne({name})
    if (candidate) {
        if (candidate.password === password) {
            req.session.isAuth = true
            if (candidate.isTeacher){
                req.session.isAuthenticatedTeacher = true
                req.session.user = candidate
            } else {
                req.session.isAuthenticatedStudent = true
                req.session.user = candidate
            }
            if (name === "admin") {
                req.session.isAdmin = true
            }
         }
    }
    res.redirect('/')
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', async (req,res)=> {
    const name = req.body.username
    const password = req.body.password
    const email = req.body.email
    const user = new User({
        name:name,
        password: password,
        email: email,
        isTeacher: true
    })
    await user.save()

    res.redirect('/')
})




module.exports = router